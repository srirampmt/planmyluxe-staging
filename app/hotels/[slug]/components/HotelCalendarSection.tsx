"use client";

import { memo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Flame, Phone, Shield } from "lucide-react";
import { HotelDeal, DealsByDate, StaticPricingData, StaticPricingSeason } from "@/types/hotel";
import { useUtmPhone } from "@/components/utm/UtmPhoneProvider";
import { buildEnquirySource } from "@/lib/source-builder";
import { openTawkChat } from "@/lib/tawk";
import TrustpilotWidget from "@/components/TrustpilotWidget";
import { attachCurrentPageToWhatsAppHref, getWhatsAppUrl } from "@/lib/utils";
import { getWhatsAppDealTraceLine } from "@/lib/hotel-utils";
import { ChatIcon, WhatsAppIcon } from "./icons";
import HolidayCalendar from "./HolidayCalendar";

// Lazy load calendar with loading state
// const HolidayCalendar = dynamic(() => import("./HolidayCalendar"), {
//   ssr: false,
//   loading: () => (
//     <div className="relative h-[500px] overflow-hidden rounded-2xl bg-pml-primary/5">
//       <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
//       <div className="flex h-full items-center justify-center">
//         <p className="text-[13px] font-semibold text-pml-primary/60">Loading calendar…</p>
//       </div>
//     </div>
//   ),
// });

const CalendarSkeleton = dynamic(() => import("@/components/CalendarSkeleton"), {
  ssr: false,
});

const StaticPricingCard = dynamic(() => import("./StaticPricingCard"), {
  ssr: false,
});

interface HotelCalendarSectionProps {
  dealsByDate: DealsByDate;
  selectedDeal: HotelDeal | null;
  apiDataLoading: boolean;
  isSearching: boolean;
  noDealsMessage: string;
  filterOptionsWithIds: any;
  currentFilters: {
    departure: string;
    boardBasis: string;
    duration: string;
  };
  priceData: any;
  calendarDepartureDate: string;
  onDateSelect: (date: string) => void;
  onFilterChange: (filterType: "departure" | "boardBasis" | "duration", value: string) => void;
  onEnquire: () => void;
  taxPerNight?: any;
  location?: string;
  onBookNow?: () => void;
  saveText?: string;
  defaultSearchIds?: { departure: string; boardBasis: string; duration: string } | null;
  autoDeal?: boolean;
  resolvedDealAirportId?: string;
  staticPricing?: StaticPricingData | null;
  onSeasonInfoChange?: (season: StaticPricingSeason | null) => void;
  onSeasonEnquire?: () => void;
}

const HotelCalendarSection = memo(function HotelCalendarSection({
  dealsByDate,
  selectedDeal,
  apiDataLoading,
  isSearching,
  noDealsMessage,
  filterOptionsWithIds,
  currentFilters,
  priceData,
  calendarDepartureDate,
  onDateSelect,
  onFilterChange,
  onEnquire,
  taxPerNight,
  location,
  onBookNow,
  saveText,
  defaultSearchIds,
  autoDeal = true,
  resolvedDealAirportId,
  staticPricing,
  onSeasonInfoChange,
  onSeasonEnquire,
}: HotelCalendarSectionProps) {
  const pathname = usePathname();
  const defaultAirportId = filterOptionsWithIds.airports[0]?.id || "";
  const defaultBoardBasisId = filterOptionsWithIds.boardBases[0]?.id || "";
  const defaultDurationId = filterOptionsWithIds.durations[0]?.id || "";

  // Prefer Search-seeded values, fall back to currentFilters, then first option.
  // For non-auto deals, Search.departureId is generic search criteria, not the
  // deal's actual airport — use resolvedDealAirportId instead, which is computed
  // synchronously (no effect delay) so it's correct on the very first render.
  const seedAirport =
    (autoDeal ? defaultSearchIds?.departure : resolvedDealAirportId) ||
    currentFilters.departure ||
    defaultAirportId;
  const seedBoardBasis = defaultSearchIds?.boardBasis || currentFilters.boardBasis || defaultBoardBasisId;
  const seedDuration = defaultSearchIds?.duration || currentFilters.duration || defaultDurationId;
  const safeDefaultDealHotel = selectedDeal?.hotel;
  const { phoneDisplay, phoneTel } = useUtmPhone();
  const whatsappSource = buildEnquirySource({
    section: "deal",
    pathname,
    entityName: safeDefaultDealHotel?.hotelName,
  });
  const whatsappContextLine = getWhatsAppDealTraceLine(selectedDeal?.quoteReference, autoDeal, staticPricing);
  const shouldShowCalendar = Object.keys(dealsByDate).length > 0 || Boolean(noDealsMessage);

  const handleSeasonClick = () => {
    onSeasonEnquire?.();
  };

  

  return (
    <div id="holiday-calendar" className="scroll-mt-[var(--main-nav-height,0px)] md:mt-0" >
      <style>{`@keyframes pml-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
      {/* CONTACT BUTTONS */}
      <div className="grid grid-cols-3 gap-[6px] mb-6 md:mb-3">
        <a
          href={`tel:${phoneTel}`}
          className="inline-flex h-[48px] items-center justify-center gap-1.5 rounded-xl px-[6px] text-[14px] font-bold leading-[36px] bg-[#595858] text-white shadow-sm transition-all duration-200 hover:bg-[#595858] active:scale-95"
          aria-label={`Call Us: ${phoneDisplay}`}
        >
          <Phone className="h-4 w-4 flex-shrink-0" />
          <span className="text-[14px]">Call Us</span>
        </a>
        <button
          type="button"
          onClick={openTawkChat}
          className="inline-flex h-[48px] items-center justify-center gap-1.5 rounded-xl px-[6px] text-[14px] font-bold leading-[36px] bg-pml-primary-soft/50 text-pml-primary border-0 hover:bg-pml-primary/20 transition-all duration-200 active:scale-95"
          aria-label="Chat Online"
        >
          <ChatIcon className="h-5 w-5 hidden md:block" />
          <span className="text-[14px]">Chat&nbsp;Online</span>
        </button>
        <a
          href={getWhatsAppUrl({
            source: whatsappSource,
            contextLine: whatsappContextLine,
          })}
          onClick={(event) =>
            attachCurrentPageToWhatsAppHref(event, {
              source: whatsappSource,
              contextLine: whatsappContextLine,
            })
          }
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-[48px] items-center justify-center gap-1.5 rounded-xl px-[6px] text-[14px] font-bold leading-[36px] bg-[#1B7A44] text-white shadow-sm transition-all duration-200 hover:bg-[#1ebc59] active:scale-95"
          aria-label="WhatsApp"
        >
          <WhatsAppIcon className="h-5 w-5 flex-shrink-0" />
          <span className="text-[14px]">Whatsapp</span>
        </a>
      </div>
      <div
        className="w-full rounded-2xl border border-gray-200 bg-white p-3 font-['Montserrat'] shadow-md shadow-pml-primary/10 relative"
        aria-busy={isSearching || apiDataLoading}
      >

        {/* CALENDAR */}
        {staticPricing ? (
          <StaticPricingCard
            data={staticPricing}
            phoneTel={phoneTel}
            onSeasonInfoChange={onSeasonInfoChange}
            onSeasonClick={handleSeasonClick}
            whatsappSource={whatsappSource}
            whatsappContextLine={whatsappContextLine}
          />
        ) : !apiDataLoading && shouldShowCalendar ? (
          <HolidayCalendar
            availableAirports={filterOptionsWithIds.airports}
            availableBoardBases={filterOptionsWithIds.boardBases}
            availableDurations={filterOptionsWithIds.durations}
            selectedAirport={seedAirport}
            selectedBoardBasis={seedBoardBasis}
            selectedDuration={seedDuration}
            initialPrices={priceData}
            initialDepartureDate={calendarDepartureDate}
            defaultDate={safeDefaultDealHotel?.checkInDate || calendarDepartureDate}
            nights={(selectedDeal?.hotel?.duration ?? Number(selectedDeal?.hotel?.nights)) || 7}
            onDateSelect={onDateSelect}
            onFilterChange={onFilterChange}
            onEnquire={onEnquire}
            isSearching={isSearching || apiDataLoading}
            hideFilters={false}
            noDealsMessage={noDealsMessage || undefined}
            selectedDeal={selectedDeal}
            taxPerNight={taxPerNight}
            location={location}
            apiDataLoading={apiDataLoading}
            onBookNow={onBookNow}
            saveText={saveText}
            autoDeal={autoDeal}
          />
        ) : apiDataLoading ? (
          <CalendarSkeleton />
        ) : null}
        {/* TRUST & SOCIAL PROOF */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Header label */}
          <div className="px-4 py-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pml-primary/10">
                <Shield className="h-3.5 w-3.5 text-pml-primary" />
              </span>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#242F40]">
                Trusted &amp; Protected
              </p>
            </div>
            {/* Badge row */}
            <div className="flex items-center gap-2">
              <a
                href="https://thetravelnetworkgroup.co.uk/verify-a-member/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Travel Trust Association – Member Q6399"
                className="flex h-[84px] flex-1 items-center justify-center rounded-xl border border-gray-100 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <Image
                  src="https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/homepage/TTA.webp"
                  alt="Travel Trust Association"
                  width={200}
                  height={108}
                  className="h-[44px] w-auto object-contain"
                />
              </a>
              <a
                href="https://www.caa.co.uk/atol-protection/check-an-atol/search-atol-holders/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ATOL Protected T7655"
                className="flex h-[84px] flex-1 items-center justify-center rounded-xl border border-gray-100 bg-white p-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <Image
                  src="https://planmylux.s3.eu-west-2.amazonaws.com/ATOL-3.webp"
                  alt="ATOL Protected T7655"
                  width={128}
                  height={128}
                  className="h-[64px] w-[64px] rounded-full object-contain"
                />
              </a>
            </div>
          </div>
          {/* Trustpilot row */}
          <div className="border-t border-gray-100 pt-3">
            <TrustpilotWidget />
          </div>
        </div>
      </div>
    </div>
  );
});

export default HotelCalendarSection;


