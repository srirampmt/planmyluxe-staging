"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, use } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import FilterSidebar from './components/FilterSidebar';
import ActiveFilters from './components/ActiveFilters';
import SortSelect from './components/SortSelect';
import SearchPageBar from './components/SearchPageBar';
import MobileFilterPanel from './components/MobileFilterPanel';
import HotelResultsList from './components/HotelResultsList';
import { isHotelOnOffer } from './components/HotelCard';
import MobileSearchBar from "./components/MobileSearchBar";
import Coupons from './components/Coupons';
import { resolveAirportIataToId } from '@/lib/mappings/airports';
import { encodeDestinationParam, isDestinationSelection } from '@/lib/mappings/destinations';

export const dynamic = "force-dynamic";

function ResultsHeader({ sortValue, onSortChange }: { sortValue: string; onSortChange: (v: string) => void }) {
  return (
    <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
      <span className="text-[13px] text-gray-500">Sort by:</span>
      <SortSelect value={sortValue} onChange={onSortChange} />
    </div>
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ searchId?: string; [key: string]: any }>;
}) {
  const resolvedParams = searchParams && typeof (searchParams as any).then === 'function'
    ? use(searchParams)
    : (searchParams as any);
  const searchId = resolvedParams?.searchId;

  const [initialData, setInitialData] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(!!searchId);

  // True when the ?searchId= this page loaded with turned out to be gone or
  // expired server-side (the backend returned 404/410 while hydrating). We
  // show an explicit "your search has expired" screen instead of silently
  // retrying, so the user isn't left staring at what looks like a genuine
  // zero-results page after leaving the tab open for a while — see the
  // handleRefreshExpiredSearch callback below for what "Refresh search" does.
  const [searchExpired, setSearchExpired] = useState(false);

  const { filters, updateFilters: applyFilterUpdate, clearAll: clearAllFilters, removeFilter: removeOneFilter } = useSearchFilters();
  const debouncedFilters = useDebounce(filters, 300);

  // Guards the hydration -> search-bar sync a few lines below (Phase 6:
  // populating the search bar from a bare ?searchId= link's DB-resolved
  // criteria) against clobbering an edit the user makes to destination/
  // date/nights/departure_airports WHILE that hydration fetch is still in
  // flight. The hydration effect's `.then()` callback can land up to ~1s
  // after mount and is deliberately not reactive to `filters` (see its own
  // comment below) — without this guard it unconditionally calls
  // updateFilters() with the DB-resolved criteria the moment it resolves,
  // silently overwriting whatever the user already typed into the search
  // bar in that window. The visible symptom: the user changes destination,
  // clicks Search, gets a perfectly successful 201 response and normal-
  // looking logs — but it's actually a cache HIT for the OLD (reverted)
  // criteria, not the new destination they asked for, because their edit
  // never took effect. Set to true by every UI-facing path that can touch
  // a base-criteria field (the updateFilters/clearAll/removeFilter
  // wrappers just below); the hydration effect calls the RAW
  // applyFilterUpdate directly so its own sync doesn't trip this itself.
  const userEditedBaseCriteriaRef = useRef(false);
  const BASE_CRITERIA_KEYS = ["destinations", "date", "nights", "departure_airports"];

  const updateFilters = (next: Record<string, any>) => {
    if (BASE_CRITERIA_KEYS.some((k) => k in next)) {
      userEditedBaseCriteriaRef.current = true;
    }
    applyFilterUpdate(next);
  };
  const clearAll = () => {
    userEditedBaseCriteriaRef.current = true;
    clearAllFilters();
  };
  const removeFilter = (key: string, value: string) => {
    if (BASE_CRITERIA_KEYS.includes(key)) {
      userEditedBaseCriteriaRef.current = true;
    }
    removeOneFilter(key, value);
  };

  const activeCount = useMemo(() => (
    (filters.holiday_types?.length || 0) +
    (filters.rating?.length || 0) +
    (filters.outbound_flight_time?.length || 0) +
    (filters.inbound_flight_time?.length || 0) +
    (filters.board_basis?.length || 0) +
    (filters.regions?.length || 0) +
    (filters.resorts?.length || 0) +
    ((filters.price_min != null || filters.price_max != null) ? 1 : 0) +
    (filters.special_offers_only ? 1 : 0)
  ), [filters]);

  // Any deliberate change to the search criteria always supersedes an
  // "expired" screen for the PREVIOUS criteria — the user picking a new
  // destination shouldn't be blocked behind a stale "refresh?" prompt.
  useEffect(() => {
    setSearchExpired(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters]);

  // Tell useSearch not to race the ?searchId= hydration fetch below with its
  // own POST for the same criteria — previously both fired in parallel on
  // landing with a shared search link (two full round-trips for one page
  // load). See PML-Search-Flow-Review.md C4.
  const waitForExternalData = !!searchId && initialLoading;
  const externalDataReady = !!searchId && !initialLoading && !!initialData;

  // Pass initialData to useSearch hook so it actually seeds its own state
  // (searchId/cursor/allHotels/total/options) from the hydration fetch below
  // instead of just marking it "consumed" and leaving that state empty —
  // see useSearch.ts's initialData option for why that mattered.
  const {
    hotels,
    total,
    baseTotalCount,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    priceBounds,
    allHotels,
    options,
    destinationUnavailable,
    rateLimitRetryAfter,
  } = useSearch(debouncedFilters, { waitForExternalData, externalDataReady, blockAutoFetch: searchExpired, initialData });

  // Sync initialData values on client mount if available
  const [firstMounted, setFirstMounted] = useState(false);

  useEffect(() => {
    if (searchId) {
      setInitialLoading(true);
      // Send the current filter/sort state alongside searchId so the
      // backend can serve the right filtered view on the very first
      // hydration fetch instead of a flash of unfiltered results that
      // then self-corrects. This mirrors the POST body shape used by
      // useSearch.ts. Deliberately reads `filters` (not `debouncedFilters`)
      // as they stand on first render — i.e. whatever useSearchFilters
      // parsed from the URL — and is intentionally NOT in the dependency
      // array below: this fetch should only ever run once per searchId,
      // never re-run just because the user changes a filter afterwards
      // (that goes through useSearch's own effect instead).
      const hydrationCriteria = {
        destinations: filters.destinations,
        holiday_types: filters.holiday_types,
        date: filters.date,
        nights: filters.nights,
        departure_airports: filters.departure_airports,
        board_basis: filters.board_basis && filters.board_basis.length > 0 ? filters.board_basis : "ANY",
        ratings: filters.rating,
        regions: filters.regions,
        resorts: filters.resorts,
        price_min: filters.price_min,
        price_max: filters.price_max,
        outbound_flight_time: filters.outbound_flight_time,
        inbound_flight_time: filters.inbound_flight_time,
        sort: filters.sort,
      };
      const criteriaParam = encodeURIComponent(JSON.stringify(hydrationCriteria));
      fetch(`/api/hotelsearch?searchId=${searchId}&criteria=${criteriaParam}`)
        .then((res) => {
          if (res.status === 200) {
            return res.json();
          }
          if (res.status === 410) {
            // Dead branch against the current backend, kept only because
            // removing searchExpired/handleRefreshExpiredSearch entirely
            // would also mean touching HotelResultsList's corresponding
            // props — out of scope for a comment fix. The search-redesign
            // deliberately dropped expiry for SearchDefinition rows ("any
            // valid id resolves, for anyone, forever" — see models.py), so
            // this endpoint has no code path left that returns 410, and
            // this branch cannot fire anymore. If you're looking at this
            // because something related broke, the bug is elsewhere.
            setSearchExpired(true);
            return null;
          }
          // 404 covers two different situations the backend deliberately
          // can't tell apart (same response either way, so a guesser can't
          // learn which one it is): a search ID that never existed / was
          // purged after ~24h, OR one that belongs to someone else
          // entirely — e.g. this is a search-results link someone copied
          // and reused as a campaign/marketing URL, opened by a visitor who
          // never ran that search themselves. Showing "your search has
          // expired" here would be wrong and confusing (it was never
          // theirs to expire), so instead we fall through to the generic
          // catch below and let useSearch's own effect quietly run a
          // fresh search using the criteria that are already sitting in
          // the URL (?d=&dt=&n=&dp=... etc, independent of this dead
          // searchId) — no interstitial, no extra click, results just
          // load. That's what keeps a copied link working the same way
          // for as long as the campaign runs.
          throw new Error("Failed to fetch initial search data");
        })
        .then((payload) => {
          if (!payload) return;

          // Populate the visible search bar from the criteria this
          // searchId actually resolved to in the DB — a bare ?searchId=
          // link carries none of these in the URL by design (that's the
          // whole point of the redesign: base criteria live server-side,
          // not in query params), so without this the results now render
          // correctly but the search bar sits blank/misleading above them.
          // base_criteria's field names and value shapes (destinations as
          // slugs, departure_airports as IATA codes) match SearchFilters
          // directly — both trace back to the same payload.get(...) calls
          // in views.py's create_search, which is what wrote
          // search_def.criteria in the first place — so this is a plain
          // passthrough, no format conversion needed. `nights` is the one
          // exception: stored/returned as a number, SearchFilters wants a
          // string.
          // Read at the moment this fetch resolves (a ref, so this is the
          // LIVE current value, not the mount-time snapshot `filters`
          // itself is stuck at in this closure) — true if the user changed
          // destination/date/nights/departure_airports at any point since
          // mount, including while this fetch was still in flight. If so,
          // the DB-resolved base_criteria is no longer what the user wants
          // on screen: skip the sync entirely rather than stomping their
          // edit back to the link's original criteria. Their own edit will
          // drive its own real search through the normal fetch path below
          // once debouncedFilters catches up — nothing further to do here.
          const userAlreadyEditedBaseCriteria = userEditedBaseCriteriaRef.current;

          const baseCriteria = payload.base_criteria;
          // base_criteria.destinations' shape is owned by the backend and
          // not yet updated to the {destination_id, <level>: true} contract
          // this page now sends — validate before trusting it, so an
          // unconverted backend response (still slugs, or anything else)
          // falls back to the current filters instead of poisoning
          // `filters.destinations` with an incompatible shape.
          const baseDestinations = Array.isArray(baseCriteria?.destinations) && baseCriteria.destinations.every(isDestinationSelection)
            ? baseCriteria.destinations
            : null;
          const resolvedFilters = baseCriteria && !userAlreadyEditedBaseCriteria
            ? {
                ...filters,
                destinations: baseDestinations && baseDestinations.length
                  ? baseDestinations
                  : filters.destinations,
                date: baseCriteria.date ?? filters.date,
                date_max: baseCriteria.date_max ?? filters.date_max,
                nights: baseCriteria.nights != null ? String(baseCriteria.nights) : filters.nights,
                departure_airports: baseCriteria.departure_airports && baseCriteria.departure_airports.length
                  ? baseCriteria.departure_airports
                  : filters.departure_airports,
              }
            : null;

          if (resolvedFilters) {
            // The raw hook function, deliberately NOT the tracking
            // `updateFilters` wrapper above — this call is the sync
            // itself, not a user edit, and must not mark
            // userEditedBaseCriteriaRef (which would be a no-op here since
            // we're past the check, but would incorrectly suppress this
            // same effect's guard for anyone reasoning about it, and — more
            // importantly — matters if this block is ever refactored to run
            // more than once).
            applyFilterUpdate({
              destinations: resolvedFilters.destinations,
              date: resolvedFilters.date,
              date_max: resolvedFilters.date_max,
              nights: resolvedFilters.nights,
              departure_airports: resolvedFilters.departure_airports,
            });
          }

          setInitialData({
            search_id: searchId,
            results: payload.results || [],
            next_cursor: payload.next_cursor || null,
            total_count: payload.total_count || (payload.results ? payload.results.length : 0),
            base_total_count: payload.base_total_count || 0,
            facets: payload.facets || null,
            destination_unavailable: Boolean(payload.destination_unavailable),
            // Was previously dropped here even though the type/backend both
            // carry it (Phase 4 review finding) — useSearch.ts's
            // sessionStorage freshness check treats a MISSING expires_at as
            // "never stale," so this cache entry silently never got the
            // periodic-refresh behavior every POST-originated entry gets.
            expires_at: payload.expires_at,
            // Snapshot of exactly the filters this hydration fetch was
            // built from (see hydrationCriteria above) — NOT the same as
            // reading `filters` again later, since this effect only runs
            // once per searchId while `filters` keeps changing. useSearch.ts
            // compares this against its own current fetchKey before
            // consuming initialData, so a filter change the user makes
            // WHILE this fetch is still in flight can't get seeded into the
            // wrong (now-current) fetchKey's cache slot (Phase 4 review
            // finding — the hydration race).
            hydrated_for_filters: {
              destinations: filters.destinations,
              holiday_types: filters.holiday_types,
              date: filters.date,
              nights: filters.nights,
              departure_airports: filters.departure_airports,
              board_basis: filters.board_basis,
              rating: filters.rating,
              regions: filters.regions,
              resorts: filters.resorts,
              price_min: filters.price_min,
              price_max: filters.price_max,
              outbound_flight_time: filters.outbound_flight_time,
              inbound_flight_time: filters.inbound_flight_time,
              sort: filters.sort,
            },
            // The filters this search will actually be looked up under
            // once the applyFilterUpdate() call above lands and the 300ms
            // debounce catches up (destinations/date/nights/
            // departure_airports now populated instead of empty). Lets
            // useSearch.ts write its sessionStorage cache entry under THAT
            // key instead of the still-empty ambient one, so the
            // post-sync re-run hits the cache instead of firing a
            // duplicate POST for a search that was just fetched here.
            // null when base_criteria wasn't in the response, OR when the
            // user already edited base criteria before this resolved (see
            // userAlreadyEditedBaseCriteria above) — useSearch.ts falls
            // back to the ambient key in both cases, which is correct: a
            // user edit means their own real search is what should run
            // next, not a synced-then-cached version of the old link.
            resolved_filters: resolvedFilters,
          });
        })
        .catch((err) => {
          console.error("Client-side initial data fetch error:", err);
        })
        .finally(() => {
          setInitialLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchId]);

  // "Refresh search" button on the expired screen — re-runs the exact same
  // criteria this page already has (from the URL/filters), producing a
  // brand new search and a brand new searchId. We don't re-fetch the old
  // (expired) searchId; we just let useSearch's own effect do a fresh
  // create-search POST once blockAutoFetch clears, since the criteria
  // (fetchKey) haven't changed.
  const handleRefreshExpiredSearch = () => {
    setSearchExpired(false);
  };

  useEffect(() => {
    if (initialData && !firstMounted && allHotels.length > 0) {
      setFirstMounted(true);
    }
  }, [initialData, firstMounted, allHotels]);

  const displayOptions = options
    ? { ...options, price_min: priceBounds?.min ?? options.price_min, price_max: priceBounds?.max ?? options.price_max }
    : options;

  useEffect(() => {
    if (!priceBounds) return;
    const { min, max } = priceBounds;
    const outOfRange =
      (filters.price_min != null && (filters.price_min < min || filters.price_min > max)) ||
      (filters.price_max != null && (filters.price_max < min || filters.price_max > max));
    if (outOfRange) {
      updateFilters({ price_min: null, price_max: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceBounds?.min, priceBounds?.max]);

  const [isCompact, setIsCompact] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [searchBarHeightPx, setSearchBarHeightPx] = useState(84);
  const [resultsHeaderHeightPx, setResultsHeaderHeightPx] = useState(60);

  const resultsRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const searchBarSectionRef = useRef<HTMLElement>(null);
  const resultsHeaderRef = useRef<HTMLDivElement>(null);
  const handleSortChange = (v: string) => updateFilters({ ...filters, sort: v });

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (typeof window !== 'undefined') {
      const resultsElement = resultsHeaderRef.current;
      if (resultsElement) {
        const rect = resultsElement.getBoundingClientRect();
        const targetScrollTop = window.scrollY + rect.top - searchBarHeightPx;
        if (window.scrollY > targetScrollTop) {
          window.scrollTo({ top: targetScrollTop, behavior: 'instant' });
        }
      }
    }
  }, [debouncedFilters, searchBarHeightPx]);

  useLayoutEffect(() => {
    const update = () => {
      if (searchBarSectionRef.current) {
        const h = Math.round(searchBarSectionRef.current.getBoundingClientRect().height);
        setSearchBarHeightPx(h);
        document.documentElement.style.setProperty('--search-bar-height', `${h}px`);
      }
      if (resultsHeaderRef.current) {
        const h = Math.round(resultsHeaderRef.current.getBoundingClientRect().height);
        setResultsHeaderHeightPx(h);
        document.documentElement.style.setProperty('--results-header-height', `${h}px`);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (searchBarSectionRef.current) ro.observe(searchBarSectionRef.current);
    if (resultsHeaderRef.current) ro.observe(resultsHeaderRef.current);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const thresholdHide = 8; // fires as soon as the search bar reaches the navbar
      const thresholdShow = 4; // small hysteresis band so it doesn't flicker right at scrollY≈0

      let shouldBeCompact = isCompact;
      if (window.scrollY >= thresholdHide) {
        shouldBeCompact = true;
      } else if (window.scrollY <= thresholdShow) {
        shouldBeCompact = false;
      }

      if (shouldBeCompact !== isCompact) {
        setIsCompact(shouldBeCompact);
        window.dispatchEvent(new Event(shouldBeCompact ? 'hideNavbar' : 'showNavbar'));
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCompact]);

  // Sync filters to URL state
  useEffect(() => {
    const dateToISO = (dateStr: string): string => {
      if (!dateStr) return "";
      const trimmed = dateStr.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
      const MONTH_MAP: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
      };
      const parts = trimmed.split(/\s*[\u2013\u2014]\s*/);
      const startPart = parts[0].trim();
      const match = startPart.match(/(\d+)\s+([A-Za-z]+)/);
      if (!match) return "";
      const day = parseInt(match[1], 10);
      const monthStr = match[2].toLowerCase().slice(0, 3);
      const monthIndex = MONTH_MAP[monthStr];
      if (monthIndex === undefined) return "";
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let year = today.getFullYear();
      if (new Date(year, monthIndex, day) < today) year += 1;
      const mm = String(monthIndex + 1).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      return `${year}-${mm}-${dd}`;
    };

    try {
      const params = new URLSearchParams();
      // Ensure we keep searchId if present
      if (typeof window !== "undefined") {
        const currentParams = new URLSearchParams(window.location.search);
        const sid = currentParams.get("searchId");
        if (sid) params.set("searchId", sid);
      }
      if (filters.q) params.set('q', filters.q);
      if (filters.destinations && filters.destinations.length) params.set('did', encodeDestinationParam(filters.destinations[0]));
      if (filters.holiday_types && filters.holiday_types.length) params.set('type', filters.holiday_types.join(','));
      if (filters.sort) params.set('s', filters.sort);
      if (filters.date) params.set('dt', dateToISO(filters.date));
      if (filters.date_max) params.set('dtmax', dateToISO(filters.date_max));
      if (filters.nights) params.set('n', filters.nights);
      if (filters.departure_airports && filters.departure_airports.length) {
        const depIds = filters.departure_airports.map(resolveAirportIataToId).filter(Boolean);
        if (depIds.length > 0) {
          params.set('dp', depIds.join(','));
        }
      }
      if (filters.outbound_flight_time && filters.outbound_flight_time.length) {
        params.set('outbound', filters.outbound_flight_time.join(','));
      }
      if (filters.inbound_flight_time && filters.inbound_flight_time.length) {
        params.set('inbound', filters.inbound_flight_time.join(','));
      }
      if (filters.board_basis && filters.board_basis.length) {
        params.set('board_basis', filters.board_basis.join(','));
      }
      if (filters.regions && filters.regions.length) {
        params.set('regions', filters.regions.join(','));
      }
      if (filters.resorts && filters.resorts.length) {
        params.set('resorts', filters.resorts.join(','));
      }
      if (filters.rating && filters.rating.length) {
        params.set('rating', filters.rating.join(','));
      }
      params.set('search', 'true');
      const qs = params.toString();
      const newUrl = qs ? `/hotels?${qs}` : '/hotels';
      window.history.replaceState({}, '', newUrl);
    } catch (e) {
      // ignore
    }
  }, [filters.q, filters.destinations, filters.holiday_types, filters.sort, filters.date, filters.date_max, filters.nights, filters.departure_airports, filters.outbound_flight_time, filters.inbound_flight_time, filters.board_basis, filters.regions, filters.resorts, filters.rating]);

  // Sync searchPrefill to sessionStorage. `airports` stores IATA codes
  // directly (filters.departure_airports already is that shape) — no local
  // name-resolution table needed; searchbar.tsx resolves codes to display
  // names itself, from the canonical lib/mappings/airports.ts table, at
  // render time.
  useEffect(() => {
    try {
      sessionStorage.setItem('searchPrefill', JSON.stringify({
        q: filters.q || '',
        dest: filters.destinations?.[0] ? encodeDestinationParam(filters.destinations[0]) : '',
        airports: filters.departure_airports || [],
        date: filters.date || '',
        nights: filters.nights || '7',
      }));
    } catch { /* ignore storage errors */ }
  }, [filters.destinations, filters.departure_airports, filters.date, filters.nights, filters.q]);

  const displayHotels = initialData && !firstMounted && hotels.length === 0 ? initialData.results : hotels;
  const hasSpecialOffers = useMemo(() => displayHotels.some(isHotelOnOffer), [displayHotels]);
  const displayTotal = initialData && !firstMounted && hotels.length === 0 ? initialData.total_count : total;
  const displayBaseTotalCount = initialData && !firstMounted && hotels.length === 0 ? (initialData.base_total_count ?? 0) : baseTotalCount;
  const isCurrentlyLoading = initialLoading || loading;

  return (
    <div data-testid="search-page" className="min-h-screen bg-white font-['Montserrat'] search-page--compact-bar">
      <section
        ref={searchBarSectionRef}
        className={`sticky z-40 w-full ${isCompact
          ? "bg-white shadow-sm border-b border-gray-100"
          : "bg-white"
          }`}
        style={{
          top: isCompact ? 0 : 'var(--main-nav-height)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-[10px] md:py-[14px]">
          <div className="w-full max-w-[1280px] mx-auto">
            <div className="block lg:hidden">
              <MobileSearchBar filters={filters} onApply={updateFilters} isSearching={loading} />
            </div>
            <div className="hidden lg:block">
              <SearchPageBar
                initialQuery={filters.q}
                initialDest={filters.destinations?.[0] ? encodeDestinationParam(filters.destinations[0]) : ''}
                initialDealType={filters.holiday_types?.[0] || ''}
                initialTravelDate={filters.date || ''}
                initialDateMax={filters.date_max || ''}
                initialNights={filters.nights || '7'}
                initialDeparturePoints={filters.departure_airports.join(',')}
                onApply={updateFilters}
                isSearching={loading}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] md:pb-[18px]">
        <div className="w-full max-w-[1280px] mx-auto">
          <div className="flex gap-4 xl:gap-6 items-start xl:items-stretch min-h-0 ">
            <div ref={sidebarRef} className="hidden w-[320px] flex-shrink-0 lg:block">
              <div
                className={`sticky z-[15] bg-white py-2 mb-3 ${!(isCompact && isDesktop) ? 'top-[97px]' : ''}`}
                style={{
                  top: (isCompact && isDesktop) ? `${searchBarHeightPx}px` : undefined,
                  transition: 'top 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#CB2187] text-white">
                      <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-lg font-bold text-[#4C4C4C]">Filters</span>
                    {activeCount > 0 && (
                      <span className="flex min-w-5 items-center justify-center rounded-full bg-[#FFF7FC] px-1.5 py-0.5 text-[11px] font-bold text-[#CB2187]">
                        {activeCount}
                      </span>
                    )}
                  </div>
                  {activeCount > 0 && (
                    <button
                      type="button"
                      data-testid="clear-all-filters"
                      onClick={clearAll}
                      className="cursor-pointer rounded-md border-none bg-transparent px-2 py-1 text-[12px] font-semibold text-[#CB2187] outline-none hover:bg-[#FFF7FC] focus-visible:ring-2 focus-visible:ring-[#CB2187]/30"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <div>
                <FilterSidebar options={displayOptions} filters={filters} onFilterChange={updateFilters} onClearAll={clearAll} total={displayTotal} hasSpecialOffers={hasSpecialOffers} />
              </div>
            </div>

            <div className="flex-1 min-w-0 ">
              <div
                ref={resultsHeaderRef}
                className={`sticky z-30 bg-white py-2 px-0 lg:px-4 ${!(isCompact && isDesktop) ? 'top-[84px] sm:top-[60px] lg:top-[97px]' : ''}`}
                style={{
                  top: (isCompact && isDesktop) ? `${searchBarHeightPx}px` : undefined,
                  transition: 'top 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div className="block lg:hidden ">
                  <MobileFilterPanel
                    options={displayOptions}
                    filters={filters}
                    total={displayTotal}
                    onFilterChange={updateFilters}
                    onClearAll={clearAll}
                    onRemove={removeFilter}
                    hasSpecialOffers={hasSpecialOffers}
                  />
                </div>

                <div className="hidden lg:flex items-center justify-between gap-2 px-3 sm:px-4 lg:px-0">
                  {/* <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap flex-1 min-w-0">
                    <ActiveFilters filters={filters} options={displayOptions} onRemove={removeFilter} onClearAll={clearAll} />
                  </div> */}
                  <span className="text-[16px] font-semibold text-[#4C4C4C]">
                    {!isCurrentlyLoading && displayBaseTotalCount > 0 ? `${displayBaseTotalCount} Deals Found` : ''}
                  </span>
                  <ResultsHeader sortValue={filters.sort} onSortChange={handleSortChange} />
                </div>
              </div>

              <div ref={resultsRef} className="scrollbar-hide md:overflow-x-hidden">
                <HotelResultsList
                  hotels={displayHotels}
                  total={displayTotal}
                  loading={isCurrentlyLoading}
                  loadingMore={loadingMore}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                  onClearAll={clearAll}
                  destinationUnavailable={destinationUnavailable}
                  rateLimitRetryAfter={rateLimitRetryAfter}
                  searchExpired={searchExpired}
                  onRefreshExpired={handleRefreshExpiredSearch}
                  specialOffersOnly={filters.special_offers_only}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {displayHotels.length > 0 && <Coupons />}
    </div>
  );
}
