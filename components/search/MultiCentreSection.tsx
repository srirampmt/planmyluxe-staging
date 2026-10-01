"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
          <path d={STAR_PATH} fill={index < filled ? "#CB2187" : "#E0E0E0"} />
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
    <article className="h-full w-[280px] shrink-0 sm:w-[320px]">
      <Link
        href={href}
        className="group flex h-full flex-col overflow-hidden rounded-[12px] border border-[#EDEDED] bg-white no-underline shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EDEDED]">
          {deal.image ? (
            <img
              src={deal.image}
              alt={heading}
              className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              loading="lazy"
            />
          ) : null}
          {tag ? (
            <span className="pointer-events-none absolute left-0 top-0 max-w-[70%] rounded-br-[167px] bg-white pb-[4px] pl-[12px] pr-[32px] pt-[4px] text-[11px] font-semibold uppercase leading-[18px] tracking-[0.015em] text-[#CB2187] md:text-[13px]">
              {tag}
            </span>
          ) : null}
          {nights > 0 ? (
            <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.015em] text-[#CB2187]">
              {nights} night{nights === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
          <h3 className="line-clamp-2 text-[16px] font-semibold leading-[24px] text-[#4c4c4c]">
            {heading}
          </h3>
          {subtitle ? (
            <p className="mt-1.5 line-clamp-2 text-[12px] leading-[18px] tracking-[0.02em] text-[#7C7C7C]">{subtitle}</p>
          ) : null}

          {rating > 0 || meta.length > 0 ? (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#7C7C7C]">
              {rating > 0 ? <StarRow rating={rating} /> : null}
              {meta.length > 0 ? <span>{meta.join(" · ")}</span> : null}
            </div>
          ) : null}

          <div className="mt-auto border-t border-[#EDEDED] pt-3.5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7C7C7C]">From</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-[20px] font-semibold leading-none tracking-tight text-[#4c4c4c]">
                    £{price.toLocaleString("en-GB")}
                  </span>
                  <span className="text-[12px] font-medium text-[#7C7C7C]">pp</span>
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
  if (!multicentre_collection_snapshots || multicentre_collection_snapshots.length === 0) {
    return null;
  }

  return (
    <section id="multi-centre-section" className="relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] w-screen bg-white font-['Montserrat']">
      <div className="mx-auto w-full max-w-[1440px] px-[16px] py-[20px] sm:px-[24px] md:px-[32px] md:py-[50px] lg:px-[40px]">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="mb-3 flex items-end justify-between gap-4 md:mb-5">
            <h2 className="min-w-0 text-[24px] font-semibold leading-[30px] tracking-[-0.005em] text-[#4c4c4c] md:text-[48px] md:leading-[60px]">
              {multicentre_collection_title || "Multi-centre holiday deals"}
            </h2>
            <Link
              href="/multi-centre"
              className="hidden shrink-0 text-xs text-gray-500 underline hover:text-[#CB2187] sm:inline"
            >
              view all multi-centre holidays
            </Link>
          </div>

          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="pb-2">
              {multicentre_collection_snapshots.map((deal) => (
                <CarouselItem key={deal.id} className="basis-auto">
                  <DealCard deal={deal} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselNext className="hidden md:flex" />
            <CarouselPrevious className="hidden md:flex" />
          </Carousel>

          <Link
            href="/multi-centre"
            className="mt-5 inline-flex text-xs text-gray-500 underline hover:text-[#CB2187] sm:hidden"
          >
            view all multi-centre holidays
          </Link>
        </div>
      </div>
    </section>
  );
}
