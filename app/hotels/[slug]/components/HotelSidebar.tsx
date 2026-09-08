"use client";

import { memo } from "react";
import dynamic from "next/dynamic";
import { HotelDeal } from "@/types/hotel";

const FlightSummary = dynamic(() => import("./FlightSummary"), {
  ssr: false,
  loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded-lg"></div>,
});

const FlightSummarySkeleton = dynamic(() => import("@/components/FlightSummarySkeleton"), {
  ssr: false,
});

const ContactAndTrending = dynamic(() => import("./ContactAndTrending"), {
  ssr: false,
});

interface HotelSidebarProps {
  selectedDeal: HotelDeal | null;
  taxPerNight: any;
  location: string;
  apiDataLoading: boolean;
  noDealsMessage: string;
  onBookNow: () => void;
  afterSummary?: React.ReactNode;
  saveText?: string;
}

const HotelSidebar = memo(function HotelSidebar({
  selectedDeal,
  taxPerNight,
  location,
  apiDataLoading,
  noDealsMessage,
  onBookNow,
  afterSummary,
  saveText,
}: HotelSidebarProps) {
  return (
    <aside className="w-full">
      <div
        className="space-y-4 md:sticky self-start"
        style={{ top: "calc(var(--main-nav-height, 0px) + 16px)" }}
      >
        {/* <div className="hidden md:block">
          <ContactAndTrending />
        </div> */}
        {noDealsMessage ? (
          <FlightSummary emptyStateMessage={noDealsMessage} onBookNow={onBookNow} saveText={saveText} />
        ) : (
          <div className="relative">
            {selectedDeal ? (
              <FlightSummary
                selectedDeal={selectedDeal}
                taxPerNight={taxPerNight}
                location={location}
                onBookNow={onBookNow}
                saveText={saveText}
              />
            ) : apiDataLoading ? (
              <FlightSummarySkeleton />
            ) : null}

            {apiDataLoading ? <FlightSummarySkeleton /> : null}
          </div>
        )}

        {afterSummary ? <div>{afterSummary}</div> : null}
        {/* <div className="md:hidden">
          <ContactAndTrending />
        </div> */}
      </div>
    </aside>
  );
});

export default HotelSidebar;
