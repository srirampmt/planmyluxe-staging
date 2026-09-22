import {
  BadgePoundSterling, Check, Clock3, Globe, MapPin, Moon, Palmtree,
  PlaneLanding, PlaneTakeoff, Star, Sun, Sunrise, Sunset, Tag, UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import * as Slider from '@radix-ui/react-slider';
import * as Switch from '@radix-ui/react-switch';
import type { SearchFilters } from '@/hooks/useSearchFilters';
import type { FilterOptions } from '@/hooks/useSearch';
import { BOARD_BASIS_NAMES } from '@/lib/mappings/board-basis';

const STAR_PATH = "M14.0001 5.4091L8.91313 5.07466L6.99734 0.261719L5.08156 5.07466L0.0001297 5.4091L3.89754 8.7184L2.61862 13.7384L6.99734 10.9707L11.3761 13.7384L10.0972 8.7184L14.0001 5.4091Z";
const GOLD = "#FFD13D";

function SectionHeading({ title, icon: Icon, right }: {
  title: string;
  icon: LucideIcon;
  right?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-[#FBE3F1] bg-[#FFF7FC] text-[#CB2187]">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <h3 className="m-0 text-[14px] font-semibold text-black">{title}</h3>
      </div>
      {right}
    </div>
  );
}

function GoldStars({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 14 14" className="block">
          <path d={STAR_PATH} fill={GOLD} />
        </svg>
      ))}
    </span>
  );
}

function SpecialOffersToggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <label className="flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-[#bbf7d0] bg-[#EAFAF0] p-1.5 transition-colors hover:border-[#0F8A3D]/30">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] border border-[#bbf7d0] bg-white">
          <Tag className="h-3.5 w-3.5 text-[#0F8A3D]" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <span className="block text-[14px] font-semibold leading-tight text-[#4C4C4C]">Special offers</span>
        </div>
      </div>
      <Switch.Root
        data-testid="filter-special-offers-toggle"
        checked={checked}
        onCheckedChange={onToggle}
        aria-label="Show discounted holidays only"
        className="relative h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-[#bbf7d0] bg-white outline-none transition-colors data-[state=checked]:border-white data-[state=checked]:bg-[#0F8A3D] focus-visible:ring-2 focus-visible:ring-[#0F8A3D]/30 focus-visible:ring-offset-2"
      >
        <Switch.Thumb className="block h-[18px] w-[18px] translate-x-[3px] rounded-full bg-[#0F8A3D] shadow-sm transition-transform duration-200 data-[state=checked]:translate-x-[21px] data-[state=checked]:bg-white" />
      </Switch.Root>
    </label>
  );
}

function CheckboxRow({ label, count, checked, disabled, onChange, testId }: {
  label: string; count?: number; checked: boolean; disabled?: boolean; onChange: () => void; testId?: string;
}) {
  return (
    <label
      data-testid={testId}
      className={`flex min-h-10 items-center justify-between gap-3 rounded-[8px] px-2 py-2 transition-colors ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      } ${checked ? 'bg-[#FFF7FC]' : !disabled ? 'hover:bg-[#FFF7FC]' : ''}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="relative w-[18px] h-[18px] flex-shrink-0">
          <input type="checkbox" checked={checked} disabled={disabled} onChange={() => { if (!disabled) onChange(); }} className="sr-only peer" />
          <span className="absolute inset-0 rounded-[4px] border-2 border-[#E0E0E0] bg-white transition-colors peer-checked:border-[#CB2187] peer-checked:bg-[#CB2187] peer-focus-visible:ring-2 peer-focus-visible:ring-[#CB2187]/30 peer-focus-visible:ring-offset-2" />
          <Check className="absolute inset-0 m-auto w-3 h-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
        </span>
        <span className="truncate text-[14px] font-medium text-[#4C4C4C]">{label}</span>
      </div>
      {count != null && (
        <span className={`min-w-6 flex-shrink-0 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold ${
          checked ? 'bg-white text-[#CB2187]' : 'bg-[#FFF7FC] text-[#7C7C7C]'
        }`}>
          {count}
        </span>
      )}
    </label>
  );
}

function RatingRow({ ratingValue, count, checked, disabled, onChange }: {
  ratingValue: string; count?: number; checked: boolean; disabled?: boolean; onChange: () => void;
}) {
  const stars = parseInt(ratingValue, 10) || 0;
  return (
    <label
      data-testid={`filter-rating-${ratingValue}`}
      className={`flex min-h-10 items-center justify-between rounded-[8px] px-2 py-2 transition-colors ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      } ${checked ? 'bg-[#FFF7FC]' : !disabled ? 'hover:bg-[#FFF7FC]' : ''}`}
    >
      <span className="flex items-center gap-2.5">
        <span className="relative h-[18px] w-[18px] flex-shrink-0">
          <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={() => { if (!disabled) onChange(); }}
            className="peer sr-only"
            aria-label={`${stars} star hotel rating`}
          />
          <span className="absolute inset-0 rounded-[4px] border-2 border-[#E0E0E0] bg-white transition-colors peer-checked:border-[#CB2187] peer-checked:bg-[#CB2187] peer-focus-visible:ring-2 peer-focus-visible:ring-[#CB2187]/30 peer-focus-visible:ring-offset-2" />
          <Check className="absolute inset-0 m-auto h-3 w-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
        </span>
        <GoldStars count={stars} />
        <span className="text-[12px] font-medium text-[#7C7C7C]">
          {stars} star
        </span>
      </span>
      {count != null && (
        <span className={`min-w-6 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold ${
          checked ? 'bg-white text-[#CB2187]' : 'bg-[#FFF7FC] text-[#7C7C7C]'
        }`}>
          {count}
        </span>
      )}
    </label>
  );
}

function FlightTimePill({ icon: Icon, label, amPm, checked, disabled, onToggle, testId }: {
  icon: LucideIcon; label: string; amPm: string; checked: boolean; disabled?: boolean; onToggle: () => void; testId: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={() => { if (!disabled) onToggle(); }}
      disabled={disabled}
      aria-pressed={checked}
      aria-label={`${label}, ${amPm}`}
      className={`flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-[8px] border-2 px-1 py-1.5 outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#CB2187]/30 focus-visible:ring-offset-2 ${
        disabled
          ? 'cursor-not-allowed border-[#EDEDED] bg-white text-[#4C4C4C] opacity-50'
          : checked
          ? 'cursor-pointer border-[#CB2187] bg-[#FFF7FC] text-[#CB2187]'
          : 'cursor-pointer border-[#EDEDED] bg-white text-[#4C4C4C] hover:border-[#CB2187]/30 hover:bg-[#FFF7FC]'
      }`}
    >
      <Icon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
      <span className="whitespace-nowrap text-[10px] font-semibold leading-tight">{amPm}</span>
    </button>
  );
}

const fmtPrice = (n: number) => n.toLocaleString("en-GB");

function PriceSlider({ priceMin, priceMax, filterMin, filterMax, onChange }: { priceMin: number; priceMax: number; filterMin: number | null; filterMax: number | null; onChange: (min: number, max: number) => void }) {
  const floorMin = Math.floor(priceMin);
  const ceilMax = Math.ceil(priceMax);
  const sliderValue = useMemo(
    () => [filterMin ?? floorMin, filterMax ?? ceilMax],
    [filterMin, filterMax, floorMin, ceilMax]
  );

  return (
    <div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-3">
        <div className="inline-flex flex-row items-baseline gap-1.5 justify-self-start rounded-[8px] border border-[#FBE3F1] bg-[#FFF7FC] px-3 py-1">
          <div className="text-[10px] font-semibold text-[#7C7C7C]">Min</div>
          <div className="text-[15px] font-semibold text-[#4C4C4C]">&pound;{fmtPrice(sliderValue[0])}</div>
        </div>
        <span className="h-px w-4 bg-[#EDEDED]" />
        <div className="inline-flex flex-row items-baseline gap-1.5 justify-self-end rounded-[8px] border border-[#FBE3F1] bg-[#FFF7FC] px-3 py-1 text-right">
          <div className="text-[10px] font-semibold text-[#7C7C7C]">Max</div>
          <div className="text-[15px] font-semibold text-[#4C4C4C]">&pound;{fmtPrice(sliderValue[1])}</div>
        </div>
      </div>
      <div className="px-2 pt-1">
        <Slider.Root
          data-testid="price-range-slider"
          className="relative flex h-5 w-full touch-none select-none items-center overflow-visible"
          value={sliderValue}
          min={floorMin}
          max={ceilMax}
          step={10}
          onValueChange={([min, max]) => onChange(min, max)}
        >
          <Slider.Track className="relative h-1.5 grow rounded-full bg-[#EDEDED]">
            <Slider.Range className="absolute h-full rounded-full bg-[#CB2187]" />
          </Slider.Track>
          {[0, 1].map(i => (
            <Slider.Thumb
              key={i}
              aria-label={i === 0 ? 'Minimum price' : 'Maximum price'}
              className="block h-5 w-5 cursor-grab rounded-full border-2 border-[#CB2187] !bg-white shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#CB2187]/30 focus-visible:ring-offset-2"
            />
          ))}
        </Slider.Root>
      </div>
    </div>
  );
}

function CheckboxGroup({ items, selectedValues, onToggle, testIdPrefix, maxVisible = null }: {
  items: { value: string; label: string; count?: number; disabled?: boolean }[];
  selectedValues?: string[];
  onToggle: (v: string) => void;
  testIdPrefix: string;
  maxVisible?: number | null;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = maxVisible && !showAll ? items.slice(0, maxVisible) : items;

  return (
    <div>
      <div className="space-y-0.5">
        {visible.map((item: { value: string; label: string; count?: number; disabled?: boolean }) => (
          <CheckboxRow
            key={item.value}
            testId={`${testIdPrefix}-${item.value}`}
            label={item.label}
            count={item.count}
            disabled={item.disabled}
            checked={selectedValues?.includes(item.value) || false}
            onChange={() => onToggle(item.value)}
          />
        ))}
      </div>
      {maxVisible && items.length > maxVisible && (
        <button
          type="button"
          data-testid={`${testIdPrefix}-show-all`}
          onClick={() => setShowAll(!showAll)}
          className="mt-2 cursor-pointer rounded-md border-none bg-transparent px-2 py-1 text-[12px] font-semibold text-[#CB2187] outline-none hover:bg-[#FFF7FC] focus-visible:ring-2 focus-visible:ring-[#CB2187]/30"
        >
          {showAll ? 'Show less' : `Show more (${items.length - maxVisible})`}
        </button>
      )}
    </div>
  );
}

type OptionItem = { value: string; label: string; count?: number };
const toItems = (arr?: (string | OptionItem)[]): OptionItem[] =>
  (arr || []).map(x => typeof x === "string" ? { value: x, label: x } : x);

// Region / Resort facets (value == label == the hotel's configured name). Same
// "always keep, flag disabled" treatment as board basis: a 0-count option that
// isn't selected is disabled by the caller, never dropped from the list.
const toNameFacetItems = (arr: unknown, selected?: string[]) =>
  Array.isArray(arr)
    ? toItems(arr).map(item => ({
        ...item,
        disabled: item.count != null && item.count === 0 && !selected?.includes(item.value),
      })).sort((a, b) => (a.label || "").localeCompare(b.label || ""))
    : [];

// The only board-basis codes OfferSelector._normalize_board_basis (backend)
// ever normalizes offers to -- the source of truth for this facet's options.
const HOTEL_BOARD_BASIS_CODES = ["RO", "BB", "HB", "FB", "AI", "SC"] as const;

const FLIGHT_BANDS = [
  { value: "early_morning", label: "Night", amPm: "12am–6am", icon: Moon },
  { value: "morning", label: "Morning", amPm: "6am–12pm", icon: Sunrise },
  { value: "afternoon", label: "Afternoon", amPm: "12pm–6pm", icon: Sun },
  { value: "evening", label: "Evening", amPm: "6pm–12am", icon: Sunset },
] as const;

export default function FilterSidebar({
  options,
  filters,
  onFilterChange,
  onClearAll,
  mobile = false,
  hasSpecialOffers = false,
}: {
  options: FilterOptions | null;
  filters: SearchFilters;
  onFilterChange: (f: SearchFilters) => void;
  onClearAll: () => void;
  mobile?: boolean;
  total?: number;
  hasSpecialOffers?: boolean;
}) {
  const ratingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (options?.ratings || []).forEach((r: any) => {
      if (r && typeof r === "object") counts[String(r.value)] = r.count || 0;
    });
    return counts;
  }, [options?.ratings]);

  const filteredRatings = useMemo(() => {
    // Business rule: 1/2-star hotels are never offered (the backend
    // permanently excludes them), so those two stay hard-excluded here --
    // this is a real exclusion, not a "temporarily unavailable" one. 3/4/5
    // always render (never filtered by current count); disabled state is
    // computed separately in ratingCounts/isRatingDisabled below.
    return ["5", "4", "3"];
  }, []);

  const isRatingDisabled = useCallback(
    (r: string) => (ratingCounts[r] || 0) === 0 && !(filters.rating?.includes(r)),
    [ratingCounts, filters.rating]
  );

  const toggleArray = useCallback((key: string, value: string) => {
    const arr: string[] = ((filters as unknown) as Record<string, string[]>)[key] || [];
    const next = arr.includes(value) ? arr.filter((v: string) => v !== value) : [...arr, value];
    onFilterChange({ ...filters, [key]: next });
  }, [filters, onFilterChange]);

  const handlePriceChange = useCallback((min: number, max: number) => {
    onFilterChange({ ...filters, price_min: min, price_max: max });
  }, [filters, onFilterChange]);

  const handlePriceReset = useCallback(() => {
    onFilterChange({ ...filters, price_min: null, price_max: null });
  }, [filters, onFilterChange]);

  const handleToggleSpecialOffers = useCallback(() => {
    onFilterChange({ ...filters, special_offers_only: !filters.special_offers_only });
  }, [filters, onFilterChange]);

  const boardBasisOptions = useMemo(() => {
    if (!options || !Array.isArray(options.board_basis)) return [];
    // Always keep every board-basis option -- a 0-count one is disabled by
    // the caller (via `disabled`), never dropped from the list, so the
    // filter panel doesn't lose/regain rows as other filters change.
    // Scoped to the 6 codes the backend's board-basis facet can actually
    // return (OfferSelector._normalize_board_basis's target codes) --
    // BOARD_BASIS_NAMES also has "ANY" (a sentinel, not a real option),
    // "CC"/"CLB" (a different product line's board types), and duplicate
    // "extended variant" keys (e.g. "ROOM_ONLY") the API never emits, so
    // iterating that whole map directly would surface options this facet
    // can never match.
    return HOTEL_BOARD_BASIS_CODES
      .map((code) => {
        const backendOpt = options.board_basis?.find((b: any) => b.value === code);
        const count = backendOpt ? backendOpt.count : 0;
        const disabled = count === 0 && !(filters.board_basis && filters.board_basis.includes(code));
        return { value: code, label: BOARD_BASIS_NAMES[code], count, disabled };
      });
  }, [options, filters.board_basis]);

  const regionItems = useMemo(() => toNameFacetItems(options?.regions, filters.regions), [options, filters.regions]);
  const resortItems = useMemo(() => toNameFacetItems(options?.resorts, filters.resorts), [options, filters.resorts]);

  const outboundOptions = useMemo(() => {
    const counts = options?.outbound_flight_times && typeof options.outbound_flight_times === "object"
      ? options.outbound_flight_times
      : { early_morning: 0, morning: 0, afternoon: 0, evening: 0 };
    return FLIGHT_BANDS.map(opt => ({ ...opt, count: (counts as Record<string, number>)[opt.value] || 0 }));
  }, [options?.outbound_flight_times]);

  const inboundOptions = useMemo(() => {
    const counts = options?.inbound_flight_times && typeof options.inbound_flight_times === "object"
      ? options.inbound_flight_times
      : { early_morning: 0, morning: 0, afternoon: 0, evening: 0 };
    return FLIGHT_BANDS.map(opt => ({ ...opt, count: (counts as Record<string, number>)[opt.value] || 0 }));
  }, [options?.inbound_flight_times]);

  // Always keep all 4 time bands -- disabled instead of dropped when 0-count,
  // same treatment as every other dimension above.
  const visibleOutboundOptions = useMemo(
    () => outboundOptions.map(opt => ({
      ...opt,
      disabled: opt.count === 0 && !filters.outbound_flight_time?.includes(opt.value),
    })),
    [outboundOptions, filters.outbound_flight_time]
  );

  const visibleInboundOptions = useMemo(
    () => inboundOptions.map(opt => ({
      ...opt,
      disabled: opt.count === 0 && !filters.inbound_flight_time?.includes(opt.value),
    })),
    [inboundOptions, filters.inbound_flight_time]
  );

  const htItems = useMemo(() => {
    if (!options || !Array.isArray(options.holiday_types)) return [];
    return toItems(options.holiday_types).map(item => ({
      ...item,
      disabled: item.count != null && item.count === 0 && !filters.holiday_types?.includes(item.value),
    }));
  }, [options, filters.holiday_types]);

  if (!options) {
    return (
      <div
        data-testid="filter-sidebar-skeleton"
        className={`animate-pulse bg-white ${mobile ? 'pb-2' : 'rounded-[12px] border border-[#EDEDED] p-4 shadow-[0_8px_24px_rgba(76,76,76,0.06)]'}`}
      >
        <div className="mb-4 h-5 w-20 rounded-full bg-[#FBE3F1]" />
        <div className="mb-5 h-14 rounded-[10px] border border-[#FBE3F1] bg-[#FFF7FC]" />
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="h-14 rounded-[8px] bg-[#EDEDED]" />
          <div className="h-14 rounded-[8px] bg-[#EDEDED]" />
        </div>
        <div className="mb-3 h-10 rounded-[8px] bg-[#FFF7FC]" />
        <div className="h-24 rounded-[8px] bg-[#EDEDED]" />
      </div>
    );
  }

  const priceMin = options.price_min ?? 0;
  const priceMax = options.price_max ?? 10000;
  const sectionClass = "scroll-mt-4";
  const shell = mobile
    ? "pb-2 bg-white"
    : "rounded-[12px] border border-[#EDEDED] bg-white p-4 shadow-[0_8px_24px_rgba(76,76,76,0.06)] [color-scheme:light]";

  return (
    <div
      data-testid="filter-sidebar"
      className={`font-montserrat flex flex-col ${shell}`}
    >
      <div className="relative z-10 space-y-5">
        {hasSpecialOffers && (
          <div className={sectionClass}>
            <SpecialOffersToggle checked={!!filters.special_offers_only} onToggle={handleToggleSpecialOffers} />
          </div>
        )}

        <div className={sectionClass}>
          <SectionHeading
            title="Price per person"
            icon={BadgePoundSterling}
            right={(filters.price_min != null || filters.price_max != null) && (
              <button
                type="button"
                onClick={handlePriceReset}
                className="cursor-pointer rounded-md border-none bg-transparent px-2 py-1 text-[11px] font-semibold text-[#CB2187] outline-none hover:bg-[#FFF7FC] focus-visible:ring-2 focus-visible:ring-[#CB2187]/30"
              >
                Reset
              </button>
            )}
          />
          <PriceSlider
            priceMin={priceMin}
            priceMax={priceMax}
            filterMin={filters.price_min}
            filterMax={filters.price_max}
            onChange={handlePriceChange}
          />
        </div>
        
        {filteredRatings.length > 0 && (
          <div className={sectionClass}>
            <SectionHeading title="Hotel rating" icon={Star} />
            <div className="space-y-0.5">
              {filteredRatings.map(r => (
                <RatingRow
                  key={r}
                  ratingValue={r}
                  count={ratingCounts[r]}
                  disabled={isRatingDisabled(r)}
                  checked={filters.rating?.includes(r) || false}
                  onChange={() => toggleArray("rating", r)}
                />
              ))}
            </div>
          </div>
        )}

        {boardBasisOptions.length > 0 && (
          <div className={sectionClass}>
            <SectionHeading title="Board basis" icon={UtensilsCrossed} />
            <CheckboxGroup
              items={boardBasisOptions}
              selectedValues={filters.board_basis}
              onToggle={(v) => toggleArray("board_basis", v)}
              testIdPrefix="filter-board-basis"
              maxVisible={5}
            />
          </div>
        )}

        
        {htItems.length > 0 && (
          <div className={sectionClass} data-testid="filter-section-holiday-type">
            <SectionHeading title="Holiday Types" icon={Palmtree} />
            <CheckboxGroup
              items={htItems}
              selectedValues={filters.holiday_types}
              onToggle={(v) => toggleArray("holiday_types", v)}
              testIdPrefix="filter-ht"
              maxVisible={5}
            />
          </div>
        )}

        {(visibleOutboundOptions.length > 0 || visibleInboundOptions.length > 0) && (
          <div className={sectionClass}>
            
            <div className="space-y-4">
              {visibleOutboundOptions.length > 0 && (
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-black">
                    <span className="flex h-6 w-6 items-center justify-center rounded-[8px] border border-[#FBE3F1] bg-[#FFF7FC] text-[#CB2187]">
                      <PlaneTakeoff className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    Outbound Flight
                  </h4>
                  <div className={`grid gap-1.5 ${visibleOutboundOptions.length === 1 ? 'grid-cols-1' : 'grid-cols-4'}`}>
                    {visibleOutboundOptions.map(opt => {
                      const checked = filters.outbound_flight_time?.includes(opt.value) || false;
                      return (
                        <FlightTimePill
                          key={opt.value}
                          icon={opt.icon}
                          label={opt.label}
                          amPm={opt.amPm}
                          checked={checked}
                          disabled={opt.disabled}
                          onToggle={() => toggleArray("outbound_flight_time", opt.value)}
                          testId={`filter-flight-out-${opt.value}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
              {visibleInboundOptions.length > 0 && (
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-black">
                    <span className="flex h-6 w-6 items-center justify-center rounded-[8px] border border-[#FBE3F1] bg-[#FFF7FC] text-[#CB2187]">
                      <PlaneLanding className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    Return Flight
                  </h4>
                  <div className={`grid gap-1.5 ${visibleInboundOptions.length === 1 ? 'grid-cols-1' : 'grid-cols-4'}`}>
                    {visibleInboundOptions.map(opt => {
                      const checked = filters.inbound_flight_time?.includes(opt.value) || false;
                      return (
                        <FlightTimePill
                          key={opt.value}
                          icon={opt.icon}
                          label={opt.label}
                          amPm={opt.amPm}
                          checked={checked}
                          disabled={opt.disabled}
                          onToggle={() => toggleArray("inbound_flight_time", opt.value)}
                          testId={`filter-flight-in-${opt.value}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {regionItems.length > 0 && (
          <div className={sectionClass} data-testid="filter-section-region">
            <SectionHeading title="Region" icon={Globe} />
            <CheckboxGroup
              items={regionItems}
              selectedValues={filters.regions}
              onToggle={(v) => toggleArray("regions", v)}
              testIdPrefix="filter-region"
              maxVisible={5}
            />
          </div>
        )}

        {resortItems.length > 0 && (
          <div className={sectionClass} data-testid="filter-section-resort">
            <SectionHeading title="Resort" icon={MapPin} />
            <CheckboxGroup
              items={resortItems}
              selectedValues={filters.resorts}
              onToggle={(v) => toggleArray("resorts", v)}
              testIdPrefix="filter-resort"
              maxVisible={5}
            />
          </div>
        )}
      </div>
    </div>
  );
}
