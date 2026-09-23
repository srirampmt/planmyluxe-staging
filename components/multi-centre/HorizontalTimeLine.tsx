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

  if (!items?.length) return null;

  return (
    <div className="relative mb-2 w-full rounded-[16px] border border-[#EDEDED] bg-white px-3 py-4 shadow-xs sm:px-5">
      {canLeft && (
        <button
          type="button"
          onClick={() => scrollBy("left")}
          aria-label="Scroll left"
          className="absolute left-2 top-1/2 z-30 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[#EDEDED] bg-white text-[#1a1a1a] shadow-sm"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      )}
      {canRight && (
        <button
          type="button"
          onClick={() => scrollBy("right")}
          aria-label="Scroll right"
          className="absolute right-2 top-1/2 z-30 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[#EDEDED] bg-white text-[#1a1a1a] shadow-sm"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}

      <div
        ref={scrollerRef}
        className="w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max min-w-full items-start">
          {items.map((stop, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === items.length - 1;
            const isEnd = isFirst || isLast;
            const rawLeg = stop.transportLabel || stop.transportToNextStop || "flight";
            const legLabel = rawLeg.charAt(0).toUpperCase() + rawLeg.slice(1);
            const nights = stop.subtitle ? formatMultiCentreDuration(stop.subtitle) : "";

            return (
              <div
                key={`${stop.title}-${idx}`}
                onClick={stop.onNodeClick}
                className={`relative flex min-w-[118px] flex-1 flex-col items-center ${
                  stop.onNodeClick ? "cursor-pointer" : ""
                }`}
              >
                <span className="block w-full truncate px-1 text-center text-[13px] font-semibold leading-none text-[#1a1a1a]">
                  {stop.title}
                </span>

                <div className="relative mt-3 flex h-6 w-full items-center justify-center">
                  {!isFirst && (
                    <span className="absolute left-0 right-1/2 top-1/2 h-[2px] -translate-y-1/2 bg-[#E4E4E7]" />
                  )}
                  {!isLast && (
                    <span className="absolute left-1/2 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-[#E4E4E7]" />
                  )}
                  <span
                    className={`relative z-10 h-2.5 w-2.5 rounded-full ring-4 ring-white ${
                      isEnd ? "bg-[#CB2187]" : "bg-[#1a1a1a]"
                    }`}
                  />
                  {!isLast && (
                    <span
                      className="absolute left-full top-1/2 z-20 inline-flex h-6 -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-[#EDEDED] bg-white px-1.5 text-[10px] font-medium text-[#1a1a1a]"
                      title={legLabel}
                    >
                      <TransportIcon
                        type={stop.transportToNextStop}
                        className="h-3 w-3 shrink-0"
                      />
                      {legLabel}
                    </span>
                  )}
                </div>

                <span
                  className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    isEnd ? "text-[#CB2187]" : "text-[#7C7C7C]"
                  }`}
                >
                  {nights}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
