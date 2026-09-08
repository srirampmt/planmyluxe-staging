import { HotelDeal, DealsByDate, ProcessedDeal } from "@/types/hotel";
import { getAirportName, getAirportNameWithCode } from "@/lib/mappings/airports";
import { getAirlineName, getAirlineNameWithCode } from "@/lib/mappings/airlines";
import { getBoardBasisName, getBoardBasisWithDescription } from "@/lib/mappings/board-basis";
import { formatDuration, formatDurationWithDays } from "@/lib/mappings/duration";

const toNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Process API deals and group by check-in date
 * Shows only the cheapest deal per date
 */
export function processDealsByDate(
  defaultDeal: HotelDeal | null | undefined,
  apiDeals: HotelDeal[] | null | undefined,
  taxPerNight?: number,
  location?: string
): DealsByDate {
  const result: DealsByDate = {};

  if (!defaultDeal?.hotel?.checkInDate) {
    return result;
  }

  // Add default deal
  const defaultDate = defaultDeal.hotel.checkInDate;
  const defaultPrice = Math.round(getEffectivePrice(defaultDeal));
  const defaultTax = Math.round(calculateTotalTax(defaultDeal, taxPerNight, location));
  const defaultTotalPrice = defaultPrice + defaultTax;

  result[defaultDate] = {
    price: defaultTotalPrice,
    deal: defaultDeal,
    isDefault: true,
    hasCustomPrice: Boolean(defaultDeal.customPricing?.hasCustomPrice),
  };

  // Process all API deals - keep only cheapest per date
  const deals = Array.isArray(apiDeals) ? apiDeals : [];

  deals.forEach((deal) => {
    if (!deal?.hotel?.checkInDate) return;

    const date = deal.hotel.checkInDate;
    const effectivePrice = Math.round(getEffectivePrice(deal));
    const totalTax = Math.round(calculateTotalTax(deal, taxPerNight, location));
    const totalPrice = effectivePrice + totalTax;

    if (!result[date] || totalPrice < result[date].price) {
      result[date] = {
        price: totalPrice,
        deal: deal,
        isDefault: false,
        hasCustomPrice: Boolean(deal.customPricing?.hasCustomPrice),
      };
    }
  });

  return result;
}

/**
 * Get the effective price to display
 * Priority: custom price > total price
 */
export function getEffectivePrice(deal: HotelDeal): number {
  let price: number;
  if (
    deal.customPricing?.hasCustomPrice &&
    deal.customPricing.customPrice !== null
  ) {
    price = toNumber(deal.customPricing.customPrice);
  } else {
    price = toNumber(deal.totalPrice);
  }
  if (deal.customPricing?.hidden_price_sum) {
    price += toNumber(deal.customPricing.hidden_price_sum);
  }
  return price;
}

/**
 * Calculate total tax per person for the entire stay.
 * Uses the live API's touristTax.amount (per room) when present — divides by adults
 * for the per-person figure. Falls back to Tax_per_night from page content.
 */
export function calculateTotalTax(
  deal: HotelDeal,
  taxPerNight?: number,
  location?: string
): number {
  // Live API provides accurate per-deal tax; use it when available
  if (deal.touristTax?.amount != null && deal.touristTax.amount > 0) {
    const totalAdults =
      deal.hotel.rooms?.reduce((sum, r) => sum + (r.adults || 0), 0) || 2;
    return deal.touristTax.amount / totalAdults;
  }

  // Fallback: page-content Tax_per_night logic
  const locationLower = typeof location === "string" ? location.toLowerCase() : "";
  const isGreece = locationLower.includes("greece") || locationLower.includes("iceland");
  const normalizedTax = toNumber(taxPerNight);
  const duration = toNumber(deal.hotel?.duration ?? deal.hotel?.nights);

  if (!normalizedTax) {
    return 0;
  }

  if (isGreece) {
    return normalizedTax;
  }

  if (!duration) {
    return 0;
  }

  return normalizedTax * duration;
}

/**
 * Format date to display format
 * @param dateString ISO date string "2026-01-16"
 * @returns "16 Jan 2026"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return date.toLocaleDateString("en-GB", options).replace(/,/g, "");
}

/**
 * Format date and time from ISO DateTime
 * @param dateTimeString ISO DateTime "2026-01-16T18:15:00"
 * @returns { date: "Thu, 16 Jan", time: "18:15" }
 */
export function formatDateTime(dateTimeString: string): {
  date: string;
  time: string;
} {
  const dt = new Date(dateTimeString);

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "short",
  };
  const date = dt.toLocaleDateString("en-GB", dateOptions).replace(/,/g, "");

  const time = dt.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return { date, time };
}

/**
 * Calculate trip duration text
 * @param startDate ISO date string
 * @param nights Number of nights
 * @returns "16 Jan - 23 Jan (7 nights)"
 */
export function getTripSummary(startDate: string, nights: number): string {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(start);
  end.setDate(start.getDate() + nights);

  const startText = formatDate(startDate);
  const endText = formatDate(end.toISOString().split("T")[0]);

  return `${startText} - ${endText} (${nights} nights)`;
}

/**
 * Format price for display
 * @param price Number
 * @returns "£299" or "£1,299"
 */
export function formatPrice(price: number): string {
  return `£${Math.round(price).toLocaleString("en-GB")}`;
}



/**
 * Calculate price per person
 * @param totalPrice Total price for 2 people
 * @returns Formatted price per person
 */
export function getPricePerPerson(totalPrice: number): string {
  const perPerson = totalPrice;
  return formatPrice(perPerson);
}

export type SaveStrikePricing = {
  saveValue: number | null;
  saveBadgeText: string;
  strikePriceValue: number | null;
  hasValidSave: boolean;
  hasStrikePrice: boolean;
};

/**
 * Parse save text and derive strike price from base price.
 * Formula: strike * (1 - save%) = base
 */
export function calculateSaveStrikePricing(
  basePrice: number | null | undefined,
  saveText?: string
): SaveStrikePricing {
  const roundedBasePrice =
    typeof basePrice === "number" && Number.isFinite(basePrice)
      ? Math.round(basePrice)
      : null;

  const rawSaveText = (saveText || "").trim();
  const saveMatch = rawSaveText.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  const parsedSaveValue = saveMatch ? Number.parseFloat(saveMatch[0]) : Number.NaN;

  const hasValidSave =
    roundedBasePrice != null &&
    Number.isFinite(parsedSaveValue) &&
    parsedSaveValue > 0 &&
    parsedSaveValue < 100;

  if (!hasValidSave || roundedBasePrice == null) {
    return {
      saveValue: null,
      saveBadgeText: "",
      strikePriceValue: null,
      hasValidSave: false,
      hasStrikePrice: false,
    };
  }

  const strikePriceValue = Math.round(
    roundedBasePrice / (1 - parsedSaveValue / 100)
  );
  const hasStrikePrice = strikePriceValue > roundedBasePrice;
  const saveBadgeText =
    parsedSaveValue % 1 === 0
      ? parsedSaveValue.toFixed(0)
      : parsedSaveValue.toString();

  return {
    saveValue: parsedSaveValue,
    saveBadgeText,
    strikePriceValue,
    hasValidSave: true,
    hasStrikePrice,
  };
}

/**
 * Check if a date is in the past (including today)
 * @param dateString ISO date string "2026-01-16"
 * @returns boolean
 */
export function isPastDate(dateString: string): boolean {
  const date = new Date(dateString + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
}

/**
 * Resolve a backend-traceable label for a deal: the real quote reference for
 * API deals, or a synthetic marker ("STATIC-DEAL" / "MANUAL-CALENDAR") for the
 * non-API modes, where quoteReference is otherwise empty.
 */
export function getDealTraceLine(
  quoteReference: string | undefined,
  isAutoDeal: boolean,
  staticPricing: unknown | null | undefined
): string | undefined {
  return quoteReference || (isAutoDeal ? undefined : staticPricing ? "STATIC-DEAL" : "MANUAL-CALENDAR");
}

/**
 * Same as getDealTraceLine, but with shorter markers ("SD" / "MCAL") sized for
 * the WhatsApp message context line.
 */
export function getWhatsAppDealTraceLine(
  quoteReference: string | undefined,
  isAutoDeal: boolean,
  staticPricing: unknown | null | undefined
): string | undefined {
  return quoteReference || (isAutoDeal ? undefined : staticPricing ? "SD" : "MCAL");
}

/**
 * Get board basis full text
 * @param code "AI", "HB", "FB", "BB", "SC", "RO"
 * @returns Full text (uses centralized mapping)
 */
export function getBoardBasisText(code: string): string {
  return getBoardBasisName(code);
}

/**
 * Format airport display
 * @param code Airport code (IATA or numeric)
 * @returns Full airport name
 */
export function formatAirport(code: string | number): string {
  return getAirportName(code);
}

/**
 * Format airline display
 * @param code Airline IATA code
 * @returns Full airline name
 */
export function formatAirline(code: string): string {
  return getAirlineName(code);
}

/**
 * Format duration display
 * @param nights Number of nights
 * @returns "7 Nights" or "1 Night"
 */
export function formatNights(nights: number | string): string {
  return formatDuration(nights);
}

/**
 * Navigate calendar to a specific date's month
 * @param date ISO date string
 * @returns { year: number, month: number }
 */
export function getMonthFromDate(date: string): { year: number; month: number } {
  const d = new Date(date + "T00:00:00");
  return {
    year: d.getFullYear(),
    month: d.getMonth(), // 0-indexed
  };
}

/**
 * Get lowest price from deals by date
 * @param dealsByDate Processed deals object
 * @returns { price: number, date: string }
 */
export function getLowestPrice(dealsByDate: DealsByDate): {
  price: number;
  date: string;
} | null {
  const entries = Object.entries(dealsByDate);
  if (entries.length === 0) return null;

  let lowest = { price: Infinity, date: "" };

  entries.forEach(([date, processed]) => {
    if (processed.price < lowest.price) {
      lowest = { price: processed.price, date };
    }
  });

  return lowest.price === Infinity ? null : lowest;
}

/**
 * Serialize deal data for enquiry form
 * @param deal HotelDeal object
 * @returns JSON string
 */
export function serializeDealData(deal: HotelDeal, hotelNameFallback?: string): string {
  return JSON.stringify({
    quoteReference: deal.quoteReference,
    hotelName: deal.hotel.hotelName ?? hotelNameFallback,
    checkInDate: deal.hotel.checkInDate,
    duration: deal.hotel.duration ?? deal.hotel.nights,
    boardBasis: deal.hotel.boardBasis,
    totalPrice: deal.totalPrice,
    departureAirport: deal.flight?.departureAirportCode ?? deal.hotel?.fromAirport,
    outboundFlight: deal.flight?.outboundFlightNumber,
    inboundFlight: deal.flight?.inboundFlightNumber,
  });
}

/**
 * Extract filter options from custom search data
 * @param deal HotelDeal with custom_search_data
 * @returns Filter options object
 */
export function extractFilterOptions(deal: HotelDeal) {
  const customData = deal.customPricing?.custom_search_data;

  return {
    departureAirports: customData?.departure_airports || [],
    boardBasis: customData?.board_basis_multiple || [],
    durations: customData?.duration || [],
  };
}

/**
 * Convert API filter options to display-friendly arrays with proper names
 * @param deal HotelDeal with custom_search_data
 * @returns Arrays ready for dropdown display
 */
export function prepareFilterOptionsForDisplay(deal: HotelDeal) {
  const customData = deal.customPricing?.custom_search_data;

  // Convert airports: [{id, name}] -> display names array
  const airports = (customData?.departure_airports || []).map((airport: any) => {
    return String(airport?.text || "").trim() || formatAirport(airport?.id);
  });

  // Convert board basis: [{id, name}] -> display names array  
  const boardBases = (customData?.board_basis_multiple || []).map((basis: any) => {
    return getBoardBasisName(basis.code);
  });

  // Convert durations: ["2", "3", "7"] -> "2 Nights", "3 Nights", "7 Nights"
  const durations = (customData?.duration || []).map((d: string) => {
    return formatDuration(d);
  });

  return {
    airports,
    boardBases,
    durations,
  };
}

/**
 * Prepare filter options with both IDs and display names for dropdown mapping
 * @param deal HotelDeal with custom_search_data
 * @returns Object with arrays of {id, label} pairs
 */
export function prepareFilterOptionsWithIds(deal: HotelDeal) {
  const customData = deal.customPricing?.custom_search_data;

  // Airports with IDs and display names
  const airports = (customData?.departure_airports || []).map((airport: any) => ({
    id: String(airport?.id ?? ""),
    label: String(airport?.text || "").trim() || formatAirport(String(airport?.id ?? "")),
  }));

  // Board basis with IDs and display names
  const boardBases = (customData?.board_basis_multiple || []).map((basis: any) => ({
    id: basis.id,
    label: getBoardBasisName(basis.code),
  }));

  // Durations with IDs and display names
  const durations = (customData?.duration || []).map((d: string) => ({
    id: d,
    label: formatDuration(d),
  }));

  return {
    airports,
    boardBases,
    durations,
  };
}
