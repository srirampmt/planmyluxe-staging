"use client";
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal, X, ArrowDown, AlignRight, ArrowRight } from 'lucide-react';
import FilterSidebar from './FilterSidebar';
import ActiveFilters from './ActiveFilters';
import type { SearchFilters } from '@/hooks/useSearchFilters';
import type { FilterOptions } from '@/hooks/useSearch';

type Props = {
  options: FilterOptions | null;
  filters: SearchFilters;
  total: number;
  onFilterChange: (f: SearchFilters) => void;
  onClearAll: () => void;
  onRemove: (key: string, value: string) => void;
  hasSpecialOffers?: boolean;
};

export default function MobileFilterPanel({ options, filters, total, onFilterChange, onClearAll, onRemove, hasSpecialOffers }: Props) {
  const [open, setOpen] = useState(false);
  const [showSortPopover, setShowSortPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showSortPopover) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !listBtnRef.current?.contains(e.target as Node)
      ) {
        setShowSortPopover(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSortPopover]);

  return (
    <>
      {/* Trigger Row — only on mobile */}
      <div className="lg:hidden flex-shrink-0">
        <div className="flex items-center gap-3">

          {/* Filter icon + count badge */}
          <button
            data-testid="mobile-filter-toggle"
            onClick={() => setOpen(true)}
            className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border border-[#FBE3F1] bg-[#FFF7FC] text-[#CB2187] outline-none transition-colors hover:border-[#CB2187]/30 focus-visible:ring-2 focus-visible:ring-[#CB2187]/30"
            aria-label="Open filters"
          >
            <SlidersHorizontal size={18} />
            {total > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#CB2187] px-1 text-[10px] font-bold leading-none text-white">
                {total}
              </span>
            )}
          </button>

          {/* Active filter chips */}
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
            <ActiveFilters filters={filters} options={options} onRemove={onRemove} onClearAll={onClearAll} />
          </div>

          {/* Sort popover */}
          <div className="relative">
            <button
              ref={listBtnRef}
              data-testid="mobile-sort-toggle"
              onClick={() => { setShowSortPopover(prev => !prev); setOpen(false); }}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border border-[#EDEDED] bg-white text-[#4C4C4C] outline-none transition-colors hover:border-[#CB2187]/30 hover:bg-[#FFF7FC] focus-visible:ring-2 focus-visible:ring-[#CB2187]/30"
              aria-label="Sort results"
            >
              <ArrowDown size={15} />
              <AlignRight size={15} />
            </button>

            {showSortPopover && (
              <div
                ref={popoverRef}
                className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-[12px] border border-[#EDEDED] bg-white py-2 shadow-[0_8px_24px_rgba(76,76,76,0.12)]"
              >
                {[
                  { value: 'best', label: 'Best Deals' },
                  { value: 'price_asc', label: 'Price: Low to High' },
                  { value: 'price_desc', label: 'Price: High to Low' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { onFilterChange({ ...filters, sort: opt.value }); setShowSortPopover(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${(filters.sort || 'best') === opt.value
                        ? 'bg-[#FFF7FC] font-semibold text-[#CB2187]'
                        : 'text-[#4C4C4C] hover:bg-[#FFF7FC]'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-screen filter modal */}
      {open && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[1100] overflow-hidden lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div className="absolute inset-0 flex flex-col bg-white shadow-2xl animate-in slide-in-from-right-full duration-300">

            {/* Header */}
            <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[#EDEDED] px-5">
              <span className="flex items-center gap-2.5 font-montserrat text-xl font-bold text-[#4C4C4C]">
                <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#CB2187] text-white">
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                </span>
                Filters
              </span>
              <div className="flex items-center gap-3">
                <button
                  data-testid="clear-all-mobile-filters"
                  onClick={onClearAll}
                  className="cursor-pointer rounded-md border-none bg-transparent px-2 py-2 font-montserrat text-[13px] font-semibold text-[#CB2187] outline-none hover:bg-[#FFF7FC] focus-visible:ring-2 focus-visible:ring-[#CB2187]/30"
                >
                  Clear all
                </button>
                <button
                  data-testid="close-mobile-filters"
                  onClick={() => setOpen(false)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#FBE3F1] bg-[#FFF7FC] text-[#CB2187] outline-none transition-colors hover:border-[#CB2187]/30 focus-visible:ring-2 focus-visible:ring-[#CB2187]/30"
                  aria-label="Close filters"
                >
                  <X className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>

            {/* Scrollable filter content */}
            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide bg-white p-4">
              <FilterSidebar
                options={options}
                filters={filters}
                onFilterChange={onFilterChange}
                onClearAll={onClearAll}
                mobile
                total={total}
                hasSpecialOffers={hasSpecialOffers}
              />
            </div>

            {/* Sticky footer */}
            <div className="safe-area-bottom sticky bottom-0 z-20 flex-shrink-0 border-t border-[#FBE3F1] bg-white p-4 shadow-[0_-6px_20px_rgba(203,33,135,0.08)]">
              <button
                data-testid="apply-mobile-filters"
                onClick={() => setOpen(false)}
                className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border-none bg-[#CB2187] px-4 py-3 font-montserrat text-[15px] font-semibold tracking-[0.15px] text-white shadow-[0_6px_18px_rgba(203,33,135,0.24)] outline-none transition-all hover:bg-[#B51D78] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#CB2187]/30 focus-visible:ring-offset-2"
              >
                Show {total} results
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
