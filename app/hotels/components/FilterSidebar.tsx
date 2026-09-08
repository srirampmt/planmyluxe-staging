import {
  ChevronDown, Sunrise, Sun, Sunset, Moon,
  Banknote, Crown, PlaneTakeoff, PlaneLanding, Clock, Sliders,
  Sparkles, RotateCcw, Percent, Check,
  type LucideIcon,
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import * as Slider from '@radix-ui/react-slider';
import type { SearchFilters } from '@/hooks/useSearchFilters';
import type { FilterOptions } from '@/hooks/useSearch';
import { BOARD_BASIS_NAMES } from '@/lib/mappings/board-basis';

// ── Shared star SVG path ──
const STAR_PATH = "M14.0001 5.4091L8.91313 5.07466L6.99734 0.261719L5.08156 5.07466L0.0001297 5.4091L3.89754 8.7184L2.61862 13.7384L6.99734 10.9707L11.3761 13.7384L10.0972 8.7184L14.0001 5.4091Z";

// ── Flight-time bucket icons ──
const FLIGHT_TIME_ICONS: Record<string, LucideIcon> = {
  early_morning: Moon, morning: Sunrise, afternoon: Sun, evening: Sunset,
};

// ── StatusBadge (section-header pill: "N Selected" or a neutral fallback) ──
function StatusBadge({ children, active }: { children: ReactNode; active: boolean }) {
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${active ? 'bg-[#CB2187]/15 text-[#CB2187] border border-[#CB2187]/30' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
      {children}
    </span>
  );
}

function selectionBadge(n: number) {
  return n > 0 ? (
    <span className="bg-[#CB2187] text-white text-[11px] font-bold rounded-full min-w-[20px] h-[20px] px-[5px] flex items-center justify-center flex-shrink-0 tabular-nums">
      {n}
    </span>
  ) : null;
}

// ── FilterSection (collapsible glass card, icon + uppercase title + status badge) ──
function FilterSection({ icon: Icon, title, badge, children, defaultOpen = true }: {
  icon: LucideIcon; title: string; badge?: ReactNode; children: ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-[20px] p-1 bg-white/60 backdrop-blur-md border border-gray-200/60 hover:border-gray-300/80 transition-all">
      <button
        data-testid={`filter-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
        onClick={() => setOpen(!open)}
        className="w-full p-3 flex items-center justify-between text-left cursor-pointer bg-transparent border-none group"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-[#27272a] flex items-center gap-2 min-w-0">
          <Icon className="w-4 h-4 text-[#CB2187] flex-shrink-0" />
          <span className="truncate">{title}</span>
        </span>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {badge}
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition flex-shrink-0">
            <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

// ── SpecialOffersToggle (standalone gradient card, not an accordion) ──
function SpecialOffersToggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <label className="group relative flex items-center justify-between p-4 rounded-[20px] bg-gradient-to-br from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 cursor-pointer transition-all duration-300 shadow-lg shadow-emerald-500/25 overflow-hidden">
      <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute right-8 -bottom-8 w-20 h-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="flex items-center gap-3 relative z-10 min-w-0">
        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white flex-shrink-0">
          <Percent className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[13px] font-black text-white block leading-tight tracking-wide">Special Offers</span>
          <span className="text-[10px] font-semibold text-emerald-50 opacity-90">View discounted deals only</span>
        </div>
      </div>
      <div className="relative z-10 inline-flex items-center flex-shrink-0">
        <input
          type="checkbox"
          data-testid="filter-special-offers-toggle"
          checked={checked}
          onChange={onToggle}
          className="sr-only peer"
        />
        <div className="w-10 h-6 bg-white/30 rounded-full peer-checked:bg-white transition-colors relative after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white peer-checked:after:bg-teal-500 after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:after:translate-x-full shadow-inner" />
      </div>
    </label>
  );
}

// ── CheckboxRow (flat checkbox row — Board Basis / Holiday Type / Resort) ──
function CheckboxRow({ label, count, checked, onChange, testId }: {
  label: string; count?: number; checked: boolean; onChange: () => void; testId?: string;
}) {
  return (
    <label
      data-testid={testId}
      className="group flex items-center justify-between py-2 px-3 -mx-3 rounded-xl hover:bg-white cursor-pointer transition"
    >
      <div className="flex items-center gap-3 min-w-0">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-[18px] h-[18px] rounded-[6px] border-2 border-gray-300 peer-checked:border-[#CB2187] peer-checked:bg-[#CB2187] transition-all flex items-center justify-center flex-shrink-0">
          <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
        <span className="text-sm font-semibold text-[#4c4c4c] group-hover:text-[#27272a] transition truncate">{label}</span>
      </div>
      {count != null && <span className="text-[10px] font-bold text-gray-400 flex-shrink-0 tabular-nums">{count}</span>}
    </label>
  );
}

// ── StarClassButton (Hotel Class — stacked selectable button with checkbox + stars) ──
function StarClassButton({ ratingValue, count, checked, onToggle }: {
  ratingValue: string; count?: number; checked: boolean; onToggle: () => void;
}) {
  const n = parseInt(ratingValue) || 0;
  return (
    <button
      type="button"
      data-testid={`filter-rating-${ratingValue}`}
      onClick={onToggle}
      aria-pressed={checked}
      className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${checked ? 'border-[#CB2187] bg-[#CB2187]/5 shadow-sm' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
    >
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${checked ? 'border-[#CB2187] bg-[#CB2187]' : 'border-gray-300'}`}>
          <Check className={`w-3.5 h-3.5 text-white transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`} />
        </div>
        <span className="inline-flex items-center gap-[1px] ml-1">
          {[0, 1, 2, 3, 4].map(i => (
            <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
              <path d={STAR_PATH} fill={n >= i + 1 ? "#FBBC05" : "#E5E7EB"} />
            </svg>
          ))}
        </span>
      </div>
      {count != null && (
        <span className={`text-[11px] font-black px-2 py-1 rounded-lg flex-shrink-0 tabular-nums ${checked ? 'bg-white text-[#CB2187]' : 'bg-gray-100 text-gray-500'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ── FlightTimeButton (Flights accordion — compact icon-grid button) ──
function FlightTimeButton({ icon: Icon, timeRange, checked, onToggle, testId, label }: {
  icon: LucideIcon; label: string; timeRange: string; checked: boolean; onToggle: () => void; testId: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onToggle}
      aria-pressed={checked}
      title={`${label} (${timeRange})`}
      className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 ${checked ? 'border-[#CB2187] bg-[#CB2187]/5 shadow-sm' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
    >
      <Icon className={`w-5 h-5 transition-colors ${checked ? 'text-[#CB2187]' : 'text-gray-400'}`} />
      <span className={`text-[10px] font-bold ${checked ? 'text-[#CB2187]' : 'text-gray-600'}`}>{timeRange}</span>
    </button>
  );
}

// ── PriceSlider ──
function PriceSlider({ priceMin, priceMax, filterMin, filterMax, onChange }: { priceMin: number; priceMax: number; filterMin: number | null; filterMax: number | null; onChange: (min: number, max: number) => void }) {
  const sliderValue = useMemo(
    () => [filterMin ?? priceMin, filterMax ?? priceMax],
    [filterMin, filterMax, priceMin, priceMax]
  );
  const floorMin = Math.floor(priceMin);
  const ceilMax = Math.ceil(priceMax);

  return (
    <div className="px-1">
      <Slider.Root
        data-testid="price-range-slider"
        className="relative flex items-center select-none touch-none w-full h-5"
        value={sliderValue}
        min={floorMin}
        max={ceilMax}
        step={10}
        onValueChange={([min, max]) => onChange(min, max)}
      >
        <Slider.Track className="bg-[#EDEDED] relative grow rounded-full h-[6px]">
          <Slider.Range className="absolute bg-[#CB2187] rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb className="block w-[20px] h-[20px] bg-white border-[3px] border-[#CB2187] rounded-full shadow-sm hover:shadow-md focus:outline-none transition-shadow cursor-grab" />
        <Slider.Thumb className="block w-[20px] h-[20px] bg-white border-[3px] border-[#CB2187] rounded-full shadow-sm hover:shadow-md focus:outline-none transition-shadow cursor-grab" />
      </Slider.Root>
      <div className="flex justify-between mt-[8px] text-[12px] text-[#666] font-semibold tabular-nums">
        <span>&pound;{sliderValue[0]}</span>
        <span>&pound;{sliderValue[1]}</span>
      </div>
    </div>
  );
}

// ── CheckboxGroup ──
function CheckboxGroup({ items, selectedValues, onToggle, testIdPrefix, maxVisible = null, scrollOnShowAll = false }: { items: { value: string; label: string; count?: number }[]; selectedValues?: string[]; onToggle: (v: string) => void; testIdPrefix: string; maxVisible?: number | null; scrollOnShowAll?: boolean }) {
  const [showAll, setShowAll] = useState(false);
  const visible = maxVisible && !showAll ? items.slice(0, maxVisible) : items;

  // When `scrollOnShowAll` is true and `showAll` is active, enable a desktop-only scroll area.
  const scrollClass = scrollOnShowAll && showAll ? 'lg:max-h-[280px] lg:overflow-y-auto lg:pr-1' : '';

  return (
    <div className="space-y-1">
      <div className={`space-y-1 ${scrollClass}`}>
        {visible.map((item: { value: string; label: string; count?: number }) => (
          <CheckboxRow
            key={item.value}
            testId={`${testIdPrefix}-${item.value}`}
            label={item.label}
            count={item.count}
            checked={selectedValues?.includes(item.value) || false}
            onChange={() => onToggle(item.value)}
          />
        ))}
      </div>
      {maxVisible && items.length > maxVisible && (
        <button
          data-testid={`${testIdPrefix}-show-all`}
          onClick={() => setShowAll(!showAll)}
          className="text-[#CB2187] text-[12px] font-medium mt-[4px] hover:underline cursor-pointer bg-transparent border-none p-0"
        >
          {showAll ? 'Show less' : `Show all (${items.length})`}
        </button>
      )}
    </div>
  );
}

type OptionItem = { value: string; label: string; count?: number };
const toItems = (arr?: (string | OptionItem)[]): OptionItem[] =>
  (arr || []).map(x => typeof x === 'string' ? { value: x, label: x } : x);

// ── Main FilterSidebar ──
export default function FilterSidebar({
  options,
  filters,
  onFilterChange,
  onClearAll,
  showHeader = true,
  mobile = false,
  total,
  hasSpecialOffers = false,
}: {
  options: FilterOptions | null;
  filters: SearchFilters;
  onFilterChange: (f: SearchFilters) => void;
  onClearAll: () => void;
  showHeader?: boolean;
  mobile?: boolean;
  total?: number;
  hasSpecialOffers?: boolean;
}) {
  // options.ratings is an array of {value, count} objects with a NUMERIC
  // value (confirmed via live facets response: [{value:5,count:1},...]),
  // not the flat value-string array the (different) hotels-absolute
  // sibling filter assumes — extract .value/.count defensively either way.
  const ratingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (options?.ratings || []).forEach((r: any) => {
      if (r && typeof r === 'object') counts[String(r.value)] = r.count || 0;
    });
    return counts;
  }, [options?.ratings]);

  const filteredRatings = useMemo(() => {
    const available = new Set(
      (options?.ratings || []).map((r: any) => String(r && typeof r === 'object' ? r.value : r))
    );
    return ["5", "4", "3", "2", "1"].filter(r => available.has(r));
  }, [options?.ratings]);

  const activeCount = useMemo(() => (
    (filters.destinations && filters.destinations.length > 1 ? filters.destinations.length - 1 : 0) +
    (filters.holiday_types?.length || 0) +
    (filters.rating?.length || 0) +
    (filters.outbound_flight_time?.length || 0) +
    (filters.inbound_flight_time?.length || 0) +
    (filters.board_basis?.length || 0) +
    (filters.resorts?.length || 0) +
    ((filters.price_min != null || filters.price_max != null) ? 1 : 0) +
    (filters.special_offers_only ? 1 : 0)
  ), [filters]);

  const toggleArray = useCallback((key: string, value: string) => {
    const arr: string[] = ((filters as unknown) as Record<string, string[]>)[key] || [];
    const next = arr.includes(value) ? arr.filter((v: string) => v !== value) : [...arr, value];
    onFilterChange({ ...filters, [key]: next });
  }, [filters, onFilterChange]);

  const handlePriceChange = useCallback((min: number, max: number) => {
    onFilterChange({ ...filters, price_min: min, price_max: max });
  }, [filters, onFilterChange]);

  const handleToggleSpecialOffers = useCallback(() => {
    onFilterChange({ ...filters, special_offers_only: !filters.special_offers_only });
  }, [filters, onFilterChange]);

  const boardBasisOptions = useMemo(() => {
    if (!options || !Array.isArray(options.board_basis)) return [];
    return Object.entries(BOARD_BASIS_NAMES)
      .map(([code, name]) => {
        const backendOpt = options.board_basis?.find((b: any) => b.value === code);
        const count = backendOpt ? backendOpt.count : 0;
        return { value: code, label: name, count };
      })
      .filter((opt) => opt.count > 0 || (filters.board_basis && filters.board_basis.includes(opt.value)));
  }, [options?.board_basis, filters.board_basis]);

  const destItems = useMemo(() => {
    if (!options || !Array.isArray(options.destinations)) return [];
    return toItems(options.destinations)
      .sort((a, b) => (a.label || "").localeCompare(b.label || ""));
  }, [options?.destinations]);

  const outboundOptions = useMemo(() => {
    const counts = options?.outbound_flight_times && typeof options.outbound_flight_times === "object"
      ? options.outbound_flight_times
      : { early_morning: 0, morning: 0, afternoon: 0, evening: 0 };
    return [
      { value: "early_morning", label: "Early Morning", timeRange: "00:00 - 06:00", count: counts.early_morning || 0 },
      { value: "morning", label: "Morning", timeRange: "06:00 - 12:00", count: counts.morning || 0 },
      { value: "afternoon", label: "Afternoon", timeRange: "12:00 - 18:00", count: counts.afternoon || 0 },
      { value: "evening", label: "Evening", timeRange: "18:00 - 24:00", count: counts.evening || 0 },
    ].filter(opt => opt.count > 0 || (filters.outbound_flight_time && filters.outbound_flight_time.includes(opt.value)));
  }, [options?.outbound_flight_times, filters.outbound_flight_time]);

  const inboundOptions = useMemo(() => {
    const counts = options?.inbound_flight_times && typeof options.inbound_flight_times === "object"
      ? options.inbound_flight_times
      : { early_morning: 0, morning: 0, afternoon: 0, evening: 0 };
    return [
      { value: "early_morning", label: "Early Morning", timeRange: "00:00 - 06:00", count: counts.early_morning || 0 },
      { value: "morning", label: "Morning", timeRange: "06:00 - 12:00", count: counts.morning || 0 },
      { value: "afternoon", label: "Afternoon", timeRange: "12:00 - 18:00", count: counts.afternoon || 0 },
      { value: "evening", label: "Evening", timeRange: "18:00 - 24:00", count: counts.evening || 0 },
    ].filter(opt => opt.count > 0 || (filters.inbound_flight_time && filters.inbound_flight_time.includes(opt.value)));
  }, [options?.inbound_flight_times, filters.inbound_flight_time]);

  const htItems = useMemo(() => {
    if (!options || !Array.isArray(options.holiday_types)) return [];
    return toItems(options.holiday_types);
  }, [options?.holiday_types]);


  if (!options) return null;

  const priceMin = options.price_min ?? 0;
  const priceMax = options.price_max ?? 10000;
  const effectivePriceMin = filters.price_min ?? priceMin;
  const effectivePriceMax = filters.price_max ?? priceMax;

  return (
    <div
      data-testid="filter-sidebar"
      className={`font-['Montserrat'] flex flex-col relative ${mobile ? 'px-1 pb-4' : 'bg-white/80 pb-4'}`}
    >
      {showHeader && (
        <div className="flex items-center justify-between gap-3 mb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-[#111]">Filters</span>
            {activeCount > 0 && (
              <span className="bg-[#CB2187] text-white text-[11px] font-bold rounded-full min-w-[20px] h-[20px] px-[5px] flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button
              data-testid="clear-all-filters"
              onClick={onClearAll}
              className="text-[#CB2187] text-[12px] font-bold hover:underline cursor-pointer bg-transparent border-none"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      <div className="space-y-3 pb-2 relative z-10">
        <FilterSection
          icon={Banknote}
          title="Price Range"
          badge={(filters.price_min != null || filters.price_max != null) ? <StatusBadge active>&pound;{effectivePriceMin} &ndash; &pound;{effectivePriceMax}</StatusBadge> : null}
        >
          <PriceSlider
            priceMin={priceMin}
            priceMax={priceMax}
            filterMin={filters.price_min}
            filterMax={filters.price_max}
            onChange={handlePriceChange}
          />
        </FilterSection>
        
        {hasSpecialOffers && (
          <SpecialOffersToggle checked={!!filters.special_offers_only} onToggle={handleToggleSpecialOffers} />
        )}
        
        {filteredRatings.length > 0 && (
          <FilterSection
            icon={Crown}
            title="Hotel Class"
            badge={selectionBadge(filters.rating?.length || 0)}
          >
            <div className="space-y-2">
              {filteredRatings.map(r => (
                <StarClassButton
                  key={r}
                  ratingValue={r}
                  count={ratingCounts[r]}
                  checked={filters.rating?.includes(r) || false}
                  onToggle={() => toggleArray('rating', r)}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {(outboundOptions.length > 0 || inboundOptions.length > 0) && (
          <FilterSection
            icon={Clock}
            title="Flights"
            badge={selectionBadge((filters.outbound_flight_time?.length || 0) + (filters.inbound_flight_time?.length || 0))}
          >
            <div className="space-y-4">
              {outboundOptions.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <PlaneTakeoff className="w-3.5 h-3.5" /> Outbound
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {outboundOptions.map(opt => (
                      <FlightTimeButton
                        key={opt.value}
                        icon={FLIGHT_TIME_ICONS[opt.value]}
                        label={opt.label}
                        timeRange={opt.timeRange}
                        checked={filters.outbound_flight_time?.includes(opt.value) || false}
                        onToggle={() => toggleArray('outbound_flight_time', opt.value)}
                        testId={`filter-flight-out-${opt.value}`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {inboundOptions.length > 0 && (
                <div className={outboundOptions.length > 0 ? "pt-3 border-t border-gray-100" : ""}>
                  <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <PlaneLanding className="w-3.5 h-3.5" /> Return
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {inboundOptions.map(opt => (
                      <FlightTimeButton
                        key={opt.value}
                        icon={FLIGHT_TIME_ICONS[opt.value]}
                        label={opt.label}
                        timeRange={opt.timeRange}
                        checked={filters.inbound_flight_time?.includes(opt.value) || false}
                        onToggle={() => toggleArray('inbound_flight_time', opt.value)}
                        testId={`filter-flight-in-${opt.value}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </FilterSection>
        )}

        {(boardBasisOptions.length > 0 || htItems.length > 0 || destItems.length > 0) && (
          <FilterSection
            icon={Sliders}
            title="Preferences"
            badge={selectionBadge((filters.board_basis?.length || 0) + (filters.holiday_types?.length || 0) + (filters.resorts?.length || 0))}
          >
            <div className="space-y-4">
              {boardBasisOptions.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Board Basis</h4>
                  <CheckboxGroup
                    items={boardBasisOptions}
                    selectedValues={filters.board_basis}
                    onToggle={(v) => toggleArray('board_basis', v)}
                    testIdPrefix="filter-board-basis"
                    maxVisible={6}
                    scrollOnShowAll={true}
                  />
                </div>
              )}
              {htItems.length > 0 && (
                <div className={boardBasisOptions.length > 0 ? "border-t border-gray-100 pt-4" : ""}>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Holiday Type</h4>
                  <CheckboxGroup
                    items={htItems}
                    selectedValues={filters.holiday_types}
                    onToggle={(v) => toggleArray('holiday_types', v)}
                    testIdPrefix="filter-ht"
                    maxVisible={6}
                    scrollOnShowAll={true}
                  />
                </div>
              )}
              {destItems.length > 0 && (
                <div className={(boardBasisOptions.length > 0 || htItems.length > 0) ? "border-t border-gray-100 pt-4" : ""}>
                  {/* Was wired to filters.destinations (the base search-identity
                      field, resolved server-side by taking only the FIRST value —
                      see SearchService.create_search) instead of filters.resorts
                      (a genuine per-request in-results filter the backend already
                      supports via OfferSelector.offers_for_query). destItems'
                      `value` is a resort-name-derived slug (see FacetSelector's
                      "Destination (Resort) Facet" — same shape the resorts filter
                      expects), so this now filters correctly and supports
                      multi-select without re-anchoring the search. */}
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Resort</h4>
                  <CheckboxGroup
                    items={destItems}
                    selectedValues={filters.resorts}
                    onToggle={(v) => toggleArray('resorts', v)}
                    testIdPrefix="filter-resort"
                    maxVisible={8}
                    scrollOnShowAll={true}
                  />
                </div>
              )}
            </div>
          </FilterSection>
        )}
      </div>
      
    </div>
  );
}
