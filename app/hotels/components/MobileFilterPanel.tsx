"use client";
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal, X, ArrowDown, AlignRight } from 'lucide-react';
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
            className="relative flex items-center justify-center w-10 h-10 text-gray-700 cursor-pointer hover:bg-gray-50 rounded-full transition-colors"
          >
            <SlidersHorizontal size={18} />
            {total > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
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
              className="flex items-center justify-center w-10 h-10 text-gray-700 cursor-pointer hover:bg-gray-50 rounded-full transition-colors"
              aria-label="Sort results"
            >
              <ArrowDown size={15} />
              <AlignRight size={15} />
            </button>

            {showSortPopover && (
              <div
                ref={popoverRef}
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 overflow-hidden"
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
                        ? 'text-[#CB2187] font-semibold bg-pink-50'
                        : 'text-gray-700 hover:bg-gray-50'
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
          <div className="absolute inset-0 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <span className="font-bold text-xl tracking-tight text-gray-900">Filters</span>
              <button
                data-testid="close-mobile-filters"
                onClick={() => setOpen(false)}
                className="p-2 -mr-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 cursor-pointer border-none transition-colors"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable filter content — single FilterSidebar accordion */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4">
              <FilterSidebar
                options={options}
                filters={filters}
                onFilterChange={onFilterChange}
                onClearAll={onClearAll}
                showHeader={false}
                mobile
                total={total}
                hasSpecialOffers={hasSpecialOffers}
              />
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 z-20 safe-area-bottom flex-shrink-0">
              <button
                data-testid="apply-mobile-filters"
                onClick={() => setOpen(false)}
                className="w-full text-white font-bold py-3.5 rounded-2xl cursor-pointer border-none shadow-[0_4px_14px_0_rgba(203,33,135,0.39)] hover:shadow-[0_6px_20px_rgba(203,33,135,0.23)] active:scale-[0.98] transition-all text-[15px]"
                style={{ background: 'linear-gradient(135deg, #CB2187 0%, #ECAED3 100%)' }}
              >
                Show {total} results
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
