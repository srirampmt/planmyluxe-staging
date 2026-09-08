import { ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'best', label: 'Best Deals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div data-testid="sort-select" className="relative font-['Montserrat']">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-white border border-[#d5d5d5] rounded-[8px] px-4 py-[8px] pr-9 text-[14px] text-[#4c4c4c] font-medium focus:outline-none focus:ring-2 focus:ring-[#CB2187]/20 focus:border-[#CB2187] cursor-pointer"
      >
        {SORT_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666] pointer-events-none" />
    </div>
  );
}
