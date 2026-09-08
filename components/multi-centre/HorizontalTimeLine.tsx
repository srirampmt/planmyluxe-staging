import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bus, Car, ChevronLeft, ChevronRight, Plane, Ship, Train } from "lucide-react";

export type TimelineTransport = "flight" | "train" | "bus" | "ship" | "transfer" | "car";

export type TimelineStop = {
  title: string;
  subtitle?: string;
  transportToNextStop?: TimelineTransport;
  displayDay?: number;
};

type Props = {
  items: TimelineStop[];
};

function normalizeTransportType(type?: string | null): TimelineTransport | undefined {
  const normalizedType = type?.trim().toLowerCase();

  if (!normalizedType) {
    return undefined;
  }

  if (normalizedType.includes("flight") || normalizedType.includes("fly") || normalizedType.includes("air")) {
    return "flight";
  }

  if (normalizedType.includes("train") || normalizedType.includes("rail")) {
    return "train";
  }

  if (
    normalizedType.includes("ship") ||
    normalizedType.includes("cruise") ||
    normalizedType.includes("ferry") ||
    normalizedType.includes("boat")
  ) {
    return "ship";
  }

  if (
    normalizedType.includes("bus") ||
    normalizedType.includes("coach")
  ) {
    return "bus";
  }

  if (normalizedType.includes("transfer")) {
    return "transfer";
  }

  if (normalizedType.includes("taxi") || normalizedType.includes("car")) {
    return "car";
  }

  return undefined;
}

function TransportIcon({ type, className }: { type?: string; className?: string }) {
  const normalizedType = normalizeTransportType(type);
  switch (normalizedType) {
    case "flight":
      return <Plane className={className} />;
    case "train":
      return <Train className={className} />;
    case "bus":
      return <Bus className={className} />;
    case "car":
      return <Car className={className} />;
    case "transfer":
      return <Bus className={className} />;
    case "ship":
      return <Ship className={className} />;
    default:
      return null;
  }
}

export default function HorizontalTimeLine({ items }: Props) {
  const stops = useMemo(() => items, [items]);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = scrollerRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < Math.max(0, maxScrollLeft - 1));
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => updateScrollButtons();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [stops.length]);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(200, Math.floor(el.clientWidth * 0.75));
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative w-full">
      {canScrollLeft ? (
        <button
          type="button"
          onClick={() => scrollByAmount("left")}
          aria-label="Scroll timeline left"
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-pml-primary bg-white p-1.5 text-pml-primary shadow-sm hover:bg-[#F8F8F8]"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : null}

      {canScrollRight ? (
        <button
          type="button"
          onClick={() => scrollByAmount("right")}
          aria-label="Scroll timeline right"
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-pml-primary bg-white p-1.5 text-pml-primary shadow-sm hover:bg-[#F8F8F8]"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : null}

      <div
        ref={scrollerRef}
        className="w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex items-center gap-0 min-w-max px-2">
        {stops.map((it, idx) => {
          const isLast = idx === stops.length - 1;
          const segmentTransport = normalizeTransportType(it.transportToNextStop);
          
          const cityName = it.title;
          const displayDay = it.displayDay ?? idx + 1;
          
          return (
            <React.Fragment key={`${it.title}-${idx}`}>
              <div
                className="flex flex-col items-center min-w-[80px] pt-2"
              >
                {/* Circle with day number */}
                <div
                  className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-pml-primary bg-pml-primary text-white font-bold"
                >
                  {displayDay}
                  
                </div>
                
                {/* Day label */}
                <span
                  className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-pml-primary"
                >
                  {cityName}
                </span>
              </div>
              
              {/* Connecting line with gradient */}
              {!isLast && (
                <div className="relative flex items-center self-center mx-1">
                  <div 
                    className="h-[3px] w-6 md:w-10 rounded-full bg-gradient-to-r from-pml-primary to-[#FBE8F4]"
                  />
                  {segmentTransport ? (
                    <TransportIcon 
                      type={segmentTransport} 
                      className="absolute left-1/2 -translate-x-1/2 -top-7 h-6 w-6 text-pml-primary"
                    />
                  ) : null}
                  
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