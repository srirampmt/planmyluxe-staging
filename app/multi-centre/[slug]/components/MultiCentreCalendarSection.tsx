"use client";

import React from "react";
import { PriceData } from "@/types/multi-centre";
import MultiCentreCalendar from "@/components/multi-centre/MultiCentreCalendar";

type Props = {
  priceData: PriceData;
  listOfAirports: number[];
  selectedAirportId: string;
  onAirportChange: (id: string) => void;
  boardBasis: string;
  duration: string;
  location?: string;
  pricingSourceMode?: "manual" | "builder";
  landingDealDate: string;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  pricingLoading: boolean;
  onBookNow: (date?: string) => void;
};

export default function MultiCentreCalendarSection({
  priceData,
  listOfAirports,
  selectedAirportId,
  onAirportChange,
  boardBasis,
  duration,
  location,
  pricingSourceMode,
  landingDealDate,
  selectedDate,
  onDateSelect,
  pricingLoading,
  onBookNow,
}: Props) {
  return (
    <div id="holiday-calendar" className="w-full">
      {pricingLoading ? (
        <div className="w-full max-w-[420px] rounded-[16px] border border-[#EDEDED] bg-white p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-3"></div>
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded mb-3"></div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-[52px] bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <MultiCentreCalendar
          priceData={priceData}
          listOfAirports={listOfAirports}
          selectedAirportId={selectedAirportId}
          onAirportChange={onAirportChange}
          boardBasis={boardBasis}
          duration={duration}
          location={location}
          pricingSourceMode={pricingSourceMode}
          landingDealDate={landingDealDate}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          onBookNow={onBookNow}
        />
      )}
    </div>
  );
}