import { useMemo } from "react";
import { ChevronRight, MapPin, Moon, Plane, Sparkles, UtensilsCrossed } from "lucide-react";
import { extractDurationMinFromUrl, normalizeApiUrl } from "@/components/cardprice";
import { BOARD_BASIS_ID_TO_CODE, BOARD_BASIS_NAMES } from "@/lib/mappings/board-basis";

const STAR_PATH =
  "M14.0001 5.4091L8.91313 5.07466L6.99734 0.261719L5.08156 5.07466L0.0001297 5.4091L3.89754 8.7184L2.61862 13.7384L6.99734 10.9707L11.3761 13.7384L10.0972 8.7184L14.0001 5.4091Z";

function parseStayInfo(apiUrl?: string): { nights: number | null; boardBasis: string | null } {
  if (!apiUrl) return { nights: null, boardBasis: null };
  const nights = extractDurationMinFromUrl(apiUrl);
  let boardBasis: string | null = null;
  try {
    const params = new URLSearchParams(normalizeApiUrl(apiUrl));
    const bbId = params.get("boardBasisId");
    const code = bbId ? BOARD_BASIS_ID_TO_CODE[bbId] : null;
    boardBasis = code ? (BOARD_BASIS_NAMES[code] ?? null) : null;
  } catch { /* ignore */ }
  return { nights, boardBasis };
}

function formatBoardBasisLabel(label: string): string {
  return label.toLowerCase() === "bed and breakfast" ? "B&B" : label;
}

function PmlStars({ rating }: { rating?: string | number }) {
  const num = parseInt(String(rating ?? "")) || 0;
  return (
    <span className="inline-flex items-center">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="inline-block mr-[1px]"
        >
          <path d={STAR_PATH} fill={num >= i + 1 ? "#CB2187" : "#D3D3D3"} />
        </svg>
      ))}
    </span>
  );
}

function OfferBadge({ offerOnCard, saveUpToText }: { offerOnCard?: string; saveUpToText?: string }) {
  const label = offerOnCard?.trim()
    ? offerOnCard
    : saveUpToText
    ? `Save up to ${saveUpToText}`
    : "";
  if (!label) return null;
  return (
    <span className="absolute top-0 left-0 bg-white text-[#CB2187] flex items-center gap-1 pl-2 pr-4 py-1 text-[11px] md:text-[12px] font-semibold max-w-[85%] leading-[18px] tracking-[0.015em] rounded-br-[140px] pointer-events-none">
      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
      {label}
    </span>
  );
}

function StayChips({ nights, boardBasis }: { nights: number | null; boardBasis: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {nights && nights > 0 ? (
        <div className="flex items-center gap-1.5 bg-[#F8FAFC] text-[#475569] px-3 py-[7px] rounded-full text-[11px] sm:text-xs font-semibold border border-[#F1F5F9]">
          <Moon className="w-3.5 h-3.5 text-[#CB2187]" />
          {nights} {nights === 1 ? "Night" : "Nights"}
        </div>
      ) : null}
      {boardBasis ? (
        <div className="flex items-center gap-1.5 bg-[#F8FAFC] text-[#475569] px-3 py-[7px] rounded-full text-[11px] sm:text-xs font-semibold border border-[#F1F5F9]">
          <UtensilsCrossed className="w-3.5 h-3.5 text-[#CB2187]" />
          {formatBoardBasisLabel(boardBasis)}
        </div>
      ) : null}
      <div className="flex items-center gap-1.5 bg-[#F8FAFC] text-[#475569] px-3 py-[7px] rounded-full text-[11px] sm:text-xs font-semibold border border-[#F1F5F9]">
        <Plane className="w-3.5 h-3.5 text-[#CB2187]" />
        Flights Included
      </div>
    </div>
  );
}

function getSaveAmount(saveUpToText?: string): number | null {
  const match = (saveUpToText || "").match(/£(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function getDiscountPercent(saveUpToText?: string): number | null {
  const match = (saveUpToText || "").match(/(\d+(?:\.\d+)?)\s*%/);
  if (!match) return null;
  const pct = Math.round(Number(match[1]));
  return pct > 0 && pct < 95 ? pct : null;
}

function PriceSection({ price, saveUpToText }: { price: number; saveUpToText?: string }) {
  const saveAmount = getSaveAmount(saveUpToText);
  const pct = getDiscountPercent(saveUpToText);
  const oldPrice = saveAmount
    ? Math.round(price + saveAmount)
    : pct
    ? Math.round(price / (1 - pct / 100))
    : null;
  const saveLabel = saveUpToText ? `SAVE ${saveUpToText.trim()}` : "";

  return (
    <div className="pt-1 border-t border-[#C3C6C9]">
      <div className="flex items-center gap-2 mb-1 min-h-[22px]">
        {oldPrice && (
          <span className="text-[#595858] text-[13px] sm:text-[14px] font-semibold line-through decoration-[#595858]/60">
            &pound;{oldPrice}/pp
          </span>
        )}
        {saveLabel && (
          <span className="text-white text-[10px] font-semibold bg-[#00AA13] px-2 py-0.5 rounded leading-[16px]">
            {saveLabel}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-0.5 leading-none min-h-[34px]">
        <span className="text-[28px] md:text-[34px] font-bold text-[#CB2187] tracking-[-0.01em]">
          &pound;{price}
        </span>
        <span className="text-[#CB2187] font-semibold text-[16px] md:text-[18px]">/pp</span>
      </div>
    </div>
  );
}

export type HotelCardData = {
  slug: string;
  hotel_name?: string;
  location?: string;
  offer_header?: string;
  card_image?: string;
  thumbnail_1?: string;
  starting_price?: number;
  property_rating?: string | number;
  offer_on_card?: string;
  saveuptotext?: string;
  api_url?: string;
  offer_tag_type?: string;
  [key: string]: unknown;
};

type HotelCardProps = {
  hotel: HotelCardData;
  innerRef?: React.Ref<HTMLAnchorElement>;
};

const PLACEHOLDER =
  "https://planmylux.s3.eu-west-2.amazonaws.com/placeholder.webp";

export default function HotelCard({ hotel, innerRef }: HotelCardProps) {
  const img = hotel.card_image || hotel.thumbnail_1 || PLACEHOLDER;
  const href = `/hotels/${hotel.slug}`;
  const price =
    hotel.starting_price && hotel.starting_price > 0
      ? Math.round(hotel.starting_price)
      : 0;

  const { nights, boardBasis } = useMemo(
    () => parseStayInfo(hotel.api_url),
    [hotel.api_url]
  );

  return (
    <a
      ref={innerRef}
      href={href}
      data-testid={`hotel-card-${hotel.slug}`}
      className="group flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden no-underline transition-all duration-300 hover:-translate-y-[2px] font-['Montserrat']"
      style={{ boxShadow: "0px 0px 4px rgba(0,0,0,0.1), 0px 20px 40px rgba(0,0,0,0.05)" }}
    >
      {/* Image */}
      <div className="relative w-full sm:w-[300px] lg:w-[360px] h-[200px] sm:h-auto flex-shrink-0 overflow-hidden bg-pml-bg-base rounded-t-xl sm:rounded-t-none sm:rounded-l-xl">
        <img
          src={img}
          alt={hotel.hotel_name ?? ""}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 will-change-transform"
        />
        <OfferBadge offerOnCard={hotel.offer_on_card} saveUpToText={hotel.saveuptotext} />
        {typeof hotel.offer_tag_type === "string" && hotel.offer_tag_type.startsWith("http") && (
          <img
            className="absolute top-5 right-2 pointer-events-none -rotate-[30deg] w-auto h-auto max-h-[84px] object-contain"
            src={hotel.offer_tag_type}
            alt="tag"
          />
        )}
      </div>

      {/* Content */}
      <div className="px-5 py-4 flex flex-col justify-between w-full min-w-0 gap-3">
        <div>
            <div className="mb-1">
                <PmlStars rating={hotel.property_rating} />
            </div>
            <h3 className="text-[18px] md:text-[22px] font-semibold text-pml-primary leading-[1.2] mb-1 line-clamp-1" title={hotel.hotel_name || hotel.offer_header}>
                {hotel.hotel_name || hotel.offer_header}
            </h3>
            {hotel.location && (
                <div className="flex items-center gap-1.5 text-[#636363] text-[13px] sm:text-[14px] font-medium mb-3">
                    <MapPin className="w-3.5 h-3.5 text-[#B80662] flex-shrink-0" />
                    <span className="line-clamp-1">{hotel.location}</span>
                </div>
            )}
            <StayChips nights={nights} boardBasis={boardBasis} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1">
          {price > 0 ? (
            <PriceSection price={price} saveUpToText={hotel.saveuptotext} />
          ) : (
            <span className="text-[14px] text-[#999]">Price on request</span>
          )}
          <span
            style={{ background: "linear-gradient(90deg, #CB2187 0%, #FF5CBE 100%)" }}
            className="inline-flex items-center justify-center gap-2 rounded-full text-white text-[14px] sm:text-[15px] font-semibold px-5 py-2.5 whitespace-nowrap shadow-[0_4px_14px_rgba(203,33,135,0.3)] group-hover:opacity-90 transition-opacity flex-shrink-0"
          >
            View Deal
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </a>
  );
}

export function HotelCardSkeleton() {
  return (
    <div
      className="flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden animate-pulse font-['Montserrat']"
      style={{ boxShadow: "0px 0px 4px rgba(0,0,0,0.1), 0px 20px 40px rgba(0,0,0,0.05)" }}
    >
      <div className="w-full sm:w-[300px] lg:w-[360px] h-[200px] sm:h-auto bg-[#f0f0f0] flex-shrink-0 rounded-t-xl sm:rounded-t-none sm:rounded-l-xl" />
      <div className="flex-1 p-5 space-y-3">
        <div className="h-3 w-20 bg-[#eee] rounded-full" />
        <div className="h-5 w-3/4 bg-[#eee] rounded" />
        <div className="h-4 w-1/2 bg-[#eee] rounded" />
        <div className="flex gap-2 flex-wrap">
          <div className="h-8 w-20 bg-[#eee] rounded-full" />
          <div className="h-8 w-28 bg-[#eee] rounded-full" />
          <div className="h-8 w-32 bg-[#eee] rounded-full" />
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mt-2 pt-3 border-t border-gray-100">
          <div className="space-y-1.5">
            <div className="h-3 w-16 bg-[#eee] rounded" />
            <div className="h-8 w-28 bg-[#eee] rounded" />
          </div>
          <div className="h-10 w-28 bg-[#eee] rounded-full" />
        </div>
      </div>
    </div>
  );
}
