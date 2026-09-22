import React, { useEffect, useRef, useState } from "react";
import {
  Bus,
  Car,
  ChevronLeft,
  ChevronRight,
  Plane,
  Ship,
  Train,
} from "lucide-react";
import { formatMultiCentreDuration } from "@/lib/mappings/duration";

export type TimelineTransport =
  | "flight"
  | "train"
  | "bus"
  | "ship"
  | "transfer"
  | "car";

export type TimelineStop = {
  title: string;
  subtitle?: string;
  badgeType?: "origin" | "stay" | "return";
  displayDay?: number;
  transportToNextStop?: TimelineTransport;
  transportLabel?: string;
  transportDuration?: string;
  onNodeClick?: () => void;
};

type Props = { items: TimelineStop[] };

function TransportIcon({
  type,
  className,
}: {
  type?: string;
  className?: string;
}) {
  const t = type?.toLowerCase() || "";
  if (t.includes("flight") || t.includes("fly"))
    return <Plane className={className} />;
  if (t.includes("train") || t.includes("rail"))
    return <Train className={className} />;
  if (t.includes("ship") || t.includes("ferry"))
    return <Ship className={className} />;
  if (t.includes("bus") || t.includes("coach"))
    return <Bus className={className} />;
  if (t.includes("car") || t.includes("taxi"))
    return <Car className={className} />;
  return <Plane className={className} />;
}

export default function HorizontalTimeLine({ items }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 5);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    updateScroll();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    return () => {
      el.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, [items.length]);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(200, Math.floor(el.clientWidth * 0.7));
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const formatDuration = (duration?: string): string => {
    if (!duration) return "Included";
    const lower = duration.toLowerCase();
    // Check for standard "nights" or common typo "nihgts"
    if (lower.includes("nights") || lower.includes("nihgts")) {
      return duration;
    }
    // Also check for singular "night" to avoid duplication
    if (lower.includes("night")) {
      return duration;
    }
    // Otherwise, append " nights"
    return `${duration} nights`;
  };

  if (!items?.length) return null;

  return (
    <div className="relative w-full rounded-[16px] border border-slate-100 bg-white py-3 shadow-none sm:p-4 mb-2">
      {canLeft && (
        <button
          type="button"
          onClick={() => scrollBy("left")}
          aria-label="Scroll left"
          className="absolute left-1.5 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-100 bg-white text-[#CB2187] shadow-lg shadow-slate-200/60 transition-transform hover:scale-105 sm:h-9 sm:w-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      {canRight && (
        <button
          type="button"
          onClick={() => scrollBy("right")}
          aria-label="Scroll right"
          className="absolute right-1.5 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-100 bg-white text-[#CB2187] shadow-lg shadow-slate-200/60 transition-transform hover:scale-105 sm:h-9 sm:w-9"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      <div
        ref={scrollerRef}
        className="w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="mx-auto flex min-w-max items-start justify-center px-4 py-2 sm:px-6">
          {items.map((stop, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === items.length - 1;
            const num = stop.displayDay ?? (isFirst || isLast ? 1 : idx + 1);

            return (
              <React.Fragment key={`${stop.title}-${idx}`}>
                {/* NODE */}
                <div
                  onClick={stop.onNodeClick}
                  className={`group relative z-10 flex w-16 shrink-0 flex-col items-center sm:w-14 ${
                    stop.onNodeClick ? "cursor-pointer" : ""
                  }`}
                >
                  {/* Badge Section */}
                  <div className="flex h-7 items-end justify-center pb-1">
                    {stop.subtitle && (
                      <span
                        className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold sm:px-2.5 sm:text-[11px] ${
                          stop.badgeType === "origin" || isFirst
                            ? "border-slate-200/70 bg-slate-100 text-slate-500"
                            : "border-[#CB2187]/15 bg-[#CB2187]/[0.08] text-[#CB2187]"
                        }`}
                      >
                        {formatMultiCentreDuration(stop.subtitle)}
                        {/* {stop.subtitle}j */}
                      </span>
                    )}
                  </div>

                  {/* Circle Section */}
                  <div className="flex h-10 items-center justify-center sm:h-12">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#CB2187] text-sm font-black text-white shadow-md shadow-[#CB2187]/30 ring-4 ring-white sm:h-12 sm:w-12 sm:text-base">
                      {num}
                    </div>
                  </div>

                  {/* Title Section */}
                  <span className="mt-2 line-clamp-2 max-w-[80px] text-center text-xs font-bold leading-tight text-[#1a1b4b] sm:max-w-[110px] sm:text-sm">
                    {stop.title}
                  </span>
                </div>

                {/* CONNECTOR LINE & TRANSPORT PILL */}
                {!isLast && (
                  <div className="relative flex shrink-0 min-w-[80px] flex-col items-center sm:min-w-[130px]">
                    {/* Badge Spacer */}
                    <div className="h-7" />

                    {/* Line & Transport Pill Section */}
                    <div className="relative flex h-10 w-full items-center justify-center sm:h-12">
                      {/* Line connecting circle centers */}
                      <div className="absolute -left-10 -right-10 h-[2px] bg-[#CB2187] sm:-left-14" />

                      {/* Pill */}
                      <div className="relative z-10 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-100 bg-white px-2.5 py-1 text-[10px] font-bold text-[#1a1b4b] shadow-md shadow-slate-200/60 sm:px-3 sm:py-1.5 sm:text-xs">
                        <TransportIcon
                          type={stop.transportToNextStop}
                          className="h-3 w-3 shrink-0 text-[#CB2187] sm:h-3.5 sm:w-3.5"
                        />
                        <span className="capitalize">
                          {stop.transportLabel ||
                            stop.transportToNextStop ||
                            "Flight"}
                        </span>
                      </div>
                    </div>

                    {/* Duration Label Below */}
                    {stop.transportDuration && (
                      <span className="mt-2 whitespace-nowrap text-[9px] font-semibold text-slate-400 sm:text-[10px]">
                        {stop.transportDuration}
                      </span>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
