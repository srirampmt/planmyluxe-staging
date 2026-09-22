"use client";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  formatDateTime,
  getTripSummary,
  getPricePerPerson,
  formatPrice,
  getEffectivePrice,
  calculateTotalTax,
  formatAirport,
  formatAirline,
  getDealTraceLine,
  getWhatsAppDealTraceLine,
  toIsoDateKey,
} from "@/lib/hotel-utils";
import { useUtmPhone } from "@/components/utm/UtmPhoneProvider";
import { getBoardBasisName } from "@/lib/mappings";
import { Flame, Phone } from 'lucide-react';
import { HotelPageResponse, StaticPricingSeason } from "@/types/hotel";
import { useHotelData } from "./hooks/useHotelData";
import { useHotelFilters } from "./hooks/useHotelFilters";
import { useHotelSearch } from "./hooks/useHotelSearch";

// Import optimized section components
import HotelCalendarSection from "./components/HotelCalendarSection";
import EnhanceYourTrip from "./components/EnhanceYourTrip";
import HotelSidebar from "./components/HotelSidebar";
import SimilarDeals from "./components/SimilarDeals";
import McMobileConnectMenu from "@/components/multi-centre/McMobileConnectMenu";
import { usePublishRouteWhatsAppContext } from "@/components/multi-centre/RouteWhatsAppContext";
import { openTawkChat } from "@/lib/tawk";
import { attachCurrentPageToWhatsAppHref, getWhatsAppUrl } from "@/lib/utils";
import { buildEnquirySource } from "@/lib/source-builder";
import FAQs from "@/components/faqs";
import { ChatIcon, WhatsAppIcon } from "./components/icons";
// Lazy load heavy components for better performance
const HotelBanner = dynamic(() => import("./components/HotelBanner"), {
  loading: () => (
    <div className="relative h-96 overflow-hidden rounded-2xl bg-pml-primary/5">
      <div className="absolute inset-0 -translate-x-full animate-[pml-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  ),
});

const HolidayDealCard = dynamic(() => import("./components/HolidayDealCard"), {
  ssr: false,
});

const EnquiryModal = dynamic(() => import("./components/EnquiryModal"), {
  ssr: false,
});

const MobileDealSheet = dynamic(() => import("./components/MobileDealSheet"), {
  ssr: false,
});

const HotelDetailsTabs = dynamic(() => import("./components/HotelDetailsTabs"), {
  ssr: false,
});

const OfferHeader = dynamic(() => import("./components/OfferHeader"));
const ShareOffer = dynamic(() => import("./components/ShareOffer"));
const Trustsection = dynamic(() => import("@/components/Trustsection"), { ssr: false });

// Utility functions
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

function asArray<T>(value: T[] | "" | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

const asHtmlList = (items: unknown) => {
  if (!Array.isArray(items)) return "";
  const listItems = items
    .map((item) => `<li>${escapeHtml(String(item ?? ""))}</li>`)
    .join("");
  return `<ul>${listItems}</ul>`;
};

type HotelPageClientProps = {
  slug: string;
  initialHotelData: HotelPageResponse | null;
  initialLive: any;
};

export default function HotelPageClient({ slug, initialHotelData, initialLive }: HotelPageClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { phoneDisplay, phoneTel } = useUtmPhone();

  const todayIso = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }, []);

  const gridRef = useRef<HTMLDivElement>(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isMobileDealSheetOpen, setIsMobileDealSheetOpen] = useState(false);
  const [selectedSeasonInfo, setSelectedSeasonInfo] = useState<StaticPricingSeason | null>(null);
  const [isCalendarReached, setIsCalendarReached] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (footer) {
      footer.classList.add("hidden", "md:block");
    }
    return () => {
      if (footer) {
        footer.classList.remove("hidden", "md:block");
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
    }
    return () => {
      // restore for other pages
      window.history.scrollRestoration = 'auto';
    };
  }, []);

  // Use custom hooks for data management
  const {
    hotelData,
    contentLoading,
    apiDataLoading,
    dealsByDate,
    selectedDate,
    selectedDeal,
    noDealsMessage,
    handleDateSelection,
    setDealsByDate,
    setSelectedDate,
    setSelectedDeal,
    setNoDealsMessage,
    setHotelData,
    initialSnapshotRef,
    defaultSearchIds,
    addons,
    offerExpireDate,
    isAutoDeal,
    setIsAutoDeal,
    staticPricing,
    setStaticPricing,
  } = useHotelData({ slug, initialHotelData, initialLive });


  const dealPageSource = buildEnquirySource({ section: "deal", entityName: hotelData?.page?.hotel_name });
  // Backend trace marker: real quoteReference for API deals; synthetic label otherwise
  const effectiveQuoteRef = getDealTraceLine(selectedDeal?.quoteReference, isAutoDeal, staticPricing) || "";
  const hotelQuoteContextLine = getWhatsAppDealTraceLine(selectedDeal?.quoteReference, isAutoDeal, staticPricing);

  usePublishRouteWhatsAppContext(pathname, hotelQuoteContextLine);

  const {
    currentFilters,
    currentFiltersRef,
    currentFiltersDisplayRef,
    filterOptionsWithIds,
    dealDisplayFilters,
    resolvedDealAirportId,
  } = useHotelFilters(hotelData, selectedDeal, defaultSearchIds, isAutoDeal);

  const { isSearching, handleFilterChange } = useHotelSearch(
    hotelData,
    setHotelData,
    setDealsByDate,
    setSelectedDate,
    setSelectedDeal,
    setNoDealsMessage,
    initialSnapshotRef,
    filterOptionsWithIds,
    currentFiltersRef,
    currentFiltersDisplayRef,
    isAutoDeal,
    setIsAutoDeal,
    setStaticPricing
  );


  // NOTE: Must be declared before any early returns (loading/not-found) to keep hook order stable.
  const handleCtaClick = useCallback((e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const targetEl =
      (document.getElementById("holiday-calendar-grid") as HTMLElement | null) ??
      (document.getElementById("holiday-calendar") as HTMLElement | null);
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
  }, []);

  // Modal handlers
  const handleEnquireNow = useCallback(() => {
    setIsEnquiryOpen(true);
  }, []);

  const handleOpenMobileSheet = useCallback(() => {
    if (noDealsMessage || (!selectedDeal && !selectedSeasonInfo)) {
      setIsEnquiryOpen(true);
      return;
    }
    setIsMobileDealSheetOpen(true);
  }, [noDealsMessage, selectedDeal, selectedSeasonInfo]);

  // Season cards (static-pricing mode) never have a selectedDeal, so they must
  // bypass handleOpenMobileSheet's deal-presence guard and open the sheet directly.
  const handleOpenMobileSheetForSeason = useCallback(() => {
    setIsMobileDealSheetOpen(true);
  }, []);

  const handleCloseEnquiry = useCallback(() => {
    setIsEnquiryOpen(false);
  }, []);

  // Close mobile sheet when deals are cleared
  useEffect(() => {
    if (noDealsMessage || !selectedDeal) {
      setIsMobileDealSheetOpen(false);
    }
  }, [noDealsMessage, selectedDeal]);

  // Mobile sticky CTA behavior
  useEffect(() => {
    const handleScroll = () => {
      const calendarEl = document.getElementById("holiday-calendar");
      if (!calendarEl) return;

      const rect = calendarEl.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      setIsCalendarReached(isVisible);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calendar expects numeric prices keyed by date.
  // Calendar grid shows the base price only (tax excluded) — recomputed from the
  // stored deal object rather than dealsByDate[date].price, which is tax-inclusive.
  const priceData = useMemo(
    () =>
      Object.keys(dealsByDate).map((date) => ({
        date: toIsoDateKey(date) || date,
        price: Math.round(getEffectivePrice(dealsByDate[date].deal)),
        hasCustomPrice: dealsByDate[date].hasCustomPrice,
      })),
    [dealsByDate]
  );

  // Loading state — shimmering skeleton silhouette of the banner + calendar layout
  if (contentLoading) {
    return (
      <div className="min-h-screen bg-white">
        <style>{`@keyframes pml-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
        <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-10">
          {/* Banner silhouette */}
          <div className="relative mb-6 overflow-hidden rounded-2xl bg-white p-4 shadow-xl shadow-pml-primary/10 md:p-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="relative h-6 w-48 overflow-hidden rounded-lg bg-pml-primary/10">
                  <div className="absolute inset-0 -translate-x-full animate-[pml-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </div>
                <div className="relative h-4 w-32 overflow-hidden rounded-lg bg-pml-primary/10">
                  <div className="absolute inset-0 -translate-x-full animate-[pml-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </div>
              </div>
              <div className="relative h-14 w-40 overflow-hidden rounded-2xl bg-pml-primary/10">
                <div className="absolute inset-0 -translate-x-full animate-[pml-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[2fr_1fr] md:gap-3">
              <div className="relative h-[220px] overflow-hidden rounded-2xl bg-pml-primary/10 sm:h-[320px] md:h-[380px]">
                <div className="absolute inset-0 -translate-x-full animate-[pml-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-1 md:grid-rows-2 md:gap-3">
                <div className="relative h-[130px] overflow-hidden rounded-2xl bg-pml-primary/10 sm:h-[170px] md:h-[184px]">
                  <div className="absolute inset-0 -translate-x-full animate-[pml-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </div>
                <div className="relative h-[130px] overflow-hidden rounded-2xl bg-pml-primary/10 sm:h-[170px] md:h-[184px]">
                  <div className="absolute inset-0 -translate-x-full animate-[pml-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* Calendar silhouette */}
          <div className="relative mx-auto max-w-[421px] overflow-hidden rounded-2xl bg-white p-3 shadow-xl shadow-pml-primary/10">
            <div className="mb-3 grid grid-cols-3 gap-[6px]">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="relative h-12 overflow-hidden rounded-xl bg-pml-primary/10">
                  <div className="absolute inset-0 -translate-x-full animate-[pml-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 21 }).map((_, i) => (
                <div key={i} className="relative h-[54px] overflow-hidden rounded-xl bg-pml-primary/10">
                  <div className="absolute inset-0 -translate-x-full animate-[pml-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-[14px] font-semibold text-pml-primary/70">
            Loading hotel details…
          </p>
        </main>
      </div>
    );
  }

  if (!hotelData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-[440px] rounded-2xl bg-white p-8 text-center shadow-xl shadow-pml-primary/10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pml-primary/10">
            <Flame className="h-8 w-8 text-pml-primary" />
          </div>
          <p className="text-[22px] font-extrabold text-[#242F40]">Hotel not found</p>
          <p className="mt-2 text-[14px] text-[#595858]">
            This hotel page may have moved or is no longer available. Explore our other exclusive deals instead.
          </p>
          <Link
            href="/hotels"
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-pml-primary hover:bg-[#a81a6f] px-6 py-3 text-[16px] font-bold text-white shadow-[0_8px_24px_rgba(203,33,135,0.4)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            Browse deals
          </Link>
        </div>
      </div>
    );
  }

  const page = hotelData.page;

  // Prepare data for components
  const hasAnyDropdownOptions = filterOptionsWithIds.airports.length > 0 || filterOptionsWithIds.boardBases.length > 0 || filterOptionsWithIds.durations.length > 0;
  const defaultAirportId = filterOptionsWithIds.airports[0]?.id || "";
  const defaultBoardBasisId = filterOptionsWithIds.boardBases[0]?.id || "";
  const defaultDurationId = filterOptionsWithIds.durations[0]?.id || "";

  const safeDefaultDeal = hotelData?.api_data?.default_deal;
  const safeDefaultDealHotel = safeDefaultDeal && safeDefaultDeal.hotel ? safeDefaultDeal.hotel : null;
  const calendarDepartureDate =
    toIsoDateKey(selectedDate) ||
    toIsoDateKey(searchParams.get("checkinDate")) ||
    (noDealsMessage ? todayIso : toIsoDateKey(safeDefaultDealHotel?.checkInDate)) ||
    todayIso;

  const reviewsData = {
    rating: page.trip_advisor_rating || page.trip_advisor_reviews_rating,
    total: page.trip_advisor_reviews,
    updatedAt: page.trip_advisor_reviews_last_updated_date,
    google: {
      rating: page.google_rating,
      count: page.google_review_count,
      reviews: page.google_reviews,
    },
  };

  // Mobile price breakdown
  const mobilePriceBreakdown = selectedDeal
    ? {
      priceBeforeTax: Math.round(getEffectivePrice(selectedDeal)),
      totalTax: Math.round(calculateTotalTax(selectedDeal, page.Tax_per_night, page.location)),
    }
    : null;

  const mobilePriceBeforeTaxPerPerson = mobilePriceBreakdown
    ? getPricePerPerson(mobilePriceBreakdown.priceBeforeTax)
    : null;
  const mobileTaxPerPerson = mobilePriceBreakdown
    ? getPricePerPerson(mobilePriceBreakdown.totalTax)
    : null;
  const showMobileTaxBreakdown = Boolean(
    mobilePriceBreakdown && mobilePriceBreakdown.totalTax > 0
  );
  const handleOpenChat = () => {
    openTawkChat();
  };

  return (
    <>
      <div className="min-h-screen bg-white relative">
        <style>{`@keyframes pml-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
        <MobileDealSheet
          open={isMobileDealSheetOpen}
          onOpenChange={setIsMobileDealSheetOpen}
          deal={selectedDeal}
          seasonInfo={selectedSeasonInfo}
          taxPerNight={page.Tax_per_night}
          location={page.location}
          enquiryInitialValues={{
            destination: hotelData.page.location,
            resort: selectedDeal?.hotel?.hotelName || hotelData.page.hotel_name,
            quoteRef: selectedDeal?.quoteReference,
            quoteRefForSubmit: effectiveQuoteRef,
            quoteRefForWhatsApp: hotelQuoteContextLine,
            dealdata: selectedDeal,
            source: dealPageSource,
          }}
        />
        <EnquiryModal
          open={isEnquiryOpen}
          onClose={handleCloseEnquiry}
          initialValues={{
            destination: hotelData.page.location,
            resort: selectedDeal?.hotel?.hotelName || hotelData.page.hotel_name,
            quoteRef: selectedDeal?.quoteReference,
            quoteRefForSubmit: effectiveQuoteRef,
            quoteRefForWhatsApp: hotelQuoteContextLine,
            dealdata: selectedDeal,
            source: dealPageSource,
          }}
        />
        <main className="mx-auto px-4 md:px-10">
          <HotelBanner
            title={page.offer_mode ? page.offer_header : page.hotel_name}
            subtitle={page.offer_mode ? (page.info_paragraph || "Exclusive offer to Plan My Luxe - Hurry Limited Seats and Availability - Selling Fast!!!") : page.location}
            saveText={page.saveuptotext}
            price={
              noDealsMessage
                ? "---"
                : selectedDeal
                  ? Math.round(getEffectivePrice(selectedDeal) + calculateTotalTax(selectedDeal, page.Tax_per_night, page.location)).toString()
                  : selectedSeasonInfo
                    ? Math.round(Number(selectedSeasonInfo.price)).toString()
                    : "--"
            }
            ctaText="View Options"
            thumbnail_1={page.thumbnail_1}
            thumbnail_2={page.thumbnail_2}
            thumbnail_3={page.thumbnail_3}
            images={page.pictures}
            badgeText={page.Banner_Image_chips}
            isLoadingPrice={apiDataLoading && !selectedDeal && !selectedSeasonInfo}
            basePrice={
              selectedDeal
                ? getEffectivePrice(selectedDeal)
                : selectedSeasonInfo
                  ? Number(selectedSeasonInfo.price)
                  : null
            }
            localTax={selectedDeal ? calculateTotalTax(selectedDeal, page.Tax_per_night, page.location) : null}
            totalPrice={
              selectedDeal
                ? getEffectivePrice(selectedDeal) + calculateTotalTax(selectedDeal, page.Tax_per_night, page.location)
                : selectedSeasonInfo
                  ? Number(selectedSeasonInfo.price)
                  : null
            }
            onEnquire={handleEnquireNow}
            isSearching={isSearching}
            hidePriceSection={Boolean(noDealsMessage)}
            offerMode={page.offer_mode}
            rating={Number(page.property_rating) || 0}
            destination={page.hotel_destinations}
            slug={page.slug}
          />

          <div className="mx-auto max-w-[1280px] pt-[8px] md:pt-[16px] pb-[10px] md:pb-[16px]">
            <ShareOffer variant="headerRow" badges={page.tag_list} />
          </div>

          <div className="mx-auto max-w-[1280px] pb-[16px]">
            <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(320px,421px)] gap-1 lg:gap-6">
              {/* Left column */}
              <div className="w-full space-y-2 md:space-y-1">
                {page.offer_mode && (
                  // <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xl shadow-pml-primary/5 md:p-6">
                  <OfferHeader
                    location={page.location}
                    hotelName={page.hotel_name}
                    rating={Number(page.property_rating) || 0}
                    description={page.headline_review}
                    offerMode={page.offer_mode}
                  />
                  // </div>
                )}
                <div className="block md:hidden">
                  <HotelCalendarSection
                    dealsByDate={dealsByDate}
                    selectedDeal={selectedDeal}
                    apiDataLoading={apiDataLoading}
                    isSearching={isSearching}
                    noDealsMessage={noDealsMessage}
                    filterOptionsWithIds={filterOptionsWithIds}
                    currentFilters={currentFilters}
                    priceData={priceData}
                    calendarDepartureDate={calendarDepartureDate}
                    onDateSelect={handleDateSelection}
                    onFilterChange={handleFilterChange}
                    onEnquire={handleOpenMobileSheet}
                    taxPerNight={page.Tax_per_night}
                    location={page.location}
                    onBookNow={handleOpenMobileSheet}
                    defaultSearchIds={defaultSearchIds}
                    saveText={page.saveuptotext}
                    autoDeal={isAutoDeal}
                    resolvedDealAirportId={resolvedDealAirportId}
                    staticPricing={staticPricing}
                    onSeasonInfoChange={setSelectedSeasonInfo}
                    onSeasonEnquire={handleOpenMobileSheetForSeason}
                  />
                </div>
                {page.offer_mode && (
                  <>
                    <EnhanceYourTrip addons={addons} offerExpireDate={offerExpireDate} />
                  </>
                )}
                {page.offer_mode && (
                  <div className="w-full py-4 md:py-6">
                    <HolidayDealCard
                      aboutTheDeal={page.offer_about_the_deal}
                      whyWeLoveThisHotel={page.why_we_love_this_hotel}
                      aboutTheHotel={page.about_the_hotel}
                      offerMode={page.offer_mode}
                    />
                  </div>
                )}
                <HotelDetailsTabs
                  overview={page.about_the_hotel}
                  location={{
                    mapEmbedUrl: page.hotel_cordinates,
                    description: page.location_detail,
                    address: page.address,
                    latitude: page.latitude,
                    longitude: page.longitude,
                  }}
                  facilities={Array.isArray(page.facilities) ? asHtmlList(page.facilities) : String(page.facilities ?? "")}
                  reviews={reviewsData}
                  finePrint={page.fine_print}
                  hotelName={page.hotel_name}
                  departureAirport={selectedDeal ? formatAirport(selectedDeal.flight?.departureAirportCode ?? selectedDeal.hotel?.fromAirport ?? "") : undefined}
                  duration={selectedDeal ? (selectedDeal.hotel.duration ?? Number(selectedDeal.hotel.nights)) : null}
                  boardBasis={selectedDeal ? getBoardBasisName(selectedDeal.hotel.boardBasis) : undefined}
                  basePrice={
                    selectedDeal
                      ? getEffectivePrice(selectedDeal)
                      : selectedSeasonInfo
                        ? Number(selectedSeasonInfo.price)
                        : null
                  }
                  localTax={selectedDeal ? calculateTotalTax(selectedDeal, page.Tax_per_night, page.location) : null}
                  saveText={page.saveuptotext}
                  isLoadingPrice={apiDataLoading && !selectedDeal && !selectedSeasonInfo}
                  isSearching={isSearching}
                  hidePriceSection={Boolean(noDealsMessage)}
                  onEnquire={handleEnquireNow}
                  whyWeLoveThisHotel={page.why_we_love_this_hotel}
                />

                <div className="w-full pt-4">
                  <a
                    href="/top-trending-deals"
                    className="block w-full rounded-2xl bg-gradient-to-r from-pml-primary via-[#a81a6f] to-[#6d28d9] shadow-[0_8px_28px_rgba(203,33,135,0.35)] transition-transform duration-200 hover:-translate-y-0.5"
                    aria-label="View top trending deals"
                  >
                    <div className="relative flex min-h-0 items-center gap-3 overflow-hidden rounded-2xl px-4 py-4 text-left sm:px-5 md:min-h-[100px] md:gap-4">
                      <div className="absolute -right-8 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-white/5" />

                      <span className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-white/15">
                        <Flame className="h-6 w-6 text-[#FFD9A0]" />
                      </span>

                      <div className="relative flex flex-1 min-w-0 flex-col items-start gap-2 md:flex-row md:items-center md:gap-4">
                        <div className="w-full md:flex-1 md:min-w-0">
                          <p className="text-[22px] font-extrabold tracking-tight leading-[140%] text-white sm:text-[26px]">TOP TRENDING DEALS</p>
                          <p className="mt-[-2px] text-[13px] font-medium tracking-[0.01em] leading-[140%] text-white/90 sm:text-[14px]">
                            Discover Exclusive Offers Today
                          </p>
                        </div>

                        <span className="relative inline-flex shrink-0 items-center justify-center rounded-full bg-[#FFD13D] px-6 py-2.5 text-[14px] font-bold leading-[140%] text-[#4C4C4C] shadow-md transition-transform duration-200 hover:scale-105">
                          View Deals
                        </span>
                      </div>
                    </div>
                  </a>
                </div>

                <div className="w-full pt-4">
                  <div className="rounded-2xl border border-gray-200 bg-white px-3 py-[12px] shadow-xl shadow-pml-primary/5 md:px-[12px] md:py-[14px]">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center text-[12px] font-medium leading-[20px] text-[#595858] md:text-[14px] md:leading-[36px]">
                        <span className="mr-2 inline-block h-[10px] w-[10px] rounded-full bg-[#25D366]" />
                        Our team are available 24 hours, 7 days
                      </div>

                      <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                        <a
                          href={`tel:${phoneTel}`}
                          className="inline-flex h-[44px] min-w-[153px] items-center justify-center gap-2 rounded-xl bg-pml-primary hover:bg-[#a81a6f] px-3 text-[14px] font-bold leading-[36px] text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pml-primary focus-visible:ring-offset-2 md:h-[48px] md:w-[153px]"
                          aria-label={`Call ${phoneDisplay}`}
                        >
                          <Phone className="h-4 w-4" />
                          <span>Call Us</span>
                        </a>

                        <button
                          type="button"
                          onClick={handleOpenChat}
                          className="inline-flex h-[44px] min-w-[163px] items-center justify-center gap-2 rounded-xl border-2 border-pml-primary/20 bg-white px-3 text-[14px] font-bold leading-[36px] text-pml-primary transition-all duration-200 hover:border-pml-primary/40 hover:bg-pml-primary/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pml-primary focus-visible:ring-offset-2 md:h-[48px] md:w-[163px]"
                          aria-label="Open chat"
                        >
                          <ChatIcon className="h-[18px] w-[18px]" />
                          Chat Online
                        </button>

                        <a
                          href={getWhatsAppUrl({
                            source: dealPageSource,
                            contextLine: hotelQuoteContextLine,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-[44px] min-w-[163px] items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 text-[14px] font-bold leading-[36px] text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 md:h-[48px] md:w-[163px]"
                          aria-label="Send a WhatsApp message"
                          onClick={(event) =>
                            attachCurrentPageToWhatsAppHref(event, {
                              source: dealPageSource,
                              contextLine: hotelQuoteContextLine,
                            })
                          }
                        >
                          <WhatsAppIcon className="h-4 w-4" />
                          Whatsapp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right column */}
              <div className="hidden w-full min-w-0 md:block lg:sticky lg:self-start" style={{ top: "calc(var(--main-nav-height, 0px) + 16px)" }} >
                <HotelCalendarSection
                  dealsByDate={dealsByDate}
                  selectedDeal={selectedDeal}
                  apiDataLoading={apiDataLoading}
                  isSearching={isSearching}
                  noDealsMessage={noDealsMessage}
                  filterOptionsWithIds={filterOptionsWithIds}
                  currentFilters={currentFilters}
                  priceData={priceData}
                  calendarDepartureDate={calendarDepartureDate}
                  onDateSelect={handleDateSelection}
                  onFilterChange={handleFilterChange}
                  onEnquire={handleEnquireNow}
                  taxPerNight={page.Tax_per_night}
                  location={page.location}
                  onBookNow={handleEnquireNow}
                  defaultSearchIds={defaultSearchIds}
                  saveText={page.saveuptotext}
                  autoDeal={isAutoDeal}
                  resolvedDealAirportId={resolvedDealAirportId}
                  staticPricing={staticPricing}
                  onSeasonInfoChange={setSelectedSeasonInfo}
                  onSeasonEnquire={handleEnquireNow}
                />
              </div>
            </div>
          </div>


          {Array.isArray(page?.popular_deals_hotels) && page.popular_deals_hotels.length > 0 && (
            <SimilarDeals
              title="Similar Hotels"
              deal_collection={page.popular_deals_hotels}
            />
          )}
          {/* Mobile sticky footer */}
          <div className="fixed inset-x-0 bottom-0 z-50 w-full border-t border-pml-primary/15 bg-white px-3 py-2 shadow-[0_-4px_20px_rgba(203,33,135,0.15)] backdrop-blur md:hidden">

            <div className="mx-auto w-full">
              <div className="flex w-full items-center justify-between gap-2 text-[#4c4c4c]">
                <div className="min-w-0">
                  {noDealsMessage ? (
                    <div className="min-w-0">
                      <div className="text-[12px] font-bold">No deals found</div>
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1">
                        <div className="flex items-center justify-end text-pml-primary text-[24px] font-extrabold leading-none">
                          <div className="flex items-end justify-end text-[12px] pr-1 font-semibold leading-[14px] text-pml-primary/70 mb-1">
                            <span>from</span>
                          </div>
                          <span className="text-[#4c4c4c] text-[12px]">£</span>{" "}
                          {selectedDeal ? (
                            Math.round(getEffectivePrice(selectedDeal) + calculateTotalTax(selectedDeal, page.Tax_per_night, page.location))
                          ) : selectedSeasonInfo ? (
                            Math.round(Number(selectedSeasonInfo.price))
                          ) : (
                            <span className="inline-flex items-center align-middle" aria-label="Loading price" >
                              <span className="mx-2 inline-block h-5 w-12 animate-pulse rounded bg-gray-300" aria-hidden="true" />
                            </span>
                          )}{" "}
                          <span className="text-[#4c4c4c] text-[12px]">pp</span>
                        </div>
                      </div>

                      {selectedDeal && showMobileTaxBreakdown && mobilePriceBeforeTaxPerPerson && mobileTaxPerPerson && (
                        <div className="mt-0.5 text-[#6B6B6B] text-[12px] font-bold">
                          {mobilePriceBeforeTaxPerPerson} + {mobileTaxPerPerson} (Local tax)
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {noDealsMessage ? (
                    <button

                      type="button"
                      onClick={() => {
                        router.push(`/hotels/${hotelData.page.slug}`);
                      }}
                      className="shrink-0 whitespace-nowrap rounded-xl bg-[#595858] px-5 py-2.5 text-[12px] font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4C4C4C] active:scale-95"
                    >
                      Back
                    </button>
                  ) : (
                    <button
                      id="seo-enquire-button-hotels"
                      type="button"
                      onClick={isCalendarReached ? handleOpenMobileSheet : handleCtaClick}
                      className="shrink-0 whitespace-nowrap rounded-xl bg-pml-primary hover:bg-[#a81a6f] px-5 py-2.5 text-[11px] font-bold text-white shadow-[0_4px_16px_rgba(203,33,135,0.4)] transition-all duration-200 active:scale-95"
                    >
                      {isCalendarReached ? "Enquire Now" : "View Options"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <FAQs
            faqItems={asArray(page.faqs)
              .filter((f) => f.active !== false)
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((f) => ({ question: f.question ?? "", answer: f.answer ?? "" }))
              .filter((f) => Boolean(f.question) && Boolean(f.answer))}
          />
          <Trustsection />
        </main>
      </div>
    </>
  );
}
