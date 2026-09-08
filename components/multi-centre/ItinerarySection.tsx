"use client";

import { useId, useMemo, useState } from "react";
import { Plus, Minus, Plane, Train, Bus, Ship, Car } from "lucide-react";

type ItineraryItem = {
  day: number;
  title: string;
  transport: string | null;
  subtitle: string;
  description: string;
  hotel: string;
  rating: number;
  board: string;
  duration: string;
  extras: string;
};


function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="15"
      viewBox="0 0 16 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 0.75l2.06 4.17 4.6.67-3.33 3.24.79 4.58L8 11.18 3.88 13.4l.79-4.58L1.34 5.59l4.6-.67L8 .75Z"
        fill="#CB2187"
      />
    </svg>
  );
}

function getTransportIcon(transport: string | null) {
  switch (transport?.toLowerCase()) {
    case "flight":
      return <Plane size={20} className="shrink-0 text-[#4C4C4C]" />;
    case "train":
      return <Train size={20} className="shrink-0 text-[#4C4C4C]" />;
    case "bus":
      return <Bus size={20} className="shrink-0 text-[#4C4C4C]" />;
    case "ship":
      return <Ship size={20} className="shrink-0 text-[#4C4C4C]" />;
    case "car":
      return <Car size={20} className="shrink-0 text-[#4C4C4C]" />;
    case "cruise":
      return <Ship size={20} className="shrink-0 text-[#4C4C4C]" />;
    default:
      return null;
  }
}

export default function ItinerarySection({
  itinerary,
}: {
  itinerary: ItineraryItem[];
}) {
  const baseId = useId();
  const [openValue, setOpenValue] = useState<string | null>(null);
  return (
    <div className="flex w-full flex-col items-start gap-4 font-montserrat">
      <div className="w-full space-y-4">
        {itinerary.map((item, idx) => {
          const isLast = idx === itinerary.length - 1;
          const isFirst = idx === 0;
          const value = `day-${item.day}`;
          const isOpen = openValue === value;
          const triggerId = `${baseId}-trigger-${value}`;
          const contentId = `${baseId}-content-${value}`;
          const hasSubtitle = Boolean(item.subtitle && item.subtitle.trim().length > 0);
          const hasHotel = Boolean(item.hotel && item.hotel.trim().length > 0);
          const hasBoard = Boolean(item.board && item.board.trim().length > 0);
          const hasDuration = Boolean(item.duration && item.duration.trim().length > 0);
          const ratingCount = Math.max(0, Math.floor(Number(item.rating) || 0));
          const hasRating = ratingCount > 0;
          const hasExtras = Boolean(item.extras && item.extras.trim().length > 0);
          const hasSummary = hasHotel || hasBoard || hasDuration || hasRating || hasExtras;

          return (
            <div
              key={idx}
              data-state={isOpen ? "open" : "closed"}
              className="group grid w-full max-w-full grid-cols-[56px_minmax(0,1fr)] items-start border-0"
            >
              {/* Timeline column (always visible) */}
              <div
                className={
                  "flex h-full w-[56px] flex-col items-center self-stretch " +
                  (isFirst ? "pt-4 " : "pt-0 ") +
                  (isLast ? "pb-4" : "pb-0 -mb-8")
                }
              >
                <div
                  className={
                    "flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#CB2187] " +
                    (isFirst ? "" : "mt-4")
                  }
                >
                  <span className="font-sans text-[18px] font-bold leading-none text-white">
                    {item.day}
                  </span>
                </div>

                {!isLast ? (
                  <div
                    className={
                      "relative w-px flex-1 bg-[repeating-linear-gradient(to_bottom,#CFCBCB_0_6px,transparent_4px_12px)] " +
                      "bg-[length:1px_12px] bg-repeat-y transition-opacity duration-300 ease-out " +
                      "opacity-70 group-data-[state=open]:opacity-100 " +
                      "after:absolute after:left-0 after:top-full after:h-8 after:w-px after:bg-[repeating-linear-gradient(to_bottom,#CFCBCB_0_6px,transparent_4px_12px)] " +
                      "after:bg-[length:1px_12px] after:bg-repeat-y after:opacity-70 group-data-[state=open]:after:opacity-100 after:content-['']"
                    }
                  />
                ) : null}
              </div>

              {/* Card (border should NOT include timeline column) */}
              <div
                className={
                  "box-border w-full min-w-0 max-w-full overflow-hidden rounded-[10px] border border-[#EDEDED] bg-white px-4 md:px-6 transition-colors duration-200 group-data-[state=open]:bg-[#CB2187]/5 " +
                  (hasSummary ? "min-h-[120px]" : "")
                }
              >
                <button id={triggerId} type="button" aria-controls={contentId} aria-expanded={isOpen} onClick={() => setOpenValue((prev) => (prev === value ? null : value))} className="box-border flex w-full min-w-0 items-start justify-between gap-4 py-4 text-left text-[#4C4C4C]">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-col gap-3 pr-2">
                      <div className="flex w-full min-w-0 flex-col items-start gap-2 min-[1000px]:flex-row min-[1000px]:flex-nowrap min-[1000px]:items-center min-[1000px]:gap-3">
                        <div className="w-full min-w-0 break-words text-[16px] font-semibold text-pml-primary leading-[140%] min-[1000px]:w-auto min-[1000px]:max-w-[50%] min-[1000px]:shrink-0 min-[1000px]:truncate md:text-[20px]">
                          <div className="flex w-full min-w-0 items-start justify-between gap-3">
                            <span className="min-w-0">{item.title}</span>

                            {/* <1000px: icon sits with title (row); >=1000px: icon on far right */}
                            <span className="shrink-0 min-[1000px]:hidden">
                              <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-current">
                                <Plus className={ "absolute h-4 w-4 transition-all duration-300 " + (isOpen ? "rotate-180 opacity-0 scale-50" : "opacity-100") } strokeWidth={2.5} />
                                <Minus className={ "absolute h-4 w-4 transition-all duration-300 " + (isOpen ? "opacity-100" : "rotate-180 opacity-0 scale-50") } strokeWidth={2.5} />
                              </span>
                            </span>
                          </div>
                        </div>

                          {hasSubtitle ? (
                            <>
                              <div className="hidden h-6 w-px shrink-0 bg-[#CFCBCB] min-[1000px]:block" />

                              <div className="flex w-full min-w-0 flex-1 items-center gap-2 text-[14px] font-semibold leading-[140%] min-[1000px]:w-auto">
                                {getTransportIcon(item.transport)}
                                <span className="min-w-0 break-words min-[1000px]:truncate">
                                  {item.subtitle}
                                </span>
                              </div>
                            </>
                          ) : null}
                      </div>

                    {/* Summary row (always visible in trigger) */}
                    <div className="flex w-full flex-col gap-y-2 text-[14px] leading-[140%] text-[#4C4C4C]">
                      <div className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 max-[1000px]:flex-col max-[1000px]:items-start">
                        {hasHotel ? (
                          <div className="flex min-w-0 items-start gap-2 md:items-center">
                            <span className="font-normal">Hotel:</span>
                            <span className="min-w-0 break-words font-semibold underline min-[1000px]:truncate">
                              {item.hotel}
                            </span>
                          </div>
                        ) : null}

                        {hasBoard ? (
                          <div className="flex min-w-0 items-start gap-2 md:items-center">
                            <span className="font-normal">Board:</span>
                            <span className="font-semibold">{item.board}</span>
                          </div>
                        ) : null}

                        {hasDuration ? (
                          <div className="flex min-w-0 items-start gap-2 md:items-center">
                            <span className="font-normal">Duration:</span>
                            <span className="font-semibold">{item.duration}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex w-full min-w-0 flex-nowrap items-center gap-x-6 overflow-hidden max-[1000px]:flex-col max-[1000px]:items-start max-[1000px]:gap-y-2 max-[1000px]:overflow-visible">
                        {hasRating ? (
                          <div className="flex shrink-0 items-start gap-2 md:items-center">
                            <span className="font-normal">Rating:</span>
                            <div className="flex items-center gap-[2px]">
                              {Array.from({ length: ratingCount }).map((_, starIdx) => (
                                <StarIcon key={starIdx} />
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {hasExtras ? (
                          <div className="flex min-w-0 items-start gap-2 md:items-center">
                            <span className="font-normal">Extras:</span>
                            <span className="min-w-0 break-words font-semibold min-[1000px]:truncate">
                              {item.extras}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    </div>
                  </div>

                  <div className="hidden shrink-0 min-[1000px]:block">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-current">
                      <Plus
                        className={
                          "absolute h-4 w-4 transition-all duration-300 " +
                          (isOpen ? "rotate-180 opacity-0 scale-50" : "opacity-100")
                        }
                        strokeWidth={2.5}
                      />
                      <Minus
                        className={
                          "absolute h-4 w-4 transition-all duration-300 " +
                          (isOpen ? "opacity-100" : "rotate-180 opacity-0 scale-50")
                        }
                        strokeWidth={2.5}
                      />
                    </div>
                  </div>
                </button>

                <div
                  id={contentId}
                  role="region"
                  aria-labelledby={triggerId}
                  hidden={!isOpen}
                  className="pt-2 pb-4"
                >
                  <div className="flex w-full flex-col gap-4 min-[1000px]:flex-row min-[1000px]:items-start min-[1000px]:gap-6">
                    <div className="order-2 flex w-full flex-col gap-4 min-[1000px]:order-1 min-[1000px]:min-w-0 min-[1000px]:flex-1">
                      <div className="text-[16px] font-normal leading-[150%] text-[#4C4C4C]">
                        {item.description}
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type { ItineraryItem };