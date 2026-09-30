"use client";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { decodeDestinationParam } from "@/lib/mappings/destinations";
import { DEFAULT_FILTERS, hasUrlParams, seedFromUrl, type SearchFilters } from "@/lib/searchFilters";

export type { SearchFilters };

export const SEARCH_PREFILL_KEY = "searchPrefill";
export const LAST_SEARCH_KEY = "lastSearch";

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
      regions: [],
      resorts: [],
    };
  } catch {
    return {};
  }
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
      regions: [],
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
        key === "regions" ||
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
