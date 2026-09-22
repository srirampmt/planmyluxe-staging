"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { MultiCentreSnapshot } from "@/types/homepage";

const STAR_PATH =
  "M14.0001 5.4091L8.91313 5.07466L6.99734 0.261719L5.08156 5.07466L0.0001297 5.4091L3.89754 8.7184L2.61862 13.7384L6.99734 10.9707L11.3761 13.7384L10.0972 8.7184L14.0001 5.4091Z";

function toTitleCase(value: string): string {
  return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatRoute(location: string): string {
  return location
    .split(/\s*[·•|,]\s*|\s+&\s+/)
    .map((part) => toTitleCase(part.trim()))
    .filter(Boolean)
    .join(" · ");
}

function nightsCount(nights: string | number | undefined): number {
  const value = Number(nights);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function StarRow({ rating }: { rating: number }) {
  const filled = Math.min(5, Math.round(rating));
  if (filled <= 0) return null;
  return (
    <span className="inline-flex items-center gap-px" aria-label={`${filled} star`}>
      {Array.from({ length: 5 }, (_, index) => (
        <svg key={index} width="12" height="12" viewBox="-0.5 -0.5 15 15" aria-hidden="true">
          <path d={STAR_PATH} fill={index < filled ? "#D4A017" : "#E4DFD8"} />
        </svg>
      ))}
    </span>
  );
}

function DealCard({ deal }: { deal: MultiCentreSnapshot }) {
  const href = deal.slug ? `/multi-centre/${deal.slug}` : "/multi-centre";
  const route = formatRoute(deal.location || "");
  const title = (deal.title || "").trim();
  const heading = route || title || "Multi-centre";
  const subtitle = route && title && title.toLowerCase() !== route.toLowerCase() ? title : "";
  const nights = nightsCount(deal.nights);
  const price = Math.round(Number(deal.starting_price) || 0);
  const rating = Number(deal.property_rating) || 0;
  const board = (deal.board_basis || "").trim();
  const tag = (deal.tag_for_card || "").trim();
  const tax = Number(deal.local_tax) || 0;

  const meta = [
    board,
    nights > 0 ? `${nights} night${nights === 1 ? "" : "s"}` : "",
  ].filter(Boolean);

  return (
    <article className="w-[280px] shrink-0 snap-start sm:w-[320px]">
      <Link
        href={href}
        className="flex h-full flex-col overflow-hidden rounded-[16px] border border-[#ece8e4] bg-white no-underline shadow-[0_8px_28px_rgba(26,27,75,0.06)]"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#ece8e4]">
          {deal.image ? (
            <img
              src={deal.image}
              alt={heading}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
          {tag ? (
            <span className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a1b4b]">
              {tag}
            </span>
          ) : null}
          {nights > 0 ? (
            <span className="absolute right-3 top-3 rounded-full bg-[#1a1b4b]/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              {nights} night{nights === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
          <h3 className="line-clamp-2 text-[16px] font-semibold leading-snug tracking-[-0.02em] text-[#1a1b4b]">
            {heading}
          </h3>
          {subtitle ? (
            <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-5 text-[#6b6570]">{subtitle}</p>
          ) : null}

          {rating > 0 || meta.length > 0 ? (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#6b6570]">
              {rating > 0 ? <StarRow rating={rating} /> : null}
              {meta.length > 0 ? <span>{meta.join(" · ")}</span> : null}
            </div>
          ) : null}

          <div className="mt-auto border-t border-[#ece8e4] pt-3.5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a8490]">From</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-[20px] font-semibold leading-none tracking-tight text-[#1a1b4b]">
                    £{price.toLocaleString("en-GB")}
                  </span>
                  <span className="text-[12px] font-medium text-[#8a8490]">pp</span>
                </div>
              </div>
              <span className="mb-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-[#CB2187] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
                View details
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
            {tax > 0 ? (
              <p className="mt-1.5 text-[11px] font-medium text-[#1B7A4E]">
                Tax £{tax.toFixed(2)} excluded
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

type MultiCentreSectionProps = {
  multicentre_collection_title?: string;
  multicentre_collection_snapshots?: MultiCentreSnapshot[];
};

export default function MultiCentreSection({
  multicentre_collection_title,
  multicentre_collection_snapshots,
}: MultiCentreSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!multicentre_collection_snapshots || multicentre_collection_snapshots.length === 0) {
    return null;
  }

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  }

  return (
    <section id="multi-centre-section" className="bg-white py-10 font-['Montserrat'] sm:py-14">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
            <div className="min-w-0">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#CB2187]">
                Multi-centre collection
              </p>
              <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[#1a1b4b] sm:text-[36px]">
                {multicentre_collection_title || "Multi-centre holiday deals"}
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/multi-centre"
                className="mr-1 hidden text-[12px] font-semibold uppercase tracking-[0.14em] text-[#1a1b4b] no-underline hover:text-[#CB2187] sm:inline"
              >
                View all
              </Link>
              <button
                type="button"
                onClick={() => scroll("left")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ece8e4] bg-white text-[#1a1b4b] shadow-sm hover:border-[#CB2187] hover:text-[#CB2187]"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ece8e4] bg-white text-[#1a1b4b] shadow-sm hover:border-[#CB2187] hover:text-[#CB2187]"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide snap-x snap-mandatory sm:gap-5"
          >
            {multicentre_collection_snapshots.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>

          <Link
            href="/multi-centre"
            className="mt-5 inline-flex text-[12px] font-semibold uppercase tracking-[0.14em] text-[#1a1b4b] no-underline hover:text-[#CB2187] sm:hidden"
          >
            View all holidays
          </Link>
        </div>
      </div>
    </section>
  );
}
