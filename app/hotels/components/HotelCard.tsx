import { useMemo, useState } from "react";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, MapPin, Moon, MoveRight, PhoneCall, Plane, Tag, UtensilsCrossed } from "lucide-react";
import { extractDurationMinFromUrl, normalizeApiUrl } from "@/components/cardprice";
import { BOARD_BASIS_ID_TO_CODE, BOARD_BASIS_NAMES, getBoardBasisCode, getBoardBasisIdFromCode } from "@/lib/mappings/board-basis";
import { trackEvent } from "@/lib/storage";
import { attachCurrentPageToWhatsAppHref, getWhatsAppUrl } from "@/lib/utils";

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
      month: "short",
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
    <span className="inline-flex items-center flex-shrink-0">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="inline-block mr-[1px]"
        >
          <path d={STAR_PATH} fill={num >= i + 1 ? "#FBBC05" : "#D3D3D3"} />
        </svg>
      ))}
    </span>
  );
}

function FlightRoutePill({ departureCode, arrivalCode }: { departureCode?: string; arrivalCode?: string }) {
  if (!departureCode || !arrivalCode) return null;
  return (
    <span className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md text-[#1E293B] flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-full shadow-md border border-white/40 pointer-events-none">
      <Plane className="w-3.5 h-3.5 text-[#CB2187]" />
      {departureCode} → {arrivalCode}
    </span>
  );
}

function AllInclusivePill({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="absolute bottom-3.5 left-3.5 bg-slate-900/80 backdrop-blur-md text-white flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl shadow-lg border border-white/10 pointer-events-none">
      <UtensilsCrossed className="w-3.5 h-3.5" />
      All Inclusive (AI)
    </span>
  );
}

function DiscountRibbon({ pct }: { pct: number | null }) {
  if (!pct) return null;
  return (
    <span className="absolute top-4 -right-9 rotate-45 bg-[#CB2187] text-white text-[11px] font-extrabold uppercase tracking-wider py-1 px-10 shadow-lg border-b border-white/20 pointer-events-none">
      {pct}% OFF
    </span>
  );
}

function ImageCarouselControls({ count, activeIndex, onPrev, onNext }: { count: number; activeIndex: number; onPrev: (e: React.MouseEvent) => void; onNext: (e: React.MouseEvent) => void }) {
  if (count <= 1) return null;
  return (
    <>
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous photo"
        className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors border-none cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next photo"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors border-none cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full pointer-events-none">
        {activeIndex + 1}/{count}
      </span>
    </>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );
}

function formatCompactCount(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

function GoogleStars({ rating }: { rating: number }) {
  const num = Math.round(rating);
  return (
    <span className="inline-flex items-center">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="9" height="9" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mr-[1px]">
          <path d={STAR_PATH} fill={num >= i + 1 ? "#FBBC05" : "#D3D3D3"} />
        </svg>
      ))}
    </span>
  );
}

function GoogleRatingCard({ rating, reviewCount }: { rating?: string; reviewCount?: number }) {
  const parsed = rating ? parseFloat(rating) : NaN;
  if (!rating || Number.isNaN(parsed)) return null;
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2 flex items-center gap-3 shadow-xs self-start">
      <GoogleIcon className="w-6 h-6 flex-shrink-0" />
      <div className="flex items-center gap-2">
        <span className="text-base font-extrabold text-slate-900 leading-none">{parsed.toFixed(1)}</span>
        <div>
          <GoogleStars rating={parsed} />
          {typeof reviewCount === "number" && reviewCount > 0 && (
            <div className="text-[10px] font-medium text-slate-400 leading-none mt-0.5">
              <span className="hidden sm:inline">{reviewCount.toLocaleString("en-GB")} reviews</span>
              <span className="sm:hidden">{formatCompactCount(reviewCount)} reviews</span>
            </div>
          )}
        </div>
      </div>
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
  const cells: { key: string; icon: typeof Calendar; value: string }[] = [];
  if (formattedDate) cells.push({ key: "date", icon: Calendar, value: formattedDate });
  if (nights && nights > 0) cells.push({ key: "nights", icon: Moon, value: `${nights} ${nights === 1 ? "Night" : "Nights"}` });
  if (boardBasis) cells.push({ key: "board", icon: UtensilsCrossed, value: formatBoardBasisLabel(boardBasis) });
  if (departureAirportCode) cells.push({ key: "flight", icon: Plane, value: flightChipLabel(departureAirportCode, arrivalAirportCode) });
  if (cells.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-2">
      {cells.map(({ key, icon: Icon, value }) => (
        <div key={key} className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 flex items-center gap-2 min-w-0">
          <Icon className="w-4 h-4 text-[#CB2187] flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-700 truncate">{value}</span>
        </div>
      ))}
    </div>
  );
}

function OfferBanner({ label, saveAmount, compact }: { label: string; saveAmount: number | null; compact?: boolean }) {
  if (compact) {
    return (
      <div className="h-full bg-[#EAFAF0] border border-[#bbf7d0] rounded-xl px-3 py-2 flex flex-col justify-center gap-0.5 min-w-0">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#0F8A3D] min-w-0">
          <Tag className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{label}</span>
        </span>
        {saveAmount ? (
          <span className="text-[11px] font-semibold text-slate-600 truncate">Save &pound;{saveAmount.toFixed(2)}</span>
        ) : null}
      </div>
    );
  }
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#EAFAF0] border border-[#bbf7d0] rounded-xl px-4 py-2.5 text-xs sm:text-[13px] font-semibold">
      <span className="flex items-center gap-2 min-w-0">
        <Tag className="w-4 h-4 text-[#0F8A3D] flex-shrink-0" />
        <span className="text-[#0F8A3D] truncate">Special Offer: {label}</span>
        <span className="text-slate-500 font-medium hidden sm:inline">Limited Time Only!</span>
      </span>
      {saveAmount && (
        <span className="flex-shrink-0 self-end sm:self-auto">
          <span className="text-slate-600 font-normal">You Save </span>&pound;{saveAmount.toFixed(2)}
        </span>
      )}
    </div>
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
  return (
    <div>
      <div className="flex items-baseline gap-1 leading-none flex-wrap">
        {oldPrice && (
          <span className="text-slate-400 line-through text-xs font-semibold mr-0.5">
            &pound;{oldPrice}
          </span>
        )}
        <span className="text-[28px] md:text-[34px] font-black text-pml-primary tracking-tight">
          &pound;{price}
        </span>
        <span className="text-slate-500 font-medium text-[13px] md:text-sm">/pp</span>
      </div>
      {typeof tax === "number" && tax > 0 && (
        <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
          Tax: &pound;{tax.toFixed(2)} Included
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
  thumbnail_1?: string;
  thumbnail_2?: string;
  thumbnail_3?: string;
  starting_price?: number;
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

const PLACEHOLDER = "https://planmylux.s3.eu-west-2.amazonaws.com/placeholder.webp";
import { resolveAirportIataToId } from "@/lib/mappings/airports";

export default function HotelCard({ hotel, innerRef, index, isHighlighted }: HotelCardProps) {
  const images = useMemo(() => {
    const seen = new Set<string>();
    return [hotel.card_image, hotel.thumbnail_1, hotel.thumbnail_2, hotel.thumbnail_3].filter((u): u is string => {
      if (!u || seen.has(u)) return false;
      seen.add(u);
      return true;
    });
  }, [hotel.card_image, hotel.thumbnail_1, hotel.thumbnail_2, hotel.thumbnail_3]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const img = images[activeImageIndex] || PLACEHOLDER;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((i) => (i - 1 + images.length) % images.length);
  };
  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((i) => (i + 1) % images.length);
  };

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

  const resolvedArrivalAirportCode = hotel.arrivalAirportCode ? String(hotel.arrivalAirportCode).trim() || undefined : undefined;
  const resolvedDepartureAirportCode = String(
    hotel.departureAirportCode ||
    hotel.airportCode ||
    hotel.departureAirport ||
    hotel.fromAirport ||
    hotel.hotel?.fromAirport ||
    hotel.flight?.departureAirportCode ||
    ""
  ).trim() || undefined;
  const isAllInclusive = getBoardBasisCode((resolvedBoardBasis as any) ?? "") === "AI";

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
      className={`group flex flex-col sm:flex-row gap-4 sm:gap-5 rounded-[12px] border-2 p-4 sm:p-2 no-underline font-['Montserrat'] ${isHighlighted
        ? "border-2 border-gray-200 bg-[#B80662]/5"
        : "border-slate-100 bg-white"
        }`}>
      {/* Image */}
      <div className="relative w-full sm:w-[260px] lg:w-[320px] h-[220px] sm:h-auto flex-shrink-0 overflow-hidden rounded-[12px] bg-pml-bg-base">
        <img src={img} alt={hotel.hotel_name ?? ""} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 will-change-transform" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
        <ImageCarouselControls count={images.length} activeIndex={activeImageIndex} onPrev={handlePrevImage} onNext={handleNextImage} />
        <FlightRoutePill departureCode={hotel.departureAirportCode as string | undefined} arrivalCode={resolvedArrivalAirportCode} />
        <AllInclusivePill show={isAllInclusive} />
        {isOffer && <DiscountRibbon pct={pct} />}
        {isHighlighted && (
          <span className="absolute bottom-3 right-3 z-2 bg-[#B80662] text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-[6px] shadow-[0_2px_8px_rgba(184,6,98,0.4)] animate-pulse">
            Last Viewed
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between w-full min-w-0 gap-3">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-[1.15] line-clamp-1 flex-1 min-w-0" title={hotel.hotel_name || hotel.offer_header}>
              {hotel.hotelName || hotel.hotel_name}
            </h3>
            <PmlStars rating={hotel.property_rating} />
          </div>
          {hotel.location && (
            <div className="flex items-center gap-1.5 text-slate-500 mt-1">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-sm font-medium text-slate-600 line-clamp-1">{hotel.location}</span>
            </div>
          )}
          {hotel.quoteReference && (
            <div className="text-[12px] text-gray-500 font-semibold mt-1.5">
              Quote Ref: {hotel.quoteReference}
            </div>
          )}
          <div className="mt-3">
            <FeatureChips
              nights={resolvedNights}
              boardBasis={resolvedBoardBasis}
              checkinDate={resolvedDate}
              departureAirportCode={resolvedDepartureAirportCode}
              arrivalAirportCode={resolvedArrivalAirportCode}
            />
          </div>
          {isOffer && (
            <div className="flex sm:hidden items-stretch gap-2 mt-1">
              <div className="flex-1 min-w-0">
                <OfferBanner
                  label={hotel.offer_on_card?.toString().trim() || `${pct}% OFF`}
                  saveAmount={saveAmount}
                  compact
                />
              </div>
              <div className="flex-shrink-0">
                <GoogleRatingCard rating={hotel.google_rating} reviewCount={hotel.google_review_count} />
              </div>
            </div>
          )}
          {isOffer && (
            <div className="hidden sm:block mt-1">
              <OfferBanner
                label={hotel.offer_on_card?.toString().trim() || `${pct}% OFF`}
                saveAmount={saveAmount}
              />
            </div>
          )}
        </div>

        {!isOffer && <div className="border-t border-slate-100" />}

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className={isOffer ? "hidden sm:flex" : "flex"}>
            <GoogleRatingCard rating={hotel.google_rating} reviewCount={hotel.google_review_count} />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4 sm:ml-auto">
            {price > 0 && <PriceSection price={price} oldPrice={oldPrice} tax={hotel.tax} />}
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={getWhatsAppUrl({ source: hotel.hotelName || hotel.hotel_name })}
                onClick={(e) => { e.stopPropagation(); attachCurrentPageToWhatsAppHref(e, { source: hotel.hotelName || hotel.hotel_name }); }}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                title="Chat on WhatsApp"
                className="flex-shrink-0 p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-[#25D366] hover:border-[#25D366]/40 hover:bg-[#25D366]/10 transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="fill-current h-5 w-5 flex-shrink-0 text-[#25D366]" aria-hidden="true"><path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c7.905 4.27 17.661-1.4 17.665-10.449 0-3.176-1.24-6.165-3.495-8.402ZM22.002 11.866c-.006 7.633-8.385 12.4-15.012 8.504l-.36-.214-3.75.975 1.005-3.645-.239-.375C-.478 10.546 4.26 1.966 12.072 1.966c2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99Z"></path><path d="M17.507 14.307c-2.199-1.096-2.429-1.242-2.713-.816-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.293-.506.32-.578.878-1.634.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.576-.05-.997-.042-1.368.344-1.614 1.774-1.207 3.604.174 5.55 2.714 3.552 4.16 4.206 6.804 5.114.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345Z"></path></svg>
              </a>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); window.location.href = "tel:02037400744"; }}
                aria-label="Call 020 3740 0744"
                title="020 3740 0744"
                className="flex-shrink-0 p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-pink-600 hover:border-pink-300 hover:bg-pink-50/40 transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-pink-600" />
              </button>
              <a href={href}
                style={isOffer ? { background: "#CB2187" } : { background: "#0f1d38" }}
                className={`px-5 sm:px-6 py-2.5 inline-flex items-center justify-center gap-1.5 rounded-[12px] text-white text-[13px] sm:text-[14px] font-semibold whitespace-nowrap shadow-lg ${isOffer ? "shadow-pink-500/25" : "shadow-slate-900/20"} group-hover:opacity-90 transition-opacity cursor-pointer`}
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
