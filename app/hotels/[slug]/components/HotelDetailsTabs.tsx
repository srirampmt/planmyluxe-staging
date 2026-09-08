"use client";

import { useEffect, useRef, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { calculateSaveStrikePricing, formatPrice } from "@/lib/hotel-utils";

import styles from "./hotelRichText.module.css";

type LocationData = {
  description: string;
  distances: string[];
  mapEmbedUrl: string;
};

type LocationInput = LocationData | [string, string];

type ReviewsData = {
  rating: number | string;
  total: number | string;
  updatedAt: string;
};

interface HotelDetailsTabsProps {
  overview: string;
  location: LocationInput;
  facilities?: string;
  reviews: ReviewsData;
  finePrint?: string;
  // Sticky bar extras
  hotelName?: string;
  departureAirport?: string;
  duration?: number | null;
  boardBasis?: string;
  basePrice?: number | null;
  localTax?: number | null;
  saveText?: string;
  isLoadingPrice?: boolean;
  isSearching?: boolean;
  hidePriceSection?: boolean;
  whyWeLoveThisHotel?: string;
  onEnquire?: () => void;
}

const TABS = [
  { id: "details", label: "Hotel Details" },
  { id: "location", label: "Location" },
  { id: "facilities", label: "Facilities" },
  { id: "reviews", label: "Reviews" },
  { id: "fineprint", label: "Fine Print" },
  { id: "whywelovethishotel", label: "Why We Love This Hotel" },
];

export default function HotelDetailsTabs(props: HotelDetailsTabsProps) {
  const {
    overview,
    location,
    facilities = "",
    reviews,
    finePrint = "",
    hotelName,
    departureAirport,
    duration,
    boardBasis,
    basePrice,
    localTax,
    saveText,
    isLoadingPrice = false,
    isSearching = false,
    hidePriceSection = false,
    onEnquire,
    whyWeLoveThisHotel,
  } = props;

  const totalPrice =
    basePrice != null ? basePrice + (localTax || 0) : null;
  const { saveBadgeText, hasStrikePrice, strikePriceValue } =
    calculateSaveStrikePricing(basePrice, saveText);
  const strikePriceStr =
    hasStrikePrice && strikePriceValue != null
      ? formatPrice(strikePriceValue)
      : "";
  const fallbackPrice = "---";

  const parseRating = (value: unknown): number => {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const raw = String(value ?? "").trim();
    if (!raw) return 0;

    // Accept formats like: "4.5", "4,5", "4.5/5", "Rating: 4.5 out of 5"
    const match = raw.match(/(\d+(?:[\.,]\d+)?)/);
    if (!match) return 0;
    const normalized = match[1].replace(",", ".");
    const num = Number.parseFloat(normalized);
    return Number.isFinite(num) ? num : 0;
  };
  const [activeTab, setActiveTab] = useState("details");
  const [isSticky, setIsSticky] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Detect when the tabs bar becomes sticky
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const navHeightRaw = getComputedStyle(document.documentElement)
      .getPropertyValue("--main-nav-height")
      .trim();
    const navHeight = Number.parseFloat(navHeightRaw) || 0;
    const stickyObserver = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: `-${navHeight}px 0px 0px 0px` }
    );
    stickyObserver.observe(sentinel);
    return () => stickyObserver.disconnect();
  }, []);

  const looksLikeUrl = (value: string) => /^(https?:\/\/|\/\/)/i.test(value.trim());

  const normalizeMapSrc = (value: string) => {
    const raw = (value || "").trim();
    if (!raw) return "";

    if (raw.includes("<iframe")) {
      const match = raw.match(/src\s*=\s*["']([^"']+)["']/i);
      return match?.[1] || "";
    }

    if (looksLikeUrl(raw)) {
      return raw.startsWith("//") ? `https:${raw}` : raw;
    }

    // Treat anything else as a location query (coords or address)
    return `https://www.google.com/maps?q=${encodeURIComponent(raw)}&output=embed`;
  };

  const normalizeLocationHtml = (html: string) => {
    let out = html || "";

    // If backend inserts a break between Address label and value, keep them on one line.
    out = out.replace(
      /(<strong>\s*Address\s*:?(?:\s*<\/strong>))\s*<br\s*\/?>\s*:?\s*/gi,
      "<strong>Address:</strong> "
    );

    // If backend splits Address label and value into two paragraphs, merge into one paragraph.
    out = out.replace(
      /<p>\s*<strong>\s*Address\s*:?(?:\s*<\/strong>)\s*<\/p>\s*<p>\s*:?[\s\u00A0]*/gi,
      "<p><strong>Address:</strong> "
    );

    return out;
  };

  const renderRichText = (html: string) => {
    const safe = DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
    });

    return (
      <div
        className={`${styles.hotelRichText} text-sm md:text-base`}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    );
  };

  const getFacilityItems = (html: string) => {
    const trimmed = (html || "").trim();
    if (!trimmed) return [] as string[];

    // If the backend provides a list, prefer extracting items so we can enforce
    // a fixed "17 items per column" layout.
    if (!trimmed.toLowerCase().includes("<li")) return [] as string[];

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed, "text/html");
      const items = Array.from(doc.querySelectorAll("li"))
        .map((li) => (li.textContent || "").trim())
        .filter(Boolean);
      return items;
    } catch {
      return [] as string[];
    }
  };

  const chunk = <T,>(items: T[], size: number) => {
    const out: T[][] = [];
    for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
    return out;
  };

  const renderFacilities = (html: string) => {
    const items = getFacilityItems(html);
    if (!items.length) return html.trim() ? renderRichText(html) : null;

    const columns = chunk(items, 17);

    return (
      <div className="flex flex-wrap items-start gap-[10px]">
        {columns.map((col, idx) => (
          <div
            key={idx}
            className="w-[282px] flex flex-col items-start gap-[10px] font-['Montserrat'] text-[16px] leading-[140%] font-normal text-[#595858]"
          >
            <ul className="list-disc pl-5 space-y-[10px]">
              {col.map((item, itemIdx) => (
                <li key={itemIdx}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  const { mapSrc, locationDescription } = (() => {
    if (Array.isArray(location)) {
      const [mapValue, descriptionValue] = location;
      return {
        mapSrc: normalizeMapSrc(mapValue || ""),
        locationDescription: descriptionValue || "",
      };
    }

    return {
      mapSrc: normalizeMapSrc(location.mapEmbedUrl || ""),
      locationDescription: location.description || "",
    };
  })();

  return (
    <div className="max-w-[1280px] font-['Montserrat'] mb-12 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl shadow-pml-primary/5 md:p-6" >
      {/* Sentinel — used to detect when tabs bar becomes sticky */}
      {/* <div ref={sentinelRef} aria-hidden className="h-px" /> */}

      {/* ================= TABS ================= */}
      <div
        className={`sticky z-30 transition-all rounded-xl ${isSticky ? "bg-white shadow-md my-2 px-2" : "bg-white"}`}
        style={{ top: isSticky ? "calc(var(--main-nav-height, 0px) - 1px)" : "var(--main-nav-height, 0px)" }}
      >
        {isSticky ? (
          /* ── sticky single-row layout ── */
          <div className="flex items-center justify-between gap-4 py-2">
            {/* Left: hotel name + tags (row 1), tabs (row 2) — stacked in column */}
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="flex items-start md:items-center gap-0 md:gap-2 min-w-0 flex-col md:flex-row justify-start">
                {hotelName && (
                  <p className="text-[18px] md:text-[22px] font-semibold text-pml-primary leading-tight whitespace-nowrap shrink-0">
                    {hotelName}
                  </p>
                )}
                {(departureAirport || duration != null || boardBasis) && (
                  <div className="flex items-center gap-x-2 font-medium text-[13px] text-[#595858] shrink-0 self-start md:self-auto">
                    {departureAirport && (
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        {departureAirport}
                      </span>
                    )}
                    {duration != null && (
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <span>•</span>{duration} Night{duration !== 1 ? "s" : ""}
                      </span>
                    )}
                    {boardBasis && (
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <span>•</span>{boardBasis}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-6 overflow-x-auto text-sm font-medium">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pt-2 pb-1 shrink-0 border-b-[3px] transition-colors text-[14px] md:text-[15px] ${
                      activeTab === tab.id
                        ? "border-pml-primary text-pml-primary font-bold"
                        : "border-transparent text-gray-600 hover:text-pml-primary/70"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: price + button */}
            {/* <div className="flex-shrink-0 md:pt-1">
              <div className="hidden items-center gap-[18px] md:flex">
                {!hidePriceSection && (
                  <div className="flex flex-col items-end text-[14px] font-medium leading-[16px] text-[#595858]">
                    <div className="mb-[4px] flex flex-wrap items-center justify-end gap-2">
                      {saveBadgeText ? (
                        <div className="inline-flex h-[24px] items-center justify-center rounded-[4px] bg-[#25D366] px-[10px] text-[12px] font-semibold leading-[14px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.2)]">
                          Save&nbsp;{saveBadgeText}%
                        </div>
                      ) : null}
                      {saveBadgeText && hasStrikePrice ? (
                        <p className="relative inline-flex items-center text-[16px] font-bold leading-[14px] text-[#595858]">
                          <span>{strikePriceStr}</span>
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[130%] -translate-x-1/2 -translate-y-1/2 rotate-[-10deg] bg-[#595858]"
                          />
                        </p>
                      ) : null}
                    </div>
                    {isLoadingPrice ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pml-primary"></div>
                        <span className="text-[#4c4c4c] text-[12px]">Loading...</span>
                      </div>
                    ) : (
                      <div className="w-full text-right">
                        <div className="text-[26px] font-bold leading-[30px] text-[#CB2187] lg:text-[30px] lg:leading-[34px]">
                          {totalPrice != null ? formatPrice(totalPrice) : fallbackPrice}/
                          <span className="text-[20px] font-light leading-[30px] text-[#CB2187] lg:text-[30px] lg:leading-[34px]">
                            pp
                          </span>
                        </div>
                        {localTax != null && localTax !== 0 && (
                          <div className="mt-[2px] flex items-center justify-end text-[12px] font-medium leading-[14px] text-[#595858]">
                            <span>{formatPrice(basePrice ?? 0)}</span>
                            <span className="mx-1">+</span>
                            <span>£{Math.round(localTax ?? 0)}</span>
                            <span className="ml-1">(Local Tax)</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {onEnquire && (
                  <button
                    type="button"
                    onClick={() => onEnquire?.()}
                    disabled={isSearching}
                    className="flex h-[60px] w-[179px] items-center justify-center rounded-[8px] bg-pml-primary hover:bg-[#a81a6f] px-[10px] py-[10px] text-[18px] font-bold leading-[56px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.25)] disabled:opacity-70"
                  >
                    Enquire Now
                  </button>
                )}
              </div>
            </div> */}
          </div>
        ) : (
          /* ── normal underline tab strip ── */
          <div className="flex overflow-x-auto gap-6 text-sm font-medium">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pt-4 pb-1 shrink-0 border-b-[3px] transition-colors ${
                  activeTab === tab.id
                    ? "border-pml-primary text-pml-primary font-bold"
                    : "border-transparent text-gray-600 hover:text-pml-primary/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ================= HOTEL DETAILS ================= */}
      {activeTab === "details" && (
        <section id="details" className="pt-4 md:pt-5 text-[#595858]">
          <h2 className="text-xl text-pml-primary font-extrabold tracking-tight mb-2">About The Hotel</h2>
          {overview ? renderRichText(overview) : null}
        </section>
      )}

      {/* ================= LOCATION ================= */}
      {activeTab === "location" && (
        <section id="location" className="pt-4 md:pt-5 text-[#595858]">
          <h2 className="text-xl text-pml-primary font-extrabold tracking-tight mb-3 ">Location</h2>

          {locationDescription ? (
            <div className="mb-3">
              {renderRichText(normalizeLocationHtml(locationDescription))}
            </div>
          ) : null}
          {mapSrc && (
            <iframe
              src={mapSrc}
              className="w-full h-[220px] rounded-2xl mb-3"
              loading="lazy"
            />
          )}
        </section>
      )}

      {/* ================= FACILITIES ================= */}
      {activeTab === "facilities" && (
        <section id="facilities" className="pt-4 md:pt-5 text-[#595858]">
          <h2 className="text-xl text-pml-primary font-extrabold tracking-tight mb-3 ">Facilities</h2>
          {facilities.trim() ? <div className="mb-3">{renderFacilities(facilities)}</div> : null}
        </section>
      )}

      {/* ================= REVIEWS ================= */}
      {activeTab === "reviews" && (
        <section id="reviews" className="pt-4 md:pt-5 text-[#595858]">
          <h2 className="text-xl text-pml-primary font-extrabold tracking-tight mb-2 ">Reviews</h2>
          <p className="text-[16px] text-[#595858] leading-[140%] font-medium mt-1 mb-[12px]">
            TripAdvisor Reviews
          </p>
          <div className="flex items-center gap-3 mb-[12px]">
            <div className="flex gap-1">
              {(() => {
                const rating = parseRating((reviews as any)?.rating);
                const count = Math.max(0, Math.min(5, Math.floor(rating)));
                return Array.from({ length: count }).map((_, i) => i);
              })().map((i) => (
                <svg
                  key={`review-dot-${i}`}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="12" fill="#00AF87" />
                </svg>
              ))}
            </div>
            <span className="text-[14px] text-[#595858] leading-[140%] font-medium">
              {(Number(reviews.total) || 0).toLocaleString()} reviews
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: {reviews.updatedAt}
          </p>
        </section>
      )}

      {activeTab === "fineprint" && (
        <section id="fineprint" className="pt-4 md:pt-5 pb-10 text-[#595858]">
          <h2 className="text-xl text-pml-primary font-extrabold tracking-tight mb-2">Fine Print</h2>
          {finePrint.trim() ? <div className="mb-3">{renderRichText(finePrint)}</div> : null}
        </section>
      )}
      {activeTab === "whywelovethishotel" && (
        <section id="whywelovethishotel" className="pt-4 md:pt-5 pb-10 text-[#595858]">
          <h2 className="text-xl text-pml-primary font-extrabold tracking-tight mb-2">Why We Love This Hotel</h2>
          {whyWeLoveThisHotel?.trim() ? (
            <div className="mb-3">{renderRichText(whyWeLoveThisHotel)}</div>
          ) : null}
        </section>
      )}
    </div>
  );
}


