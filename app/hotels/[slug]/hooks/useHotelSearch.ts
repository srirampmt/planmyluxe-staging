import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { HotelPageResponse, HotelDeal, DealsByDate, StaticPricingData } from "@/types/hotel";
import { processDealsByDate } from "@/lib/hotel-utils";

type SearchFilters = {
  departure: string;
  boardBasis: string;
  duration: string;
};

type PageSnapshot = {
  hotelData: HotelPageResponse;
  dealsByDate: DealsByDate;
  selectedDate: string;
  selectedDeal: HotelDeal | null;
  noDealsMessage: string;
  auto: boolean;
  staticPricing: StaticPricingData | null;
};

const buildFilterKey = (filters: SearchFilters) =>
  `dep=${filters.departure || ""}|bb=${filters.boardBasis || ""}|dur=${filters.duration || ""}`;

export function useHotelSearch(
  hotelData: HotelPageResponse | null,
  setHotelData: React.Dispatch<React.SetStateAction<HotelPageResponse | null>>,
  setDealsByDate: React.Dispatch<React.SetStateAction<DealsByDate>>,
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>,
  setSelectedDeal: React.Dispatch<React.SetStateAction<HotelDeal | null>>,
  setNoDealsMessage: React.Dispatch<React.SetStateAction<string>>,
  initialSnapshotRef: React.MutableRefObject<PageSnapshot | null>,
  filterOptionsWithIds: any,
  currentFiltersRef: React.MutableRefObject<SearchFilters>,
  currentFiltersDisplayRef: React.MutableRefObject<SearchFilters>,
  isAutoDeal: boolean,
  setIsAutoDeal: React.Dispatch<React.SetStateAction<boolean>>,
  setStaticPricing: React.Dispatch<React.SetStateAction<StaticPricingData | null>>
) {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isSearching, setIsSearching] = useState(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightAbortRef = useRef<AbortController | null>(null);
  const lastRequestIdRef = useRef(0);
  const searchCacheRef = useRef<Map<string, PageSnapshot>>(new Map());
  const lastAppliedFilterKeyRef = useRef<string>("");
  const isAutoDealRef = useRef(isAutoDeal);
  isAutoDealRef.current = isAutoDeal;

  const restoreSnapshot = useCallback(
    (snapshot: PageSnapshot) => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (inFlightAbortRef.current) inFlightAbortRef.current.abort();
      setIsSearching(false);
      setHotelData(snapshot.hotelData);
      setDealsByDate(snapshot.dealsByDate);
      setSelectedDate(snapshot.selectedDate);
      setSelectedDeal(snapshot.selectedDeal);
      setNoDealsMessage(snapshot.noDealsMessage);
      setIsAutoDeal(snapshot.auto);
      setStaticPricing(snapshot.staticPricing);
    },
    [setHotelData, setDealsByDate, setSelectedDate, setSelectedDeal, setNoDealsMessage, setIsAutoDeal, setStaticPricing]
  );

  // OPTIMIZED: Dynamic search with request deduplication and caching
  const performDynamicSearch = useCallback(
    async (filters: SearchFilters, filterKey: string) => {
      const requestId = ++lastRequestIdRef.current;

      // Cancel previous request
      if (inFlightAbortRef.current) inFlightAbortRef.current.abort();
      const controller = new AbortController();
      inFlightAbortRef.current = controller;

      setIsSearching(true);
      setNoDealsMessage("");

      try {
        const response = await fetch(`/api/hotels-live/${slug}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            hotelKey: hotelData?.page.hotelKey,
            departure: filters.departure,
            boardBasis: filters.boardBasis,
            duration: filters.duration,
            adults: 2,
            children: 0,
            auto: isAutoDealRef.current,
          }),
        });

        const responseText = await response.text();
        let result: any = null;
        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch {
            console.error("Dynamic search returned non-JSON body");
            return;
          }
        }

        if (!response.ok) {
          console.error("Dynamic search request failed");
          const snapshot: PageSnapshot | null = hotelData
            ? {
                hotelData,
                dealsByDate: {},
                selectedDate: "",
                selectedDeal: null,
                noDealsMessage: "Search failed. Please try again.",
                auto: isAutoDealRef.current,
                staticPricing: null,
              }
            : null;
          if (snapshot) {
            searchCacheRef.current.set(filterKey, snapshot);
            restoreSnapshot(snapshot);
          } else {
            setNoDealsMessage("Search failed. Please try again.");
          }
          return;
        }

        // Ignore stale responses
        if (requestId !== lastRequestIdRef.current) return;

        const backendSuccess = result?.data?.success;
        if (backendSuccess === false) {
          const message =
            result?.data?.error ||
            "We couldn't find any offers that match your current search, but don't worry — our team is ready to help! Please call us or send an enquiry, and we'll create the perfect travel plan tailored just for you.";

          const snapshot: PageSnapshot | null = hotelData
            ? {
                hotelData,
                dealsByDate: {},
                selectedDate: "",
                selectedDeal: null,
                noDealsMessage: message,
                auto: isAutoDealRef.current,
                staticPricing: null,
              }
            : null;

          if (snapshot) {
            searchCacheRef.current.set(filterKey, snapshot);
            restoreSnapshot(snapshot);
          } else {
            setNoDealsMessage(message);
            setDealsByDate({});
            setSelectedDeal(null);
            setSelectedDate("");
          }
          return;
        }

        const apiData =
          result?.data?.api_data ?? result?.data?.data?.api_data ?? result?.api_data;

        const results =
          apiData?.api_deals?.Results ??
          result?.data?.api_deals?.Results ??
          result?.api_deals?.Results;

        const firstDeal = results?.[0];

        const staticData =
          isAutoDealRef.current === false ? apiData?.api_deals?.static : null;
        if (staticData && hotelData) {
          const staticSnapshot: PageSnapshot = {
            hotelData: { ...hotelData, api_data: apiData } as any,
            dealsByDate: {},
            selectedDate: "",
            selectedDeal: null,
            noDealsMessage: "",
            auto: result?.data?.auto !== false,
            staticPricing: staticData,
          };
          searchCacheRef.current.set(filterKey, staticSnapshot);
          restoreSnapshot(staticSnapshot);
          return;
        }

        if (!firstDeal?.hotel?.checkInDate) {
          const message =
            "We couldn't find any offers that match your current search, but don't worry — our team is ready to help! Please call us or send an enquiry, and we'll create the perfect travel plan tailored just for you.";
          const snapshot: PageSnapshot | null = hotelData
            ? {
                hotelData,
                dealsByDate: {},
                selectedDate: "",
                selectedDeal: null,
                noDealsMessage: message,
                auto: isAutoDealRef.current,
                staticPricing: null,
              }
            : null;

          if (snapshot) {
            searchCacheRef.current.set(filterKey, snapshot);
            restoreSnapshot(snapshot);
          } else {
            setNoDealsMessage(message);
            setDealsByDate({});
            setSelectedDeal(null);
            setSelectedDate("");
          }
          return;
        }

        const processed = processDealsByDate(
          firstDeal,
          results,
          hotelData?.page.Tax_per_night,
          hotelData?.page.location
        );

        const newSnapshot: PageSnapshot = {
          hotelData: { ...hotelData!, api_data: apiData } as any,
          dealsByDate: processed,
          selectedDate: firstDeal.hotel.checkInDate,
          selectedDeal: firstDeal,
          noDealsMessage: "",
          auto: result?.data?.auto !== false,
          staticPricing: null,
        };

        searchCacheRef.current.set(filterKey, newSnapshot);
        restoreSnapshot(newSnapshot);
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Search aborted");
          return;
        }
        console.error("Dynamic search error:", error);
        setNoDealsMessage("Search failed. Please try again.");
      } finally {
        setIsSearching(false);
      }
    },
    [slug, hotelData, restoreSnapshot, setNoDealsMessage, setDealsByDate, setSelectedDeal, setSelectedDate]
  );

  // Handle filter changes with URL updates
  const handleFilterChange = useCallback(
    async (filterType: "departure" | "boardBasis" | "duration", selectedId: string) => {
      const id = String(selectedId || "");

      const labelFromId = (kind: "departure" | "boardBasis" | "duration", nextId: string) => {
        if (!nextId) return "";
        if (kind === "departure") {
          return filterOptionsWithIds.airports.find((a: any) => String(a.id) === nextId)?.label || "";
        }
        if (kind === "boardBasis") {
          return filterOptionsWithIds.boardBases.find((b: any) => String(b.id) === nextId)?.label || "";
        }
        return filterOptionsWithIds.durations.find((d: any) => String(d.id) === nextId)?.label || "";
      };

      const nextLabel = labelFromId(filterType, id);
      currentFiltersDisplayRef.current = {
        ...currentFiltersDisplayRef.current,
        [filterType]: nextLabel,
      };

      const newFilters = {
        ...currentFiltersRef.current,
        [filterType]: id,
      };
      currentFiltersRef.current = newFilters;

      const nextParams = new URLSearchParams(searchParams.toString());
      if (newFilters.departure) nextParams.set("departure", newFilters.departure);
      else nextParams.delete("departure");
      if (newFilters.boardBasis) nextParams.set("boardBasis", newFilters.boardBasis);
      else nextParams.delete("boardBasis");
      if (newFilters.duration) nextParams.set("duration", newFilters.duration);
      else nextParams.delete("duration");

      const query = nextParams.toString();

      if (query === searchParams.toString()) return;

      setIsSearching(true);
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [slug, pathname, filterOptionsWithIds, router, searchParams, currentFiltersRef, currentFiltersDisplayRef, setIsSearching]
  );

  // URL-driven search effect
  useEffect(() => {
    if (!slug || !hotelData) return;

    const filtersFromUrl: SearchFilters = {
      departure: searchParams.get("departure") || "",
      boardBasis: searchParams.get("boardBasis") || "",
      duration: searchParams.get("duration") || "",
    };

    const hasAnyFilter =
      Boolean(filtersFromUrl.departure) ||
      Boolean(filtersFromUrl.boardBasis) ||
      Boolean(filtersFromUrl.duration);

    if (!hasAnyFilter) {
      if (lastAppliedFilterKeyRef.current !== "") {
        lastAppliedFilterKeyRef.current = "";
      }
      if (initialSnapshotRef.current) {
        restoreSnapshot(initialSnapshotRef.current);
      }
      return;
    }

    const filterKey = buildFilterKey(filtersFromUrl);
    if (filterKey === lastAppliedFilterKeyRef.current) return;

    // Check cache first
    const cached = searchCacheRef.current.get(filterKey);
    if (cached) {
      restoreSnapshot(cached);
      lastAppliedFilterKeyRef.current = filterKey;
      return;
    }

    lastAppliedFilterKeyRef.current = filterKey;

    // Debounce URL-driven searches (reduces rapid API calls when users change filters quickly)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      performDynamicSearch(filtersFromUrl, filterKey);
    }, 600);
  }, [slug, hotelData, searchParams, performDynamicSearch, restoreSnapshot, initialSnapshotRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (inFlightAbortRef.current) inFlightAbortRef.current.abort();
    };
  }, []);

  return {
    isSearching,
    handleFilterChange,
    performDynamicSearch,
  };
}
