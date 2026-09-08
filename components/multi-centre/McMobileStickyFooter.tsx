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
  selectedPriceItem?: { date?: string; price?: number; localTax?: number; totalPrice?: number; referenceId?: string } | null;
  forceEnquireCta?: boolean;
  message?: string;
};

export default function McMobileStickyFooter({ selectedPrice, onViewOptions, onEnquire, selectedDate, slug, selectedPriceItem, forceEnquireCta, message }: Props) {
  const formatPrice = (price?: number | null) => (price == null ? "-" : `£${Math.round(price)}`);
  const [isCalendarReached, setIsCalendarReached] = useState(false);
  const [isMobileDealSheetOpen, setIsMobileDealSheetOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (typeof window === "undefined") return;
      // Only open on mobile viewport sizes (Tailwind `md` breakpoint is 768px).
      if (!window.matchMedia("(max-width: 767px)").matches) return;
      // Defer so parent state (selectedDate, selectedPriceItem) can update before the sheet reads it.
      window.setTimeout(() => setIsMobileDealSheetOpen(true), 0);
    };

    window.addEventListener("mc:open-mobile-deal-sheet", handler as EventListener);
    return () => window.removeEventListener("mc:open-mobile-deal-sheet", handler as EventListener);
  }, []);

  const pickVisible = useCallback((elements: Array<HTMLElement | null | undefined>) => {
    for (const el of elements) {
      if (!el) continue;
      if (el.getClientRects().length > 0) return el;
    }
    return null;
  }, []);
  // Mobile sticky CTA behavior
  useEffect(() => {
    const handleScroll = () => {
      const holidayCalendarEls = Array.from(
        document.querySelectorAll<HTMLElement>("#holiday-calendar")
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
      document.querySelectorAll<HTMLElement>("#holiday-calendar")
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
          source: buildEnquirySource({ section: "multi-centre", entityName: slug }),
          resort: slug ?? "",
          localTax: (selectedPriceItem as any)?.localTax ?? null,
          totalPrice: (selectedPriceItem as any)?.totalPrice ?? selectedPrice ?? null,
          basePrice: (selectedPriceItem as any)?.price ?? ((selectedPriceItem as any)?.totalPrice != null && (selectedPriceItem as any)?.localTax != null ? (selectedPriceItem as any).totalPrice - (selectedPriceItem as any).localTax : null),
          message,
        }}
        deal={null}
        // boardBasis={""}
        // duration={""}
        // destinations={[]}
      />
      <div 
        className="fixed inset-x-0 bottom-0 z-50 w-full bg-[#FBE8F4] py-2 md:hidden"
        data-testid="mc-mobile-footer"
      >
        <McMobileConnectMenu
          slug={slug}
        />

        {/* Price and CTA */}
        <div className="relative z-[70] w-full">
          <div className="flex w-full items-center justify-between text-[#4c4c4c] px-5">
            <div className="min-w-0">
              {selectedPrice !== null ? (
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1 justify-start">
                    <span className="text-[11px] text-[#4c4c4c]">From</span>
                    <div className="text-pml-primary text-[22px] font-bold leading-none">
                      <span className="text-[#4c4c4c] text-[12px]">£</span>{" "}
                      {Math.round(selectedPrice)}{" "}
                      <span className="text-[#4c4c4c] text-[11px] font-medium">pp</span>
                    </div>
                  </div>
                  {selectedPriceItem && Number((selectedPriceItem as any).localTax) > 0 ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-[14px]">
                        {formatPrice((selectedPriceItem as any).price)}
                      </div>

                      <div className="text-[14px]">+</div>

                      <div className="text-[13px] font-semibold">
                        £{Math.round(Number((selectedPriceItem as any).localTax))}
                      </div>

                      <div className="text-[10px] text-[#595858] font-semibold">
                        (Local tax)
                      </div>
                    </div>
                  ) : (
                    <div className="text-[13px] mt-1">
                      Per Person Price Starting from
                    </div>
                  )}
                </div>
              ) : (
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-[#4c4c4c]">
                    Select a date
                  </div>
                  <div className="text-[11px] text-[#6B6B6B]">
                    to see the price
                  </div>
                </div>
              )}
            </div>

            <button type="button" onClick={showEnquireCta ? handleOpenMobileSheet : handleCtaClick} className="shrink-0 whitespace-nowrap rounded-[10px] bg-[#CB2187] px-4 py-2 text-[10px] font-semibold text-white" >
              {showEnquireCta ? "Enquire Now" : "View Options"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
