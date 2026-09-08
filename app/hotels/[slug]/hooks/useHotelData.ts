import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { HotelPageResponse, HotelDeal, DealsByDate, StaticPricingData } from "@/types/hotel";
import { processDealsByDate } from "@/lib/hotel-utils";

type PageSnapshot = {
  hotelData: HotelPageResponse;
  dealsByDate: DealsByDate;
  selectedDate: string;
  selectedDeal: HotelDeal | null;
  noDealsMessage: string;
  auto: boolean;
  staticPricing: StaticPricingData | null;
};

type DefaultSearchIds = {
  departure: string;
  boardBasis: string;
  duration: string;
} | null | undefined;

export type HotelDataSeed = {
  slug: string;
  initialHotelData: HotelPageResponse | null;
  initialLive: any;
};

const NO_DEALS_MESSAGE =
  "We couldn't find any offers that match your current search, but don't worry — our team is ready to help! Please call us or send an enquiry, and we'll create the perfect travel plan tailored just for you.";

type DerivedHotelPageState = {
  hotelData: HotelPageResponse;
  dealsByDate: DealsByDate;
  selectedDate: string;
  selectedDeal: HotelDeal | null;
  noDealsMessage: string;
  isAutoDeal: boolean;
  staticPricing: StaticPricingData | null;
  defaultSearchIds: DefaultSearchIds;
  initialSnapshot: PageSnapshot | null;
  // True only when no valid default deal was found AND the page was reached with
  // query params in the URL — mirrors today's "strip stale query and reload" quirk.
  shouldRedirectIfQueryPresent: boolean;
};

// Pure: derives all post-fetch state from a (content, live) pair without touching any
// setters. Shared by the seeded (server-provided) path and the unseeded (client-fetch)
// path so the three-mode branching logic exists in exactly one place.
function deriveHotelPageState(
  contentData: HotelPageResponse,
  liveJson: any
): DerivedHotelPageState {
  const liveApiData =
    liveJson?.api_data ??
    liveJson?.data?.api_data ??
    liveJson?.data?.data?.api_data ??
    liveJson;

  const isAutoDeal = liveJson?.auto !== false;

  const search = (liveApiData as any)?.api_deals?.Search;
  let defaultSearchIds: DefaultSearchIds;
  if (search) {
    const boardBasisRaw = Array.isArray(search.boardBasisId)
      ? search.boardBasisId[0]
      : search.boardBasisId;

    defaultSearchIds = {
      departure: String(search.departureId || ""),
      boardBasis: boardBasisRaw != null ? String(boardBasisRaw) : "",
      duration: String(search.durationMin || ""),
    };
  } else {
    defaultSearchIds = null;
  }

  if (!liveApiData) {
    return {
      hotelData: contentData,
      dealsByDate: {},
      selectedDate: "",
      selectedDeal: null,
      noDealsMessage: NO_DEALS_MESSAGE,
      isAutoDeal,
      staticPricing: null,
      defaultSearchIds: null,
      initialSnapshot: null,
      shouldRedirectIfQueryPresent: false,
    };
  }

  const mergedHotelData = { ...contentData, api_data: liveApiData } as HotelPageResponse;

  let defaultDeal = (liveApiData as any)?.default_deal as HotelDeal | null | undefined;
  const results = (liveApiData as any)?.api_deals?.Results as
    | HotelDeal[]
    | null
    | undefined;

  if (
    (!defaultDeal || !defaultDeal.hotel?.checkInDate) &&
    Array.isArray(results) &&
    results.length > 0
  ) {
    defaultDeal = results[0];
  }

  const staticData = liveJson?.auto === false ? (liveApiData as any)?.api_deals?.static : null;
  if (staticData) {
    return {
      hotelData: mergedHotelData,
      dealsByDate: {},
      selectedDate: "",
      selectedDeal: null,
      noDealsMessage: "",
      isAutoDeal,
      staticPricing: staticData,
      defaultSearchIds,
      initialSnapshot: null,
      shouldRedirectIfQueryPresent: false,
    };
  }

  if (!defaultDeal?.hotel?.checkInDate) {
    return {
      hotelData: mergedHotelData,
      dealsByDate: {},
      selectedDate: "",
      selectedDeal: null,
      noDealsMessage: NO_DEALS_MESSAGE,
      isAutoDeal,
      staticPricing: null,
      defaultSearchIds,
      initialSnapshot: null,
      shouldRedirectIfQueryPresent: true,
    };
  }

  const processed = processDealsByDate(
    defaultDeal,
    results,
    contentData.page.Tax_per_night,
    contentData.page.location
  );
  const initialDate = defaultDeal.hotel.checkInDate;

  return {
    hotelData: mergedHotelData,
    dealsByDate: processed,
    selectedDate: initialDate,
    selectedDeal: defaultDeal,
    noDealsMessage: "",
    isAutoDeal,
    staticPricing: null,
    defaultSearchIds,
    initialSnapshot: {
      hotelData: mergedHotelData,
      dealsByDate: processed,
      selectedDate: initialDate,
      selectedDeal: defaultDeal,
      noDealsMessage: "",
      auto: isAutoDeal,
      staticPricing: null,
    },
    shouldRedirectIfQueryPresent: false,
  };
}

export function useHotelData(seed?: HotelDataSeed) {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();

  // Computed once (first render only) — the server-provided seed, if any, is authoritative
  // and never re-derived on re-render.
  const seededState = useMemo(() => {
    if (!seed?.initialHotelData) return null;
    return deriveHotelPageState(seed.initialHotelData, seed.initialLive);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally computed once for the initial seed only
  }, []);

  const [hotelData, setHotelData] = useState<HotelPageResponse | null>(() =>
    seed ? seededState?.hotelData ?? null : null
  );
  const [contentLoading, setContentLoading] = useState(() => !seed);
  const [apiDataLoading, setApiDataLoading] = useState(() => !seed);
  const [dealsByDate, setDealsByDate] = useState<DealsByDate>(() =>
    seed ? seededState?.dealsByDate ?? {} : {}
  );
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    seed ? seededState?.selectedDate ?? "" : ""
  );
  const [selectedDeal, setSelectedDeal] = useState<HotelDeal | null>(() =>
    seed ? seededState?.selectedDeal ?? null : null
  );
  const [noDealsMessage, setNoDealsMessage] = useState<string>(() =>
    seed ? seededState?.noDealsMessage ?? "" : ""
  );
  const [isAutoDeal, setIsAutoDeal] = useState<boolean>(() =>
    seed ? seededState?.isAutoDeal ?? true : true
  );
  const [staticPricing, setStaticPricing] = useState<StaticPricingData | null>(() =>
    seed ? seededState?.staticPricing ?? null : null
  );
  const [defaultSearchIds, setDefaultSearchIds] = useState<DefaultSearchIds>(() =>
    seed ? seededState?.defaultSearchIds ?? null : undefined
  );

  const initialSnapshotRef = useRef<PageSnapshot | null>(
    seed ? seededState?.initialSnapshot ?? null : null
  );

  // One-time redirect for the seeded case: if the server-provided data had no valid
  // default deal and the page was reached with stale query params, strip them — mirrors
  // the equivalent check in the unseeded fetch path below.
  useEffect(() => {
    if (!seed) return;
    if (
      seededState?.shouldRedirectIfQueryPresent &&
      typeof window !== "undefined" &&
      window.location.search
    ) {
      window.location.replace(window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed/seededState are stable for this mount
  }, []);

  // Optimized: Parallel data fetching for better performance
  useEffect(() => {
    if (!slug) return;

    // Handle page reload with query params
    if (typeof window !== "undefined") {
      const hasQuery = Boolean(window.location.search);
      let isReload = false;

      try {
        const navEntry = performance.getEntriesByType("navigation")?.[0] as
          | PerformanceNavigationTiming
          | undefined;
        isReload = navEntry?.type === "reload";
      } catch {
        // ignore
      }

      if (hasQuery && isReload) {
        window.location.replace(window.location.pathname);
        return;
      }
    }

    // Server-seeded initial data (success or failure) is authoritative — nothing to fetch.
    if (seed) return;

    initialSnapshotRef.current = null;

    const fetchHotelData = async () => {
      try {
        setContentLoading(true);
        setApiDataLoading(true);
        setNoDealsMessage("");
        setDefaultSearchIds(undefined);
        setStaticPricing(null);
        const hotelSupplierId = searchParams.get("hotelSupplierId");
        const liveUrl = hotelSupplierId
          ? `/api/hotels-live/${slug}?hotelSupplierId=${hotelSupplierId}`
          : `/api/hotels-live/${slug}`;

        // OPTIMIZATION: Parallel fetch for faster loading
        const [contentRes, liveRes] = await Promise.all([
          fetch(`/api/hotels/${slug}`, {
            cache: 'no-store'
          }),
          fetch(liveUrl, {
            cache: 'no-store'
          })
        ]);

        if (!contentRes.ok) {
          console.error('Content fetch error:', {
            status: contentRes.status,
            statusText: contentRes.statusText,
            url: `/api/hotels/${slug}`
          });
          throw new Error(`Content fetch failed! status: ${contentRes.status}`);
        }

        const contentData: HotelPageResponse = await contentRes.json();
        setHotelData(contentData);
        setContentLoading(false);

        // Handle live data
        let liveJson: any = null;
        if (liveRes.ok) {
          try {
            liveJson = await liveRes.json();
          } catch {
            liveJson = null;
          }
        }

        const derived = deriveHotelPageState(contentData, liveJson);

        if (
          derived.shouldRedirectIfQueryPresent &&
          typeof window !== "undefined" &&
          window.location.search
        ) {
          window.location.replace(window.location.pathname);
          return;
        }

        setIsAutoDeal(derived.isAutoDeal);
        setDefaultSearchIds(derived.defaultSearchIds);
        setHotelData(derived.hotelData);
        setDealsByDate(derived.dealsByDate);
        setSelectedDate(derived.selectedDate);
        setSelectedDeal(derived.selectedDeal);
        setNoDealsMessage(derived.noDealsMessage);
        setStaticPricing(derived.staticPricing);

        if (!initialSnapshotRef.current && derived.initialSnapshot) {
          initialSnapshotRef.current = derived.initialSnapshot;
        }

        setApiDataLoading(false);
      } catch (error) {
        console.error("Error fetching hotel data:", error);
        setContentLoading(false);
        setApiDataLoading(false);
      }
    };

    fetchHotelData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed is stable for this mount (see key={slug} on the parent)
  }, [slug]);

  const handleDateSelection = useCallback(
    (date: string) => {
      const deal = dealsByDate[date];
      if (!deal) return;

      setSelectedDate(date);
      setSelectedDeal(deal.deal);
      setNoDealsMessage("");
    },
    [dealsByDate]
  );

  return {
    hotelData,
    contentLoading,
    apiDataLoading,
    dealsByDate,
    selectedDate,
    selectedDeal,
    noDealsMessage,
    handleDateSelection,
    setDealsByDate,
    setSelectedDate,
    setSelectedDeal,
    setNoDealsMessage,
    setHotelData,
    initialSnapshotRef,
    defaultSearchIds,
    // Derived conveniences from new offer-mode fields
    isOfferMode: hotelData?.page?.offer_mode ?? false,
    offerExpireDate: hotelData?.page?.expiredate ?? "",
    addons: hotelData?.page?.addons ?? [],
    isAutoDeal,
    setIsAutoDeal,
    staticPricing,
    setStaticPricing,
  };
}
