"use client";

import { useState, useEffect, useCallback, type SyntheticEvent } from "react";
import MobileDealSheet from "./MobileDealSheet";
import { buildEnquirySource } from "@/lib/source-builder";
import McMobileConnectMenu from "./McMobileConnectMenu";

type Props = {
  selectedPrice: number | null;
  onViewOptions?: () => void;
  onEnquire?: () => void;
  selectedDate?: string;
  slug?: string;
  selectedPriceItem?: {
    date?: string;
    price?: number;
    localTax?: number;
    totalPrice?: number;
    referenceId?: string;
  } | null;
  forceEnquireCta?: boolean;
  message?: string;
};

export default function McMobileStickyFooter({
  selectedPrice,
  onViewOptions,
  onEnquire,
  selectedDate,
  slug,
  selectedPriceItem,
  forceEnquireCta,
  message,
}: Props) {
  const formatPrice = (price?: number | null) =>
    price == null ? "-" : `£${Math.round(price)}`;
  const [isCalendarReached, setIsCalendarReached] = useState(false);
  const [isMobileDealSheetOpen, setIsMobileDealSheetOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (typeof window === "undefined") return;
      if (!window.matchMedia("(max-width: 767px)").matches) return;
      window.setTimeout(() => setIsMobileDealSheetOpen(true), 0);
    };

    window.addEventListener(
      "mc:open-mobile-deal-sheet",
      handler as EventListener,
    );
    return () =>
      window.removeEventListener(
        "mc:open-mobile-deal-sheet",
        handler as EventListener,
      );
  }, []);

  const pickVisible = useCallback(
    (elements: Array<HTMLElement | null | undefined>) => {
      for (const el of elements) {
        if (!el) continue;
        if (el.getClientRects().length > 0) return el;
      }
      return null;
    },
    [],
  );

  useEffect(() => {
    const handleScroll = () => {
      const holidayCalendarEls = Array.from(
        document.querySelectorAll<HTMLElement>("#holiday-calendar"),
      );
      const calendarEl = pickVisible([
        document.getElementById("holiday-calendar") as HTMLElement | null,
        ...holidayCalendarEls,
        document.getElementById("holiday-calendar-mc") as HTMLElement | null,
      ]);
      if (!calendarEl) return;

      const rect = calendarEl.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      setIsCalendarReached(isVisible);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pickVisible]);

  const handleOpenMobileSheet = useCallback(() => {
    setIsMobileDealSheetOpen(true);
  }, []);

  const showEnquireCta = isCalendarReached || forceEnquireCta;

  const handleCtaClick = (e?: SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onViewOptions?.();

    const holidayCalendarEls = Array.from(
      document.querySelectorAll<HTMLElement>("#holiday-calendar"),
    );

    const targetEl = pickVisible([
      document.getElementById("holiday-calendar-grid") as HTMLElement | null,
      document.getElementById("multi-centre-calendar") as HTMLElement | null,
      ...holidayCalendarEls,
      document.getElementById("holiday-calendar-mc") as HTMLElement | null,
    ]);
    if (!targetEl) return;

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const prevBodyPointerEvents = document.body.style.pointerEvents;
    document.body.style.pointerEvents = "none";

    window.setTimeout(() => {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        targetEl.focus?.({ preventScroll: true });
        document.body.style.pointerEvents = prevBodyPointerEvents;
      }, 500);
    }, 0);
  };

  return (
    <>
      <MobileDealSheet
        open={isMobileDealSheetOpen}
        onOpenChange={setIsMobileDealSheetOpen}
        enquiryInitialValues={{
          selectedDate,
          selectedPrice,
          quoteRef: (selectedPriceItem as any)?.referenceId,
          source: buildEnquirySource({
            section: "multi-centre",
            entityName: slug,
          }),
          resort: slug ?? "",
          localTax: (selectedPriceItem as any)?.localTax ?? null,
          totalPrice:
            (selectedPriceItem as any)?.totalPrice ?? selectedPrice ?? null,
          basePrice:
            (selectedPriceItem as any)?.price ??
            ((selectedPriceItem as any)?.totalPrice != null &&
            (selectedPriceItem as any)?.localTax != null
              ? (selectedPriceItem as any).totalPrice -
                (selectedPriceItem as any).localTax
              : null),
          message,
        }}
        deal={null}
      />

      {/* Slim Modern Footer Wrapper */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 px-4 pt-1.5 pb-3.5 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden"
        data-testid="mc-mobile-footer"
      >
        <McMobileConnectMenu slug={slug} />

        {/* Compact Single Row Content */}
        <div className="mt-1 flex items-center justify-between gap-3">
          {/* Price Container */}
          <div className="min-w-0 flex-1">
            {selectedPrice !== null ? (
              <div className="flex flex-col justify-center">
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    From
                  </span>
                  <div className="flex items-baseline text-xl font-extrabold text-black leading-none">
                    <span className="text-xs font-bold text-black mr-0.5">
                      £
                    </span>
                    {Math.round(selectedPrice)}
                    <span className="ml-1 text-[10px] font-semibold text-slate-400">
                      pp
                    </span>
                  </div>
                </div>

                {selectedPriceItem &&
                Number((selectedPriceItem as any).localTax) > 0 ? (
                  <div className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-slate-500">
                    <span>{formatPrice((selectedPriceItem as any).price)}</span>
                    <span>+</span>
                    <span className="font-semibold text-black">
                      £{Math.round(Number((selectedPriceItem as any).localTax))}{" "}
                      tax
                    </span>
                  </div>
                ) : (
                  <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-400">
                    Per person starting price
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col justify-center">
                <span className="text-xs font-bold text-black leading-tight">
                  Select a date
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  View pricing & options
                </span>
              </div>
            )}
          </div>

          {/* Action CTA Button */}
          <button
            type="button"
            onClick={showEnquireCta ? handleOpenMobileSheet : handleCtaClick}
            className="shrink-0 h-10 px-5 inline-flex items-center justify-center rounded-full bg-[#CB2187] text-xs font-bold text-white shadow-sm shadow-[#CB2187]/30 transition-transform active:scale-95 focus:outline-none"
          >
            {showEnquireCta ? "Enquire Now" : "View Options"}
          </button>
        </div>
      </div>
    </>
  );
}
