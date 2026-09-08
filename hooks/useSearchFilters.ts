"use client";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { resolveAirportIdToIata } from "@/lib/mappings/airports";
import { decodeDestinationParam, type DestinationSelection } from "@/lib/mappings/destinations";

export const SEARCH_PREFILL_KEY = "searchPrefill";
export const LAST_SEARCH_KEY = "lastSearch";

export type SearchFilters = {
  q: string;
  destinations: DestinationSelection[];
  holiday_types: string[];
  rating: string[];
  price_min: number | null;
  price_max: number | null;
  sort: string;
  date: string | null;
  date_max: string | null;
  nights: string | null;
  departure_airports: string[];
  outbound_flight_time: string[];
  inbound_flight_time: string[];
  board_basis: string[];
  resorts: string[];
  special_offers_only: boolean;
};

const DEFAULT_FILTERS: SearchFilters = {
  q: "",
  destinations: [],
  holiday_types: [],
  rating: [],
  price_min: null,
  price_max: null,
  sort: "best",
  date: null,
  date_max: null,
  nights: null,
  departure_airports: [],
  outbound_flight_time: [],
  inbound_flight_time: [],
  board_basis: [],
  resorts: [],
  special_offers_only: false,
};

function seedFromUrl(searchParams: URLSearchParams): SearchFilters {
  const destination = decodeDestinationParam(searchParams.get("did"));
  const type = searchParams.get("type") || "";
  const sort = searchParams.get("s") || searchParams.get("sort") || "best";
  const q = searchParams.get("q") || "";
  const date = searchParams.get("dt") || searchParams.get("date") || "";
  const dateMax = searchParams.get("dtmax") || searchParams.get("date_max") || "";
  const nights = searchParams.get("n") || searchParams.get("nights") || "";
  const departurePoints = searchParams.get("dp") || searchParams.get("dep") || searchParams.get("departure") || searchParams.get("departurePoints") || "";
  const outbound = searchParams.get("outbound") || "";
  const inbound = searchParams.get("inbound") || "";
  const board_basis = searchParams.get("board_basis") || "";
  const resorts = searchParams.get("resorts") || "";
  const rating = searchParams.get("rating") || "";

  const parsedAirports = departurePoints
    ? departurePoints.split(",").map(resolveAirportIdToIata).filter(Boolean) as string[]
    : [];

  return {
    ...DEFAULT_FILTERS,
    q,
    destinations: destination ? [destination] : [],
    holiday_types: type ? type.split(",") : [],
    sort,
    date: date || null,
    date_max: dateMax || null,
    nights: nights || null,
    departure_airports: parsedAirports,
    outbound_flight_time: outbound ? outbound.split(",") : [],
    inbound_flight_time: inbound ? inbound.split(",") : [],
    board_basis: board_basis ? board_basis.split(",") : [],
    resorts: resorts ? resorts.split(",") : [],
    rating: rating ? rating.split(",") : [],
  };
}

function seedFromStorage(): Partial<SearchFilters> {
  try {
    const raw = sessionStorage.getItem(SEARCH_PREFILL_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const destination = decodeDestinationParam(parsed.dest);
    return {
      q: parsed.q || "",
      destinations: destination ? [destination] : [],
      holiday_types: parsed.type ? [parsed.type] : [],
      date: parsed.date || null,
      date_max: parsed.date_max || null,
      nights: parsed.nights || null,
      departure_airports: parsed.airports || [],
      outbound_flight_time: [],
      inbound_flight_time: [],
      board_basis: [],
      resorts: [],
    };
  } catch {
    return {};
  }
}

// Every URL param seedFromUrl() knows how to read — checked by both the
// initial useState() below and the sync effect that follows it. Previously
// these were two separately hand-maintained lists that had already drifted
// ("board_basis"/"resorts" were in the effect's list but not the initial
// one — Phase 4 review finding): a bookmarked/shared link containing only
// `?resorts=...` or `?board_basis=...` with no `did` alongside it seeded
// from sessionStorage on first render, then got silently corrected to the
// URL's values a tick later — a flash of wrong filters plus a redundant
// extra state update on mount. One shared list can't drift.
//
// "did" (destination id + level, e.g. "842:resort") replaced the old "d"/
// "dest" slug params as part of the destination-dropdown redesign — an old
// bookmarked `?d=<slug>`/`?dest=<slug>` link simply won't seed a
// destination anymore (falls through to the existing "select a
// destination" validation state), by design.
const URL_PARAM_KEYS = [
  "did", "type", "q",
  "dp", "dep", "departure", "departurePoints",
  "dt", "date",
  "dtmax", "date_max",
  "n", "nights",
  "outbound", "inbound",
  "board_basis", "resorts",
  "rating",
] as const;

function hasUrlParams(searchParams: ReturnType<typeof useSearchParams>): boolean {
  return URL_PARAM_KEYS.some((key) => searchParams.has(key));
}

export function useSearchFilters() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<SearchFilters>(() => {
    const fromUrl = seedFromUrl(searchParams);
    if (hasUrlParams(searchParams)) return fromUrl;
    const fromStorage = seedFromStorage();
    return { ...DEFAULT_FILTERS, ...fromStorage };
  });

  // Sync when URL search params change (e.g. browser back/forward)
  useEffect(() => {
    if (hasUrlParams(searchParams)) {
      setFilters(seedFromUrl(searchParams));
    }
  }, [searchParams]);

  const updateFilters = useCallback((next: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  // Resets only the *refinement* fields the filter bar actually controls —
  // not the base search identity (destinations/date/nights/departure_airports),
  // sort, or the top search bar's free-text `q`. Previously this reset to
  // DEFAULT_FILTERS wholesale, which wiped the destination/dates/airports
  // too — "Clear all" in the filter sidebar was silently discarding the
  // search itself, not just the filters layered on top of it.
  const clearAll = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      holiday_types: [],
      rating: [],
      price_min: null,
      price_max: null,
      outbound_flight_time: [],
      inbound_flight_time: [],
      board_basis: [],
      resorts: [],
      special_offers_only: false,
    }));
  }, []);

  const removeFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => {
      if (
        key === "holiday_types" ||
        key === "rating" ||
        key === "outbound_flight_time" ||
        key === "inbound_flight_time" ||
        key === "board_basis" ||
        key === "resorts"
      ) {
        return { ...prev, [key]: (prev[key] as string[]).filter((v) => v !== value) };
      }
      if (key === "price") {
        return { ...prev, price_min: null, price_max: null };
      }
      if (key === "q") {
        return { ...prev, q: "" };
      }
      return prev;
    });
  }, []);

  return { filters, updateFilters, clearAll, removeFilter };
}
