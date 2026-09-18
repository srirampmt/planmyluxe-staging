"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SearchFilters } from "./useSearchFilters";
import {
  getRequestHeaders,
  getSearchCache,
  setSearchCache,
  removeSearchCache,
  saveSearchHistory,
  trackEvent,
  saveFilterOptions,
  getFilterOptions,
} from "@/lib/storage";
import { createSearchIdempotencyKey } from "@/lib/clientIdempotency";
import { getBoardBasisCode } from "@/lib/mappings/board-basis";

export type HotelResult = {
  id: string | number;
  type: string;
  slug: string;
  hotelName: string;
  hotel_name: string;
  resortName: string;
  location: string;
  rating: number;
  property_rating: number;
  boardBasis: string;
  totalPrice: number;
  starting_price: number;
  price_pp: number;
  card_image: string;
  top_facilities?: string;
  hotel_holidaystyles?: string;
  departureAirportCode?: string;
  checkInDate?: string;
  duration?: number;
  [key: string]: any;
};

export type FilterOptions = {
  destinations?: string[];
  holiday_types?: any[];
  ratings?: any[];
  resorts?: any[];
  facilities?: any[];
  board_basis?: any[];
  price_min?: number;
  price_max?: number;
  outbound_flight_times?: Record<string, number>;
  inbound_flight_times?: Record<string, number>;
};

type BackendSearchResponse = {
  success: boolean;
  search_id: string;
  results: HotelResult[];
  next_cursor: string | null;
  facets: FilterOptions;
  total_count: number;
  // Total hotels matching the base search (destination/dates/airports/
  // nights) only, ignoring rating/board_basis/resorts/holiday_types/price/
  // flight-time filters -- unlike total_count, this stays the same across
  // every filter combination within the same search.
  base_total_count: number;
  expires_at: string;
  destination_unavailable?: boolean;
};

type BackendPageResponse = {
  success: boolean;
  results: HotelResult[];
  next_cursor: string | null;
};

export type UseSearchOptions = {
  // True while a caller-managed initial fetch (e.g. page.tsx resolving
  // ?searchId=... server-side) is still in flight for the CURRENT filters.
  // Prevents this hook from racing it with a duplicate POST.
  waitForExternalData?: boolean;
  // True once that caller-managed initial fetch has resolved successfully
  // for the current filters. Consumed once per distinct search criteria —
  // a later filter change always triggers a real fetch regardless of this
  // flag's value, since it's a signal about the search this page loaded
  // with, not a general "never fetch" switch.
  externalDataReady?: boolean;
  // True while the caller is showing an explicit "your search has expired"
  // message instead of results (see page.tsx's searchExpired state). While
  // this is true, this hook must NOT silently fetch on its own — the whole
  // point of the expired screen is that the user makes the call to refresh,
  // not that the page quietly swaps in new results underneath them. The
  // caller flips this back to false when the user clicks "Refresh search",
  // which lets the normal fetch logic below run.
  blockAutoFetch?: boolean;
  // The payload page.tsx's own hydration fetch already retrieved for
  // ?searchId=... (GET /client/api/v1/searches/{id}, same shape as the
  // POST response). Consumed exactly once, the same moment externalDataReady
  // is consumed for a given fetchKey — this hook previously just marked that
  // fetch "done" without ever copying its results into its own state, which
  // left searchId/cursor/allHotels/total/options permanently empty on any
  // page load that resolves a link instead of running its own POST (masked
  // on the originating browser only because getSearchCache(fetchKey) already
  // had a matching entry from the live search that produced the link).
  initialData?: {
    search_id: string;
    results: HotelResult[];
    next_cursor: string | null;
    total_count?: number;
    base_total_count?: number;
    facets?: FilterOptions | null;
    destination_unavailable?: boolean;
    expires_at?: string;
    // The filters page.tsx's hydration fetch actually ran with, snapshotted
    // at the moment it fired (see page.tsx). Compared against this hook's
    // OWN current fetchKey (via computeFetchKey below) before consuming —
    // see that use site for why: page.tsx's hydration effect intentionally
    // runs once per searchId and never updates hydrationCriteria if the
    // user changes a filter while the fetch is still in flight, so without
    // this check a fast filter change could get seeded with the WRONG
    // (earlier) search's data under the NEW fetchKey (Phase 4 review
    // finding — the hydration race).
    hydrated_for_filters?: Partial<SearchFilters> | null;
    // The full filter set AFTER merging in the base criteria resolved from
    // the DB (destinations/date/nights/departure_airports) for a bare
    // ?searchId= link — see page.tsx's resolvedFilters and its
    // updateFilters() call. Used only to key the sessionStorage cache
    // write above so it lands in the same slot the hook's own effect will
    // look up under once debouncedFilters catches up to that sync; absent
    // for every other caller.
    resolved_filters?: Partial<SearchFilters> | null;
  } | null;
};

// Canonical search criteria key — shared by the main fetchKey below and by
// the hydration-race check above, so both always agree on what "the same
// search" means. Pass either the live `filters` state or a snapshot of it
// (e.g. initialData.hydrated_for_filters).
function computeFetchKey(f: Partial<SearchFilters> | null | undefined): string {
  return JSON.stringify({
    destinations: f?.destinations || [],
    holiday_types: f?.holiday_types || [],
    date: f?.date || "",
    date_max: f?.date_max || "",
    nights: f?.nights || "7",
    departure_airports: f?.departure_airports || [],
    board_basis: f?.board_basis || [],
    ratings: f?.rating || [],
    resorts: f?.resorts || [],
    price_min: f?.price_min,
    price_max: f?.price_max,
    outbound_flight_time: f?.outbound_flight_time || [],
    inbound_flight_time: f?.inbound_flight_time || [],
    sort: f?.sort || "price_asc",
  });
}

export function useSearch(filters: SearchFilters, opts?: UseSearchOptions) {
  const [searchId, setSearchId] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [allHotels, setAllHotels] = useState<HotelResult[]>([]);
  const [total, setTotal] = useState(0);
  const [baseTotalCount, setBaseTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [options, setOptions] = useState<FilterOptions | null>(null);
  const [destinationUnavailable, setDestinationUnavailable] = useState(false);
  // Seconds to wait before the client should be allowed to search again —
  // set when the backend returns 429. Cleared on the next successful fetch.
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState<number | null>(null);

  // Bumped to force the main effect to re-run for the SAME fetchKey — used
  // when loadMore discovers the search session expired mid-scroll (404/410)
  // and needs a fresh create-search call rather than silently dying.
  const [refetchNonce, setRefetchNonce] = useState(0);

  // One-shot gate for consuming opts.initialData — see the detailed
  // comment at its use site below for why this must NOT be keyed by
  // fetchKey (that was the P0 regression: it let stale initialData get
  // replayed on every later filter change instead of firing a real fetch).
  const externalDataConsumedRef = useRef(false);

  // Load cached options on mount to avoid SSR hydration mismatch
  useEffect(() => {
    const cached = getFilterOptions();
    if (cached) {
      setOptions(cached);
    }
  }, []);

  // Compute canonical search criteria key (re-trigger search only when filters change)
  const fetchKey = computeFetchKey(filters);

  useEffect(() => {
    // The caller is showing the "your search has expired" screen and is
    // waiting on the user to press "Refresh search" — stay parked and don't
    // fetch anything until that happens (blockAutoFetch flips to false).
    if (opts?.blockAutoFetch) {
      setLoading(false);
      return;
    }

    // A server-fetched initial page (page.tsx resolving ?searchId=...) is
    // still in flight for these exact filters — don't race it with our own
    // POST. Once it resolves (success or failure) this effect re-runs.
    //
    // THIS MUST COME BEFORE the hasDestination/hasDate guard below.
    // BUG THIS FIXES: a bare `?searchId=X` link — the exact shape a shared/
    // campaign link is meant to be, with the destination/date intentionally
    // left OUT of the URL because they live in the DB row the id resolves
    // to — seeds `filters.destinations`/`filters.date` as empty, because
    // there's nothing in the URL for useSearchFilters to read. With the
    // hasDestination/hasDate check running FIRST (the previous order),
    // every single run of this effect hit that guard and returned before
    // ever reaching this block — on the initial render, on the render
    // where the hydration fetch starts, AND on the render where it
    // finishes — so `waitForExternalData`/`externalDataReady` were
    // effectively dead code for this exact link shape. The hydration fetch
    // in page.tsx still ran and still resolved correctly, but this hook's
    // own state (allHotels/total/searchId/cursor) never got seeded from
    // it, and page.tsx's `firstMounted` fallback (which shows
    // `initialData` directly until this hook's state takes over) flips off
    // as soon as `initialData` arrives regardless — so results appeared to
    // just vanish. Checking hydration state first means a bare searchId
    // link is handled purely by "is external data in flight / ready?",
    // never by "does the user have a destination/date typed in?" — which
    // is the right question for a link where the criteria were never
    // supposed to be in the URL at all.
    if (opts?.waitForExternalData) {
      setLoading(true);
      return;
    }

    const hasDestination = (filters.destinations || []).length > 0;
    const hasDate = Boolean(filters.date);
    // Only bail out for "not enough to search yet" once we know this ISN'T
    // a hydration flow currently in flight (checked above) — a completed
    // hydration is handled by the externalDataReady branch immediately
    // below, which must run even when filters are empty.
    if (!hasDestination && !hasDate && !opts?.externalDataReady) {
      setLoading(false);
      return;
    }

    // The server-fetched initial page already delivered data for this exact
    // search — consume it ONCE PER HOOK LIFETIME (not once per fetchKey —
    // see the bug this replaced below) and skip the redundant POST. Any
    // later change to filters must fall through to the real fetch logic.
    //
    // BUG THIS FIXES: externalDataReady (page.tsx) is derived from
    // searchId/initialLoading/initialData, none of which page.tsx ever
    // resets — so it stays true for the rest of the page's life, not just
    // for the first render after hydration. The previous guard compared
    // externalDataConsumedForKeyRef against the CURRENT fetchKey, which is
    // true again the moment the user changes ANY filter (new fetchKey ==
    // "not yet consumed" as far as that check could tell) — so it kept
    // reseeding state from the ORIGINAL, increasingly stale initialData
    // instead of ever falling through to a real POST. Net effect: once a
    // page started from a shared link, every later filter/sort change
    // silently redisplayed the first page's original results forever, with
    // no fetch, no loading state, and no visible error. A plain "consumed
    // at all yet" boolean is the correct one-shot gate here.
    if (opts?.externalDataReady && !externalDataConsumedRef.current) {
      externalDataConsumedRef.current = true;

      const initial = opts?.initialData;
      // page.tsx's hydration effect builds hydrationCriteria from `filters`
      // ONCE, at the moment it fires, and deliberately never updates it —
      // but nothing stops the user from changing a filter while that fetch
      // is still in flight. If they do, `fetchKey` (computed from the
      // CURRENT filters, every render) has already moved on to a different
      // search by the time this branch runs. Without this check, `initial`
      // (data for the OLD filters) would get seeded and cached under the
      // NEW fetchKey — silently showing/caching the wrong search's results
      // (Phase 4 review finding — the hydration race). `hydrated_for_filters`
      // missing entirely (an older/other caller) is treated as a match, so
      // this stays backward-compatible.
      const hydrationMatchesCurrentFilters =
        !initial?.hydrated_for_filters ||
        computeFetchKey(initial.hydrated_for_filters) === fetchKey;

      if (initial && hydrationMatchesCurrentFilters) {
        setSearchId(initial.search_id ?? null);
        setCursor(initial.next_cursor ?? null);
        setAllHotels(initial.results || []);
        setTotal(initial.total_count ?? (initial.results ? initial.results.length : 0));
        setBaseTotalCount(initial.base_total_count ?? 0);
        setDestinationUnavailable(Boolean(initial.destination_unavailable));
        setRateLimitRetryAfter(null);

        if (initial.facets) {
          setOptions(initial.facets);
          saveFilterOptions(initial.facets);
        }

        // Same cache write the POST path does — so a same-browser reload
        // of this exact filter combination hits the fast cache path too,
        // and loadMore's stale-cursor recovery (removeSearchCache) has a
        // real entry to drop if this search later 404s/410s mid-scroll.
        //
        // Keyed for the filters this search will be looked up under AFTER
        // page.tsx syncs the search bar to the resolved base criteria
        // (destinations/date/nights/departure_airports — see page.tsx's
        // resolved_filters and its updateFilters() call), not the ambient
        // `fetchKey` computed from the pre-sync filters a bare searchId
        // link starts with (empty, by design). Writing under the ambient
        // key here would put this entry in a different cache slot than the
        // one the hook looks up ~300ms later once debouncedFilters catches
        // up to the sync — a wasteful duplicate POST for a search that was
        // just fetched via hydration. `resolved_filters` is absent for any
        // caller that isn't the bare-searchId hydration flow, so this is a
        // no-op (falls back to `fetchKey`) everywhere else.
        const cacheWriteKey = initial.resolved_filters
          ? computeFetchKey(initial.resolved_filters)
          : fetchKey;

        setSearchCache(cacheWriteKey, {
          success: true,
          search_id: initial.search_id,
          results: initial.results || [],
          next_cursor: initial.next_cursor ?? null,
          total_count: initial.total_count ?? (initial.results ? initial.results.length : 0),
          base_total_count: initial.base_total_count ?? 0,
          facets: initial.facets ?? null,
          destination_unavailable: Boolean(initial.destination_unavailable),
          expires_at: initial.expires_at,
        });

        if (typeof window !== "undefined") {
          // Deferred: this branch's effect runs before page.tsx's own
          // URL-sync effect in the same commit (hook registration order),
          // so `did=` may not be in the address bar yet on a page load
          // that started from a bare ?searchId= URL. setTimeout(0) waits
          // for the current synchronous effect flush (including that
          // URL-sync effect) to finish first, so the saved entry reflects
          // the actual destination instead of a dest-less URL.
          setTimeout(() => saveSearchHistory(window.location.href), 0);
        }

        trackEvent("search", {
          destinations: filters.destinations,
          date: filters.date,
          date_max: filters.date_max,
          cached: false,
          results_count: (initial.results || []).length,
        });

        setLoading(false);
        return;
      }
      // Either there was no initialData, or it was hydrated for a
      // DIFFERENT filter combination than what's in effect right now —
      // don't seed stale data into the current fetchKey's slot. The ref is
      // already marked consumed above, so this can't loop; fall through to
      // the normal cache-check/fetch logic below for the CURRENT filters.
    }

    // Second guard, needed because the bail-out above was deliberately
    // widened to let externalDataReady through with empty filters (that's
    // the fix for the bare-searchId-link bug). `opts?.externalDataReady`
    // itself never resets back to false for the rest of this page's life
    // (see page.tsx), so on any LATER re-run of this effect — e.g.
    // loadMore's stale-cursor recovery bumping refetchNonce — the first
    // guard would let a still-empty `filters` fall all the way through to
    // a real POST with no destination/date. Use `searchId` (this hook's
    // own persisted state, set once a search is actually established,
    // whether via hydration or a normal POST) instead of the
    // ever-true externalDataReady flag: enough to search means a
    // destination/date was typed, OR we already have a real search
    // established and are just refreshing/paginating it.
    if (!hasDestination && !hasDate && !searchId) {
      setLoading(false);
      return;
    }

    // Check client sessionStorage cache
    const cached = getSearchCache(fetchKey);
    const cacheIsFresh =
      cached &&
      cached.success !== false &&
      Array.isArray(cached.results) &&
      (!cached.expires_at || new Date(cached.expires_at).getTime() > Date.now());

    if (cached && !cacheIsFresh) {
      // Stale — the SearchSession this cache entry points at has (or is
      // about to) expire server-side. Drop it so we fetch fresh instead of
      // handing the UI a searchId that will 410 on the next loadMore.
      removeSearchCache(fetchKey);
    }

    if (cacheIsFresh) {
      setSearchId(cached.search_id);
      setCursor(cached.next_cursor);
      setAllHotels(cached.results);
      setTotal(cached.total_count);
      setBaseTotalCount(cached.base_total_count ?? 0);
      setDestinationUnavailable(Boolean(cached.destination_unavailable));
      setRateLimitRetryAfter(null);
      setLoading(false);

      if (cached.facets) {
        setOptions(cached.facets);
        saveFilterOptions(cached.facets);
      }

      // Save search details to history on successful cache hit
      if (typeof window !== "undefined") {
        saveSearchHistory(window.location.href);
      }

      trackEvent("search", {
        destinations: filters.destinations,
        date: filters.date,
        date_max: filters.date_max,
        cached: true,
        results_count: cached.results.length,
      });

      // Synchronize searchId to URL
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (url.searchParams.get("searchId") !== cached.search_id) {
          url.searchParams.set("searchId", cached.search_id);
          window.history.replaceState({}, "", url.toString());
        }
      }
      return;
    }

    let cancelled = false;
    // React 18 Strict Mode double-invokes this effect once on mount in dev
    // (effect -> cleanup -> effect). Without aborting the stale first
    // invocation's request, both actually hit the network. `cancelled`
    // alone only suppresses the resulting state updates, not the request
    // itself.
    const controller = new AbortController();
    setLoading(true);
    setCursor(null);

    const idempotencyKey = createSearchIdempotencyKey();

    fetch("/api/hotelsearch", {
      method: "POST",
      headers: getRequestHeaders(undefined, idempotencyKey),
      body: JSON.stringify({
        destinations: filters.destinations,
        holiday_types: filters.holiday_types,
        date: filters.date,
        date_max: filters.date_max,
        nights: filters.nights,
        departure_airports: filters.departure_airports,
        board_basis: filters.board_basis && filters.board_basis.length > 0 ? filters.board_basis : "ANY",
        ratings: filters.rating,
        resorts: filters.resorts,
        price_min: filters.price_min,
        price_max: filters.price_max,
        outbound_flight_time: filters.outbound_flight_time,
        inbound_flight_time: filters.inbound_flight_time,
        sort: filters.sort,
      }),
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) {
          if (r.status === 429) {
            const retryAfter = parseInt(r.headers.get("Retry-After") || "10", 10) || 10;
            const rateLimitError: any = new Error("Rate limited");
            rateLimitError.rateLimited = true;
            rateLimitError.retryAfter = retryAfter;
            throw rateLimitError;
          }
          throw new Error("Search init failed");
        }
        return r.json();
      })
      .then((data: BackendSearchResponse) => {
        if (!cancelled && data.success) {
          setSearchId(data.search_id);
          setCursor(data.next_cursor);

          const resultsList = data.results || [];
          setAllHotels(resultsList);
          setTotal(data.total_count);
          setBaseTotalCount(data.base_total_count ?? 0);
          setDestinationUnavailable(Boolean(data.destination_unavailable));
          setRateLimitRetryAfter(null);

          if (data.facets) {
            setOptions(data.facets);
            saveFilterOptions(data.facets);
          }

          // Cache in client storage
          setSearchCache(fetchKey, data);

          // Save search details to history on successful fetch
          if (typeof window !== "undefined") {
            saveSearchHistory(window.location.href);
          }

          trackEvent("search", {
            destinations: filters.destinations,
            date: filters.date,
            date_max: filters.date_max,
            cached: false,
            results_count: resultsList.length,
          });

          // Synchronize searchId to URL
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("searchId", data.search_id);
            window.history.replaceState({}, "", url.toString());
          }
        }
      })
      .catch((err) => {
        if (err?.name === "AbortError") return; // Strict Mode's dev-only double-invoke abort, not a real failure
        console.error("Search fetch error:", err);
        if (!cancelled) {
          if (err && err.rateLimited) {
            // Transient — keep whatever results are already on screen
            // rather than blanking the page over a temporary 429.
            setRateLimitRetryAfter(err.retryAfter);
          } else {
            setRateLimitRetryAfter(null);
            setAllHotels([]);
            setTotal(0);
            setBaseTotalCount(0);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey, refetchNonce, opts?.waitForExternalData, opts?.externalDataReady, opts?.blockAutoFetch]);

  // loadMore scrolls fetching subsequent pages from Django backend
  const loadMore = useCallback(() => {
    if (loadingMore || !cursor || !searchId) return;

    setLoadingMore(true);

    fetch(`/api/hotelsearch?searchId=${searchId}&cursor=${encodeURIComponent(cursor)}`, {
      method: "GET",
    })
      .then((r) => {
        // 400 is included alongside 404/410 here: the backend never
        // actually returns 410 from this endpoint (SearchDefinition rows
        // don't expire — see the redesign notes), and an invalid/expired
        // cursor signature comes back as 400 ("Invalid or expired cursor
        // token"), not 404/410. Without this, that's the realistic
        // "expired mid-scroll" case and it was falling through to the
        // generic catch below — which doesn't clear the stale cursor —
        // making this whole recovery path effectively unreachable. loadMore
        // only ever sends `cursor` (never `criteria`), so a 400 here can't
        // be confused with the other validation errors this endpoint can
        // return for a malformed request.
        if (r.status === 404 || r.status === 410 || r.status === 400) {
          // The search session expired (or was never found) mid-scroll.
          // Previously this just logged an error and infinite scroll went
          // silently dead. Instead: drop the stale cache entry and bump
          // refetchNonce so the main effect re-runs a fresh create-search
          // for the same criteria — the user keeps scrolling and just sees
          // a brief reload instead of a dead end.
          removeSearchCache(fetchKey);
          setSearchId(null);
          setCursor(null);
          setRefetchNonce((n) => n + 1);
          return null;
        }
        if (r.status === 429) {
          const retryAfter = parseInt(r.headers.get("Retry-After") || "10", 10) || 10;
          setRateLimitRetryAfter(retryAfter);
          return null;
        }
        if (!r.ok) throw new Error("Page fetch failed");
        return r.json();
      })
      .then((data: BackendPageResponse | null) => {
        if (data && data.success) {
          setCursor(data.next_cursor);
          setAllHotels((prev) => [...prev, ...(data.results || [])]);
        }
      })
      .catch((err) => {
        console.error("Load more fetch error:", err);
      })
      .finally(() => {
        setLoadingMore(false);
      });
  }, [cursor, searchId, loadingMore, fetchKey]);

  // Derived price bounds directly from backend facets to match slider range
  const priceBounds = options && typeof options.price_min === "number" && typeof options.price_max === "number"
    ? { min: options.price_min, max: options.price_max }
    : null;

  return {
    hotels: allHotels,
    total,
    baseTotalCount,
    loading,
    loadingMore,
    hasMore: cursor !== null,
    loadMore,
    priceBounds,
    allHotels,
    options,
    destinationUnavailable,
    rateLimitRetryAfter,
  };
}

export function getHotelBoardBasisCode(hotel: any): string | null {
  if (hotel.boardBasis) {
    return getBoardBasisCode(hotel.boardBasis);
  }
  if (hotel.board_basis) {
    return getBoardBasisCode(hotel.board_basis);
  }
  if (hotel.api_url && typeof hotel.api_url === "string") {
    try {
      const url = hotel.api_url.includes("?") ? hotel.api_url : "?" + hotel.api_url;
      const params = new URLSearchParams(url.substring(url.indexOf("?")));
      const bbId = params.get("boardType") || params.get("boardBasisId");
      if (bbId) {
        return getBoardBasisCode(bbId);
      }
    } catch { /* ignore */ }
  }
  return null;
}
