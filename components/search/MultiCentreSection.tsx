"use client";
import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, MapPinIcon } from "lucide-react";
import type { MultiCentreSnapshot } from "@/types/homepage";

function DealCard({ deal }: { deal: MultiCentreSnapshot }) {
  const href = deal.slug ? `/multi-centre/${deal.slug}` : "#";
  const displayPrice = Number(deal.starting_price ?? 0) || 0;
  const rating = Number(deal.property_rating || 0);
  const formattedLocation = (deal.location ?? "")
    .split(/,\s*| & /)
    .filter((p) => p.trim())
    .map((p) => p.trim().toUpperCase())
    .join(" · ");

  return (
    <div className="shrink-0 w-[260px] sm:w-[280px] snap-start font-['Montserrat']">
      <a
        href={href}
        className="bg-white rounded-[8px] overflow-hidden flex flex-col h-[360px] border border-[#e0e0e0] group no-underline shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        {/* Image */}
        <div className="relative w-full overflow-hidden bg-[#f5f5f5] h-[180px] shrink-0">
          <img
            src={deal.image || ""}
            alt={deal.title || "Hotel"}
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105 will-change-transform"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow p-4 ">
          {/* Stars */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              {rating > 0 && (
                <span className="flex gap-[2px]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.0001 5.4091L8.91313 5.07466L6.99734 0.261719L5.08156 5.07466L0.0001297 5.4091L3.89754 8.7184L2.61862 13.7384L6.99734 10.9707L11.3761 13.7384L10.0972 8.7184L14.0001 5.4091Z" fill={rating >= i + 1 ? "#CB2187" : "#E0E0E0"} />
                    </svg>
                  ))}
                </span>
              )}
            </div>
          </div>

          {/* Location with pin */}
          <div className="flex items-center gap-1 mb-2">
            <MapPinIcon className="w-4 h-4 text-pml-primary" />
            <span className="text-[11px] font-semibold text-[#6b7280] tracking-wide uppercase truncate">
              {formattedLocation}
            </span>
          </div>

          {/* Title */}
          <h5 className="text-[14px] font-semibold text-[#CB2187] leading-[1.4] line-clamp-2 overflow-hidden">
            {deal.title || ""}
          </h5>

          {/* CTA Button */}
          <div className="mt-3 w-full bg-[#CB2187] group-hover:bg-[#a81870] text-white font-semibold text-[13px] py-3 px-4 rounded-xl flex items-center justify-between transition-colors duration-200">
            <span className="truncate pr-2">
              {String(deal.nights ?? "00").padStart(2, "0")} Nights from £{displayPrice.toLocaleString("en-GB", { maximumFractionDigits: 0 })} p...
            </span>
            <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center shrink-0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18l6-6-6-6" stroke="#CB2187" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </a>
    </div>
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
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  }

  return (
    <section id="multi-centre-section" className="py-8 sm:py-12 md:py-16 ">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 md:px-8 lg:px-10 ">
        <div
          className="w-full max-w-[1280px] mx-auto rounded-[12px] overflow-hidden p-4 sm:p-6 md:p-8 lg:p-10 border border-ray-200 bg-gray-50"
          style={{ boxShadow: "none" }}
        >
          {/* Header */}
          <div className="text-left mb-4 sm:mb-6">
            {/* <p className="text-[12px] font-bold tracking-[0.1em] leading-[14px] text-[#CB2187] uppercase mb-2 font-['Montserrat']">
              Exclusive Deals
            </p> */}
            <h2 className="text-[24px] md:text-[40px] font-semibold text-[#CB2187] leading-[30px] md:leading-[60px] tracking-[-0.005em] max-w-[626px]">
              {multicentre_collection_title}
            </h2>
          </div>

          {/* Carousel */}
          <div className="relative">
            <button
              onClick={() => scroll("left")}
              className="hidden sm:flex absolute -left-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md items-center justify-center text-gray-600 hover:text-[#CB2187] hover:border-[#CB2187]/40 transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>

            <div
              ref={scrollRef}
              className="flex gap-3 sm:gap-5 overflow-x-auto scroll-smooth pb-4 sm:pb-6 px-1 sm:px-2 scrollbar-hide snap-x snap-mandatory"
            >
              {multicentre_collection_snapshots.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>

            <button
              onClick={() => scroll("right")}
              className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md items-center justify-center text-gray-600 hover:text-[#CB2187] hover:border-[#CB2187]/40 transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
