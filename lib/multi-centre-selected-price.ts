// manual/legacy mode: a plain number. builder mode: an object with offerPrice/actualPrice/referenceId.
export type DayPriceValue = number | { actualPrice?: unknown; offerPrice?: unknown; referenceId?: unknown };

export type DefaultPricingItem = {
  slug?: string;
  defaultAirportId?: string | number | null;
  landingMonth?: string | number | null;
  localTax?: number | string | null;
  priceDataByAirport?: Record<string, Record<string, Record<string, DayPriceValue> | Record<number, DayPriceValue>>>;
  pricing_source_mode?: "manual" | "builder" | "static";
  static?: boolean;
  static_pricing_data?: { fromPrice?: string | number | null } | null;
};

export function parseStaticPrice(price: string): number | null {
  const cleaned = price.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

// Backend sends prices with or without "£" and with or without decimals — normalize to
// a rounded whole-number "£N". Non-numeric placeholders (e.g. "---") pass through untouched.
export function formatGbpPrice(price: string): string {
  const parsed = parseStaticPrice(price);
  return parsed == null ? price.trim() : `£${Math.round(parsed)}`;
}

function asFiniteNumber(value: unknown): number | null {
  const num = typeof value === "number" ? value : Number(String(value));
  return Number.isFinite(num) ? num : null;
}

// Resolves a day's price regardless of shape (manual: plain number, builder: object),
// and carries the builder-mode referenceId (used later for the enquiry's quote_reference).
export function parseDayPriceEntry(value: unknown): { price: number; referenceId?: string } | null {
  if (value && typeof value === "object") {
    const v = value as { offerPrice?: unknown; actualPrice?: unknown; referenceId?: unknown };
    const price = asFiniteNumber(v.offerPrice) ?? asFiniteNumber(v.actualPrice);
    if (price == null) return null;
    return { price, referenceId: typeof v.referenceId === "string" ? v.referenceId : undefined };
  }
  const price = asFiniteNumber(value);
  return price == null ? null : { price };
}

function parseMonthKeyParts(monthKey: string): { year: number; month: number } | null {
  const match = monthKey.match(/^(\d{4})(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return null;
  return { year, month };
}

function toMonthKey(year: number, month: number): string {
  return `${String(year).padStart(4, "0")}${String(month).padStart(2, "0")}`;
}

function startOfToday(input: Date): Date {
  return new Date(input.getFullYear(), input.getMonth(), input.getDate());
}

function addDays(input: Date, days: number): Date {
  const next = new Date(input);
  next.setDate(next.getDate() + days);
  return next;
}

function parseIsoDateLocal(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export type SelectedDealResolution = {
  date: string;
  totalPrice: number;
  basePrice: number;
  monthKey: string;
};

function pickCheapestFutureInMonth(
  monthDataAny: unknown,
  monthKey: string,
  localTax: number,
  today: Date
): SelectedDealResolution | null {
  const parts = parseMonthKeyParts(monthKey);
  if (!parts) return null;

  const year = parts.year;
  const month = parts.month;
  const entries = Object.entries((monthDataAny ?? {}) as Record<string, unknown>);
  if (entries.length === 0) return null;

  let best: SelectedDealResolution | null = null;
  for (const [dayRaw, priceRaw] of entries) {
    const day = Number(dayRaw);
    const basePrice = parseDayPriceEntry(priceRaw)?.price ?? null;
    if (!Number.isFinite(day) || basePrice === null) continue;

    const candidateDate = new Date(year, month - 1, day);
    if (
      candidateDate.getFullYear() !== year ||
      candidateDate.getMonth() !== month - 1 ||
      candidateDate.getDate() !== day
    ) {
      continue;
    }

    if (candidateDate.getTime() <= today.getTime()) continue;

    const totalPrice = basePrice + localTax;
    if (!best || totalPrice < best.totalPrice) {
      best = {
        date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        totalPrice,
        basePrice,
        monthKey,
      };
    }
  }

  return best;
}

function compareDealCandidate(a: SelectedDealResolution | null, b: SelectedDealResolution): SelectedDealResolution {
  if (!a) return b;
  if (b.totalPrice < a.totalPrice) return b;
  if (b.totalPrice === a.totalPrice && b.date < a.date) return b;
  return a;
}

function collectFutureDealCandidates(
  airportDataAny: unknown,
  localTax: number,
  today: Date,
): SelectedDealResolution[] {
  const airportData = (airportDataAny ?? {}) as Record<string, unknown>;
  const candidates: SelectedDealResolution[] = [];

  for (const [monthKey, monthDataAny] of Object.entries(airportData)) {
    const parts = parseMonthKeyParts(monthKey);
    if (!parts) continue;

    const entries = Object.entries((monthDataAny ?? {}) as Record<string, unknown>);
    for (const [dayRaw, priceRaw] of entries) {
      const day = Number(dayRaw);
      const basePrice = parseDayPriceEntry(priceRaw)?.price ?? null;
      if (!Number.isFinite(day) || basePrice === null) continue;

      const candidateDate = new Date(parts.year, parts.month - 1, day);
      if (
        candidateDate.getFullYear() !== parts.year ||
        candidateDate.getMonth() !== parts.month - 1 ||
        candidateDate.getDate() !== day
      ) {
        continue;
      }

      if (candidateDate.getTime() <= today.getTime()) continue;

      candidates.push({
        date: `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        totalPrice: basePrice + localTax,
        basePrice,
        monthKey,
      });
    }
  }

  candidates.sort((a, b) => a.date.localeCompare(b.date));
  return candidates;
}

function pickCheapestInFirstDaysFromEarliestAvailable(
  airportDataAny: unknown,
  dayCount: number,
  localTax: number,
  today: Date,
): SelectedDealResolution | null {
  if (!Number.isFinite(dayCount) || dayCount <= 0) return null;

  const candidates = collectFutureDealCandidates(airportDataAny, localTax, today);
  if (!candidates.length) return null;

  const earliestDate = parseIsoDateLocal(candidates[0].date);
  if (!earliestDate) return null;
  const inclusiveWindowEnd = addDays(earliestDate, dayCount - 1);

  let best: SelectedDealResolution | null = null;
  for (const candidate of candidates) {
    const candidateDate = parseIsoDateLocal(candidate.date);
    if (!candidateDate) continue;
    if (candidateDate.getTime() > inclusiveWindowEnd.getTime()) break;
    best = compareDealCandidate(best, candidate);
  }

  return best;
}

function pickCheapestFutureInWindow(
  airportDataAny: unknown,
  dayWindow: number,
  localTax: number,
  today: Date,
): SelectedDealResolution | null {
  const airportData = (airportDataAny ?? {}) as Record<string, unknown>;
  const windowEnd = addDays(today, dayWindow);
  let best: SelectedDealResolution | null = null;

  for (const [monthKey, monthDataAny] of Object.entries(airportData)) {
    const parts = parseMonthKeyParts(monthKey);
    if (!parts) continue;

    const entries = Object.entries((monthDataAny ?? {}) as Record<string, unknown>);
    for (const [dayRaw, priceRaw] of entries) {
      const day = Number(dayRaw);
      const basePrice = parseDayPriceEntry(priceRaw)?.price ?? null;
      if (!Number.isFinite(day) || basePrice === null) continue;

      const candidateDate = new Date(parts.year, parts.month - 1, day);
      if (
        candidateDate.getFullYear() !== parts.year ||
        candidateDate.getMonth() !== parts.month - 1 ||
        candidateDate.getDate() !== day
      ) {
        continue;
      }

      if (candidateDate.getTime() <= today.getTime()) continue;
      if (candidateDate.getTime() > windowEnd.getTime()) continue;

      const totalPrice = basePrice + localTax;
      const candidate: SelectedDealResolution = {
        date: `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        totalPrice,
        basePrice,
        monthKey,
      };

      if (
        !best ||
        candidate.totalPrice < best.totalPrice ||
        (candidate.totalPrice === best.totalPrice && candidate.date < best.date)
      ) {
        best = candidate;
      }
    }
  }

  return best;
}

export function resolveSelectedDeal(item: DefaultPricingItem, now: Date = new Date()): SelectedDealResolution | null {
  const priceDataByAirport = item.priceDataByAirport ?? {};
  const airportKeys = Object.keys(priceDataByAirport);
  if (airportKeys.length === 0) return null;

  const airportId = airportKeys[0];
  const airportData = priceDataByAirport[airportId] ?? {};
  const localTax = asFiniteNumber(item.localTax ?? 0) ?? 0;
  const today = startOfToday(now);

  // Priority 1: landingMonth (YYYYMM) cheapest future date if month is valid and not in the past.
  const landingMonthRaw = String(item.landingMonth ?? "").trim();
  const landingMonthParts = parseMonthKeyParts(landingMonthRaw);
  if (landingMonthParts) {
    const currentMonthKey = toMonthKey(today.getFullYear(), today.getMonth() + 1);
    if (landingMonthRaw >= currentMonthKey) {
      const selectedFromLandingMonth = pickCheapestFutureInMonth(
        (airportData as any)[landingMonthRaw],
        landingMonthRaw,
        localTax,
        today
      );
      if (selectedFromLandingMonth) {
        return selectedFromLandingMonth;
      }
    }
  }

  // Fallback: first 30 days from earliest available future priced date.
  const fallbackFromEarliestWindow = pickCheapestInFirstDaysFromEarliestAvailable(
    airportData,
    30,
    localTax,
    today
  );
  if (fallbackFromEarliestWindow) {
    return fallbackFromEarliestWindow;
  }

  return pickCheapestFutureInWindow(airportData, 30, localTax, today);
}

function isStaticPricingItem(item: DefaultPricingItem): boolean {
  return item.pricing_source_mode === "static" || item.static === true;
}

export function computeSelectedCardPrice(item: DefaultPricingItem): number | null {
  if (isStaticPricingItem(item)) {
    const raw = item.static_pricing_data?.fromPrice;
    if (raw == null) return null;
    const parsed = parseStaticPrice(String(raw));
    return parsed == null ? null : Math.round(parsed);
  }

  const resolved = resolveSelectedDeal(item);
  if (!resolved) return null;
  return Math.round(resolved.totalPrice);
}
