import { useMemo, useState } from "react";
import { ArrowRight, BedDouble, Calendar, ChevronDown, Info, MapPin, PhoneCall, Tag, Ticket } from "lucide-react";
import { extractDurationMinFromUrl, normalizeApiUrl } from "@/components/cardprice";
import { BOARD_BASIS_ID_TO_CODE, BOARD_BASIS_NAMES, getBoardBasisCode, getBoardBasisIdFromCode } from "@/lib/mappings/board-basis";
import { trackEvent } from "@/lib/storage";
import { attachCurrentPageToWhatsAppHref, getWhatsAppUrl } from "@/lib/utils";
import { parseTopFacilities } from "@/lib/mappings/top-facilities";

const STAR_PATH = "M14.0001 5.4091L8.91313 5.07466L6.99734 0.261719L5.08156 5.07466L0.0001297 5.4091L3.89754 8.7184L2.61862 13.7384L6.99734 10.9707L11.3761 13.7384L10.0972 8.7184L14.0001 5.4091Z";

function parseStayInfo(apiUrl?: string): { nights: number | null; boardBasis: string | null; date: string | null } {
  if (!apiUrl) return { nights: null, boardBasis: null, date: null };
  const nights = extractDurationMinFromUrl(apiUrl);
  let boardBasis: string | null = null;
  let date: string | null = null;
  try {
    const params = new URLSearchParams(normalizeApiUrl(apiUrl));
    const bbId = params.get("boardType");
    const code = bbId ? BOARD_BASIS_ID_TO_CODE[bbId] : null;
    boardBasis = code ? (BOARD_BASIS_NAMES[code] ?? null) : null;
    date = params.get("dateMin") || params.get("date") || null;
  } catch { /* ignore */ }
  return { nights, boardBasis, date };
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr ?? "";
  }
}

function formatBoardBasisLabel(label: string): string {
  const raw = String(label || "").trim().toUpperCase();
  if (raw === "RO" || raw === "9" || raw === "ROOM ONLY" || raw === "ROOM_ONLY") return "Room Only";
  if (raw === "BB" || raw === "8" || raw === "BED AND BREAKFAST" || raw === "BED & BREAKFAST" || raw === "BED_BREAKFAST") return "Bed And Breakfast";
  if (raw === "HB" || raw === "3" || raw === "HALF BOARD" || raw === "HALF_BOARD") return "Half Board";
  if (raw === "FB" || raw === "4" || raw === "FULL BOARD" || raw === "FULL_BOARD") return "Full Board";
  if (raw === "AI" || raw === "5" || raw === "ALL INCLUSIVE" || raw === "ALL_INCLUSIVE") return "All Inclusive";
  if (raw === "SC" || raw === "2" || raw === "SELF CATERING" || raw === "SELF_CATERING") return "Self Catering";
  if (raw === "CC" || raw === "6" || raw === "CATERED CHALET") return "Catered Chalet";
  if (raw === "CLB" || raw === "12" || raw === "CLUB HOTEL") return "Club Hotel";
  if (raw === "ANY" || raw === "-1" || raw === "ALL BOARD BASIS") return "All board basis";
  return label;
}

function PmlStars({ rating }: { rating?: string | number }) {
  const num = parseInt(String(rating ?? "")) || 0;
  return (
    <span className="inline-flex h-3.5 flex-shrink-0 items-center gap-px overflow-visible">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="-0.5 -0.5 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block overflow-visible"
          aria-hidden="true"
        >
          <path d={STAR_PATH} fill={num >= i + 1 ? "#FBBC05" : "#D3D3D3"} />
        </svg>
      ))}
    </span>
  );
}

function DiscountRibbon({ pct }: { pct: number | null }) {
  if (!pct) return null;
  return (
    <span className="pointer-events-none absolute top-[18px] -right-[40px] z-10 w-[140px] rotate-45 bg-pml-primary py-1 text-center text-[12px] font-bold tracking-wide text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
      {pct}% OFF
    </span>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function formatCompactCount(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

function GoogleRatingCard({ rating, reviewCount }: { rating?: string; reviewCount?: number }) {
  const parsed = rating ? parseFloat(rating) : NaN;
  if (!rating || Number.isNaN(parsed)) return null;
  return (
    <div className="inline-flex w-fit max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200/80 bg-white px-2.5 py-1 shadow-sm">
      <GoogleIcon className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="text-[13px] font-bold leading-none text-slate-800">{parsed.toFixed(1)}</span>
      {typeof reviewCount === "number" && reviewCount > 0 && (
        <span className="text-[11px] font-medium leading-none text-slate-400">
          <span className="hidden sm:inline">{reviewCount.toLocaleString("en-GB")} reviews</span>
          <span className="sm:hidden">{formatCompactCount(reviewCount)} reviews</span>
        </span>
      )}
    </div>
  );
}

function flightChipLabel(departureAirportCode?: string, arrivalAirportCode?: string): string {
  if (!departureAirportCode) return "";
  return arrivalAirportCode
    ? `${departureAirportCode}⇌${arrivalAirportCode}`
    : `${departureAirportCode}`;
}

function FeatureChips({ nights, boardBasis, checkinDate, departureAirportCode, arrivalAirportCode }: { nights: number | null; boardBasis?: string | null; checkinDate?: string; departureAirportCode?: string; arrivalAirportCode?: string }) {
  const formattedDate = formatDate(checkinDate);
  const nightsLabel = nights && nights > 0 ? `${nights} ${nights === 1 ? "Night" : "Nights"}` : "";
  const dateAndNights = [formattedDate, nightsLabel].filter(Boolean).join(" - ");

  const items: { key: string; icon: typeof Calendar; value: string; hint?: string }[] = [];
  if (dateAndNights) items.push({ key: "date", icon: Calendar, value: dateAndNights });
  if (boardBasis) items.push({ key: "board", icon: BedDouble, value: formatBoardBasisLabel(boardBasis) });
  if (departureAirportCode) items.push({ key: "flight", icon: Ticket, value: flightChipLabel(departureAirportCode, arrivalAirportCode), hint: "Other routes in View Deal" });
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col items-start gap-1.5">
      {items.map(({ key, icon: Icon, value, hint }) => (
        <div key={key} className="flex items-center gap-2 min-w-0 text-slate-500">
          <Icon className="w-4 h-4 flex-shrink-0 text-pml-primary" />
          <span className="text-[11px] sm:text-[13px] font-medium truncate">{value}</span>
          {hint && (
            <span className="group/hint relative flex-shrink-0">
              <Info className="w-3.5 h-3.5 cursor-help" />
              <div className="absolute z-10 bottom-full left-0 mb-1.5 hidden w-max whitespace-nowrap rounded-[8px] border border-slate-200/80 bg-white p-2.5 text-[11px] font-medium leading-relaxed text-slate-700 shadow-lg group-hover/hint:block pointer-events-none">
                {hint}
              </div>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function TopFacilityChips({ topFacilities }: { topFacilities?: string }) {
  const facilities = useMemo(() => parseTopFacilities(topFacilities).slice(0, 3), [topFacilities]);
  if (facilities.length === 0) return null;

  return (
    <div className="flex flex-col items-start gap-1.5 flex-shrink-0">
      {facilities.map(({ id, icon: Icon, name }) => (
        <div key={id} className="flex items-center gap-2 min-w-0 text-slate-500">
          <Icon className="w-4 h-4 flex-shrink-0 text-pml-primary" />
          <span className="text-[11px] sm:text-[13px] font-medium truncate">{name}</span>
        </div>
      ))}
    </div>
  );
}

function OfferBanner({ label, saveAmount }: { label: string; saveAmount: number | null }) {
  return (
    <div className="flex h-8 w-full min-w-0 items-center gap-2 rounded-[10px] border border-[#63e6be] bg-[#e6fcf5] px-2.5">
      <Tag className="h-3.5 w-3.5 flex-shrink-0 text-[#0ca678]" />
      <span className="min-w-0 flex items-center text-left leading-0.5">
        <span className="block text-[12px] font-medium text-[#0ca678]">Special Offer - {label}</span>
      </span>
    </div>
  );
}

function ContactButtons({ source }: { source?: string }) {
  return (
    <>
      <a
        href={getWhatsAppUrl({ source })}
        onClick={(e) => { e.stopPropagation(); attachCurrentPageToWhatsAppHref(e, { source }); }}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
        className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-all hover:-translate-y-px hover:border-[#25D366]/40 hover:bg-[#25D366]/10 hover:text-[#25D366] focus:outline-none"
      >
        <svg viewBox="0 0 24 24" className="fill-current h-5 w-5 flex-shrink-0 text-[#25D366]" aria-hidden="true"><path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c7.905 4.27 17.661-1.4 17.665-10.449 0-3.176-1.24-6.165-3.495-8.402ZM22.002 11.866c-.006 7.633-8.385 12.4-15.012 8.504l-.36-.214-3.75.975 1.005-3.645-.239-.375C-.478 10.546 4.26 1.966 12.072 1.966c2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99Z"></path><path d="M17.507 14.307c-2.199-1.096-2.429-1.242-2.713-.816-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.293-.506.32-.578.878-1.634.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.576-.05-.997-.042-1.368.344-1.614 1.774-1.207 3.604.174 5.55 2.714 3.552 4.16 4.206 6.804 5.114.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345Z"></path></svg>
      </a>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); window.location.href = "tel:02037400744"; }}
        aria-label="Call 020 3740 0744"
        title="020 3740 0744"
        className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-all hover:-translate-y-px hover:border-pink-300 hover:bg-pink-50/40 hover:text-pink-600 focus:outline-none"
      >
        <PhoneCall className="w-4 h-4 text-pink-600" />
      </button>
    </>
  );
}

function computeDiscount(rawPrice: number, saveUpToText?: string): { pct: number | null; oldPrice: number | null; saveAmount: number | null } {
  const pct = Math.round(Number(saveUpToText));
  if (!saveUpToText || Number.isNaN(pct) || pct <= 0 || pct >= 95 || !rawPrice) {
    return { pct: null, oldPrice: null, saveAmount: null };
  }
  const oldPriceRaw = rawPrice / (1 - pct / 100);
  return { pct, oldPrice: Math.round(oldPriceRaw), saveAmount: oldPriceRaw - rawPrice };
}

function PriceSection({ price, oldPrice, tax }: { price: number; oldPrice: number | null; tax?: number }) {
  const [showTaxNote, setShowTaxNote] = useState(false);
  return (
    <div className="sm:flex sm:w-full sm:flex-col sm:items-end">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-end gap-0.5 sm:gap-1.5">
        {oldPrice && (
          <span className="text-slate-400 line-through text-xs font-medium leading-none">
            &pound;{oldPrice}
          </span>
        )}
        <div className="flex items-baseline gap-1">
          <span className="text-[28px] sm:text-[30px] font-bold text-[#4C4C4C] leading-none tracking-normal gap-[1px]">
            &pound;<span className="ml-0.5">{price}</span>
          </span>
          <span className="text-slate-500 font-medium text-[13px] sm:text-sm">/pp</span>
        </div>
      </div>
      {typeof tax === "number" && tax > 0 && (
        <div className="group/tax relative inline-block mt-0.5">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTaxNote((v) => !v); }}
            aria-expanded={showTaxNote}
            className="flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-emerald-600 cursor-help"
          >
            Tax: &pound;{tax.toFixed(2)} Excluded
            <Info className="w-3 h-3 flex-shrink-0" />
          </button>
          <div
            className={`absolute z-10 bottom-full left-0 sm:left-auto sm:right-0 mb-1.5 w-64 rounded-[8px] border border-slate-200/80 bg-white p-2.5 text-[11px] font-medium leading-relaxed text-slate-700 shadow-lg ${showTaxNote ? "block" : "hidden group-hover/tax:block"}`}
          >
            Payable directly at the hotel at check-in or check-out — it is not paid to us. Calculated using live exchange rates, so the final figure can shift slightly.
          </div>
        </div>
      )}
    </div>
  );
}

export function isHotelOnOffer(hotel: Pick<HotelCardData, "offer_on_card" | "saveuptotext">): boolean {
  return Boolean(hotel.offer_on_card?.toString().trim()) || Boolean(hotel.saveuptotext?.toString().trim());
}

export type HotelCardData = {
  slug: string;
  hotelName?: string;
  hotel_name?: string;
  location?: string;
  offer_header?: string;
  card_image?: string;
  top_facilities?: string;
  starting_price?: number;
  rating?: string | number;
  property_rating?: string | number;
  offer_on_card?: string;
  saveuptotext?: string;
  checkinDate?: string;
  checkInDate?: string;
  flight?: any;
  hotelId?: string | number;
  quoteReference?: string;
  departureAirportCode?: string;
  arrivalAirportCode?: string;
  departureAirport?: string;
  airportCode?: string;
  hotel?: any;
  google_rating?: string;
  google_review_count?: number;
  tax?: number;
  rawPrice?: number;
  [key: string]: unknown;
};

type HotelCardProps = {
  hotel: HotelCardData;
  innerRef?: React.Ref<HTMLDivElement>;
  index?: number;
  isHighlighted?: boolean;
};


import { resolveAirportIataToId } from "@/lib/mappings/airports";

export default function HotelCard({ hotel, innerRef, index, isHighlighted }: HotelCardProps) {
  const img = hotel.card_image || undefined;

  const { nights, boardBasis, date: parsedDate } = useMemo(
    () => parseStayInfo(hotel.api_url as string | undefined),
    [hotel.api_url]
  );

  const resolvedDate = (hotel.checkInDate as string | undefined) || (hotel.checkinDate as string | undefined) || (hotel.flight as any)?.outboundDepartureDate || parsedDate || undefined;
  const resolvedBoardBasis = (hotel.boardBasis as string | undefined) || (hotel.board_basis as string | undefined) || boardBasis || undefined;
  const resolvedNights = nights || (hotel.duration as number | null) || (hotel.nights as number | null) || null;

  const href = useMemo(() => {
    const queryParams = new URLSearchParams();
    if (resolvedDate) queryParams.set("checkinDate", String(resolvedDate));

    const resolvedDuration = nights || hotel.duration || hotel.nights;
    if (resolvedDuration) queryParams.set("duration", String(resolvedDuration));

    let bbId = "";
    if (hotel.boardBasis) {
      const code = getBoardBasisCode(hotel.boardBasis as any);
      if (code) bbId = getBoardBasisIdFromCode(code);
    }
    if (!bbId && hotel.api_url) {
      try {
        const params = new URLSearchParams(normalizeApiUrl(hotel.api_url as string));
        bbId = params.get("boardType") || params.get("boardBasisId") || "";
      } catch { }
    }
    if (bbId) queryParams.set("boardBasis", String(bbId));

    const depCode =
      hotel.departureAirportCode ||
      hotel.airportCode ||
      hotel.departureAirport ||
      hotel.fromAirport ||
      hotel.flight?.departureAirportCode ||
      hotel.hotel?.fromAirport;
    if (depCode) {
      const depIds = String(depCode)
        .split(",")
        .map(resolveAirportIataToId)
        .filter(Boolean)
        .join(",");
      if (depIds) {
        queryParams.set("departure", depIds);
      }
    }

    queryParams.set("search", "true");

    const queryStr = queryParams.toString();
    return `/hotels/${hotel.slug}${queryStr ? `?${queryStr}` : ""}`;
  }, [hotel.slug, resolvedDate, nights, hotel.duration, hotel.nights, hotel.boardBasis, hotel.api_url, hotel.departureAirportCode, hotel.airportCode, hotel.fromAirport, hotel.flight, hotel.hotel]);

  const rawPriceValue =
    (typeof hotel.rawPrice === "number" && hotel.rawPrice > 0 ? hotel.rawPrice : undefined) ??
    (typeof hotel.starting_price === "number" && hotel.starting_price > 0 ? hotel.starting_price : undefined) ??
    0;
  const price = rawPriceValue > 0 ? Math.round(rawPriceValue) : 0;

  const isOffer = isHotelOnOffer(hotel);
  const { pct, oldPrice, saveAmount } = useMemo(
    () => computeDiscount(rawPriceValue, hotel.saveuptotext),
    [rawPriceValue, hotel.saveuptotext]
  );
  const offerLabel = hotel.offer_on_card?.toString().trim() || (pct ? `${pct}% OFF` : "");

  const resolvedDepartureAirportCode = String(
    hotel.departureAirportCode ||
    hotel.airportCode ||
    hotel.departureAirport ||
    hotel.fromAirport ||
    hotel.hotel?.fromAirport ||
    hotel.flight?.departureAirportCode ||
    ""
  ).trim() || undefined;
  const resolvedArrivalAirportCode = hotel.arrivalAirportCode ? String(hotel.arrivalAirportCode).trim() || undefined : undefined;
  const handleClick = () => {

    if (hotel.hotelId) {
      try {
        const slug = hotel.slug;
        const dealToSave = {
          ...hotel,
          slug,
          hotel_name: hotel.hotelName,
          boardBasis: hotel.boardBasis,
          property_rating: hotel.rating,
          starting_price: hotel.rawPrice,
          departureAirportCode: hotel.departureAirportCode,
        };
        localStorage.setItem('pml_current_deal', JSON.stringify(dealToSave));
      } catch (err) {
        console.error("Failed to save supplier deal to localStorage:", err);
      }
    }

    const hotelId = String(hotel.hotelId);
    if (hotelId && typeof window !== "undefined") {
      sessionStorage.setItem('pml_last_viewed_id', hotelId);
    }
  };

  return (
    <div
      ref={innerRef}
      onClick={handleClick}
      data-testid={`hotel-card-${hotel.slug}`}
      className={`group flex flex-col sm:flex-row overflow-hidden rounded-[12px] border shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05),0_2px_6px_-2px_rgba(0,0,0,0.025)] min-h-[200px] no-underline font-['Montserrat'] ${isHighlighted
        ? "border-2 border-gray-200 bg-[#B80662]/5"
        : "border-slate-200 bg-white"
        }`}>
      {/* Image */}
      <div className="relative h-[180px] w-full flex-shrink-0 overflow-hidden sm:h-auto sm:w-[260px] lg:w-[280px]">
        <img src={img} alt={hotel.hotel_name ?? ""} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 will-change-transform" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
        {isOffer && <DiscountRibbon pct={pct} />}
        {isHighlighted && (
          <span className="absolute bottom-3 right-3 z-10 bg-[#641E46]/85 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-[4px]">
            Last Viewed
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 sm:flex-row sm:justify-between sm:gap-4 sm:px-5 sm:py-4 lg:px-6">
        {/* Main info */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-1.5 flex min-w-0 items-center justify-between gap-2 overflow-visible">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-pml-primary" />
                <span className="line-clamp-1 text-[13px] font-medium leading-0.5 text-slate-500">{hotel.location}</span>
              </div>
              <PmlStars rating={hotel.property_rating ?? hotel.rating} />
            </div>
            {hotel.google_rating && (
              <div className="flex-shrink-0 sm:hidden">
                <GoogleRatingCard rating={hotel.google_rating} reviewCount={hotel.google_review_count} />
              </div>
            )}
          </div>

          <h3
            className="mb-2 line-clamp-1 text-xl font-bold leading-[1.2] tracking-tight text-slate-800 sm:mb-2 sm:text-2xl sm:font-extrabold"
            title={hotel.hotel_name || hotel.offer_header}
          >
            {hotel.hotelName || hotel.hotel_name}
          </h3>

          {hotel.quoteReference && (
            <div className="mb-2 text-[12px] font-semibold text-gray-500">
              Quote Ref: {hotel.quoteReference}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 sm:gap-x-6 sm:gap-y-2.5">
            <FeatureChips
              nights={resolvedNights}
              boardBasis={resolvedBoardBasis}
              checkinDate={resolvedDate}
              departureAirportCode={resolvedDepartureAirportCode}
              arrivalAirportCode={resolvedArrivalAirportCode}
            />
            <TopFacilityChips topFacilities={hotel.top_facilities as string | undefined} />
          </div>
          {isOffer && offerLabel && (
            <div className="mt-3 w-full">
              <OfferBanner label={offerLabel} saveAmount={saveAmount} />
            </div>
          )}
        </div>

        {/* Action panel */}
        <div className="flex w-full flex-col justify-between gap-3 border-t border-dashed border-slate-200 pt-3 sm:w-[248px] sm:flex-shrink-0 sm:items-end sm:gap-4 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          <div className="hidden w-full flex-col items-stretch gap-2 sm:flex sm:items-end">
            {hotel.google_rating && (
              <GoogleRatingCard rating={hotel.google_rating} reviewCount={hotel.google_review_count} />
            )}
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 sm:items-end">
            <div className="flex w-full items-center justify-between gap-3 sm:block sm:text-right">
              {price > 0 && (
                <PriceSection price={price} oldPrice={oldPrice} tax={hotel.tax} />
              )}
              <div className="flex flex-shrink-0 items-center gap-2 sm:hidden">
                <ContactButtons source={hotel.hotelName || hotel.hotel_name} />
              </div>
            </div>
            <div className="flex w-full min-w-0 items-center gap-2">
              <div className="hidden flex-shrink-0 items-center gap-2 sm:flex">
                <ContactButtons source={hotel.hotelName || hotel.hotel_name} />
              </div>
              <a href={href}
                className={`inline-flex min-w-0 w-full sm:w-auto sm:flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[12px] bg-pml-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg sm:text-[14px] ${isOffer ? "shadow-pink-500/25" : "shadow-slate-900/20"} hover:bg-[#b01b74] hover:-translate-y-px hover:shadow-[0_4px_10px_rgba(203,33,135,0.2)] transition-all cursor-pointer`}
              >
                View Deal
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HotelCardSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 rounded-2xl bg-white border border-slate-100 p-4 sm:p-5 shadow-xl shadow-slate-200/50 animate-pulse font-['Montserrat']">
      <div className="w-full sm:w-[260px] lg:w-[320px] h-[220px] sm:h-auto bg-[#f0f0f0] flex-shrink-0 rounded-2xl" />
      <div className="flex-1 space-y-3">
        <div className="h-3 w-20 bg-[#eee] rounded-full" />
        <div className="h-6 w-3/4 bg-[#eee] rounded" />
        <div className="h-4 w-1/2 bg-[#eee] rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="h-9 bg-[#eee] rounded-xl" />
          <div className="h-9 bg-[#eee] rounded-xl" />
          <div className="h-9 bg-[#eee] rounded-xl hidden sm:block" />
          <div className="h-9 bg-[#eee] rounded-xl hidden sm:block" />
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-2 pt-3 border-t border-slate-100">
          <div className="h-12 w-40 bg-[#eee] rounded-2xl" />
          <div className="flex items-center gap-3">
            <div className="space-y-1.5">
              <div className="h-3 w-16 bg-[#eee] rounded" />
              <div className="h-8 w-28 bg-[#eee] rounded" />
            </div>
            <div className="h-12 w-32 bg-[#eee] rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
