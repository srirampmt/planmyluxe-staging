"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import HotelBanner from "@/components/multi-centre/HotelBanner";
import StickySectionTabs from "@/components/multi-centre/StickySectionTabs";
import MultiCentreCalendarSection from "./components/MultiCentreCalendarSection";
import McMobileStickyFooter from "@/components/multi-centre/McMobileStickyFooter";
import DiscoverTheDeal from "@/components/multi-centre/DiscoverTheDeal";
import FinePrint from "@/components/multi-centre/FinePrint";
import AboutThisPackage from "@/components/multi-centre/AboutThisPackage";
import HorizontalTimeLine, { type TimelineStop, type TimelineTransport } from "@/components/multi-centre/HorizontalTimeLine";
import { useUtmPhone } from "@/components/utm/UtmPhoneProvider";
import { useMultiCentreData } from "./hooks/useMultiCentreData";
import { useMultiCentreFilters } from "./hooks/useMultiCentreFilters";
import EnquiryModal from "@/components/hotels/EnquiryModal";
import OfferCards from "@/components/multi-centre/OffersCards";
import Image from "next/image";
import { MapPin } from "lucide-react";
import ContactAndTrending from "./components/contactandtrending";
import MultiCentrePageSkeleton from "./components/MultiCentrePageSkeleton";
import { buildEnquirySource } from "@/lib/source-builder";
import { usePublishRouteWhatsAppContext } from "@/components/multi-centre/RouteWhatsAppContext";
import { formatWhatsAppDateLine } from "@/lib/utils";
import StaticPriceSection, { type SelectedSeasonInfo } from "./components/StaticPriceSection";
import { formatGbpPrice, parseStaticPrice } from "@/lib/multi-centre-selected-price";
import type { McDefaultPricingResponse, McPageResponse } from "@/types/multi-centre";

type ItineraryEntry = {
  title?: string | null;
  transport?: string | null;
};

type TravelLeg = {
  from: string;
  to: string;
  transport: TimelineTransport;
};

function cleanStopLabel(value?: string | null) {
  return String(value ?? "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\bANY\b/gi, "")
    .replace(/\bAIRPORT\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeStopToken(value?: string | null) {
  return cleanStopLabel(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function matchesStopLabel(left?: string | null, right?: string | null) {
  const normalizedLeft = normalizeStopToken(left);
  const normalizedRight = normalizeStopToken(right);

  if (!normalizedLeft || !normalizedRight) {
    return false;
  }

  return (
    normalizedLeft === normalizedRight ||
    normalizedLeft.includes(normalizedRight) ||
    normalizedRight.includes(normalizedLeft)
  );
}

// Strict variant of matchesStopLabel: only an exact normalized match counts.
// Used to avoid loose substring matches (e.g. "Milan" matching "Milan2")
// when a more precise candidate is available.
function matchesStopLabelExact(left?: string | null, right?: string | null) {
  const normalizedLeft = normalizeStopToken(left);
  const normalizedRight = normalizeStopToken(right);

  if (!normalizedLeft || !normalizedRight) {
    return false;
  }

  return normalizedLeft === normalizedRight;
}

function normalizeTimelineTransport(value?: string | null): TimelineTransport | undefined {
  const normalizedValue = String(value ?? "").trim().toLowerCase();

  if (!normalizedValue) {
    return undefined;
  }

  if (normalizedValue.includes("flight") || normalizedValue.includes("fly") || normalizedValue.includes("air")) {
    return "flight";
  }

  if (normalizedValue.includes("train") || normalizedValue.includes("rail")) {
    return "train";
  }

  if (
    normalizedValue.includes("ship") ||
    normalizedValue.includes("cruise") ||
    normalizedValue.includes("ferry") ||
    normalizedValue.includes("boat")
  ) {
    return "ship";
  }

  if (
    normalizedValue.includes("bus") ||
    normalizedValue.includes("coach")
  ) {
    return "bus";
  }

  if (normalizedValue.includes("transfer")) {
    return "transfer";
  }

  if (normalizedValue.includes("taxi") || normalizedValue.includes("car")) {
    return "car";
  }

  return undefined;
}

function parseTravelLeg(entry: ItineraryEntry): TravelLeg | null {
  const transport = normalizeTimelineTransport(entry.transport);
  const title = cleanStopLabel(entry.title);

  if (!transport || !title.includes(" to ")) {
    return null;
  }

  const [from, ...rest] = title.split(/\s+to\s+/i);
  const to = rest.join(" to ");

  if (!from || !to) {
    return null;
  }

  return {
    from: cleanStopLabel(from),
    to: cleanStopLabel(to),
    transport,
  };
}

function getLegTransport(
  legs: TravelLeg[],
  transportSequence: TimelineTransport[],
  currentStop: string,
  nextStop: string,
  index: number,
  stopCount: number
) {
  const exactMatch = legs.find(
    leg => matchesStopLabel(leg.from, currentStop) && matchesStopLabel(leg.to, nextStop)
  );

  if (exactMatch) {
    return exactMatch.transport;
  }

  if (index === 0) {
    return (
      legs.find(leg => matchesStopLabelExact(leg.to, nextStop))?.transport ??
      legs.find(leg => matchesStopLabel(leg.to, nextStop))?.transport ??
      transportSequence[0] ??
      legs[0]?.transport
    );
  }

  if (index === stopCount - 2) {
    // Search from the end of the itinerary, not the start: the final leg
    // must match the LAST occurrence of currentStop as a departure city,
    // not the first - a stop name can legitimately repeat (e.g. an
    // outbound "Milan to St.Moritz" earlier in the trip and a later
    // "Milan to UK" return leg both depart from "Milan").
    const legsReversed = [...legs].reverse();
    return (
      legsReversed.find(leg => matchesStopLabelExact(leg.from, currentStop))?.transport ??
      legsReversed.find(leg => matchesStopLabel(leg.from, currentStop))?.transport ??
      transportSequence[transportSequence.length - 1] ??
      legs[legs.length - 1]?.transport
    );
  }

  return undefined;
}

type MultiCentrePageClientProps = {
  initialContent: Omit<McPageResponse, "pricing"> | null;
  initialPricing: McDefaultPricingResponse | null;
  urlMonth?: string;
  urlAirport?: string;
};

export default function MultiCentrePageClient({
  initialContent,
  initialPricing,
  urlMonth,
  urlAirport,
}: MultiCentrePageClientProps) {
  const params = useParams<{ slug: string }>();
  const pathname = usePathname();
  const slug = params?.slug;
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const handleEnquireNow = useCallback((date?: string) => {
    if (date) setSelectedDate(date);
    setIsEnquiryOpen(true);
  }, []);

  const handleMobileBookNow = useCallback((date?: string) => {
    // Mobile: selecting a date should open the MobileDealSheet instead of the desktop enquiry modal.
    // We use a window event so the already-mounted `McMobileStickyFooter` can open its sheet.
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("mc:open-mobile-deal-sheet", { detail: { date } })
    );
  }, []);

  const handleCloseEnquiry = useCallback(() => {
    setIsEnquiryOpen(false);
  }, []);

  const [staticEnquiryMessage, setStaticEnquiryMessage] = useState("");
  const [selectedStaticSeason, setSelectedStaticSeason] = useState<SelectedSeasonInfo | null>(null);
  const recordStaticSeasonSelection = useCallback((season: SelectedSeasonInfo) => {
    setSelectedStaticSeason(season);
    setStaticEnquiryMessage(`${season.label} (${season.dates}) - from ${formatGbpPrice(season.price)}pp`);
  }, []);

  // Desktop: keep opening the EnquiryModal popup, as today.
  const handleStaticSeasonEnquire = useCallback((season: SelectedSeasonInfo) => {
    recordStaticSeasonSelection(season);
    setIsEnquiryOpen(true);
  }, [recordStaticSeasonSelection]);

  // Mobile: open the MobileDealSheet (same mechanism as handleMobileBookNow)
  // instead of the desktop EnquiryModal.
  const handleStaticSeasonEnquireMobile = useCallback((season: SelectedSeasonInfo) => {
    recordStaticSeasonSelection(season);
    handleMobileBookNow();
  }, [recordStaticSeasonSelection, handleMobileBookNow]);

  useEffect(() => {
    setSelectedStaticSeason(null);
  }, [slug]);

  const { mcData, contentLoading, pricingLoading, error, selectedAirportId, priceData, currentLandingDealDate, handleAirportChange, isStatic, staticPricingData } = useMultiCentreData(slug, {
    initialContent,
    initialPricing,
    urlMonth,
    urlAirport,
  });
  const showStaticPriceSection = isStatic;

  const { availableAirports, onAirportChange } = useMultiCentreFilters(mcData, selectedAirportId, handleAirportChange);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("highlights");
  const multiCentreSource = buildEnquirySource({
    section: "multi-centre",
    entityName: slug,
  });

  const tabsBarRef = useRef<HTMLDivElement | null>(null);
  const { phoneTel } = useUtmPhone();

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
    if (currentLandingDealDate) {
      setSelectedDate(currentLandingDealDate);
    }
  }, [currentLandingDealDate]);

  const getMainNavHeightPx = useCallback(() => {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--main-nav-height")
      .trim();
    const val = parseFloat(raw);
    return Number.isFinite(val) ? val : 0;
  }, []);

  const scrollToSection = useCallback(
    (targetId: string) => {
      const el = document.getElementById(targetId);
      if (!el) return;

      const navHeight = getMainNavHeightPx();
      const tabsHeight = tabsBarRef.current?.offsetHeight ?? 0;
      const offset = 12;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight - tabsHeight - offset;

      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    },
    [getMainNavHeightPx]
  );

  // Display price excludes tax (matches the calendar day cells); the enquiry
  // payload below still submits the true tax-inclusive total separately.
  const selectedDatePrice = useMemo(() => {
    if (!selectedDate) return null;
    const item = priceData.find(p => p.date === selectedDate);
    return item ? item.price : null;
  }, [selectedDate, priceData]);

  const selectedPriceItem = useMemo(() => {
    if (!selectedDate) return null;
    return priceData.find(p => p.date === selectedDate) ?? null;
  }, [selectedDate, priceData]);

  const selectedDateContextLine = showStaticPriceSection
    ? (selectedStaticSeason ? `from ${selectedStaticSeason.price}pp` : undefined)
    : (mcData?.pricing?.pricingSourceMode === "builder" && selectedPriceItem?.referenceId
        ? selectedPriceItem.referenceId
        : formatWhatsAppDateLine(selectedDate));

  usePublishRouteWhatsAppContext(pathname, selectedDateContextLine);

  const timelineItems = useMemo(() => {
    const itinerary = mcData?.sections?.itinerary ?? [];
    const destinations = mcData?.page?.destinations ?? [];
    if (!destinations.length || !itinerary.length) return [];

    const selectedAirport = availableAirports.find(a => a.id === selectedAirportId);
    const firstLeg = parseTravelLeg(itinerary[0] as ItineraryEntry);
    const departure = cleanStopLabel(selectedAirport?.label || firstLeg?.from || "Departure");
    const travelLegs = itinerary
      .map(item => parseTravelLeg(item as ItineraryEntry))
      .filter((leg): leg is TravelLeg => leg !== null);
    const transportSequence = itinerary
      .map(item => normalizeTimelineTransport((item as ItineraryEntry).transport))
      .filter((transport): transport is TimelineTransport => transport !== undefined);

    if (!travelLegs.length && !transportSequence.length) {
      return [];
    }

    const stopLabels = [departure, ...destinations.map((dest: string) => cleanStopLabel(dest)), departure];

    return stopLabels.map((title, index) => {
      const isFirst = index === 0;
      const isLast = index === stopLabels.length - 1;
      const nextStop = stopLabels[index + 1];

      let subtitle = "3 Nights";
      let badgeType: TimelineStop["badgeType"] = "stay";
      if (isFirst) {
        subtitle = "Origin";
        badgeType = "origin";
      } else if (isLast) {
        subtitle = "Return";
        badgeType = "return";
      } else {
        const matchedItinerary =
          itinerary.find((item) => {
            const itemTitle = String(item?.title || item?.location || item?.hotel || "").toLowerCase();
            const cityTitle = title.toLowerCase();
            return itemTitle.includes(cityTitle) || (itemTitle && cityTitle.includes(itemTitle));
          }) || itinerary[index - 1];
        subtitle =
          matchedItinerary?.duration ||
          (matchedItinerary?.nights ? `${matchedItinerary.nights} Nights` : "3 Nights");
      }

      return {
        title,
        subtitle,
        badgeType,
        displayDay: isLast ? 1 : index + 1,
        transportToNextStop: nextStop
          ? getLegTransport(travelLegs, transportSequence, title, nextStop, index, stopLabels.length)
          : undefined,
      } satisfies TimelineStop;
    });
  }, [mcData, selectedAirportId, availableAirports]);

  const calculatedPackageInfo = useMemo(() => {
    const itinerary = mcData?.sections?.itinerary ?? [];
    const destinations = mcData?.page?.destinations ?? [];
    const boardValues = itinerary.map((it: any) => it?.board).filter(Boolean);
    const uniqueBoards = new Set(boardValues);
    const board = uniqueBoards.size === 1 ? Array.from(uniqueBoards)[0] : "As per itinerary";

    return {
      duration: mcData?.page?.durationLabel || "",
      destination: destinations,
      accommodation: (mcData?.page.hotels)?.length ? `${(mcData?.page.hotels)?.length} Hotels` : "As per itinerary",
      board: board || "",
    };
  }, [mcData]);

  const processedHotels = useMemo(() => {
    const pageHotels = mcData?.page?.hotels || [];
    const itinerary = mcData?.sections?.itinerary || [];

    return pageHotels.map((pHotel, idx) => {
      const matchedItinerary =
        itinerary.find((item) => {
          if (!item) return false;
          const locLower = (pHotel.location || "").toLowerCase();
          const titleLower = (item.title || "").toLowerCase();
          const hotelLower = (item.hotel || "").toLowerCase();
          return (
            (locLower && titleLower.includes(locLower)) ||
            (locLower && titleLower && locLower.includes(titleLower)) ||
            (locLower && hotelLower.includes(locLower))
          );
        }) || itinerary[idx];

      const rawImages = Array.isArray(pHotel.images) ? pHotel.images.filter(Boolean) : [];
      const normalizedImages = rawImages.map((src) => {
        const raw = String(src);
        return /^https?:\/\//i.test(raw) ? raw : raw.startsWith("/") ? raw : `/${raw}`;
      });

      return {
        id: `hotel-${idx}`,
        location: pHotel.location || matchedItinerary?.title || `Stop ${idx + 1}`,
        duration: matchedItinerary?.duration || "3 Nights",
        hotelName: matchedItinerary?.hotel || pHotel.location || "Featured Hotel",
        rating: matchedItinerary?.rating || 4,
        board: matchedItinerary?.board || "Bed & Breakfast",
        description: pHotel.description || matchedItinerary?.description || "",
        images: normalizedImages.length > 0 ? normalizedImages : ["/placeholder.jpg"],
        extras: matchedItinerary?.extras
          ? String(matchedItinerary.extras).split(",").map((extra) => extra.trim()).filter(Boolean)
          : [],
      };
    });
  }, [mcData]);

  const staticPriceString = showStaticPriceSection
    ? selectedStaticSeason?.price ?? staticPricingData?.fromPrice ?? null
    : null;
  const staticPriceNumeric = staticPriceString ? parseStaticPrice(staticPriceString) : null;

  const bannerPrice = showStaticPriceSection
    ? staticPriceString ?? "---"
    : selectedDate
      ? selectedDatePrice !== null ? Math.round(selectedDatePrice).toString() : "---"
      : mcData?.page.starting_price || "---";

  if (contentLoading) {
    return <MultiCentrePageSkeleton />;
  }

  if (error || !mcData) {
    return (
      <main className="mx-auto w-full bg-white px-4 md:px-10">
        <div className="mx-auto max-w-[1280px] py-10 text-[#1a1b4b]">
          Unable to load this multi-centre itinerary.
        </div>
      </main>
    );
  }

  const page = mcData.page;
  // console.log(mcData.sections)
  return (
    <main className="mx-auto w-full bg-[#FAFCFD] px-4 md:px-10">
      <EnquiryModal
        open={isEnquiryOpen}
        onClose={handleCloseEnquiry}
        initialValues={{
          selectedDate: selectedDate,
          selectedPrice: (selectedPriceItem as any)?.totalPrice ?? selectedDatePrice,
          quoteRef: selectedPriceItem?.referenceId,
          source: multiCentreSource,
          message: showStaticPriceSection ? staticEnquiryMessage : undefined,
        }}
      />

      <HotelBanner
        location={page.location}
        title={page.offer_header}
        subtitle={page.info_paragraph || ""}
        priceLabel="Price starting from"
        price={bannerPrice}
        basePrice={selectedPriceItem ? (selectedPriceItem as any).price : null}
        localTax={selectedPriceItem ? (selectedPriceItem as any).localTax : null}
        totalPrice={selectedPriceItem ? (selectedPriceItem as any).price : null}
        ctaText="View Options"
        thumbnail_1={page.thumbnail_1}
        thumbnail_2={page.thumbnail_2}
        thumbnail_3={page.thumbnail_3}
        images={page.pictures || []}
        badgeText={page.Banner_Image_chips}
        onEnquire={() => handleEnquireNow(selectedDate)}
      />

      <div className="mx-auto mb-5 w-full max-w-[1280px] space-y-3 rounded-[16px] border border-slate-200/60 bg-slate-50/70 p-2 shadow-xs sm:p-4">
        <AboutThisPackage duration={mcData?.page?.durationLabel || ""} destination={mcData?.page?.destinations ?? []} accommodation={calculatedPackageInfo.accommodation} board={calculatedPackageInfo.board} />
      </div>

      <div className="mx-auto max-w-[1280px] pb-[16px]">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
          {/* Left column */}
          <div className="w-full min-w-0 space-y-6">
            <div className="mb-6">
              <HorizontalTimeLine items={timelineItems} />
            </div>

            {/* Mobile: show calendar + CTAs immediately after timeline */}
            <div className="md:hidden">
              <div className="flex flex-col  gap-4">
                {showStaticPriceSection ? (
                  <StaticPriceSection slug={slug} data={staticPricingData} onEnquire={handleStaticSeasonEnquireMobile} />
                ) : (
                  <MultiCentreCalendarSection
                    priceData={priceData}
                    listOfAirports={mcData.pricing.listOfAirports || []}
                    selectedAirportId={selectedAirportId}
                    onAirportChange={onAirportChange}
                    boardBasis={calculatedPackageInfo.board || "As per itinerary"}
                    duration={page.durationLabel || "8 Nights"}
                    location={page.location}
                    pricingSourceMode={mcData.pricing.pricingSourceMode}
                    landingDealDate={currentLandingDealDate}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    pricingLoading={pricingLoading}
                    onBookNow={handleMobileBookNow}
                  />
                )}
                {/* <McCtaButtons /> */}
                <div className="flex flex-col items-center gap-[10px] w-full rounded-[8px] border border-[#EDEDED]">
                  <div className="flex flex-col items-center justify-center w-full bg-white rounded-[8px]">
                    <div className="flex flex-row justify-center items-center p-0 w-full px-4">
                      <div className="flex flex-col items-center p-2 w-[52px]">
                        <svg
                          width="36"
                          height="36"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-[#1a1b4b]"
                          aria-hidden="true"
                        >
                          <g clipPath="url(#clip0_atol)">
                            <path
                              d="M16.7015 13.6654C16.7015 13.6654 13.9297 13.609 12.5703 10.9013C10.6459 7.11958 14.6077 5.08789 14.6077 5.08789L18.1174 5.70761L16.7015 13.6654Z"
                              fill="currentColor"
                            />
                            <path
                              d="M8.09961 14.5672L8.66456 14.6799L8.49508 14.1729L8.09961 14.5672ZM12.9088 14.8489C12.7393 14.7926 12.5698 14.8489 12.4568 14.8489C12.3438 14.9052 12.2308 15.0179 12.2308 15.1306C12.2308 15.2433 12.2308 15.356 12.3438 15.4686C12.4568 15.5813 12.5698 15.6376 12.7958 15.6376C12.9653 15.694 13.1348 15.6376 13.2478 15.6376C13.3608 15.5813 13.4737 15.4686 13.4737 15.356C13.4737 15.2433 13.4737 15.1306 13.3608 15.0179C13.2478 14.9616 13.0783 14.9052 12.9088 14.8489Z"
                              fill="currentColor"
                            />
                            <path
                              d="M11.1574 12.1973C8.83753 9.7712 8.83753 6.95078 10.2535 4.35219L8.32907 4.01416L6.17871 16.1444L15.9101 17.8381L16.5315 14.2254C16.6445 14.2254 13.4772 14.6198 11.1574 12.1937V12.1973ZM8.89403 15.1867L8.78104 14.905L7.9336 14.736L7.70762 14.9613L7.19916 14.8487L8.21608 13.8346L8.78104 13.9473L9.40249 15.2466L8.89403 15.1902V15.1867ZM11.6093 14.6797L10.9314 14.567L10.7619 15.5247L10.2535 15.412L10.4229 14.4543L9.74499 14.3416L9.80149 14.1163L11.6694 14.4543L11.6129 14.6797H11.6093ZM13.9292 15.4684C13.8727 15.6937 13.7597 15.8064 13.4772 15.8628C13.3077 15.9191 13.0253 15.9191 12.6863 15.8628C12.3473 15.8064 12.1213 15.6937 11.9518 15.5811C11.7259 15.412 11.6694 15.243 11.6694 15.0177C11.7259 14.7923 11.8389 14.6797 12.1213 14.6233C12.2908 14.567 12.5733 14.567 12.9123 14.6233C13.2512 14.6797 13.4772 14.7923 13.6467 14.905C13.8727 15.074 13.9857 15.243 13.9292 15.4684ZM15.8536 16.4261L14.2117 16.1444L14.4376 14.9578L14.9461 15.0705L14.7201 15.9719L15.8536 16.1973V16.4226V16.4261Z"
                              fill="currentColor"
                            />
                            <path
                              d="M10.0812 23.0882C3.96905 22.0143 -0.10216 16.2044 0.971254 10.1093C2.04467 4.01426 7.8743 -0.0456031 13.9864 1.02482C20.0985 2.09524 24.1733 7.90862 23.0963 14.0037C22.0229 20.0424 16.1933 24.1621 10.0812 23.0882ZM0.180317 9.94031C-0.953124 16.4297 3.40409 22.6938 9.91167 23.8206C16.4192 24.9509 22.7008 20.6058 23.8308 14.1164C23.9437 13.4403 24.0002 12.7044 24.0002 12.0283C24.0567 6.2713 19.982 1.25017 14.1559 0.179749C7.59182 -0.950533 1.36672 3.39454 0.180317 9.94031Z"
                              fill="currentColor"
                            />
                            <path
                              d="M3.00855 14.2289C3.00855 14.2852 3.06504 14.3979 3.12154 14.4542C3.23453 14.6796 3.46051 14.6796 3.68649 14.6232C3.96897 14.5669 4.13846 14.3415 4.08196 14.1725L4.02547 13.9472L3.00855 14.2289ZM1.70562 14.6232C1.70562 14.5105 1.64912 14.4542 1.64912 14.3415C1.64912 14.2289 1.59263 14.1725 1.53613 14.0598L3.96897 13.3838L4.25145 14.2852C4.36444 14.7922 4.25145 15.0739 3.85598 15.1866C3.23453 15.3556 2.95205 14.9613 2.78257 14.2852L1.70915 14.6232H1.70562ZM3.85598 16.4296C4.02547 16.7676 4.25145 16.8803 4.59042 16.6549C4.64692 16.6549 4.70341 16.5986 4.75991 16.5422C4.98589 16.3169 4.8164 16.0915 4.70341 15.9225L3.85598 16.4296ZM4.64692 15.3591L5.04239 16.0352C5.15538 16.2042 5.26837 16.4296 5.26837 16.5986C5.26837 16.8239 5.21187 16.9929 4.98589 17.162C4.64692 17.331 4.36444 17.2746 4.13846 16.9929C3.91248 17.331 3.74299 17.7253 3.5735 18.0634L3.46051 18.2887C3.40402 18.176 3.34752 18.0634 3.29102 18.007C3.23453 17.8944 3.17803 17.838 3.12154 17.7253L3.5735 16.9366C3.5735 16.8803 3.68649 16.6549 3.74299 16.5422L2.72607 17.1056C2.66957 17.0493 2.66957 16.9366 2.61308 16.8803C2.55658 16.8239 2.50009 16.7113 2.44359 16.6549L4.65045 15.3556L4.64692 15.3591ZM5.21187 18.5739C4.8729 18.912 4.70341 19.4753 5.15538 19.8169C5.60734 20.2113 6.1723 19.9296 6.5713 19.4789C6.91027 19.1408 7.07976 18.5775 6.68429 18.1796C6.23232 17.8979 5.78036 17.9542 5.21187 18.5739ZM4.98589 19.9859C4.36444 19.4789 4.25145 18.7429 4.8164 18.1232C5.32486 17.5598 6.11933 17.5035 6.79728 18.0669C7.58821 18.7429 7.30574 19.5352 6.96676 19.9296C6.4583 20.4929 5.66384 20.6056 4.98589 19.9859ZM8.09667 21.8486C8.04018 21.7922 7.92719 21.7359 7.87069 21.7359C7.8142 21.6796 7.70121 21.6796 7.58821 21.6232L8.49214 19.5352C8.26616 19.4225 8.04018 19.3662 7.8142 19.3098C7.8142 19.2535 7.87069 19.1972 7.87069 19.1972C7.87069 19.1408 7.92719 19.0845 7.92719 19.0282L9.68208 19.7606C9.68208 19.8169 9.62558 19.8732 9.62558 19.8732C9.62558 19.9296 9.56909 19.9859 9.56909 20.0422C9.3996 19.9296 9.17362 19.8169 9.00413 19.7606L8.10021 21.8486M11.437 20.0986C11.437 20.1549 11.3805 20.2113 11.3805 20.2676V20.4366C11.1545 20.3803 10.9285 20.3239 10.533 20.2676L10.4201 21.0563L10.8155 21.1127C10.985 21.1127 11.1545 21.169 11.2675 21.169C11.2675 21.2253 11.211 21.2817 11.211 21.338V21.507C11.098 21.4507 10.9285 21.4507 10.759 21.3944L10.3636 21.2253L10.2506 22.1831C10.646 22.2394 10.872 22.2394 11.098 22.2958C11.098 22.3521 11.0415 22.4084 11.0415 22.4648V22.6338L9.62558 22.4084L10.0211 19.926L11.437 20.0951M14.0958 22.0141L14.0393 22.3521C13.8133 22.4648 13.5873 22.5775 13.3049 22.5775C12.5139 22.6338 11.8889 22.2394 11.7759 21.4472C11.663 20.4894 12.2844 19.9789 13.0789 19.9225C13.3049 19.9225 13.6438 19.9225 13.8698 20.0352C13.8698 20.1479 13.8133 20.3169 13.8133 20.4296H13.7568C13.5873 20.2606 13.3614 20.1479 13.1354 20.1479C12.5139 20.2042 12.3444 20.8239 12.4009 21.3345C12.4574 21.9542 12.7964 22.3486 13.3614 22.2922C13.6438 22.3486 13.8698 22.1796 14.0958 22.0105M16.1897 21.7852C16.0767 21.7852 16.0202 21.8415 15.9072 21.8415C15.7942 21.8979 15.7377 21.8979 15.6812 21.9542L14.8338 19.8662C14.6078 19.9789 14.3818 20.0915 14.2123 20.1479C14.2123 20.0915 14.2123 20.0352 14.1558 19.9789C14.1558 19.9225 14.0993 19.8662 14.0993 19.8662L15.8542 19.1901C15.8542 19.2465 15.8542 19.3028 15.9107 19.3591C15.9107 19.4155 15.9672 19.4718 15.9672 19.4718C15.7412 19.5282 15.5152 19.5845 15.3458 19.6408L16.1932 21.7852M17.3266 18.1725C17.3266 18.2289 17.3831 18.2852 17.3831 18.2852L17.4961 18.3979C17.2701 18.5106 17.1006 18.6232 16.7617 18.8486L17.2136 19.4683L17.5526 19.2429C17.6656 19.1303 17.7786 19.0739 17.8916 18.9613C17.8916 19.0176 17.9481 19.0739 17.9481 19.0739L18.0611 19.1866C17.9481 19.2429 17.7786 19.2993 17.6656 19.412L17.3266 19.6373L17.8916 20.426C18.1741 20.2007 18.4 20.0317 18.5695 19.919C18.5695 19.9753 18.626 20.0317 18.626 20.0317L18.739 20.1444L17.6056 20.9331L16.1332 18.9014L17.3231 18.169M19.8689 18.8451L20.0384 18.6197C20.3774 18.2253 20.3774 17.7746 19.6994 17.2077C19.1345 16.757 18.739 16.8697 18.3965 17.2641L18.1705 17.5458L19.8689 18.8451ZM18.5095 16.8697C19.018 16.25 19.6429 16.3627 20.1514 16.757C20.8294 17.2641 20.8294 18.0563 20.3774 18.6197L19.7559 19.4084L17.7186 17.8838L18.5095 16.8697Z"
                              fill="currentColor"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_atol">
                              <rect width="24" height="24" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                      <div className="flex flex-col items-start p-2 h-[40px] w-full min-w-0 md:min-w-[300px]">
                        <span className="flex items-center w-full max-w-[254px] h-[24px] text-[#1a1b4b] text-[13px] md:text-[16px] leading-[24px] font-normal">
                          All holidays are ATOL protected!
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="block md:hidden w-full">
                  <ContactAndTrending />
                </div>
              </div>
            </div>

            <div ref={tabsBarRef} className="sticky z-30 w-full pb-2.5" style={{ top: "calc(var(--main-nav-height, 0px) - 1px)" }}>
              <div className="mx-auto w-full rounded-[16px] border border-[#E5E7EB] bg-white p-1.5 shadow-xs">
                <div className="flex items-center justify-between gap-1 overflow-x-auto text-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {[
                    { key: "highlights", label: "Highlights", targetId: "mc-highlights" },
                    { key: "whats-included", label: "What's Included", targetId: "whats-included" },
                    { key: "itinerary", label: "Itinerary", targetId: "mc-itinerary" },
                    { key: "hotel-details", label: "Hotel Details", targetId: "hotel-details" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.key);
                        scrollToSection(tab.targetId);
                      }}
                      className={`min-w-max shrink-0 flex-1 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 sm:px-5 sm:py-2.5 sm:text-sm ${
                        activeTab === tab.key
                          ? "border border-[#FCE7F3] bg-[#FFF0F7] text-pml-primary shadow-xs"
                          : "border border-transparent text-[#1a1b4b] hover:bg-gray-50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <StickySectionTabs
              highlights={mcData.sections.highlights}
              whatsIncluded={mcData.sections.whats_included}
              itinerary={mcData.sections.itinerary}
              hotels={processedHotels}
            />
          </div>

          {/* Right column */}
          <div className="hidden w-full min-w-0 md:block md:sticky md:self-start" style={{ top: "calc(var(--main-nav-height, 0px) + 16px)" }}>
            <div className="flex flex-col items-start gap-4">
              {showStaticPriceSection ? (
                <StaticPriceSection slug={slug} data={staticPricingData} onEnquire={handleStaticSeasonEnquire} />
              ) : (
                <MultiCentreCalendarSection
                  priceData={priceData}
                  listOfAirports={mcData.pricing.listOfAirports || []}
                  selectedAirportId={selectedAirportId}
                  onAirportChange={onAirportChange}
                  boardBasis={calculatedPackageInfo.board || "As per itinerary"}
                  duration={page.durationLabel || "8 Nights"}
                  location={page.location}
                  pricingSourceMode={mcData.pricing.pricingSourceMode}
                  landingDealDate={currentLandingDealDate}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  pricingLoading={pricingLoading}
                  onBookNow={handleEnquireNow}
                />
              )}
              {/* CTA Buttons */}
              {/* <McCtaButtons /> */}
              <div className="flex flex-col items-center gap-[10px] w-full rounded-[8px] border border-[#EDEDED]">
                <div className="flex flex-col items-center justify-center w-full bg-white rounded-[8px]">
                  <div className="flex flex-row justify-center items-center p-0 w-full px-4">
                    <div className="flex flex-col items-center p-2 w-[52px]">
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#1a1b4b]"
                        aria-hidden="true"
                      >
                        <g clipPath="url(#clip0_atol)">
                          <path
                            d="M16.7015 13.6654C16.7015 13.6654 13.9297 13.609 12.5703 10.9013C10.6459 7.11958 14.6077 5.08789 14.6077 5.08789L18.1174 5.70761L16.7015 13.6654Z"
                            fill="currentColor"
                          />
                          <path
                            d="M8.09961 14.5672L8.66456 14.6799L8.49508 14.1729L8.09961 14.5672ZM12.9088 14.8489C12.7393 14.7926 12.5698 14.8489 12.4568 14.8489C12.3438 14.9052 12.2308 15.0179 12.2308 15.1306C12.2308 15.2433 12.2308 15.356 12.3438 15.4686C12.4568 15.5813 12.5698 15.6376 12.7958 15.6376C12.9653 15.694 13.1348 15.6376 13.2478 15.6376C13.3608 15.5813 13.4737 15.4686 13.4737 15.356C13.4737 15.2433 13.4737 15.1306 13.3608 15.0179C13.2478 14.9616 13.0783 14.9052 12.9088 14.8489Z"
                            fill="currentColor"
                          />
                          <path
                            d="M11.1574 12.1973C8.83753 9.7712 8.83753 6.95078 10.2535 4.35219L8.32907 4.01416L6.17871 16.1444L15.9101 17.8381L16.5315 14.2254C16.6445 14.2254 13.4772 14.6198 11.1574 12.1937V12.1973ZM8.89403 15.1867L8.78104 14.905L7.9336 14.736L7.70762 14.9613L7.19916 14.8487L8.21608 13.8346L8.78104 13.9473L9.40249 15.2466L8.89403 15.1902V15.1867ZM11.6093 14.6797L10.9314 14.567L10.7619 15.5247L10.2535 15.412L10.4229 14.4543L9.74499 14.3416L9.80149 14.1163L11.6694 14.4543L11.6129 14.6797H11.6093ZM13.9292 15.4684C13.8727 15.6937 13.7597 15.8064 13.4772 15.8628C13.3077 15.9191 13.0253 15.9191 12.6863 15.8628C12.3473 15.8064 12.1213 15.6937 11.9518 15.5811C11.7259 15.412 11.6694 15.243 11.6694 15.0177C11.7259 14.7923 11.8389 14.6797 12.1213 14.6233C12.2908 14.567 12.5733 14.567 12.9123 14.6233C13.2512 14.6797 13.4772 14.7923 13.6467 14.905C13.8727 15.074 13.9857 15.243 13.9292 15.4684ZM15.8536 16.4261L14.2117 16.1444L14.4376 14.9578L14.9461 15.0705L14.7201 15.9719L15.8536 16.1973V16.4226V16.4261Z"
                            fill="currentColor"
                          />
                          <path
                            d="M10.0812 23.0882C3.96905 22.0143 -0.10216 16.2044 0.971254 10.1093C2.04467 4.01426 7.8743 -0.0456031 13.9864 1.02482C20.0985 2.09524 24.1733 7.90862 23.0963 14.0037C22.0229 20.0424 16.1933 24.1621 10.0812 23.0882ZM0.180317 9.94031C-0.953124 16.4297 3.40409 22.6938 9.91167 23.8206C16.4192 24.9509 22.7008 20.6058 23.8308 14.1164C23.9437 13.4403 24.0002 12.7044 24.0002 12.0283C24.0567 6.2713 19.982 1.25017 14.1559 0.179749C7.59182 -0.950533 1.36672 3.39454 0.180317 9.94031Z"
                            fill="currentColor"
                          />
                          <path
                            d="M3.00855 14.2289C3.00855 14.2852 3.06504 14.3979 3.12154 14.4542C3.23453 14.6796 3.46051 14.6796 3.68649 14.6232C3.96897 14.5669 4.13846 14.3415 4.08196 14.1725L4.02547 13.9472L3.00855 14.2289ZM1.70562 14.6232C1.70562 14.5105 1.64912 14.4542 1.64912 14.3415C1.64912 14.2289 1.59263 14.1725 1.53613 14.0598L3.96897 13.3838L4.25145 14.2852C4.36444 14.7922 4.25145 15.0739 3.85598 15.1866C3.23453 15.3556 2.95205 14.9613 2.78257 14.2852L1.70915 14.6232H1.70562ZM3.85598 16.4296C4.02547 16.7676 4.25145 16.8803 4.59042 16.6549C4.64692 16.6549 4.70341 16.5986 4.75991 16.5422C4.98589 16.3169 4.8164 16.0915 4.70341 15.9225L3.85598 16.4296ZM4.64692 15.3591L5.04239 16.0352C5.15538 16.2042 5.26837 16.4296 5.26837 16.5986C5.26837 16.8239 5.21187 16.9929 4.98589 17.162C4.64692 17.331 4.36444 17.2746 4.13846 16.9929C3.91248 17.331 3.74299 17.7253 3.5735 18.0634L3.46051 18.2887C3.40402 18.176 3.34752 18.0634 3.29102 18.007C3.23453 17.8944 3.17803 17.838 3.12154 17.7253L3.5735 16.9366C3.5735 16.8803 3.68649 16.6549 3.74299 16.5422L2.72607 17.1056C2.66957 17.0493 2.66957 16.9366 2.61308 16.8803C2.55658 16.8239 2.50009 16.7113 2.44359 16.6549L4.65045 15.3556L4.64692 15.3591ZM5.21187 18.5739C4.8729 18.912 4.70341 19.4753 5.15538 19.8169C5.60734 20.2113 6.1723 19.9296 6.5713 19.4789C6.91027 19.1408 7.07976 18.5775 6.68429 18.1796C6.23232 17.8979 5.78036 17.9542 5.21187 18.5739ZM4.98589 19.9859C4.36444 19.4789 4.25145 18.7429 4.8164 18.1232C5.32486 17.5598 6.11933 17.5035 6.79728 18.0669C7.58821 18.7429 7.30574 19.5352 6.96676 19.9296C6.4583 20.4929 5.66384 20.6056 4.98589 19.9859ZM8.09667 21.8486C8.04018 21.7922 7.92719 21.7359 7.87069 21.7359C7.8142 21.6796 7.70121 21.6796 7.58821 21.6232L8.49214 19.5352C8.26616 19.4225 8.04018 19.3662 7.8142 19.3098C7.8142 19.2535 7.87069 19.1972 7.87069 19.1972C7.87069 19.1408 7.92719 19.0845 7.92719 19.0282L9.68208 19.7606C9.68208 19.8169 9.62558 19.8732 9.62558 19.8732C9.62558 19.9296 9.56909 19.9859 9.56909 20.0422C9.3996 19.9296 9.17362 19.8169 9.00413 19.7606L8.10021 21.8486M11.437 20.0986C11.437 20.1549 11.3805 20.2113 11.3805 20.2676V20.4366C11.1545 20.3803 10.9285 20.3239 10.533 20.2676L10.4201 21.0563L10.8155 21.1127C10.985 21.1127 11.1545 21.169 11.2675 21.169C11.2675 21.2253 11.211 21.2817 11.211 21.338V21.507C11.098 21.4507 10.9285 21.4507 10.759 21.3944L10.3636 21.2253L10.2506 22.1831C10.646 22.2394 10.872 22.2394 11.098 22.2958C11.098 22.3521 11.0415 22.4084 11.0415 22.4648V22.6338L9.62558 22.4084L10.0211 19.926L11.437 20.0951M14.0958 22.0141L14.0393 22.3521C13.8133 22.4648 13.5873 22.5775 13.3049 22.5775C12.5139 22.6338 11.8889 22.2394 11.7759 21.4472C11.663 20.4894 12.2844 19.9789 13.0789 19.9225C13.3049 19.9225 13.6438 19.9225 13.8698 20.0352C13.8698 20.1479 13.8133 20.3169 13.8133 20.4296H13.7568C13.5873 20.2606 13.3614 20.1479 13.1354 20.1479C12.5139 20.2042 12.3444 20.8239 12.4009 21.3345C12.4574 21.9542 12.7964 22.3486 13.3614 22.2922C13.6438 22.3486 13.8698 22.1796 14.0958 22.0105M16.1897 21.7852C16.0767 21.7852 16.0202 21.8415 15.9072 21.8415C15.7942 21.8979 15.7377 21.8979 15.6812 21.9542L14.8338 19.8662C14.6078 19.9789 14.3818 20.0915 14.2123 20.1479C14.2123 20.0915 14.2123 20.0352 14.1558 19.9789C14.1558 19.9225 14.0993 19.8662 14.0993 19.8662L15.8542 19.1901C15.8542 19.2465 15.8542 19.3028 15.9107 19.3591C15.9107 19.4155 15.9672 19.4718 15.9672 19.4718C15.7412 19.5282 15.5152 19.5845 15.3458 19.6408L16.1932 21.7852M17.3266 18.1725C17.3266 18.2289 17.3831 18.2852 17.3831 18.2852L17.4961 18.3979C17.2701 18.5106 17.1006 18.6232 16.7617 18.8486L17.2136 19.4683L17.5526 19.2429C17.6656 19.1303 17.7786 19.0739 17.8916 18.9613C17.8916 19.0176 17.9481 19.0739 17.9481 19.0739L18.0611 19.1866C17.9481 19.2429 17.7786 19.2993 17.6656 19.412L17.3266 19.6373L17.8916 20.426C18.1741 20.2007 18.4 20.0317 18.5695 19.919C18.5695 19.9753 18.626 20.0317 18.626 20.0317L18.739 20.1444L17.6056 20.9331L16.1332 18.9014L17.3231 18.169M19.8689 18.8451L20.0384 18.6197C20.3774 18.2253 20.3774 17.7746 19.6994 17.2077C19.1345 16.757 18.739 16.8697 18.3965 17.2641L18.1705 17.5458L19.8689 18.8451ZM18.5095 16.8697C19.018 16.25 19.6429 16.3627 20.1514 16.757C20.8294 17.2641 20.8294 18.0563 20.3774 18.6197L19.7559 19.4084L17.7186 17.8838L18.5095 16.8697Z"
                            fill="currentColor"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_atol">
                            <rect width="24" height="24" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>

                    <div className="flex flex-col items-start p-2 h-[40px] w-full min-w-0 md:min-w-[300px]">
                      <span className="flex items-center w-full max-w-[254px] h-[24px] text-[#1a1b4b] text-[13px] md:text-[16px] leading-[24px] font-normal">
                        All holidays are ATOL protected!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden md:block w-full">
                <ContactAndTrending />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discover the Deal Section */}
      <div className="mx-auto max-w-[1280px] pb-[32px] md:pb-[48px]">
        <DiscoverTheDeal content={mcData?.sections?.discover_the_deal as string} />
      </div>

      <div>
        <OfferCards offers={mcData?.sections?.similar_deals} />
      </div>
      
      {mcData?.page?.map_image && (
        <section className="mx-auto max-w-[1280px] pb-8 md:pb-12">
          <div className="w-full rounded-2xl border border-pink-100 bg-white p-3 shadow-2xs sm:p-5">
            <div className="mb-3 flex items-center gap-2.5 px-1 sm:mb-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pink-100 bg-pink-50 text-[#CB2187] sm:h-10 sm:w-10">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold leading-tight text-[#1a1b4b] sm:text-base md:text-lg">
                  Route Overview Map
                </h3>
                <p className="text-[11px] font-medium text-gray-500 sm:text-xs">
                  Visual route breakdown of your itinerary
                </p>
              </div>
            </div>
            <div className="relative w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
              <Image
                src={mcData.page.map_image}
                alt="Route overview map"
                width={1280}
                height={400}
                sizes="(max-width: 768px) 100vw, 1280px"
                quality={90}
                className="h-[180px] w-full rounded-xl object-cover object-center sm:h-[280px] md:h-[400px] md:object-contain"
                priority
              />
            </div>
          </div>
        </section>
      )}

      {/* Fine Print Section */}
      <div className="mx-auto max-w-[1280px] pb-[32px] md:pb-[48px]">
        <FinePrint content={mcData.sections.fine_print}/>
      </div>
       
      {/* Mobile Sticky Footer - hidden on desktop */}
      <McMobileStickyFooter
        selectedPrice={showStaticPriceSection ? staticPriceNumeric : selectedDatePrice}
        onViewOptions={() => {
          const calendarEl = document.getElementById("holiday-calendar-mc");
          if (calendarEl) {
            calendarEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
        onEnquire={handleEnquireNow}
        selectedDate={selectedDate}
        slug={slug}
        selectedPriceItem={
          showStaticPriceSection
            ? { price: staticPriceNumeric ?? undefined, totalPrice: staticPriceNumeric ?? undefined, localTax: 0 }
            : selectedPriceItem
        }
        forceEnquireCta={showStaticPriceSection}
        message={showStaticPriceSection ? staticEnquiryMessage : undefined}
      />

      {/* Spacer for mobile sticky footer */}
      <div className="h-[80px] md:hidden" />
    </main>
  );
}


