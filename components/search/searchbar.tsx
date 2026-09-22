"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, MapPin, Calendar, Moon, ChevronLeft, ChevronRight, Plane, ArrowLeft, X, Cross } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { FilterOption } from '@/types/homepage';
import { resolveAirportIdToIata, getAirportName, IATA_TO_ID } from '@/lib/mappings/airports';
import { useDebounce } from '@/hooks/useDebounce';
import {
  getDestinationLevel,
  getDestinationLabel,
  getDestinationBreadcrumb,
  makeDestinationSelection,
  encodeDestinationParam,
  decodeDestinationParam,
  type DestinationRow,
  type DestinationLevel,
} from '@/lib/mappings/destinations';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Fixed flexibility window for the "± days flexible" checkbox -- a plain
// boolean, not a user-adjustable pill selector.
const FLEX_DAYS = 3;

function resolveDepartureAirportName(rawId: string): { code: string; name: string } {
  const iata = resolveAirportIdToIata(rawId);
  const name = getAirportName(iata);
  return { code: iata, name };
}

const REGIONS = [
  "Any London",
  "Any Midland",
  "Any Scotland",
  "Any Eurostar",
  "Any Northern Ireland",
  "Any Ireland (South)",
  "Any East Anglia",
  "Any North East / Yorkshire",
  "Any North West",
  "Any South East",
  "Any South West/Wales"
];
const regionAirports: Record<string, string[]> = {
  "Any London": ["LCY", "LGW", "LHR", "LTN", "STN"],
  "Any Midland": ["BHX", "CVT", "DSA", "EMA", "HUY", "LBA"],
  "Any Scotland": ["ABZ", "DND", "EDI", "GLA", "PIK", "INV"],
  "Any Eurostar": [],
  "Any Northern Ireland": ["BHD", "BFS", "LDY"],
  "Any Ireland (South)": ["ORK", "DUB", "SNN"],
  "Any East Anglia": ["STN", "NWI"],
  "Any North East / Yorkshire": ["DSA", "HUY", "NCL", "MME"],
  "Any North West": ["BLK", "LBA", "LPL", "MAN"],
  "Any South East": ["JER", "LCY", "LGW", "LHR", "LTN", "SEN", "STN", "SOU", "MSE"],
  "Any South West/Wales": ["BOH", "BRS", "CWL", "EXT", "NQY", "PLY"],
};

const LEVEL_LABEL: Record<DestinationLevel, string> = {
  top_level: 'Continent',
  country: 'Country',
  region: 'Region',
  resort: 'Resort',
  city: 'City',
};

const LEVEL_BADGE_CLASS: Record<DestinationLevel, string> = {
  top_level: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  country: 'bg-amber-50 text-amber-600 border border-amber-100',
  region: 'bg-pink-50 text-pink-600 border border-pink-100',
  resort: 'bg-purple-50 text-purple-600 border border-purple-100',
  city: 'bg-sky-50 text-sky-600 border border-sky-100',
};

const FAVOURITE_SECTION_ORDER: DestinationLevel[] = ['top_level', 'country', 'region', 'resort', 'city'];

const FAVOURITE_SECTION_HEADING: Record<DestinationLevel, string> = {
  top_level: 'Continents',
  country: 'Countries',
  region: 'Regions',
  resort: 'Resorts',
  city: 'Cities',
};

type FavouriteSection = {
  level: DestinationLevel;
  heading: string;
  rows: DestinationRow[];
};

function groupFavouritesByLevel(rows: DestinationRow[]): FavouriteSection[] {
  const byLevel = new Map<DestinationLevel, DestinationRow[]>();
  for (const row of rows) {
    const level = getDestinationLevel(row) ?? 'city';
    if (!byLevel.has(level)) byLevel.set(level, []);
    byLevel.get(level)!.push(row);
  }
  for (const levelRows of byLevel.values()) {
    levelRows.sort((a, b) => getDestinationLabel(a).localeCompare(getDestinationLabel(b)));
  }
  return FAVOURITE_SECTION_ORDER
    .map((level) => ({ level, heading: FAVOURITE_SECTION_HEADING[level], rows: byLevel.get(level) || [] }))
    .filter((section) => section.rows.length > 0);
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function TravelDatePicker({
  testId, label, placeholder, value, startDate, endDate, onChangeRange, open, onToggle, onClose, compact, className = "flex-1", nights, isMobile, onChangeOpenDropdown, inlineMobile,
  activeDateTab, onDateTabChange, isFlexible, onFlexibleChange, selectedMonth, onSelectMonth
}: {
  testId: string;
  label: string;
  placeholder: string;
  value: string;
  startDate: Date | null;
  endDate: Date | null;
  onChangeRange: (start: Date | null, end: Date | null) => void;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  compact?: boolean;
  className?: string;
  nights: string;
  isMobile?: boolean;
  onChangeOpenDropdown?: (val: any) => void;
  inlineMobile?: boolean;
  activeDateTab: 'calendar' | 'month';
  onDateTabChange: (tab: 'calendar' | 'month') => void;
  isFlexible: boolean;
  onFlexibleChange: (val: boolean) => void;
  selectedMonth: { year: number; month: number } | null;
  onSelectMonth: (year: number, month: number) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mobileRef = useRef<HTMLDivElement | null>(null);
  const [calYear, setCalYear] = useState(() => (startDate || new Date()).getFullYear());
  const [calMonth, setCalMonth] = useState(() => (startDate || new Date()).getMonth());
  const [tempStart, setTempStart] = useState<Date | null>(startDate);
  const [tempEnd, setTempEnd] = useState<Date | null>(endDate);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target) || mobileRef.current?.contains(target)) return;
      onClose();
    };
    if (open) {
      document.addEventListener('mousedown', handler);
      document.addEventListener('touchstart', handler);
    }
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setTempStart(startDate);
      setTempEnd(endDate);
      if (startDate) {
        setCalYear(startDate.getFullYear());
        setCalMonth(startDate.getMonth());
      }
    }
  }, [open, startDate, endDate]);

  const calDays = getCalendarDays(calYear, calMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 3); // Tomorrow is the minimum selectable date
  const maxDate = new Date(today);
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  const isPrevDisabled = calYear < minDate.getFullYear() || (calYear === minDate.getFullYear() && calMonth <= minDate.getMonth());
  const isNextDisabled = calYear > maxDate.getFullYear() || (calYear === maxDate.getFullYear() && calMonth >= maxDate.getMonth());

  const prevMonth = () => {
    if (isPrevDisabled) return;
    if (calMonth === 0) {
      setCalYear(calYear - 1);
      setCalMonth(11);
    } else {
      setCalMonth(calMonth - 1);
    }
  };

  const nextMonth = () => {
    if (isNextDisabled) return;
    if (calMonth === 11) {
      setCalYear(calYear + 1);
      setCalMonth(0);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const clicked = new Date(calYear, calMonth, day);
    if (clicked < minDate || clicked > maxDate) return;

    const numNights = parseInt(nights, 10) || 7;
    setTempStart(clicked);
    const calculatedEnd = new Date(clicked);
    calculatedEnd.setDate(calculatedEnd.getDate() + numNights);
    setTempEnd(calculatedEnd);
    // Apply immediately (no Done button)
    onChangeRange(clicked, calculatedEnd);
  };

  const handleClear = () => {
    setTempStart(null);
    setTempEnd(null);
    onChangeRange(null, null);
  };

  const nightsCount = tempStart && tempEnd ? Math.round((tempEnd.getTime() - tempStart.getTime()) / (1000 * 3600 * 24)) : 0;
  const formatDateDisplay = (d: Date) => `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;

  const handleDateClickMobile = (day: number) => {
    const clicked = new Date(calYear, calMonth, day);
    if (clicked < minDate || clicked > maxDate) return;
    const numNights = parseInt(nights, 10) || 7;
    const calculatedEnd = new Date(clicked);
    calculatedEnd.setDate(calculatedEnd.getDate() + numNights);
    // Apply immediately on mobile
    onChangeRange(clicked, calculatedEnd);
    setTempStart(clicked);
    setTempEnd(calculatedEnd);
  };

  const calendarContent = (isMobileView: boolean) => (
    <>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          disabled={isPrevDisabled}
          onClick={prevMonth}
          className={`p-1 rounded-full border-none bg-transparent flex items-center justify-center transition-colors ${isPrevDisabled
            ? 'text-gray-200 cursor-not-allowed'
            : 'hover:bg-gray-100 cursor-pointer text-gray-600'
            }`}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-bold text-sm text-[#20152e]">
          {MONTH_NAMES[calMonth]} {calYear}
        </span>
        <button
          type="button"
          disabled={isNextDisabled}
          onClick={nextMonth}
          className={`p-1 rounded-full border-none bg-transparent flex items-center justify-center transition-colors ${isNextDisabled
            ? 'text-gray-200 cursor-not-allowed'
            : 'hover:bg-gray-100 cursor-pointer text-gray-600'
            }`}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday Names */}
      <div className="grid grid-cols-7 gap-y-1 text-center mb-1 text-[11px] font-bold text-gray-400">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <span key={d}>{d}</span>)}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {calDays.map((day, idx) => {
          if (day === null) return <span key={idx} />;
          const current = new Date(calYear, calMonth, day);
          const isOutOfRange = current < minDate || current > maxDate;
          const displayStart = isMobileView ? tempStart : tempStart;
          const displayEnd = isMobileView ? tempEnd : tempEnd;
          const isStart = displayStart && current.getTime() === displayStart.getTime();
          const isEnd = displayEnd && current.getTime() === displayEnd.getTime();
          const inRange = displayStart && displayEnd && current > displayStart && current < displayEnd;

          return (
            <div key={idx} className="relative flex justify-center py-0.5">
              <button
                type="button"
                disabled={isOutOfRange}
                onClick={() => isMobileView ? handleDateClickMobile(day) : handleDateClick(day)}
                className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs border-none transition-all ${isOutOfRange ? 'text-gray-300 cursor-not-allowed bg-transparent' :
                  isStart || isEnd ? 'bg-[#CB2187] text-white cursor-pointer shadow-sm shadow-black/10 scale-110' :
                    inRange ? 'bg-[#CB2187]/10 text-[#CB2187] cursor-pointer rounded-none w-full' :
                      'text-gray-700 hover:bg-gray-100 cursor-pointer bg-transparent'
                  }`}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );

  const monthTiles = (() => {
    const tiles: { year: number; month: number }[] = [];
    let cy = minDate.getFullYear();
    let cm = minDate.getMonth();
    const ly = maxDate.getFullYear();
    const lm = maxDate.getMonth();
    while (cy < ly || (cy === ly && cm <= lm)) {
      tiles.push({ year: cy, month: cm });
      cm += 1;
      if (cm > 11) { cm = 0; cy += 1; }
    }
    return tiles;
  })();

  const monthGridContent = () => (
    <div className="grid grid-cols-3 gap-2">
      {monthTiles.map(({ year, month }) => {
        const isSelected = !!selectedMonth && selectedMonth.year === year && selectedMonth.month === month;
        return (
          <button
            key={`${year}-${month}`}
            type="button"
            onClick={() => onSelectMonth(year, month)}
            className={`px-3 py-2.5 rounded-[12px] text-xs font-semibold text-center transition-all border border-solid cursor-pointer ${isSelected
              ? 'bg-[#CB2187] border-[#CB2187] text-white shadow-sm shadow-black/10'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-[#CB2187]/10 hover:border-[#CB2187]/30'
              }`}
          >
            {MONTH_NAMES[month].slice(0, 3)} {year}
          </button>
        );
      })}
    </div>
  );

  const dateTabsRow = () => (
    <div className="flex items-center gap-1.5 mb-4 bg-gray-100/80 rounded-full p-1">
      {(['calendar', 'month'] as const).map(tab => (
        <button
          key={tab}
          type="button"
          onClick={() => onDateTabChange(tab)}
          className={`flex-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all border-none cursor-pointer ${activeDateTab === tab ? 'bg-white text-[#CB2187] shadow-sm' : 'bg-transparent text-gray-500'
            }`}
        >
          {tab === 'calendar' ? 'Calendar' : 'Months'}
        </button>
      ))}
    </div>
  );

  const flexToggleRow = () => (
    <label className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={isFlexible}
        onChange={(e) => onFlexibleChange(e.target.checked)}
        className="w-4 h-4 rounded accent-[#CB2187] cursor-pointer"
      />
      <span className="text-xs font-semibold text-gray-600">± {FLEX_DAYS} days flexible</span>
    </label>
  );

  const dateTabBody = (isMobileView: boolean) => (
    <>
      {dateTabsRow()}
      {activeDateTab === 'month' ? monthGridContent() : (
        <>
          {calendarContent(isMobileView)}
          {flexToggleRow()}
        </>
      )}
    </>
  );

  if (inlineMobile) {
    const nightsCount = tempStart && tempEnd ? Math.round((tempEnd.getTime() - tempStart.getTime()) / (1000 * 3600 * 24)) : 0;
    return (
      <div className="w-full bg-white flex flex-col font-['Montserrat'] select-none">
        <div className="flex-grow overflow-y-auto min-h-0 bg-white">
          {dateTabBody(true)}
        </div>
        {/* Mobile Footer — Done */}
        <div className="pt-3 border-t border-gray-100 bg-white flex-shrink-0">
          <button
            type="button"
            onClick={() => { onChangeOpenDropdown?.(null); }}
            className="w-full text-white font-bold py-3.5 px-4 rounded-2xl text-[14px] bg-[#CB2187] cursor-pointer border-none"
          >
            Done ({activeDateTab === 'month' && selectedMonth
              ? `${MONTH_NAMES[selectedMonth.month]} ${selectedMonth.year}`
              : tempStart && tempEnd
                ? `${nightsCount} ${nightsCount === 1 ? 'Night' : 'Nights'}`
                : 'Choose dates'})
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative min-w-0 w-full ${className}`} data-testid={testId}>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center min-h-[52px] px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer group text-left border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-sm ${
          open
            ? 'border-[#CB2187] ring-2 ring-[#CB2187]/20'
            : 'border-gray-200/90 hover:border-gray-300'
        }`}
      >
        <div className={`w-9 h-9 rounded-full transition-all flex-shrink-0 flex items-center justify-center mr-2.5 ${
          open
            ? 'bg-[#CB2187] text-white'
            : 'bg-gray-50 text-slate-500 group-hover:bg-[#CB2187]/10 group-hover:text-[#CB2187]'
        }`}>
          <Calendar size={compact ? 15 : 16} />
        </div>
        <div className="flex-1 min-w-0">
          <label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5 cursor-pointer font-montserrat whitespace-nowrap truncate">
            {label}
          </label>
          <div className={`w-full bg-transparent border-none p-0 text-xs md:text-[13.5px] truncate font-semibold ${
            value ? 'text-gray-800' : 'text-gray-400 font-normal'
          }`}>
            {value || placeholder}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-300 flex-shrink-0 transition-transform duration-200 ml-1 group-hover:text-gray-400 ${
          open ? 'rotate-180 text-[#CB2187]' : ''
        }`} />
      </button>

      {open && (
        isMobile ? (
          createPortal(
            <div ref={mobileRef} className="fixed inset-0 z-[2100] bg-white flex flex-col font-['Montserrat'] select-none">
              {/* Mobile Header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 flex-shrink-0">
                <button type="button" onClick={() => onChangeOpenDropdown?.('airport')} className="p-1.5 -ml-1 text-gray-600">
                  <ArrowLeft size={20} />
                </button>
                <span className="font-bold text-[16px] text-gray-900">Travel Dates</span>
                <button type="button" onClick={onClose} className="p-1.5 -mr-1 text-gray-600">
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Calendar Body */}
              <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0 bg-white">
                {dateTabBody(true)}
              </div>

              {/* Mobile Footer — Next: Nights */}
              <div className="pt-3 px-4 pb-4 border-t border-gray-100 bg-white flex-shrink-0">
                <button
                  type="button"
                  onClick={() => { onClose(); onChangeOpenDropdown?.('nights'); }}
                  className="w-full text-white font-bold py-3 px-4 rounded-2xl text-[14px] bg-[#CB2187] cursor-pointer border-none"
                >
                  Select Duration ({activeDateTab === 'month' && selectedMonth
                    ? `${MONTH_NAMES[selectedMonth.month]} ${selectedMonth.year}`
                    : tempStart && tempEnd
                      ? `${nightsCount} ${nightsCount === 1 ? 'Night' : 'Nights'}`
                      : 'Choose dates first'})
                </button>
              </div>
            </div>,
            document.body
          )
        ) : (
          <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-white rounded-[16px] shadow-[0_20px_50px_rgba(30,12,26,0.18)] border border-gray-100 p-4 z-50 w-[320px] select-none">
            {dateTabBody(false)}
          </div>
        )
      )}
    </div>
  );
}

function DestinationsSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div
          key={i}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] bg-slate-50/50 border border-solid border-slate-100/80"
        >
          <div className="w-4 h-4 rounded-full bg-slate-200 flex-shrink-0"></div>
          <div className="h-3 bg-slate-200 rounded flex-1"></div>
          <div className="w-8 h-3.5 bg-slate-100 rounded flex-shrink-0"></div>
        </div>
      ))}
    </div>
  );
}

function AirportButton({ airport, isSelected, onClick }: { airport: { code: string; name: string }; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all border border-solid group ${isSelected
        ? 'bg-[#CB2187] border-[#CB2187] text-white shadow-sm shadow-black/10'
        : 'bg-white border-gray-200 text-gray-700 hover:bg-[#CB2187]/10 hover:border-[#CB2187]/30'
        } cursor-pointer`}
    >
      <Plane size={12} className={isSelected ? 'text-white' : 'text-slate-400 group-hover:text-[#CB2187]'} />
      <span className="flex-1 truncate">{airport.name}</span>
      {airport.code && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
          }`}>
          {airport.code}
        </span>
      )}
    </button>
  );
}

export default function SearchBar({
  initialQuery = '',
  initialDest = '',
  initialDealType = '',
  initialTravelDate = '',
  initialDateMax = '',
  initialNights = '7',
  initialDeparturePoints = '',
  compact = false,
  disablePrefill = false,
  onApply,
  isMobileEdit = false,
  onCloseMobileEdit,
  isSearchLoading = false,
}: {
  initialQuery?: string;
  initialDest?: string;
  initialDealType?: string;
  initialTravelDate?: string;
  initialDateMax?: string;
  initialNights?: string;
  initialDeparturePoints?: string;
  compact?: boolean;
  disablePrefill?: boolean;
  onApply?: (filters: any) => void;
  isMobileEdit?: boolean;
  onCloseMobileEdit?: () => void;
  // Real "search request in flight" signal from the parent's useSearch()
  // hook, where one exists (results page). Distinct from the local
  // `isSearching` state below, which tracks destination-autocomplete
  // staleness, not the hotel search submission.
  isSearchLoading?: boolean;
}) {
  const router = useRouter();
  const [activeMobileTab, setActiveMobileTab] = useState<'dest' | 'airport' | 'date' | 'nights' | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [isMobile, setIsMobile] = useState(() =>
    isMobileEdit && typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const [dest, setDest] = useState(initialDest);
  const [dealType, setDealType] = useState(initialDealType);

  const [nights, setNights] = useState(initialNights || '7');

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setDealType(initialDealType);
  }, [initialDealType]);

  useEffect(() => {
    setNights(initialNights || '7');
  }, [initialNights]);

  const getTomorrow = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 3); // Aligned with minDate (today + 3)
    return tomorrow;
  };

  const parseDateRangeText = (text: string): { start: Date | null; end: Date | null } => {
    if (!text) return { start: null, end: null };

    // Handle ISO date format YYYY-MM-DD (from URL dt param)
    if (/^\d{4}-\d{2}-\d{2}$/.test(text.trim())) {
      const [year, month, day] = text.trim().split('-').map(Number);
      return { start: new Date(year, month - 1, day), end: null };
    }

    // Normalize delimiters to "-"
    const normalized = text.replace(/[\u2013\u2014]/g, '-');
    const parts = normalized.split('-').map(p => p.trim());

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    const parsePart = (partStr: string): { day: number; monthIndex: number } | null => {
      const match = partStr.match(/(\d+)\s+([A-Za-z]+)/);
      if (!match) return null;
      const day = parseInt(match[1], 10);
      const monthStr = match[2].toLowerCase();
      const monthIndex = MONTH_NAMES.findIndex(m => m.toLowerCase().startsWith(monthStr));
      if (monthIndex === -1) return null;
      return { day, monthIndex };
    };

    if (parts.length === 2) {
      const startInfo = parsePart(parts[0]);
      const endInfo = parsePart(parts[1]);

      if (startInfo && endInfo) {
        let startYear = currentYear;
        let startDateObj = new Date(startYear, startInfo.monthIndex, startInfo.day);
        if (startDateObj < today) {
          startYear += 1;
          startDateObj = new Date(startYear, startInfo.monthIndex, startInfo.day);
        }

        let endYear = startYear;
        let endDateObj = new Date(endYear, endInfo.monthIndex, endInfo.day);
        if (endDateObj < startDateObj) {
          endYear += 1;
          endDateObj = new Date(endYear, endInfo.monthIndex, endInfo.day);
        }
        return { start: startDateObj, end: endDateObj };
      }
    } else if (parts.length === 1) {
      const startInfo = parsePart(parts[0]);
      if (startInfo) {
        let startYear = currentYear;
        let startDateObj = new Date(startYear, startInfo.monthIndex, startInfo.day);
        if (startDateObj < today) {
          startYear += 1;
          startDateObj = new Date(startYear, startInfo.monthIndex, startInfo.day);
        }
        return { start: startDateObj, end: null };
      }
    }

    return { start: null, end: null };
  };

  const [startDate, setStartDate] = useState<Date | null>(() => {
    if (initialTravelDate) {
      const parsed = parseDateRangeText(initialTravelDate);
      return parsed.start;
    }
    return null;
  });
  const [endDate, setEndDate] = useState<Date | null>(() => {
    if (initialTravelDate) {
      const parsed = parseDateRangeText(initialTravelDate);
      return parsed.end;
    }
    return null;
  });

  // Search date-range mode -- independent of startDate/endDate above, which
  // stay checkin/checkout+nights. 'calendar' + isFlexible=false (default) is
  // byte-identical to today's exact-date search.
  const [activeDateTab, setActiveDateTab] = useState<'calendar' | 'month'>('calendar');
  const [isFlexible, setIsFlexible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null);

  const formatDateRangeText = (start: Date | null, end: Date | null) => {
    if (start && end) {
      const sDay = start.getDate();
      const sM = MONTH_NAMES[start.getMonth()].slice(0, 3);
      const eDay = end.getDate();
      const eM = MONTH_NAMES[end.getMonth()].slice(0, 3);
      return `${sDay} ${sM} — ${eDay} ${eM}`;
    } else if (start) {
      const sDay = start.getDate();
      const sM = MONTH_NAMES[start.getMonth()].slice(0, 3);
      return `${sDay} ${sM}`;
    }
    return '';
  };

  const [travelDate, setTravelDate] = useState(() => initialTravelDate || '');

  useEffect(() => {
    let activeTravelDate = initialTravelDate;
    let activeNights = initialNights;

    if (!activeTravelDate && !disablePrefill) {
      try {
        const raw = sessionStorage.getItem('searchPrefill');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.date) {
            activeTravelDate = parsed.date;
          }
          if (parsed.nights) {
            activeNights = parsed.nights;
          }
        }
      } catch { }
    }

    const tomorrow = getTomorrow();
    if (activeTravelDate) {
      const parsed = parseDateRangeText(activeTravelDate);
      let finalStart = parsed.start;
      let calculatedEnd = parsed.end;

      if (finalStart && finalStart < tomorrow) {
        finalStart = tomorrow;
        calculatedEnd = null; // force recalculation based on nights
      }

      setStartDate(finalStart);
      if (finalStart && !calculatedEnd) {
        const numNights = parseInt(activeNights || '7', 10) || 7;
        calculatedEnd = new Date(finalStart);
        calculatedEnd.setDate(calculatedEnd.getDate() + numNights);
      }
      setEndDate(calculatedEnd);
      setTravelDate(formatDateRangeText(finalStart, calculatedEnd));
    } else {
      // No date provided — start empty so user must choose
      setStartDate(null);
      setEndDate(null);
      setTravelDate('');
    }
  }, [initialTravelDate, initialNights, disablePrefill]);

  // Re-derives the Calendar/Months tab + flexible checkbox from an incoming
  // date/date_max pair (URL params, a resumed searchId, or sessionStorage
  // prefill) -- so navigating from a month/flexible homepage search into
  // /hotels shows the same mode there instead of silently resetting to a
  // plain exact date. Runs after the effect above so it can override
  // startDate/endDate for the flexible case (effect order = commit order).
  useEffect(() => {
    let activeTravelDate = initialTravelDate;
    let activeDateMax = initialDateMax;

    if (!activeTravelDate && !disablePrefill) {
      try {
        const raw = sessionStorage.getItem('searchPrefill');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.date) activeTravelDate = parsed.date;
          if (parsed.date_max) activeDateMax = parsed.date_max;
        }
      } catch { }
    }

    const parseISO = (s: string): Date | null => {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((s || '').trim());
      if (!m) return null;
      return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    };
    const min = parseISO(activeTravelDate);
    const max = parseISO(activeDateMax);

    if (!min || !max) {
      setActiveDateTab('calendar');
      setIsFlexible(false);
      setSelectedMonth(null);
      return;
    }

    const lastDayOfMinMonth = new Date(min.getFullYear(), min.getMonth() + 1, 0);
    const isWholeMonth = min.getDate() === 1
      && max.getFullYear() === lastDayOfMinMonth.getFullYear()
      && max.getMonth() === lastDayOfMinMonth.getMonth()
      && max.getDate() === lastDayOfMinMonth.getDate();

    if (isWholeMonth) {
      setActiveDateTab('month');
      setSelectedMonth({ year: min.getFullYear(), month: min.getMonth() });
      setIsFlexible(false);
    } else {
      // Flexible window -- re-center the calendar tab on the midpoint of
      // the range (reconstructs the originally picked date in the common,
      // unclamped case).
      const mid = new Date(min.getTime() + (max.getTime() - min.getTime()) / 2);
      mid.setHours(0, 0, 0, 0);
      setActiveDateTab('calendar');
      setIsFlexible(true);
      setSelectedMonth(null);
      setStartDate(mid);
      const numNights = parseInt(initialNights || '7', 10) || 7;
      const midEnd = new Date(mid);
      midEnd.setDate(midEnd.getDate() + numNights);
      setEndDate(midEnd);
      setTravelDate(formatDateRangeText(mid, midEnd));
    }
  }, [initialTravelDate, initialDateMax, initialNights, disablePrefill]);

  useEffect(() => {
    // Always prefer sessionStorage nights over the hard-coded default '7'.
    // The results page passes an explicit non-default value from URL params.
    let activeNights = (initialNights && initialNights !== '7') ? initialNights : '';
    if (!activeNights && !disablePrefill) {
      try {
        const raw = sessionStorage.getItem('searchPrefill');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.nights) {
            activeNights = parsed.nights;
          }
        }
      } catch { }
    }
    setNights(activeNights || initialNights || '7');
  }, [initialNights, disablePrefill]);
  const [openDropdown, setOpenDropdown] = useState<'dest' | 'airport' | 'date' | 'nights' | null>(null);
  const [destinationsData, setDestinationsData] = useState<DestinationRow[]>([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(true);
  const [destinationSearch, setDestinationSearch] = useState('');
  const [destSearchTouched, setDestSearchTouched] = useState(false);
  const [destinationSearchDisplay, setDestinationSearchDisplay] = useState('');
  const [selectedDestinationObj, setSelectedDestinationObj] = useState<DestinationRow | null>(null);
  const [airportSearch, setAirportSearch] = useState('');
  const [selectedAirports, setSelectedAirports] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ dest?: string; airports?: string }>({});

  // Ref container for outside clicks
  const destRef = useRef<HTMLDivElement>(null);
  const airportRef = useRef<HTMLDivElement>(null);
  const nightsRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const destButtonInputRef = useRef<HTMLInputElement>(null);
  const destSubPageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isMobile && openDropdown === 'dest') {
      const id = requestAnimationFrame(() => {
        destButtonInputRef.current?.focus();
        destButtonInputRef.current?.select();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [openDropdown, isMobile]);

  useEffect(() => {
    if (isMobile && isMobileEdit && activeMobileTab === 'dest') {
      const id = requestAnimationFrame(() => {
        destSubPageInputRef.current?.focus();
        destSubPageInputRef.current?.select();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [isMobile, isMobileEdit, activeMobileTab]);

  useEffect(() => {
    setIsLoadingDestinations(true);
    fetch('/api/destinations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDestinationsData(data);
        } else {
          console.error("Fetched destinations data is not an array:", data);
          setDestinationsData([]);
        }
        setIsLoadingDestinations(false);
      })
      .catch(err => {
        console.error("Failed to fetch destinations:", err);
        setDestinationsData([]);
        setIsLoadingDestinations(false);
      });
  }, []);

  // Sync initial parameters
  useEffect(() => {
    let activeDest = initialDest;
    let prefillLabel = '';

    if (!disablePrefill) {
      try {
        const raw = sessionStorage.getItem('searchPrefill');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (!activeDest && parsed.dest) {
            activeDest = parsed.dest;
          }
          if (parsed.dest && parsed.dest === activeDest && parsed.destinationLabel) {
            prefillLabel = parsed.destinationLabel;
          }
        }
      } catch { }
    }

    if (activeDest) {
      setDest(activeDest);
      setDestinationSearchDisplay(prefillLabel);
      const sel = decodeDestinationParam(activeDest);
      if (sel) {
        let cancelled = false;
        fetch(`/api/destinations?id=${sel.destination_id}`)
          .then(res => res.json())
          .then((match: DestinationRow | null) => {
            if (cancelled || !match) return;
            setDestinationSearchDisplay(getDestinationLabel(match));
            setSelectedDestinationObj(match);
          })
          .catch(() => { });
        return () => { cancelled = true; };
      }
    } else {
      setDest('');
      setDestinationSearchDisplay('');
      setSelectedDestinationObj(null);
    }
  }, [initialDest, disablePrefill]);

  useEffect(() => {
    if (initialDeparturePoints) {
      const codes = initialDeparturePoints.split(',').map(resolveAirportIdToIata).filter(Boolean);
      setSelectedAirports(codes);
    } else {
      setSelectedAirports([]);
      if (!disablePrefill) {
        try {
          const raw = sessionStorage.getItem('searchPrefill');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.airports && Array.isArray(parsed.airports)) {
              setSelectedAirports(parsed.airports);
            }
          }
        } catch { }
      }
    }
  }, [initialDeparturePoints, disablePrefill]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (mobileDropdownRef.current && mobileDropdownRef.current.contains(target)) return;
      if (destRef.current && !destRef.current.contains(target)) {
        if (openDropdown === 'dest') setOpenDropdown(null);
      }
      if (airportRef.current && !airportRef.current.contains(target)) {
        if (openDropdown === 'airport') setOpenDropdown(null);
      }
      if (nightsRef.current && !nightsRef.current.contains(target)) {
        if (openDropdown === 'nights') setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [openDropdown]);

  const favouriteDestinations = useMemo(
    () => destinationsData.filter(r => r.is_active && r.favourites),
    [destinationsData]
  );
  const favouriteSections = useMemo(
    () => groupFavouritesByLevel(favouriteDestinations),
    [favouriteDestinations]
  );

  const debouncedDestinationSearch = useDebounce(destinationSearch, 300);
  const [searchResults, setSearchResults] = useState<DestinationRow[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const query = debouncedDestinationSearch.trim();
    if (!destSearchTouched || !query) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    fetch(`/api/destinations?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        setSearchResults(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        if (cancelled) return;
        console.error("Destination search failed:", err);
        setSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });
    return () => { cancelled = true; };
  }, [debouncedDestinationSearch, destSearchTouched]);
  const availableAirports = useMemo(() => {
    if (!selectedDestinationObj) return [];
    const rawIds = (selectedDestinationObj.from_airports || '').split(',').map(c => c.trim()).filter(Boolean);
    return rawIds.map(resolveDepartureAirportName);
  }, [selectedDestinationObj]);
  const sortedAirports = useMemo(() => {
    const airportsMap = new Map<string, string>(); // code -> name
    Object.keys(IATA_TO_ID).forEach(code => airportsMap.set(code, getAirportName(code)));

    destinationsData.forEach(row => {
      (row.from_airports || '').split(',').map(c => c.trim()).filter(Boolean).forEach(rawId => {
        const { code, name } = resolveDepartureAirportName(rawId);
        if (code && name) airportsMap.set(code, name);
      });
    });

    return Array.from(airportsMap, ([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [destinationsData]);
  const getAirportsForRegion = (region: string) => {
    const members = regionAirports[region] || [];
    if (!selectedDestinationObj) return members;
    const destinationAirportCodes = new Set(availableAirports.map(a => a.code));
    return members.filter(code => destinationAirportCodes.has(code));
  };
  const isRegionSelected = (region: string) => {
    const airports = getAirportsForRegion(region);
    return airports.length > 0 && airports.every(a => selectedAirports.includes(a));
  };
  const toggleRegion = (region: string) => {
    const airports = getAirportsForRegion(region);
    if (isRegionSelected(region)) {
      setSelectedAirports(sa => sa.filter(a => !airports.includes(a)));
    } else {
      setSelectedAirports(sa => Array.from(new Set([...sa, ...airports])));
    }
  };
  const toggleAirport = (a: string) => {
    setSelectedAirports(prev => {
      const isSelected = prev.includes(a);
      const next = isSelected ? prev.filter(x => x !== a) : [...prev, a];
      if (next.length > 0) {
        setValidationErrors(prev => ({ ...prev, airports: undefined }));
      }
      return next;
    });
  };
  const selectDestination = (row: DestinationRow, opts: { openAirportNext?: boolean } = {}) => {
    if (selectedDestinationObj?.destination_id !== row.destination_id) {
      setSelectedAirports([]);
    }
    setDest(encodeDestinationParam(makeDestinationSelection(row)));
    setDestinationSearchDisplay(getDestinationLabel(row));
    setSelectedDestinationObj(row);
    setDestinationSearch('');
    setValidationErrors(prev => ({ ...prev, dest: undefined }));
    if (isMobileEdit) {
      setActiveMobileTab(null);
    } else {
      setOpenDropdown(opts.openAirportNext && isMobile ? 'airport' : null);
    }
  };
  const handleNightsChange = (val: string) => {
    setNights(val);
    const numNights = parseInt(val, 10);
    if (!isNaN(numNights) && numNights > 0) {
      const currentStart = startDate || getTomorrow();
      if (!startDate) setStartDate(currentStart);
      const newEnd = new Date(currentStart);
      newEnd.setDate(newEnd.getDate() + numNights);
      setEndDate(newEnd);
      setTravelDate(formatDateRangeText(currentStart, newEnd));
    }
  };
  const handleCalendarRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      const calcNights = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      setNights(String(calcNights));
      setTravelDate(formatDateRangeText(start, end));
    } else if (start) {
      setTravelDate(formatDateRangeText(start, null));
    } else {
      setTravelDate('');
    }
  };

  const handleSelectMonth = (year: number, month: number) => {
    setSelectedMonth({ year, month });
  };

  const clampToSearchWindow = (d: Date): Date => {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const min = new Date(t); min.setDate(min.getDate() + 3);
    const max = new Date(t); max.setFullYear(max.getFullYear() + 1);
    if (d < min) return min;
    if (d > max) return max;
    return d;
  };
  const toISODate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Resolves the month tab / flexible checkbox into an ISO {dateMin, dateMax}
  // pair for the search request. Both null for the default exact-date case
  // -- identical to today's behavior.
  const computeSearchDateRange = (): { dateMin: string | null; dateMax: string | null } => {
    if (activeDateTab === 'month' && selectedMonth) {
      const first = clampToSearchWindow(new Date(selectedMonth.year, selectedMonth.month, 1));
      const last = clampToSearchWindow(new Date(selectedMonth.year, selectedMonth.month + 1, 0));
      return { dateMin: toISODate(first), dateMax: toISODate(last) };
    }
    if (isFlexible && startDate) {
      const min = clampToSearchWindow(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - FLEX_DAYS));
      const max = clampToSearchWindow(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + FLEX_DAYS));
      return { dateMin: toISODate(min), dateMax: toISODate(max) };
    }
    return { dateMin: null, dateMax: null };
  };

  // Closed-state pill label -- distinct from travelDate (checkin—checkout
  // display) for month/flexible modes, so those don't misread as a fixed
  // check-in/checkout pair.
  const dateRangeLabel = useMemo(() => {
    if (activeDateTab === 'month' && selectedMonth) {
      return `${MONTH_NAMES[selectedMonth.month]} ${selectedMonth.year}`;
    }
    if (isFlexible && startDate) {
      const d = startDate.getDate();
      const m = MONTH_NAMES[startDate.getMonth()].slice(0, 3);
      return `${d} ${m} ± ${FLEX_DAYS} days`;
    }
    return travelDate;
  }, [activeDateTab, selectedMonth, isFlexible, startDate, travelDate]);

  const nightOptions = useMemo((): FilterOption[] => [
    { value: '2', label: '2 Nights' },
    { value: '3', label: '3 Nights' },
    { value: '4', label: '4 Nights' },
    { value: '5', label: '5 Nights' },
    { value: '7', label: '7 Nights' },
    { value: '10', label: '10 Nights' },
    { value: '11', label: '11 Nights' },
    { value: '14', label: '14 Nights' },
  ], []);

  // Search-button double-submit guard. submitLockRef is checked/set
  // synchronously (a useState alone isn't visible until the next render, so
  // a true rapid double-click could pass a state-only check twice).
  // isSubmitting drives the visible disabled/spinner state; it hands off to
  // the real isSearchLoading prop (below) once an actual fetch starts, and
  // otherwise self-clears via the timeout so the button can never get
  // stuck disabled.
  const submitLockRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isSearchLoading) {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  }, [isSearchLoading]);

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (submitLockRef.current) return;
    let effectiveDest = dest;
    let effectiveDestinationObj = selectedDestinationObj;
    if (destSearchTouched && destinationSearch.trim()) {
      const resultsAreStale = isSearching || destinationSearch !== debouncedDestinationSearch;
      if (!resultsAreStale && searchResults.length === 1) {
        effectiveDestinationObj = searchResults[0];
        effectiveDest = encodeDestinationParam(makeDestinationSelection(searchResults[0]));
      } else {
        effectiveDestinationObj = null;
        effectiveDest = '';
      }
    }
    const selection = effectiveDestinationObj
      ? makeDestinationSelection(effectiveDestinationObj)
      : decodeDestinationParam(effectiveDest);

    const errors: { dest?: string } = {};
    const hasDestination = !!selection;
    if (!hasDestination) errors.dest = 'Please select a destination from the list';
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setOpenDropdown('dest');
      setActiveMobileTab('dest');
      return;
    }
    setValidationErrors({});

    submitLockRef.current = true;
    setIsSubmitting(true);
    setTimeout(() => {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }, 1200);

    const q = query || initialQuery || '';
    const params = new URLSearchParams();
    if (q) params.set('q', q);

    if (selection) {
      params.set('did', encodeDestinationParam(selection));
      setValidationErrors(prev => ({ ...prev, dest: undefined }));
    }

    const DEFAULT_LONDON_AIRPORTS = ['LCY', 'LGW', 'LHR', 'LTN', 'STN'];

    const effectiveAirports = selectedAirports.length > 0 ? selectedAirports : DEFAULT_LONDON_AIRPORTS;
    const departureAirports = effectiveAirports;

    if (departureAirports.length > 0) {
      params.set('departurePoints', departureAirports.join(','));
    }

    // Month tab / flexible checkbox resolve to an explicit ISO {dateMin,
    // dateMax} pair -- both null in the default exact-date case.
    const { dateMin: rangeDateMin, dateMax: rangeDateMax } = computeSearchDateRange();

    // If user didn't select a date, fall back to tomorrow as default.
    // Always ISO here (never the "15 Oct — 22 Oct" display text) -- a
    // non-ISO date in the URL gets silently normalized to ISO by
    // app/hotels/page.tsx's own dateToISO()+replaceState(), which Next's
    // router then resyncs into useSearchFilters, changing filters.date and
    // triggering a second, genuinely-separate search a few hundred ms
    // after the first. Emitting ISO from the start keeps the URL canonical
    // from the first navigation, so that resync is a no-op.
    const effectiveTravelDate = rangeDateMin
      || (startDate ? toISODate(startDate) : null)
      || toISODate(getTomorrow());

    if (effectiveTravelDate) params.set('date', effectiveTravelDate);
    if (rangeDateMax) params.set('date_max', rangeDateMax);
    if (nights) params.set('nights', nights);
    params.set('sort', 'best');

    try {
      sessionStorage.setItem('searchPrefill', JSON.stringify({
        q,
        dest: params.get('did') || '',
        destinationLabel: effectiveDestinationObj ? getDestinationLabel(effectiveDestinationObj) : '',
        airports: effectiveAirports,
        date: effectiveTravelDate,
        date_max: rangeDateMax,
        nights
      }));
    } catch { }

    const filters = {
      q,
      destinations: selection ? [selection] : [],
      holiday_types: dealType ? [dealType] : [],
      date: effectiveTravelDate,
      date_max: rangeDateMax,
      nights,
      departurePoints: effectiveAirports,
      departure_airports: departureAirports,
      sort: 'best',
    };

    if (typeof onApply === 'function') {
      onApply(filters);
      return;
    }

    router.push('/hotels?' + params.toString());
  };


  const renderDestinationsDropdownContent = () => {
    if (isLoadingDestinations) {
      return (
        <div className="space-y-4 px-5 py-2 animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-3.5 bg-slate-200 rounded-full"></span>
            <span className="w-24 h-3.5 bg-slate-200 rounded"></span>
          </div>
          <DestinationsSkeletonGrid />
        </div>
      );
    }
    if (destSearchTouched && destinationSearch.trim()) {
      if (isSearching) {
        return (
          <div className="space-y-4 px-5 py-2 animate-pulse">
            <DestinationsSkeletonGrid />
          </div>
        );
      }
      if (searchResults.length > 0) {
        return (
          <div className="space-y-1 px-3">
            {searchResults.map(d => {
              const isSelected = selectedDestinationObj?.destination_id === d.destination_id;
              const level = getDestinationLevel(d);
              const label = getDestinationLabel(d);
              const breadcrumb = getDestinationBreadcrumb(d);
              return (
                <button
                  key={d.destination_id}
                  type="button"
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-[13px] transition-all flex items-center gap-3 cursor-pointer group outline-none ${
                    isSelected
                      ? 'bg-pink-50/90 font-semibold text-[#CB2187] border border-pink-200/60'
                      : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                  }`}
                  onClick={() => selectDestination(d)}
                >
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold block truncate">
                        {label}
                      </span>
                      {level && (
                        <span className={`text-[8px] font-extrabold px-1 py-0.5 rounded-full uppercase tracking-wider ${LEVEL_BADGE_CLASS[level]}`}>
                          {LEVEL_LABEL[level]}
                        </span>
                      )}
                    </div>
                    {breadcrumb && (
                      <span className="text-[10px] text-gray-400 block truncate mt-0.5">
                        {breadcrumb}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        );
      }
      return <p className="text-sm text-gray-500 px-3 py-3">No destinations found matching &quot;{destinationSearch}&quot;.</p>;
    }

    return (
      <div className="space-y-2 px-3">
        {favouriteSections.length > 0 && (
          <div className="mb-1 pb-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-3.5 bg-[#CB2187] rounded-full"></span>
              <span className="text-[11px] font-extrabold text-[#CB2187] uppercase tracking-wider font-montserrat">
                Popular Destinations
              </span>
            </div>
            <div className="space-y-4">
              {favouriteSections.map(section => (
                <div key={section.level}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {section.heading}
                  </p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {section.rows.map(row => {
                      const isSelected = selectedDestinationObj?.destination_id === row.destination_id;
                      const label = getDestinationLabel(row);
                      return (
                        <button
                          key={row.destination_id}
                          type="button"
                          className={`flex items-center gap-2.5 text-left px-3 py-2.5 rounded-[12px] text-xs font-semibold transition-all border border-solid group ${isSelected
                            ? 'bg-[#CB2187] border-[#CB2187] text-white shadow-sm shadow-black/10'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-[#CB2187]/10 hover:border-[#CB2187]/30'
                            } cursor-pointer`}
                          onClick={() => selectDestination(row, { openAirportNext: true })}
                        >
                          <MapPin size={12} className={isSelected ? 'text-white' : 'text-slate-400 group-hover:text-[#CB2187]'} />
                          <span className="flex-1 truncate">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAirportsDropdownContent = () => {
    const searchLower = airportSearch.trim().toLowerCase();
    const matchedAvailable = availableAirports.filter(a => a.name.toLowerCase().includes(searchLower) || a.code.toLowerCase().includes(searchLower));
    const availableCodesSet = new Set(matchedAvailable.map(a => a.code));
    const matchedOther = selectedDestinationObj
      ? []
      : sortedAirports.filter(a => (a.name.toLowerCase().includes(searchLower) || a.code.toLowerCase().includes(searchLower)) && !availableCodesSet.has(a.code));

    if (searchLower) {
      if (matchedAvailable.length === 0 && matchedOther.length === 0) {
        return <p className="text-sm text-gray-500 py-3 px-1">No airports found matching &quot;{airportSearch}&quot;.</p>;
      }

      return (
        <div className="space-y-4 px-1">
          {matchedAvailable.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold text-[#CB2187] uppercase tracking-wider mb-2.5">
                Available Airports for Destination
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {matchedAvailable.map(a => (
                  <AirportButton key={a.code} airport={a} isSelected={selectedAirports.includes(a.code)} onClick={() => toggleAirport(a.code)} />
                ))}
              </div>
            </div>
          )}

          {matchedOther.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2.5">
                {matchedAvailable.length > 0 ? "Other Airports" : "Search Results"}
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {matchedOther.map(a => (
                  <AirportButton key={a.code} airport={a} isSelected={selectedAirports.includes(a.code)} onClick={() => toggleAirport(a.code)} />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    const destinationName = selectedDestinationObj ? getDestinationLabel(selectedDestinationObj) : undefined;
    const destinationAirportCodes = new Set(availableAirports.map(a => a.code));

    // A region (e.g. "Any London") can add airports the destination doesn't actually
    // fly from — those wouldn't show up in availableAirports, leaving no button to
    // deselect them. Append any selected-but-not-listed airports so they stay clickable.
    const extraSelectedAirports = selectedDestinationObj
      ? selectedAirports
        .filter(code => !destinationAirportCodes.has(code))
        .map(code => ({ code, name: getAirportName(code) }))
      : [];

    const airportsToShow = selectedDestinationObj
      ? [...availableAirports, ...extraSelectedAirports]
      : sortedAirports;

    // Authoritative from the destination's own from_airports_group_ids
    // (backend-driven) rather than guessing via airport-name overlap — only
    // the regions this destination actually lists are shown, everything
    // else is hidden. Falls back to all 11 regions when nothing's selected.
    const visibleRegions = selectedDestinationObj
      ? Array.from(new Set(
          (selectedDestinationObj.from_airports_group_ids || '')
            .split(',')
            .map(id => id.trim())
            .filter(Boolean)
            .map(id => getAirportName(id))
            .filter(name => name in regionAirports)
        ))
      : REGIONS;

    return (
      <div className="px-1 space-y-4">
        <div>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2.5">Quick Region Select</p>
          {visibleRegions.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">No regions available for this destination.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {visibleRegions.map(region => {
                // Strictly reflects actual selection state — no implicit
                // default highlight (e.g. "Any London" used to show
                // selected even with zero airports actually chosen, since
                // handleSubmit falls back to London airports by default;
                // that's a submit-time fallback, not a real selection, so
                // it shouldn't visually claim to be one).
                const isSelected = isRegionSelected(region);
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => toggleRegion(region)}
                    className={`flex items-center gap-2 text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all border border-solid group ${isSelected
                      ? 'bg-[#CB2187] border-[#CB2187] text-white shadow-sm shadow-black/10'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-[#CB2187]/10 hover:border-[#CB2187]/30'
                      } cursor-pointer`}
                  >
                    <MapPin size={12} className={isSelected ? 'text-white' : 'text-slate-400 group-hover:text-[#CB2187]'} />
                    <span className="flex-1 truncate">{region}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-solid border-gray-100 pt-4">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-3">
            {destinationName ? `Airports for ${destinationName}` : 'All Airports'}
          </p>
          {airportsToShow.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">No specific airports listed for this destination — all airports available.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {airportsToShow.map(a => (
                <AirportButton key={a.code} airport={a} isSelected={selectedAirports.includes(a.code)} onClick={() => toggleAirport(a.code)} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isMobile && isMobileEdit) {
    if (activeMobileTab === null) {
      return (
        <div className="fixed inset-0 h-[100dvh] w-screen bg-white z-[2000] overflow-y-auto overscroll-contain flex flex-col font-['Montserrat'] select-none">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100/80 flex-shrink-0 bg-white sticky top-0 z-20">
            <button
              type="button"
              onClick={onCloseMobileEdit}
              className="p-1.5 -ml-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={22} className="text-[#CB2187]" />
            </button>
            <div className="flex flex-col items-center text-center">
              <span className="font-bold text-[17px] text-gray-900 leading-tight">Edit Search</span>
              <span className="text-xs text-gray-400 font-medium">Update your search details</span>
            </div>
            <button
              type="button"
              onClick={onCloseMobileEdit}
              className="p-1.5 -mr-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X size={22} className="text-[#CB2187]" />
            </button>
          </div>

          {/* Menu Options */}
          <div className="flex-grow p-4 space-y-3.5">
            {[
              { id: 'dest', label: 'Destination', val: destinationSearchDisplay || 'Select Destinations', icon: MapPin },
              { id: 'airport', label: 'Departure Airports', val: selectedAirports.length > 0 ? selectedAirports.map(getAirportName).join(', ') : 'All Airports', icon: Plane },
              { id: 'date', label: 'Travel Dates', val: dateRangeLabel || 'Anytime', icon: Calendar },
              { id: 'nights', label: 'Nights', val: nights ? `${nights} Night${nights === '1' ? '' : 's'}` : 'Any Duration', icon: Moon },
            ].map(item => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveMobileTab(item.id as any);
                    // Prefill the sub-page header input with the current
                    // selection (text gets selected by the focus effect
                    // above) so typing immediately replaces it — mirrors
                    // the desktop button's behavior.
                    if (item.id === 'dest') {
                      setDestinationSearch(destinationSearchDisplay || '');
                      setDestSearchTouched(false);
                    }
                  }}
                  className="w-full flex items-center px-4 py-4 bg-slate-50/70 hover:bg-slate-50 border border-solid border-slate-100 rounded-2xl shadow-sm transition-all active:scale-[0.99] cursor-pointer text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#CB2187]/8 text-[#CB2187] flex items-center justify-center mr-3.5 flex-shrink-0 group-hover:bg-[#CB2187] group-hover:text-white transition-all duration-200">
                    <ItemIcon size={18} />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      {item.label}
                    </span>
                    <span className="text-[13.5px] font-semibold text-slate-700 truncate block mt-0.5">
                      {item.val}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-[#CB2187] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Footer Search Button */}
          <div className="pt-3 px-4 pb-4 border-t border-gray-100 bg-white flex-shrink-0 sticky bottom-0 z-20">
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting || isSearchLoading}
              className="w-full text-white font-bold py-3.5 px-4 rounded-2xl text-[15px] bg-[#CB2187] cursor-pointer border-none shadow-[0_4px_12px_rgba(203,33,135,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isSubmitting || isSearchLoading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent align-middle" aria-label="Loading" />
              ) : (
                <Search size={18} />
              )}
              <span>Search</span>
            </button>
          </div>
        </div>
      );
    }

    // Sub-page layout
    return (
      <div className="fixed inset-0 h-[100dvh] w-screen bg-white z-[2000] overflow-y-auto overscroll-contain flex flex-col font-['Montserrat'] select-none">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100/80 flex-shrink-0 bg-white sticky top-0 z-20">
          <button
            type="button"
            onClick={() => setActiveMobileTab(null)}
            className="p-1.5 -ml-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={22} className="text-[#CB2187]" />
          </button>
          {activeMobileTab === 'dest' ? (
            <div className="relative flex-1 mx-3">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                ref={destSubPageInputRef}
                value={destinationSearch}
                onChange={(e) => { setDestinationSearch(e.target.value); setDestSearchTouched(true); }}
                placeholder="Search destinations..."
                className="w-full pl-9 pr-3 py-2 text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-full outline-none focus:bg-white focus:border-[#CB2187] focus:ring-2 focus:ring-[#CB2187]/20 transition-all placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>
          ) : (
            <span className="font-bold text-[17px] text-gray-900">
              {activeMobileTab === 'airport' && 'Departure Airports'}
              {activeMobileTab === 'date' && 'Travel Dates'}
              {activeMobileTab === 'nights' && 'Select Duration'}
            </span>
          )}
          <button
            type="button"
            onClick={() => setActiveMobileTab(null)}
            className="text-[#CB2187] font-bold text-[15px] cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none"
          >
            Done
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0 bg-white">
          {activeMobileTab === 'dest' && (
            <div className="flex flex-col h-full">
              {validationErrors.dest && (
                <div className="mb-3 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium flex-shrink-0">
                  {validationErrors.dest}
                </div>
              )}
              {renderDestinationsDropdownContent()}
            </div>
          )}

          {activeMobileTab === 'airport' && (
            <div className="flex flex-col h-full space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide">From Airport</p>
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={airportSearch}
                    onChange={(e) => setAirportSearch(e.target.value)}
                    placeholder="Search departure airports by name or code..."
                    className="w-full pl-11 pr-4 py-3.5 text-sm border border-solid border-gray-200/80 rounded-2xl outline-none bg-[#f8f9fa] focus:bg-white focus:border-[#CB2187] focus:ring-2 focus:ring-[#CB2187]/20 transition-all font-medium text-gray-700"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center px-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedAirports([])}
                  className="text-[#CB2187] text-xs font-bold bg-transparent border-none cursor-pointer"
                >
                  Clear Selection
                </button>
                <span className="text-gray-400 text-xs font-medium">{selectedAirports.length} selected</span>
              </div>
              <div className="flex-grow overflow-y-auto min-h-0">
                {renderAirportsDropdownContent()}
              </div>
              {/* Done Button */}
              <div className="pt-3 border-t border-gray-100 bg-white flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveMobileTab(null)}
                  className="w-full text-white font-bold py-3.5 px-4 rounded-2xl text-[14px] bg-[#CB2187] cursor-pointer border-none"
                >
                  Done ({selectedAirports.length > 0 ? `${selectedAirports.length} selected` : 'All Airports'})
                </button>
              </div>
            </div>
          )}

          {activeMobileTab === 'date' && (
            <div className="flex flex-col h-full">
              <TravelDatePicker
                testId="search-traveldate"
                label="Travel Dates"
                placeholder="Anytime"
                value={dateRangeLabel}
                startDate={startDate}
                endDate={endDate}
                onChangeRange={handleCalendarRangeChange}
                open={true}
                onToggle={() => { }}
                onClose={() => { }}
                compact={compact}
                nights={nights}
                isMobile={true}
                inlineMobile={true}
                onChangeOpenDropdown={setActiveMobileTab as any}
                activeDateTab={activeDateTab}
                onDateTabChange={setActiveDateTab}
                isFlexible={isFlexible}
                onFlexibleChange={setIsFlexible}
                selectedMonth={selectedMonth}
                onSelectMonth={handleSelectMonth}
              />
            </div>
          )}

          {activeMobileTab === 'nights' && (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-3 overflow-y-scroll pb-8 [scrollbar-width:thin] [scrollbar-color:#c4c4c4_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
              {nightOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    handleNightsChange(opt.value);
                    setActiveMobileTab(null);
                  }}
                  className={`w-full text-left px-5 py-4 text-[14px] rounded-2xl border cursor-pointer transition-all ${opt.value === nights
                    ? 'bg-pink-50 border-[#CB2187] text-[#CB2187] font-bold'
                    : 'bg-transparent text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-testid={`search-bar-${compact ? 'compact' : 'hero'}`} className="w-full max-w-full">
      <div className="relative z-10 flex w-full flex-col items-stretch justify-between gap-2 p-1 md:gap-2 sm:p-2 lg:flex-row lg:items-center">
        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-row items-stretch w-full gap-2 lg:gap-2 flex-1 min-w-0">

          {/* Destination Dropdown */}
          <div ref={destRef} className="min-w-0 w-full lg:flex-[1.1] flex-1 relative" data-testid="search-dest">
            {!isMobile && openDropdown === 'dest' ? (
              <div className="w-full flex items-center min-h-[52px] px-3 py-1.5 rounded-xl border border-[#CB2187] ring-2 ring-[#CB2187]/20 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center mr-2.5 bg-[#CB2187] text-white">
                  <Search size={compact ? 15 : 16} />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wider block mb-0.5 font-montserrat whitespace-nowrap truncate text-gray-400">
                    Destination
                  </label>
                  <input
                    ref={destButtonInputRef}
                    value={destinationSearch}
                    onChange={(e) => { setDestinationSearch(e.target.value); setDestSearchTouched(true); }}
                    placeholder="Search destinations by name, region or country..."
                    className="w-full bg-transparent border-none p-0 text-xs md:text-[13.5px] outline-none text-gray-800 font-semibold placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(null)}
                  className="flex-shrink-0 ml-1 p-0.5 border-none bg-transparent cursor-pointer"
                  aria-label="Close destination search"
                >
                  <ChevronDown className="w-4 h-4 rotate-180 text-[#CB2187]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const next = openDropdown === 'dest' ? null : 'dest';
                  setOpenDropdown(next);
                  // Prefill with the current selection (text gets selected by
                  // the focus effect above) so typing immediately replaces
                  // it; stays empty when nothing's selected yet, which shows
                  // the default favourites/recent-searches view.
                  if (next === 'dest' && !isMobile) {
                    setDestinationSearch(destinationSearchDisplay || '');
                    setDestSearchTouched(false);
                  }
                }}
                className={`w-full flex items-center min-h-[52px] px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer group text-left border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-sm ${
                  validationErrors.dest
                    ? 'border-red-300 ring-2 ring-red-400/60'
                    : 'border-gray-200/90 hover:border-gray-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-full transition-all flex-shrink-0 flex items-center justify-center mr-2.5 ${validationErrors.dest
                  ? 'bg-red-50 text-red-500'
                  : 'bg-gray-50 text-slate-500 group-hover:bg-[#CB2187]/10 group-hover:text-[#CB2187]'
                  }`}>
                  <MapPin size={compact ? 15 : 16} />
                </div>
                <div className="flex-1 min-w-0">
                  <label className={`text-[10px] md:text-[11px] font-semibold uppercase tracking-wider block mb-0.5 cursor-pointer font-montserrat whitespace-nowrap truncate ${validationErrors.dest ? 'text-red-500' : 'text-gray-400'
                    }`}>
                    Destination {validationErrors.dest && <span className="normal-case tracking-normal font-normal">— {validationErrors.dest}</span>}
                  </label>
                  <div className={`w-full bg-transparent border-none p-0 text-xs md:text-[13.5px] truncate ${destinationSearchDisplay ? 'text-gray-800 font-semibold' : validationErrors.dest ? 'text-red-400 font-normal' : 'text-gray-400 font-normal'}`}>
                    {destinationSearchDisplay || (validationErrors.dest ? 'Required — select a destination' : 'Select Destination')}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ml-1 ${validationErrors.dest ? 'text-red-400' : 'text-gray-300 group-hover:text-gray-400'}`} />
              </button>
            )}
            {openDropdown === 'dest' && (
              isMobile ? (
                createPortal(
                  <div ref={mobileDropdownRef} className="fixed inset-0 z-[2100] bg-white flex flex-col font-['Montserrat']">
                    <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 flex-shrink-0">
                      <button type="button" onClick={() => setOpenDropdown(null)} className="p-1.5 -ml-1 text-gray-600">
                        <ArrowLeft size={20} />
                      </button>
                      <span className="font-bold text-[16px] text-gray-900">Where to?</span>
                      <button type="button" onClick={() => setOpenDropdown(null)} className="p-1.5 -mr-1 text-gray-600">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0 bg-white">
                      <div className="flex flex-col h-full space-y-4">
                        <div className="relative flex-shrink-0">
                          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            value={destinationSearch}
                            onChange={(e) => { setDestinationSearch(e.target.value); setDestSearchTouched(true); }}
                            placeholder="Search destinations by name, region or country..."
                            className="w-full pl-11 pr-4 py-3 text-sm border border-solid border-gray-200/80 rounded-2xl outline-none bg-[#f8f9fa] focus:bg-white focus:border-[#CB2187] focus:ring-2 focus:ring-[#CB2187]/20 transition-all font-medium text-gray-700"
                          />
                        </div>
                        <div className="flex-1 overflow-y-auto min-h-0">
                          {renderDestinationsDropdownContent()}
                        </div>
                      </div>
                    </div>
                  </div>,
                  document.body
                )
              ) : (
                <div className="absolute top-[calc(100%+12px)] left-0 w-full lg:w-[280px] bg-white rounded-[16px] shadow-[0_20px_50px_rgba(30,12,26,0.18)] border border-gray-100 py-3 z-50 max-h-[380px] overflow-y-auto scroll-autohide">
                  {renderDestinationsDropdownContent()}
                </div>
              )
            )}
          </div>

          {/* Departure Airports Dropdown */}
          <div ref={airportRef} className="min-w-0 w-full lg:flex-[1.5] flex-1 relative" data-testid="search-dealtype">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'airport' ? null : 'airport')}
              className={`w-full flex items-center min-h-[52px] px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer group text-left border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-sm ${
                validationErrors.airports
                  ? 'border-red-300 ring-2 ring-red-400/60'
                  : openDropdown === 'airport'
                    ? 'border-[#CB2187] ring-2 ring-[#CB2187]/20'
                    : 'border-gray-200/90 hover:border-gray-300'
              }`}
            >
              <div className={`w-9 h-9 rounded-full transition-all flex-shrink-0 flex items-center justify-center mr-2.5 ${validationErrors.airports
                ? 'bg-red-50 text-red-500'
                : openDropdown === 'airport'
                  ? 'bg-[#CB2187] text-white'
                  : 'bg-gray-50 text-slate-500 group-hover:bg-[#CB2187]/10 group-hover:text-[#CB2187]'
                }`}>
                <Plane size={compact ? 15 : 16} />
              </div>
              <div className="flex-1 min-w-0">
                <label className={`text-[10px] md:text-[11px] font-semibold uppercase tracking-wider block mb-0.5 cursor-pointer font-montserrat whitespace-nowrap truncate ${validationErrors.airports ? 'text-red-500' : 'text-gray-400'
                  }`}>
                  Departure Airports {validationErrors.airports && <span className="normal-case tracking-normal font-normal">— {validationErrors.airports}</span>}
                </label>
                <div className={`w-full bg-transparent border-none p-0 text-xs md:text-[13.5px] truncate ${selectedAirports.length > 0 ? 'text-gray-800 font-semibold' : validationErrors.airports ? 'text-red-400 font-normal' : 'text-gray-400 font-normal'
                  }`}>
                  {selectedAirports.length > 0
                    ? selectedAirports.map(getAirportName).join(', ')
                    : validationErrors.airports
                      ? 'Required — select an airport'
                      : 'All Airports'}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ml-1 ${validationErrors.airports ? 'text-red-400' : `text-gray-300 group-hover:text-gray-400 ${openDropdown === 'airport' ? 'rotate-180 text-[#CB2187]' : ''}`
                }`} />
            </button>
            {openDropdown === 'airport' && (
              isMobile ? (
                createPortal(
                  <div ref={mobileDropdownRef} className="fixed inset-0 z-[2100] bg-white flex flex-col font-['Montserrat']">
                    <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 flex-shrink-0">
                      <button type="button" onClick={() => setOpenDropdown('dest')} className="p-1.5 -ml-1 text-gray-600">
                        <ArrowLeft size={20} />
                      </button>
                      <span className="font-bold text-[16px] text-gray-900">Flying from?</span>
                      <button type="button" onClick={() => setOpenDropdown(null)} className="p-1.5 -mr-1 text-gray-600">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0 bg-white">
                      <div className="flex flex-col h-full space-y-4">
                        <div className="relative flex-shrink-0">
                          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            value={airportSearch}
                            onChange={(e) => setAirportSearch(e.target.value)}
                            placeholder="Search departure airports by name or code..."
                            className="w-full pl-11 pr-4 py-3 text-sm border border-solid border-gray-200/80 rounded-2xl outline-none bg-[#f8f9fa] focus:bg-white focus:border-[#CB2187] focus:ring-2 focus:ring-[#CB2187]/20 transition-all font-medium text-gray-700"
                          />
                        </div>
                        <div className="flex justify-between items-center px-1 flex-shrink-0">
                          <button type="button" onClick={() => setSelectedAirports([])} className="text-[#CB2187] text-xs font-bold bg-transparent border-none cursor-pointer">
                            Clear Selection
                          </button>
                          <span className="text-gray-400 text-xs font-medium">{selectedAirports.length} selected</span>
                        </div>
                        <div className="flex-1 overflow-y-auto min-h-0">
                          {renderAirportsDropdownContent()}
                        </div>
                        <div className="pt-3 border-t border-gray-100 bg-white flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setOpenDropdown('date')}
                            className="w-full text-white font-bold py-3 px-4 rounded-2xl text-[14px] bg-[#CB2187] cursor-pointer"
                          >
                            Select Dates ({selectedAirports.length > 0 ? `${selectedAirports.length} selected` : 'All Airports'})
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>,
                  document.body
                )
              ) : (
                <div className="absolute top-[calc(100%+12px)] left-0 w-full lg:min-w-[320px] bg-white rounded-[16px] shadow-[0_20px_50px_rgba(30,12,26,0.18)] border border-gray-100 p-3 z-50 max-h-[380px] overflow-y-auto scroll-autohide flex flex-col">
                  <div className="relative mb-2.5 flex-shrink-0">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={airportSearch}
                      onChange={(e) => setAirportSearch(e.target.value)}
                      placeholder="Search airport or code..."
                      className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#CB2187] focus:ring-2 focus:ring-[#CB2187]/20 text-gray-800"
                    />
                  </div>
                  {renderAirportsDropdownContent()}
                </div>
              )
            )}
          </div>

          {/* Travel Date Picker */}
          <TravelDatePicker
            testId="search-traveldate"
            label="Travel Dates"
            placeholder="Anytime"
            value={dateRangeLabel}
            startDate={startDate}
            endDate={endDate}
            onChangeRange={handleCalendarRangeChange}
            open={openDropdown === 'date'}
            onToggle={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
            onClose={() => setOpenDropdown(null)}
            compact={compact}
            className="lg:flex-[1.1] flex-1"
            nights={nights}
            isMobile={isMobile}
            onChangeOpenDropdown={setOpenDropdown}
            activeDateTab={activeDateTab}
            onDateTabChange={setActiveDateTab}
            isFlexible={isFlexible}
            onFlexibleChange={setIsFlexible}
            selectedMonth={selectedMonth}
            onSelectMonth={handleSelectMonth}
          />

          {/* Nights Dropdown */}
          <div ref={nightsRef} className="relative min-w-0 w-full flex-1 lg:flex-[0.85]" data-testid="search-nights">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'nights' ? null : 'nights')}
              className={`w-full flex items-center min-h-[52px] px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer group text-left border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-sm ${
                openDropdown === 'nights'
                  ? 'border-[#CB2187] ring-2 ring-[#CB2187]/20'
                  : 'border-gray-200/90 hover:border-gray-300'
              }`}
            >
              <div className={`w-9 h-9 rounded-full transition-all flex-shrink-0 flex items-center justify-center mr-2.5 ${openDropdown === 'nights' ? 'bg-[#CB2187] text-white' : 'bg-gray-50 text-slate-500 group-hover:bg-[#CB2187]/10 group-hover:text-[#CB2187]'}`}>
                <Moon size={compact ? 15 : 16} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5 cursor-pointer font-montserrat whitespace-nowrap truncate">
                  Nights
                </label>
                <div className={`w-full bg-transparent border-none p-0 text-xs md:text-[13.5px] truncate ${nights ? 'text-gray-800 font-semibold' : 'text-gray-400 font-normal'}`}>
                  {nights ? `${nights} Night${nights === '1' ? '' : 's'}` : 'Any Duration'}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-300 flex-shrink-0 transition-transform duration-200 ml-1 group-hover:text-gray-400 ${openDropdown === 'nights' ? 'rotate-180 text-[#CB2187]' : ''}`} />
            </button>
            {openDropdown === 'nights' && (
              isMobile ? (
                createPortal(
                  <div ref={mobileDropdownRef} className="fixed inset-0 z-[2100] bg-white flex flex-col font-['Montserrat']">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                      <button type="button" onClick={() => setOpenDropdown('date')} className="p-1.5 -ml-1 text-gray-600">
                        <ArrowLeft size={20} />
                      </button>
                      <span className="font-bold text-[16px] text-gray-900">Select Duration</span>
                      <button type="button" onClick={() => setOpenDropdown(null)} className="p-1.5 -mr-1 text-gray-600">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-scroll bg-white px-4 py-4 [scrollbar-width:thin] [scrollbar-color:#c4c4c4_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
                      <div className="flex flex-col space-y-3 pb-8">
                        {nightOptions.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => { handleNightsChange(opt.value); setOpenDropdown(null); }}
                            className={`w-full text-left px-5 py-4 text-[14px] rounded-2xl border cursor-pointer transition-all ${opt.value === nights ? 'bg-pink-50 border-[#CB2187] text-[#CB2187] font-bold' : 'bg-transparent text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>,
                  document.body
                )
              ) : (
                <div className="absolute top-[calc(100%+12px)] right-0 z-50 w-[200px] max-h-[280px] overflow-y-auto rounded-[16px] border border-gray-100 bg-white p-2 shadow-[0_20px_50px_rgba(30,12,26,0.18)] [scrollbar-width:thin] [scrollbar-color:#c4c4c4_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
                  {nightOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { handleNightsChange(opt.value); setOpenDropdown(null); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-[13px] border-none cursor-pointer transition-all ${
                        opt.value === nights
                          ? 'bg-pink-50/90 font-semibold text-[#CB2187]'
                          : 'bg-transparent text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )
            )}
          </div>

        </div>
        <div className="flex w-full flex-shrink-0 self-stretch p-1 lg:w-auto">
          <button
            data-testid="search-submit"
            type="submit"
            disabled={isSubmitting || isSearchLoading}
            className="relative flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full bg-[#CB2187] px-7 py-3 font-semibold tracking-wide text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:bg-[#a81870] hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)] active:scale-95 cursor-pointer border-none group lg:min-w-[140px] lg:px-9 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isSubmitting || isSearchLoading ? (
              <span className="relative z-10 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent align-middle" aria-label="Loading" />
            ) : (
              <Search size={18} className="relative z-10" />
            )}
            <span className="relative z-10 text-[14px] md:text-[15px] font-bold">Search</span>
          </button>
        </div>
      </div>
    </form>
  );
}
