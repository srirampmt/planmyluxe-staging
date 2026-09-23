"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  ArrowRight,
  AudioLines,
  Bus,
  Car,
  ChevronLeft,
  ChevronRight,
  Compass,
  Info,
  Landmark,
  Plane,
  Ship,
  Ticket,
  Train,
  type LucideIcon,
} from "lucide-react";
import type { McPackageCard } from "@/types/multi-centre";

export type { McPackageCard };

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const trimmed = String(value || "").trim();
    if (trimmed) return trimmed;
  }
  return "";
}

function getCardTitle(pkg: McPackageCard): string {
  if (Array.isArray(pkg.destinations) && pkg.destinations.length > 0) {
    const parts = pkg.destinations
      .map((d) => toTitleCase(String(d || "").trim()))
      .filter(Boolean);
    if (parts.length > 0) return parts.join(" · ");
  }
  if (pkg.route?.trim()) {
    return pkg.route
      .split(/[-–—•·,]+/)
      .map((p) => toTitleCase(p.trim()))
      .filter(Boolean)
      .join(" · ");
  }
  if (pkg.location?.trim()) {
    return pkg.location
      .split(/[-–—•·,]+/)
      .map((p) => toTitleCase(p.trim()))
      .filter(Boolean)
      .join(" · ");
  }
  if (pkg.title?.trim()) return toTitleCase(pkg.title.trim());
  if (pkg.slug) {
    return pkg.slug
      .split("-")
      .filter((p) => p && !/^\d+$/.test(p))
      .map((p) => toTitleCase(p))
      .join(" · ");
  }
  return "Multi-centre";
}

function getThumbnails(pkg: McPackageCard): string[] {
  const fallback = firstNonEmpty(pkg.image, pkg.pictures?.[0]);
  const slots = [
    firstNonEmpty(pkg.thumbnail_1, fallback),
    firstNonEmpty(pkg.thumbnail_2, fallback),
    firstNonEmpty(pkg.thumbnail_3, fallback),
  ].filter(Boolean);

  const unique: string[] = [];
  for (const src of slots) {
    if (!unique.includes(src)) unique.push(src);
  }
  return unique.slice(0, 3);
}

function getDurationOverlay(pkg: McPackageCard): string {
  const raw = firstNonEmpty(pkg.durationLabel, pkg.duration_label);
  if (raw) return raw.replace(/\s+/g, " ").toUpperCase();

  const nights = typeof pkg.nights === "number" && pkg.nights > 0 ? pkg.nights : 0;
  if (nights > 0) {
    const days = nights + 1;
    return `${days} DAYS / ${nights} NIGHTS`;
  }
  return "";
}

function getTransports(pkg: McPackageCard): string[] {
  if (Array.isArray(pkg.transports)) {
    const unique: string[] = [];
    for (const item of pkg.transports) {
      const label = String(item || "").trim();
      if (label && !unique.includes(label)) unique.push(label);
    }
    return unique;
  }
  return pkg.flights_included ? ["Flight"] : [];
}

function getInclusions(pkg: McPackageCard): string[] {
  if (!Array.isArray(pkg.inclusions_preview)) return [];
  return pkg.inclusions_preview
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

function getCardChip(pkg: McPackageCard): string {
  const tag = firstNonEmpty(pkg.tag_for_card);
  if (tag) return tag;
  if (pkg.save_upto == null || pkg.save_upto === "") return "";
  return `Save up to ${pkg.save_upto}`;
}

function getRatingValue(pkg: McPackageCard): number {
  if (pkg.property_rating == null || pkg.property_rating === "") return 0;
  const numeric = Number(pkg.property_rating);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
}

function resolveTransportIcon(label: string): LucideIcon {
  const key = label.toLowerCase();
  if (/(cruise|ship|ferry|boat|yacht|sail)/.test(key)) return Ship;
  if (/(train|rail)/.test(key)) return Train;
  if (/(bus|coach)/.test(key)) return Bus;
  if (/(car|transfer|driver|taxi)/.test(key)) return Car;
  if (/(flight|plane|air)/.test(key)) return Plane;
  return Compass;
}

function TransportMark({ label }: { label: string }) {
  const Icon = resolveTransportIcon(label);
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#4a4650]">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f8eef5]">
        <Icon className="h-3.5 w-3.5 text-[#CB2187]" strokeWidth={1.8} />
      </span>
      {label}
    </span>
  );
}

function resolveExcursionIcon(label: string): LucideIcon {
  const key = label.toLowerCase();
  if (/(boat|cruise|snorkel|ferry|sail|yacht)/.test(key)) return Ship;
  if (/(ticket|entry|admission|pass)/.test(key)) return Ticket;
  if (/(audio|headset)/.test(key)) return AudioLines;
  if (/(museum|chapel|castle|colosseum|forum|palace|acropolis|landmark|cathedral)/.test(key)) {
    return Landmark;
  }
  if (/(train|rail)/.test(key)) return Train;
  return Compass;
}

const STAR_PATH =
  "M14.0001 5.4091L8.91313 5.07466L6.99734 0.261719L5.08156 5.07466L0.0001297 5.4091L3.89754 8.7184L2.61862 13.7384L6.99734 10.9707L11.3761 13.7384L10.0972 8.7184L14.0001 5.4091Z";

function StarRow({ rating }: { rating: number }) {
  const filled = Math.min(5, Math.round(rating));
  return (
    <span className="inline-flex items-center gap-px" aria-label={`${filled} star hotel`}>
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          key={index}
          width="12"
          height="12"
          viewBox="-0.5 -0.5 15 15"
          className="block"
          aria-hidden="true"
        >
          <path d={STAR_PATH} fill={index < filled ? "#D4A017" : "#E4DFD8"} />
        </svg>
      ))}
    </span>
  );
}

function MediaCarousel({
  images,
  alt,
  chip,
  duration,
}: {
  images: string[];
  alt: string;
  chip: string;
  duration: string;
}) {
  const [index, setIndex] = useState(0);
  const looping = images.length > 1;
  const autoplay = useMemo(
    () =>
      Autoplay({
        delay: 4800,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    []
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      loop: looping,
      skipSnaps: false,
      duration: 50,
    },
    looping ? [autoplay] : []
  );

  const sync = useCallback((api: NonNullable<typeof emblaApi>) => {
    setIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    sync(emblaApi);
    emblaApi.on("select", sync);
    emblaApi.on("reInit", sync);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) autoplay.stop();

    return () => {
      emblaApi.off("select", sync);
      emblaApi.off("reInit", sync);
    };
  }, [autoplay, emblaApi, sync]);

  const showControls = looping;
  const goPrev = () => {
    emblaApi?.scrollPrev();
    autoplay.reset();
  };
  const goNext = () => {
    emblaApi?.scrollNext();
    autoplay.reset();
  };

  return (
    <div className="group/media relative aspect-[16/9] w-full overflow-hidden bg-[#ece8e4]">
      <div ref={emblaRef} className="h-full w-full overflow-hidden">
        <div className="flex h-full">
          {(images.length > 0 ? images : [""]).map((src, slideIndex) => (
            <div
              key={`${src || "empty"}-${slideIndex}`}
              className="relative h-full min-w-0 flex-[0_0_100%]"
            >
              {src ? (
                <img
                  src={src}
                  alt={alt}
                  className="h-full w-full object-cover"
                  loading={slideIndex === 0 ? "eager" : "lazy"}
                  draggable={false}
                />
              ) : (
                <div className="h-full w-full bg-[#ece8e4]" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />

      {chip ? (
        <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a1a1a] shadow-[0_2px_10px_rgba(26,27,75,0.08)]">
          {chip}
        </span>
      ) : null}

      {duration ? (
        <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-[2px]">
          {duration}
        </span>
      ) : null}

      {showControls ? (
        <div className="group/prev absolute inset-y-0 left-0 z-20 flex w-12 items-center pl-2">
          <button
            type="button"
            aria-label="Previous photo"
            onClick={goPrev}
            className="pointer-events-none flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(0,0,0,0.35)] text-white opacity-0 transition-opacity duration-200 group-hover/media:pointer-events-auto group-hover/media:opacity-100 group-hover/prev:bg-[rgba(0,0,0,0.72)]"
          >
            <ChevronLeft className="h-4 w-4 text-white" strokeWidth={2} />
          </button>
        </div>
      ) : null}

      {showControls ? (
        <div className="group/next absolute inset-y-0 right-0 z-20 flex w-12 items-center justify-end pr-2">
          <button
            type="button"
            aria-label="Next photo"
            onClick={goNext}
            className="pointer-events-none flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(0,0,0,0.35)] text-white opacity-0 transition-opacity duration-200 group-hover/media:pointer-events-auto group-hover/media:opacity-100 group-hover/next:bg-[rgba(0,0,0,0.72)]"
          >
            <ChevronRight className="h-4 w-4 text-white" strokeWidth={2} />
          </button>
        </div>
      ) : null}

      {showControls ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-2.5 z-10 flex justify-center">
          <div className="flex items-center gap-1.5 rounded-full bg-[rgba(0,0,0,0.28)] px-2 py-1 transition-colors duration-200 group-hover/media:bg-[rgba(0,0,0,0.45)]">
            {images.map((src, dotIndex) => (
              <span
                key={`${src}-dot-${dotIndex}`}
                className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                  dotIndex === index
                    ? "w-4 bg-[rgba(255,255,255,0.65)]"
                    : "w-1.5 bg-[rgba(255,255,255,0.5)]"
                }`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ListingPackageCard({
  pkg,
  href,
}: {
  pkg: McPackageCard;
  href: string;
}) {
  const title = getCardTitle(pkg);
  const thumbs = getThumbnails(pkg);
  const duration = getDurationOverlay(pkg);
  const transports = getTransports(pkg);
  const inclusions = getInclusions(pkg);
  const chip = getCardChip(pkg);
  const rating = getRatingValue(pkg);
  const board = firstNonEmpty(pkg.board_basis);
  const nights = typeof pkg.nights === "number" && pkg.nights > 0 ? pkg.nights : 0;
  const hotelsCount =
    typeof pkg.hotels_count === "number" && pkg.hotels_count > 0 ? pkg.hotels_count : 0;

  const stayBits = [
    nights > 0 ? `${nights} nights` : "",
    hotelsCount > 0 ? `${hotelsCount} hotels` : "",
  ].filter(Boolean);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[16px] border border-[#ece8e4] bg-white shadow-[0_8px_28px_rgba(26,27,75,0.06)]">
      <MediaCarousel
        images={thumbs}
        alt={title}
        chip={chip}
        duration={duration}
      />

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h3
          title={title}
          className="truncate text-[17px] font-semibold leading-snug tracking-[-0.02em] text-[#1a1a1a] sm:text-[18px]"
        >
          {title}
        </h3>

        {(rating > 0 || board || stayBits.length > 0) ? (
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-[#6b6570]">
            {rating > 0 ? <StarRow rating={rating} /> : null}
            {board ? <span>{board}</span> : null}
            {stayBits.length > 0 ? (
              <span className={rating > 0 || board ? "text-[#b7b1aa]" : undefined}>
                {(rating > 0 || board) && stayBits.length > 0 ? "· " : ""}
                {stayBits.join(" · ")}
              </span>
            ) : null}
          </div>
        ) : null}

        {transports.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            {transports.map((item) => (
              <TransportMark key={item} label={item} />
            ))}
          </div>
        ) : null}

        {inclusions.length > 0 ? (
          <ul className="mt-3.5 space-y-2">
            {inclusions.map((item) => {
              const Icon = resolveExcursionIcon(item);
              return (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-px flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#f8eef5]">
                    <Icon className="h-3 w-3 text-[#CB2187]" strokeWidth={2} />
                  </span>
                  <span className="line-clamp-1 text-[12.5px] font-medium leading-5 text-[#3f3b44]">
                    {item}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="mt-auto border-t border-[#ece8e4] pt-4">
          <div className="flex h-12 items-center justify-between gap-4">
            <div className="flex min-w-0 flex-col justify-center gap-1">
              <div className="flex items-baseline gap-1">
                <span className="text-[22px] font-semibold leading-none tracking-tight text-[#1a1a1a]">
                  £{Math.round(Number(pkg.starting_price) || 0).toLocaleString()}
                </span>
                <span className="text-[12px] font-medium text-[#8a8490]">pp</span>
              </div>
              {typeof pkg.local_tax === "number" && pkg.local_tax > 0 ? (
                <div className="group/tax relative inline-block">
                  <span className="flex cursor-help items-center gap-1 whitespace-nowrap text-[11px] font-medium leading-4 text-[#1B7A4E]">
                    Tax £{pkg.local_tax.toFixed(2)} excluded
                    <Info className="h-3 w-3 flex-shrink-0" />
                  </span>
                  <div className="pointer-events-none absolute bottom-full left-0 z-30 mb-1.5 hidden w-56 bg-[#1a1a1a] p-2.5 text-[10px] font-medium leading-snug text-white group-hover/tax:block">
                    Payable directly at the hotel at check-in or check-out — it is not paid to us. Calculated using live exchange rates, so the final figure can shift slightly.
                  </div>
                </div>
              ) : null}
            </div>
            <div className="flex h-full shrink-0 items-center">
              <Link
                href={href}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#CB2187] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white no-underline"
              >
                View details
                <ArrowRight className="h-3.5 w-3.5 stroke-[2]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ListingPackageCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[16px] border border-[#ece8e4] bg-white">
      <div className="aspect-[16/9] w-full bg-[#ece8e4]" />
      <div className="space-y-3 px-5 pb-5 pt-4">
        <div className="h-5 w-3/4 bg-[#ece8e4]" />
        <div className="h-3 w-1/2 bg-[#ece8e4]" />
        <div className="h-px w-full bg-[#ece8e4]" />
        <div className="h-6 w-24 bg-[#ece8e4]" />
      </div>
    </div>
  );
}
