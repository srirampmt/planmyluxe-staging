"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
import { resolveAirportIataToId, resolveAirportIdToIata } from '@/lib/mappings/airports';
import { encodeDestinationParam, isDestinationSelection } from '@/lib/mappings/destinations';
import type { SearchFilters } from '@/lib/searchFilters';
import type { ClientSearchPayload } from '@/lib/searchServerData';

// Result of page.tsx resolving ?searchId= on the server. `null` while that
// fetch is still streaming (this component is the Suspense fallback).
export type ServerSearch = {
  status: number;
  payload: ClientSearchPayload | null;
  filters: SearchFilters;
} | null;

// The search bar criteria a ?searchId= link resolved to in the DB — a bare
// ?searchId= link carries none of these in the URL by design (base criteria
// live server-side), so without this the search bar sits blank above the
// results. base_criteria's field names match SearchFilters, but `nights` is
// a number there and `departure_airports` are provider ids (the POST route
// resolves IATA codes to ids before Django stores them) — both converted
// back so a link whose URL already matches its DB criteria syncs to
// identical filters and doesn't trigger a redundant search.
function resolveBaseCriteria(payload: ClientSearchPayload, filters: SearchFilters): SearchFilters | null {
  const baseCriteria = payload.base_criteria;
  if (!baseCriteria) return null;
  // base_criteria.destinations' shape is owned by the backend — validate
  // before trusting it so an incompatible shape falls back to the current
  // filters instead of poisoning `filters.destinations`.
  const baseDestinations = Array.isArray(baseCriteria.destinations) && baseCriteria.destinations.every(isDestinationSelection)
    ? baseCriteria.destinations
    : null;
  return {
    ...filters,
    destinations: baseDestinations && baseDestinations.length ? baseDestinations : filters.destinations,
    date: baseCriteria.date ?? filters.date,
    date_max: baseCriteria.date_max ?? filters.date_max,
    nights: baseCriteria.nights != null ? String(baseCriteria.nights) : filters.nights,
    departure_airports: baseCriteria.departure_airports && baseCriteria.departure_airports.length
      ? baseCriteria.departure_airports.map((id: string) => resolveAirportIdToIata(String(id)))
      : filters.departure_airports,
  };
}

function ResultsHeader({ sortValue, onSortChange }: { sortValue: string; onSortChange: (v: string) => void }) {
  return (
    <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
      <span className="text-[13px] text-gray-500">Sort by:</span>
      <SortSelect value={sortValue} onChange={onSortChange} />
    </div>
  );
}

export default function SearchPageClient({
  searchId,
  serverSearch,
}: {
  searchId?: string;
  serverSearch?: ServerSearch;
}) {
  const { filters, updateFilters, clearAll, removeFilter } = useSearchFilters();
  const debouncedFilters = useDebounce(filters, 300);

  const serverPayload = serverSearch?.payload ?? null;

  const [initialData] = useState<any>(() => {
    if (!searchId || !serverSearch || !serverPayload) return null;
    return {
      search_id: searchId,
      results: serverPayload.results,
      next_cursor: serverPayload.next_cursor,
      total_count: serverPayload.total_count || serverPayload.results.length,
      base_total_count: serverPayload.base_total_count,
      facets: serverPayload.facets,
      destination_unavailable: serverPayload.destination_unavailable,
      // useSearch.ts's sessionStorage freshness check treats a MISSING
      // expires_at as "never stale", so it must be passed through.
      expires_at: serverPayload.expires_at,
      // Exactly the filters the server fetch was built from. useSearch.ts
      // compares this against its own current fetchKey before consuming
      // initialData, so if this browser seeded different filters (e.g. from
      // sessionStorage, which the server can't see) it runs a normal fetch
      // instead of showing the wrong search's results.
      hydrated_for_filters: serverSearch.filters,
      // The filters this search will be looked up under once the base
      // criteria sync below lands and the 300ms debounce catches up — lets
      // useSearch.ts write its cache entry under THAT key, so the post-sync
      // re-run hits the cache instead of firing a duplicate POST.
      resolved_filters: resolveBaseCriteria(serverPayload, filters),
    };
  });
  // Still true only while page.tsx's server fetch is streaming — this
  // instance is the Suspense fallback and gets replaced once it resolves.
  const initialLoading = !!searchId && !serverSearch;

  // Never set true anymore: SearchDefinition rows don't expire, so the
  // backend has no path left that returns 410. A 404 (unknown id, or
  // someone else's link reused as a campaign URL) falls through to useSearch
  // running a fresh search from the criteria already in the URL. Kept only
  // because HotelResultsList still takes the expired-screen props.
  const [searchExpired, setSearchExpired] = useState(false);

  useEffect(() => {
    if (!serverPayload) return;
    const resolved = resolveBaseCriteria(serverPayload, filters);
    if (!resolved) return;
    updateFilters({
      destinations: resolved.destinations,
      date: resolved.date,
      date_max: resolved.date_max,
      nights: resolved.nights,
      departure_airports: resolved.departure_airports,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Tell useSearch not to race page.tsx's server-side ?searchId= fetch with
  // its own POST for the same criteria. See PML-Search-Flow-Review.md C4.
  const waitForExternalData = initialLoading;
  const externalDataReady = !!searchId && !initialLoading && !!initialData;

  // Pass initialData to useSearch hook so it seeds its own state
  // (searchId/cursor/allHotels/total/options) from the server fetch —
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

  const baseOptions = options ?? initialData?.facets ?? null;
  const displayOptions = baseOptions
    ? { ...baseOptions, price_min: priceBounds?.min ?? baseOptions.price_min, price_max: priceBounds?.max ?? baseOptions.price_max }
    : baseOptions;

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
