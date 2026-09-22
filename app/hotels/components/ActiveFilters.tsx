import { X } from 'lucide-react';
import type { SearchFilters } from '@/hooks/useSearchFilters';
import type { FilterOptions } from '@/hooks/useSearch';
import { BOARD_BASIS_NAMES } from '@/lib/mappings/board-basis';

// "early_morning" -> "Early Morning"
function titleCase(value: string): string {
  return value.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

type Chip = { key: string; value: string; label: string };

function buildChips(filters: SearchFilters, options: FilterOptions | null): Chip[] {
  const chips: Chip[] = [];

  if (filters.q) chips.push({ key: 'q', value: filters.q, label: `"${filters.q}"` });

  // holiday_types values are either free-text CMS style names (already
  // human-readable) or fixed marketing tag ids ("7") -- look up the
  // backend-resolved label for the latter via the facet list.
  const holidayTypeLabels = new Map(
    (options?.holiday_types || []).map((o: any) => [o.value, o.label])
  );

  (filters.rating || []).forEach(v => chips.push({ key: 'rating', value: v, label: `${v} Stars` }));
  (filters.holiday_types || []).forEach(v => chips.push({ key: 'holiday_types', value: v, label: holidayTypeLabels.get(v) || v }));
  (filters.outbound_flight_time || []).forEach(v => chips.push({ key: 'outbound_flight_time', value: v, label: `${titleCase(v)} (out)` }));
  (filters.inbound_flight_time || []).forEach(v => chips.push({ key: 'inbound_flight_time', value: v, label: `${titleCase(v)} (in)` }));
  (filters.board_basis || []).forEach(v => chips.push({ key: 'board_basis', value: v, label: BOARD_BASIS_NAMES[v] || v }));
  (filters.regions || []).forEach(v => chips.push({ key: 'regions', value: v, label: v }));
  (filters.resorts || []).forEach(v => chips.push({ key: 'resorts', value: v, label: v }));

  if (filters.price_min != null || filters.price_max != null) {
    chips.push({ key: 'price', value: '', label: `£${filters.price_min ?? 0} – £${filters.price_max ?? ''}` });
  }

  return chips;
}

export default function ActiveFilters({
  filters,
  options,
  onRemove,
  onClearAll,
}: {
  filters: SearchFilters;
  options: FilterOptions | null;
  onRemove: (key: string, value: string) => void;
  onClearAll: () => void;
}) {
  const chips = buildChips(filters, options);
  if (chips.length === 0) return null;

  return (
    <>
      {chips.map(chip => (
        <span
          key={`${chip.key}-${chip.value}`}
          data-testid={`active-filter-chip-${chip.key}-${chip.value || 'range'}`}
          className="flex items-center gap-1.5 bg-white border border-[#CB2187]/30 text-[#CB2187] text-[12px] font-medium px-3 py-1 rounded-full flex-shrink-0"
        >
          <span className="truncate max-w-[160px]">{chip.label}</span>
          <button
            type="button"
            onClick={() => onRemove(chip.key, chip.value)}
            aria-label={`Remove ${chip.label} filter`}
            className="text-[#CB2187] hover:text-[#9e1467] transition-colors bg-transparent border-none p-0 cursor-pointer flex-shrink-0"
          >
            <X size={12} strokeWidth={3} />
          </button>
        </span>
      ))}
      <button
        type="button"
        data-testid="active-filters-clear-all"
        onClick={onClearAll}
        className="text-[11px] font-bold text-[#999] hover:text-[#CB2187] underline underline-offset-2 cursor-pointer bg-transparent border-none flex-shrink-0"
      >
        Clear all
      </button>
    </>
  );
}
