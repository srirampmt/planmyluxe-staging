"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  PlaneTakeoff,
  Phone,
  Moon,
  Utensils,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import { HotelDeal } from "@/types/hotel";
import FlightSummary from "./FlightSummary";
import { formatNights, toIsoDateKey } from "@/lib/hotel-utils";
import { getBoardBasisName } from "@/lib/mappings/board-basis";

/* ===================== CUSTOM DROPDOWN ===================== */
interface FilterDropdownProps {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  options: Array<{ id: string; label: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function FilterDropdown({ icon, label, placeholder, value, options, onChange, disabled }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((o) => o.id === value)?.label || placeholder;

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((p) => !p)}
        className={`w-full flex min-h-[56px] items-center gap-2 rounded-xl px-[10px] py-[6px] bg-gray-100 border-0 transition-all duration-200 text-left${
          disabled ? " opacity-50 cursor-not-allowed" : " cursor-pointer hover:bg-gray-200"
        }`}
      >
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-pink-100 text-pml-primary">{icon}</span>
        <span className="flex-1 min-w-0">
          <span className="block text-[13px] font-medium tracking-wide text-[#595858] leading-[16px] mb-[3px]">{label}</span>
          <span className="block text-[16px] font-semibold text-[#242F40] leading-[20px] truncate">{selectedLabel}</span>
        </span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-[#595858] transition-transform duration-200${open ? " rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-[200] max-h-56 overflow-y-auto rounded-xl border border-[#E8E8E8] bg-white shadow-xl py-1"
        >
          {options.map((opt) => (
            <li
              key={opt.id}
              role="option"
              aria-selected={opt.id === value}
              onClick={() => { onChange(opt.id); setOpen(false); }}
              className={`px-4 py-2.5 text-[13px] cursor-pointer select-none transition-colors${
                opt.id === value
                  ? " bg-pml-primary/10 text-pml-primary font-semibold"
                  : " text-[#4C4C4C] hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface StaticFilterBoxProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StaticFilterBox({ icon, label, value }: StaticFilterBoxProps) {
  return (
    <div className="w-full">
      <div className="w-full flex min-h-[56px] items-center gap-2 rounded-xl px-[10px] py-[10px] bg-gray-100 border-0 text-left">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-pml-primary/5 text-pml-primary">{icon}</span>
        <span className="flex-1 min-w-0">
          <span className="block text-[13px] font-medium uppercase tracking-wide text-[#595858] leading-[14px] mb-[7px]">{label}</span>
          <span className="block text-[16px] font-semibold text-[#242F40] leading-[20px] truncate">{value}</span>
        </span>
      </div>
    </div>
  );
}

/* ===================== TYPES ===================== */

interface PriceData {
  date: string; // YYYY-MM-DD
  price: number;
  hasCustomPrice?: boolean;
}

interface HolidayCalendarProps {
  availableAirports: Array<{ id: string; label: string }>;
  availableBoardBases: Array<{ id: string; label: string }>;
  availableDurations: Array<{ id: string; label: string }>;
  selectedAirport?: string; // id
  selectedBoardBasis?: string; // id
  selectedDuration?: string; // id
  initialPrices: PriceData[]; // Full list of available prices
  initialDepartureDate: string; // YYYY-MM-DD (e.g., "2025-10-08")
  defaultDate?: string; // Default deal date (shown in green)
  nights: number; // Initial number of nights (e.g., 7)
  onDateSelect?: (date: string) => void; // Callback when date is selected
  onFilterChange?: (
    filterType: "departure" | "boardBasis" | "duration",
    value: string,
  ) => void; // Callback for filter changes
  onEnquire?: () => void; // Callback for enquiry button (no deals state)
  isSearching?: boolean; // Loading state for search
  hideFilters?: boolean; // Hide filter dropdowns when custom pricing is active
  disableFilters?: boolean; // Keep filters visible but disable interactions (e.g. custom pricing)
  autoDeal?: boolean; // When false, Nights/Board Basis are fixed values from selectedDeal, not dropdowns
  noDealsMessage?: string; // Show empty state when no deals found
  // FlightSummary / HotelSidebar data
  selectedDeal?: HotelDeal | null;
  taxPerNight?: any;
  location?: string;
  apiDataLoading?: boolean;
  onBookNow?: () => void;
  saveText?: string;
  afterSummary?: React.ReactNode;
}

interface DayData {
  dayOfMonth: number | null;
  dateKey: string | null;
  price: number | null;
  isPast: boolean;
  isSelectable: boolean;
}

/* ===================== HELPERS ===================== */

// Function to generate the price map for quick lookup
const getPriceMap = (prices: PriceData[]) => {
  return prices.reduce(
    (map, item) => {
      const key = toIsoDateKey(item.date);
      if (key) map[key] = item.price;
      return map;
    },
    {} as Record<string, number>,
  );
};

const getCustomPriceMap = (prices: PriceData[]) => {
  return prices.reduce(
    (map, item) => {
      const key = toIsoDateKey(item?.date);
      if (key) map[key] = Boolean(item.hasCustomPrice);
      return map;
    },
    {} as Record<string, boolean>,
  );
};



const getDaysInMonth = (
  year: number,
  month: number,
  priceMap: Record<string, number>,
  today: Date,
): DayData[] => {
  const date = new Date(year, month, 1);
  const firstDayIndex = date.getDay(); // 0 (Sun) to 6 (Sat)
  const days: DayData[] = [];

  // Add leading blank days (Mon-first: Mon=0 … Sun=6)
  const numPreviousDays = (firstDayIndex + 6) % 7;
  for (let i = 0; i < numPreviousDays; i++) {
    days.push({
      dayOfMonth: null,
      dateKey: null,
      price: null,
      isPast: false,
      isSelectable: false,
    });
  }

  // Add actual days
  while (date.getMonth() === month) {
    const day = date.getDate();
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day,
    ).padStart(2, "0")}`;

    const dayDate = new Date(year, month, day);
    dayDate.setHours(0, 0, 0, 0); // Ensure comparison accuracy
    const isPast = dayDate <= today; // Today and earlier dates are past

    // Only use price if explicitly defined in priceMap
    const price = priceMap[dateKey] ?? null;

    // Set price to null for past dates
    const finalPrice = !isPast ? price : null;

    days.push({
      dayOfMonth: day,
      dateKey,
      price: finalPrice,
      isPast,
      isSelectable: !isPast, // All future dates are selectable (even without price)
    });

    date.setDate(date.getDate() + 1);
  }

  // Add trailing blank days only to complete the last week row (dynamic 4/5/6 rows)
  while (days.length % 7 !== 0) {
    days.push({
      dayOfMonth: null,
      dateKey: null,
      price: null,
      isPast: false,
      isSelectable: false,
    });
  }

  return days;
};

/* ===================== COMPONENT ===================== */

export default function HolidayCalendar({
  availableAirports,
  availableBoardBases,
  availableDurations,
  selectedAirport: selectedAirportProp,
  selectedBoardBasis: selectedBoardBasisProp,
  selectedDuration: selectedDurationProp,
  initialPrices,
  initialDepartureDate,
  defaultDate,
  nights,
  onDateSelect,
  onFilterChange,
  onEnquire,
  isSearching = false,
  hideFilters = false,
  disableFilters = false,
  autoDeal,
  noDealsMessage,
  selectedDeal,
  taxPerNight,
  location,
  apiDataLoading = false,
  onBookNow,
  saveText,
  afterSummary,
}: HolidayCalendarProps) {

  // Ensure option lists are unique to avoid duplicate React keys (e.g. "East Midlands").
  const airportOptions = useMemo(() => {
    const seen = new Set<string>();
    const next: Array<{ id: string; label: string }> = [];
    for (const a of availableAirports || []) {
      const id = String((a as any)?.id ?? "");
      const label = String((a as any)?.label ?? "");
      if (!id || !label) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      next.push({ id, label });
    }
    return next;
  }, [availableAirports]);

  const boardBasisOptions = useMemo(() => {
    const seen = new Set<string>();
    const next: Array<{ id: string; label: string }> = [];
    for (const b of availableBoardBases || []) {
      const id = String((b as any)?.id ?? "");
      const label = String((b as any)?.label ?? "");
      if (!id || !label) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      next.push({ id, label });
    }
    return next;
  }, [availableBoardBases]);

  const durationOptions = useMemo(() => {
    const seen = new Set<string>();
    const next: Array<{ id: string; label: string }> = [];
    for (const d of availableDurations || []) {
      const id = String((d as any)?.id ?? "");
      const label = String((d as any)?.label ?? "");
      if (!id || !label) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      next.push({ id, label });
    }
    return next;
  }, [availableDurations]);

  // --- STATE ---
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const initialDate = useMemo(() => {
    const key = toIsoDateKey(initialDepartureDate);
    if (!key) return today;
    const d = new Date(`${key}T00:00:00`);
    return Number.isNaN(d.getTime()) ? today : d;
  }, [initialDepartureDate, today]);

  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [selectedDateKey, setSelectedDateKey] = useState(() => toIsoDateKey(initialDepartureDate));

  // Keep internal selected date/month in sync when parent changes selected date
  useEffect(() => {
    const key = toIsoDateKey(initialDepartureDate);
    if (!key) return;
    const d = new Date(`${key}T00:00:00`);
    if (Number.isNaN(d.getTime())) return;
    setSelectedDateKey(key);
    setCurrentMonth(d.getMonth());
    setCurrentYear(d.getFullYear());
  }, [initialDepartureDate]);

  // Departure airport is initialised once when options first arrive and then owned
  // locally — changing the selected deal will NOT alter the displayed value.
  const [selectedAirport, setSelectedAirport] = useState("");
  const airportInitialized = useRef(false);
  useEffect(() => {
    if (airportInitialized.current || airportOptions.length === 0) return;
    const candidate = String(selectedAirportProp ?? "");
    setSelectedAirport(
      candidate && airportOptions.some((o) => o.id === candidate)
        ? candidate
        : airportOptions[0]?.id ?? "",
    );
    airportInitialized.current = true;
  }, [airportOptions, selectedAirportProp]);

  // Board basis — initialised once from props, then owned locally.
  const [selectedBoardBasis, setSelectedBoardBasis] = useState("");
  const boardBasisInitialized = useRef(false);
  useEffect(() => {
    if (boardBasisInitialized.current || boardBasisOptions.length === 0) return;
    const candidate = String(selectedBoardBasisProp ?? "");
    setSelectedBoardBasis(
      candidate && boardBasisOptions.some((o) => o.id === candidate)
        ? candidate
        : boardBasisOptions[0]?.id ?? "",
    );
    boardBasisInitialized.current = true;
  }, [boardBasisOptions, selectedBoardBasisProp]);

  // Duration — initialised once from props, then owned locally.
  const [selectedDuration, setSelectedDuration] = useState("");
  const durationInitialized = useRef(false);
  useEffect(() => {
    if (durationInitialized.current || durationOptions.length === 0) return;
    const candidate = String(selectedDurationProp ?? "");
    setSelectedDuration(
      candidate && durationOptions.some((o) => o.id === candidate)
        ? candidate
        : durationOptions[0]?.id ?? "",
    );
    durationInitialized.current = true;
  }, [durationOptions, selectedDurationProp]);

  // --- MEMOIZED DATA ---
  const priceMap = useMemo(() => getPriceMap(initialPrices), [initialPrices]);

  // Earliest deal date in the returned price list (used to hide months before the first deal).
  const firstDealMonthDate = useMemo(() => {
    let minTime = Infinity;
    for (const item of initialPrices || []) {
      const raw = String((item as any)?.date ?? "");
      if (!raw) continue;
      const t = Date.parse(raw);
      if (!Number.isFinite(t)) continue;
      if (t < minTime) minTime = t;
    }
    if (!Number.isFinite(minTime) || minTime === Infinity) return null;
    const d = new Date(minTime);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }, [initialPrices]);

  // Latest deal date in the returned price list (used to hide months after the last deal).
  const lastDealMonthDate = useMemo(() => {
    let maxTime = -Infinity;
    for (const item of initialPrices || []) {
      const raw = String((item as any)?.date ?? "");
      if (!raw) continue;
      const t = Date.parse(raw);
      if (!Number.isFinite(t)) continue;
      if (t > maxTime) maxTime = t;
    }
    if (!Number.isFinite(maxTime) || maxTime === -Infinity) return null;
    const d = new Date(maxTime);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }, [initialPrices]);

  // Compute days and mark ALL dates with the cheapest price in the month
  const days = useMemo(() => {
    const monthDays = getDaysInMonth(currentYear, currentMonth, priceMap, today);
    // Find the minimum price among all selectable days with prices
    let minPrice = Infinity;
    monthDays.forEach((day) => {
      if (day.isSelectable && day.price !== null && day.price < minPrice) {
        minPrice = day.price;
      }
    });
    // Mark ALL days that have the minimum price
    if (Number.isFinite(minPrice)) {
      monthDays.forEach((day) => {
        if (day.isSelectable && day.price === minPrice) {
          (day as any).isCheapest = true;
        }
      });
    }
    return monthDays;
  }, [currentYear, currentMonth, priceMap, today]);

  const minAllowedMonthDate = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth(), 1);
    if (!firstDealMonthDate) return d;
    return firstDealMonthDate > d ? firstDealMonthDate : d;
  }, [today, firstDealMonthDate]);

  // Month dropdown should only show the next 16 months (and respect deal bounds)
  const maxAllowedMonthDate = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth(), 1);
    // When there are no deals, show the next 6 months (including current month)
    // with enquiry (phone) icons on each selectable date.
    if (noDealsMessage) {
      d.setMonth(d.getMonth() + 5);
      return d;
    }
    d.setMonth(d.getMonth() + 15);
    if (!lastDealMonthDate) return d;
    return lastDealMonthDate < d ? lastDealMonthDate : d;
  }, [today, lastDealMonthDate, noDealsMessage]);

  // If the available deal range changes (filters change), keep the UI month within bounds.
  useEffect(() => {
    const minYear = minAllowedMonthDate.getFullYear();
    const minMonth = minAllowedMonthDate.getMonth();
    const maxYear = maxAllowedMonthDate.getFullYear();
    const maxMonth = maxAllowedMonthDate.getMonth();

    const isTooEarly =
      currentYear < minYear || (currentYear === minYear && currentMonth < minMonth);
    const isTooFar =
      currentYear > maxYear || (currentYear === maxYear && currentMonth > maxMonth);

    if (isTooEarly) {
      setCurrentYear(minYear);
      setCurrentMonth(minMonth);
      return;
    }

    if (isTooFar) {
      setCurrentYear(maxYear);
      setCurrentMonth(maxMonth);
    }
  }, [minAllowedMonthDate, maxAllowedMonthDate, currentYear, currentMonth]);

  const isBeforeMinAllowed = useCallback(
    (year: number, month: number) => {
      const minYear = minAllowedMonthDate.getFullYear();
      const minMonth = minAllowedMonthDate.getMonth();
      return year < minYear || (year === minYear && month < minMonth);
    },
    [minAllowedMonthDate],
  );

  const isAfterMaxAllowed = useCallback(
    (year: number, month: number) => {
      const maxYear = maxAllowedMonthDate.getFullYear();
      const maxMonth = maxAllowedMonthDate.getMonth();
      return year > maxYear || (year === maxYear && month > maxMonth);
    },
    [maxAllowedMonthDate],
  );

  const isNextDisabled = useMemo(() => {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    return isAfterMaxAllowed(nextYear, nextMonth);
  }, [currentYear, currentMonth, isAfterMaxAllowed]);

  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const monthNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!monthDropdownOpen) return;
    function handleOutside(e: MouseEvent) {
      if (monthNavRef.current && !monthNavRef.current.contains(e.target as Node))
        setMonthDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [monthDropdownOpen]);

  // --- HANDLERS & DERIVED STATE ---

  const handleMonthChange = (direction: "prev" | "next") => {
    let newMonth = currentMonth;
    let newYear = currentYear;
    if (direction === "prev") {
      const candidateMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const candidateYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      if (isBeforeMinAllowed(candidateYear, candidateMonth)) return;
      newMonth = candidateMonth;
      newYear = candidateYear;
    } else {
      const candidateMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const candidateYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      if (isAfterMaxAllowed(candidateYear, candidateMonth)) return;
      newMonth = candidateMonth;
      newYear = candidateYear;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };
  
  const handleMonthYearSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [yearStr, monthStr] = e.target.value.split("-");
    const newYear = parseInt(yearStr, 10);
    const newMonth = parseInt(monthStr, 10); // 0-indexed month
    if (isBeforeMinAllowed(newYear, newMonth)) return;
    if (isAfterMaxAllowed(newYear, newMonth)) return;
    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
  };

  const isPrevDisabled = useMemo(() => {
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return isBeforeMinAllowed(prevYear, prevMonth);
  }, [currentYear, currentMonth, isBeforeMinAllowed]);

  const monthName = new Date(currentYear, currentMonth).toLocaleString( "en-US", { month: "long" }, );
  const selectedDate = new Date(`${toIsoDateKey(selectedDateKey) || selectedDateKey}T00:00:00`);
  const returnDate = new Date(selectedDate);
  returnDate.setDate(selectedDate.getDate() + nights);
  const formatDate = (d: Date) => `${d.getDate()} ${d.toLocaleString("en-US", { month: "short", })} ${d.getFullYear()}`;
  const monthOptions = useMemo(() => {
    const start = minAllowedMonthDate;
    const maxYear = maxAllowedMonthDate.getFullYear();
    const maxMonth = maxAllowedMonthDate.getMonth();

    const opts: Array<{ value: string; label: string }> = [];
    for (let i = 0; i < 16; i += 1) {
      const d = new Date(start);
      d.setMonth(start.getMonth() + i);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      if (year > maxYear || (year === maxYear && monthIndex > maxMonth)) break;
      opts.push({
        value: `${year}-${monthIndex}`,
        label: d.toLocaleString("en-US", { month: "long", year: "numeric" }),
      });
    }
    return opts;
  }, [minAllowedMonthDate, maxAllowedMonthDate]);

  // --- JSX RENDERING ---
  if (isSearching) {
    return (
      <div className="w-full space-y-3">
        <style>{`@keyframes pml-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
        <div className="relative h-4 w-1/3 overflow-hidden rounded bg-pml-primary/10">
          <div className="absolute inset-0 -translate-x-full animate-[pml-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        </div>
        <div className="relative h-10 overflow-hidden rounded-xl bg-pml-primary/10">
          <div className="absolute inset-0 -translate-x-full animate-[pml-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative h-10 overflow-hidden rounded-xl bg-pml-primary/10">
            <div className="absolute inset-0 -translate-x-full animate-[pml-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          </div>
          <div className="relative h-10 overflow-hidden rounded-xl bg-pml-primary/10">
            <div className="absolute inset-0 -translate-x-full animate-[pml-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          </div>
        </div>
        <div className="relative h-10 overflow-hidden rounded-xl bg-pml-primary/10">
          <div className="absolute inset-0 -translate-x-full animate-[pml-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="relative h-[60px] overflow-hidden rounded-xl bg-pml-primary/10">
              <div className="absolute inset-0 -translate-x-full animate-[pml-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            </div>
          ))}
        </div>
        <div className="relative h-11 overflow-hidden rounded-xl bg-pml-primary/10">
          <div className="absolute inset-0 -translate-x-full animate-[pml-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* CHECK AVAILABILITY */}
        <div className="flex items-center gap-2 mb-3">
          
          <h2 className="text-[16px] font-bold leading-[16px] text-[#242F40]">Check Availability</h2>
        </div>

        {/* FILTERS */}
        {!hideFilters && (
          <>
            {/* Departure – full width */}
            <div className="w-full mb-3">
              <FilterDropdown
                icon={<PlaneTakeoff className="h-6 w-6 text-pml-primary" />}
                label="Departure"
                placeholder="Select airport"
                value={selectedAirport}
                options={airportOptions}
                onChange={(v) => { setSelectedAirport(v); onFilterChange?.("departure", v); }}
                disabled={disableFilters || isSearching}
              />
            </div>

            <div className="grid grid-cols-2 gap-[10px] mb-[14px]">
              {autoDeal ? (
                <FilterDropdown
                  icon={<Moon className="h-5 w-5 text-pml-primary" />}
                  label="Nights"
                  placeholder="Select nights"
                  value={selectedDuration}
                  options={durationOptions}
                  onChange={(v) => { setSelectedDuration(v); onFilterChange?.("duration", v); }}
                  disabled={disableFilters || isSearching}
                />
              ) : (
                <StaticFilterBox
                  icon={<Moon className="h-5 w-5 text-pml-primary" />}
                  label="Nights"
                  value={formatNights(selectedDeal?.hotel?.duration ?? selectedDeal?.hotel?.nights ?? nights)}
                />
              )}
              {autoDeal && boardBasisOptions.length > 0 ? (
                <FilterDropdown
                  icon={<Utensils className="h-5 w-5 text-pml-primary" />}
                  label="Board Basis"
                  placeholder="Select board basis"
                  value={selectedBoardBasis}
                  options={boardBasisOptions}
                  onChange={(v) => { setSelectedBoardBasis(v); onFilterChange?.("boardBasis", v); }}
                  disabled={disableFilters || isSearching}
                />
              ) : (
                <StaticFilterBox
                  icon={<Utensils className="h-5 w-5 text-pml-primary" />}
                  label="Board Basis"
                  value={getBoardBasisName(selectedDeal?.hotel?.boardBasis ?? "")}
                />
              )}
            </div>
          </>
        )}

        {/* CALENDAR CARD (month nav + weekdays + day grid) */}
        <div className="w-full rounded-2xl border border-gray-200 p-3">
          {/* MONTH NAV */}
          <div ref={monthNavRef} className="relative w-full mb-[8px]">
            <div className="flex h-[40px] items-center justify-between w-full rounded-xl border border-gray-200 bg-pink-50 px-3">
              <button
                onClick={() => handleMonthChange("prev")}
                disabled={isPrevDisabled}
                aria-label="Previous month"
                className={`p-1 text-[#595858] transition-opacity${isPrevDisabled ? " cursor-not-allowed opacity-40" : " hover:opacity-70"}`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.5 12.5C9.37212 12.5 9.24412 12.4511 9.1465 12.3535L5.1465 8.3535C4.95113 8.15812 4.95113 7.84175 5.1465 7.6465L9.1465 3.6465C9.34188 3.45113 9.65825 3.45113 9.8535 3.6465C10.0487 3.84188 10.0489 4.15825 9.8535 4.3535L6.207 8L9.8535 11.6465C10.0489 11.8419 10.0489 12.1583 9.8535 12.3535C9.75588 12.4511 9.62788 12.5 9.5 12.5ZM16 8C16 3.58887 12.4111 0 8 0C3.58887 0 0 3.58887 0 8C0 12.4111 3.58887 16 8 16C12.4111 16 16 12.4111 16 8ZM15 8C15 11.8599 11.8599 15 8 15C4.14013 15 1 11.8599 1 8C1 4.14013 4.14013 1 8 1C11.8599 1 15 4.14013 15 8Z" fill="#595858"/>
                </svg>
              </button>

              {/* Scroll target */}
              <div id="holiday-calendar-grid" tabIndex={-1} className="scroll-mt-[110px]" />

              {/* Custom month picker trigger */}
              <button
                type="button"
                onClick={() => setMonthDropdownOpen((p) => !p)}
                className="flex-1 flex items-center justify-center gap-1.5 text-[16px] font-bold leading-[16px] text-[#242F40] hover:opacity-70 transition-opacity"
              >
                <span>{new Date(currentYear, currentMonth).toLocaleString("en-US", { month: "long", year: "numeric" })}</span>
                <ChevronDown className={`h-4 w-4 text-[#595858] transition-transform duration-200${monthDropdownOpen ? " rotate-180" : ""}`} />
              </button>

              <button
                onClick={() => handleMonthChange("next")}
                disabled={isNextDisabled}
                aria-label="Next month"
                className={`p-1 text-[#595858] transition-opacity${isNextDisabled ? " cursor-not-allowed opacity-40" : " hover:opacity-70"}`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.5 12.5C6.62788 12.5 6.75588 12.4511 6.8535 12.3535L10.8535 8.3535C11.0489 8.15812 11.0489 7.84175 10.8535 7.6465L6.8535 3.6465C6.65812 3.45113 6.34175 3.45113 6.1465 3.6465C5.95125 3.84188 5.95112 4.15825 6.1465 4.3535L9.793 8L6.1465 11.6465C5.95112 11.8419 5.95112 12.1583 6.1465 12.3535C6.24412 12.4511 6.37212 12.5 6.5 12.5ZM0 8C0 3.58887 3.58887 0 8 0C12.4111 0 16 3.58887 16 8C16 12.4111 12.4111 16 8 16C3.58887 16 0 12.4111 0 8ZM1 8C1 11.8599 4.14013 15 8 15C11.8599 15 15 11.8599 15 8C15 4.14013 11.8599 1 8 1C4.14013 1 1 4.14013 1 8Z" fill="#595858"/>
                </svg>
              </button>
            </div>

            {/* Month dropdown list */}
            {monthDropdownOpen && (
              <ul
                role="listbox"
                className="absolute left-0 right-0 top-[calc(100%+4px)] z-[200] max-h-56 overflow-y-auto rounded-xl border border-[#E8E8E8] bg-white shadow-xl py-1"
              >
                {monthOptions.map((opt) => {
                  const isActive = opt.value === `${currentYear}-${currentMonth}`;
                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        const [yearStr, monthStr] = opt.value.split("-");
                        const newYear = parseInt(yearStr, 10);
                        const newMonth = parseInt(monthStr, 10);
                        if (!isBeforeMinAllowed(newYear, newMonth) && !isAfterMaxAllowed(newYear, newMonth)) {
                          setCurrentYear(newYear);
                          setCurrentMonth(newMonth);
                        }
                        setMonthDropdownOpen(false);
                      }}
                      className={`px-4 py-2.5 text-[13px] cursor-pointer select-none transition-colors${
                        isActive
                          ? " bg-pml-primary/10 text-pml-primary font-semibold"
                          : " text-[#4C4C4C] hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* WEEKDAYS – Mon first */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold uppercase tracking-wide text-[#767676] mb-1">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <div key={d} className="text-center py-2">{d}</div>
            ))}
          </div>

          {/* CALENDAR GRID (RESPONSIVE) */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, i) => {
              const isSelected = day.dateKey === selectedDateKey;
              const isDefault = Boolean(defaultDate) && day.dateKey === toIsoDateKey(defaultDate);
              const isCheapest = (day as any).isCheapest;
              const disabled = !day.isSelectable;
              const hasContent = day.dayOfMonth !== null;
              const hasPrice = day.price !== null;
              const isPast = day.isPast;

              // In "no deals" mode, show a phone icon under every selectable date.
              const showPhoneIcon = noDealsMessage
                ? !isPast && hasContent
                : !hasPrice && !isPast && hasContent;

              const displayPrice = hasPrice && day.price !== null
                ? `£${Math.round(day.price)}`
                : "";

              let cls =
                "h-[54px] w-full rounded-xl flex flex-col justify-center items-center transition-all duration-150 ease-in-out cursor-pointer";

              if (!hasContent) {
                cls += " bg-white cursor-default";
              } else if (isPast) {
                cls += " bg-white text-[#B5B5B5] cursor-not-allowed";
              } else if (isSelected) {
                cls += " bg-pml-primary text-white border-transparent shadow-[0_4px_14px_rgba(203,33,135,0.35)] scale-[1.03]";
              } else if (!noDealsMessage && (isDefault || isCheapest)) {
                // Keep existing "best/default" highlighting only when deals exist.
                cls += " bg-emerald-100 text-[#595858] hover:bg-emerald-200 hover:-translate-y-0.5 hover:shadow-md";
              } else {
                cls += " bg-white text-[#595858] hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-sm";
              }

              const dayLabel = day.dateKey
                ? new Date(`${day.dateKey}T00:00:00`).toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : undefined;
              const ariaLabel = dayLabel
                ? disabled
                  ? `${dayLabel}, unavailable`
                  : displayPrice
                    ? `${dayLabel}, ${displayPrice} per person`
                    : dayLabel
                : undefined;

              return (
                <div key={i} className="w-full">
                  <button
                    disabled={disabled}
                    aria-label={ariaLabel}
                    onClick={() => {
                      if (!day.dateKey) return;
                      setSelectedDateKey(day.dateKey);
                      onDateSelect?.(day.dateKey);
                      onEnquire?.();
                    }}
                    className={cls}
                  >
                    {day.dayOfMonth && (
                      <>
                        <span className="text-[14px] font-normal leading-[140%] text-center">
                          {day.dayOfMonth}
                        </span>

                        {showPhoneIcon ? (
                          <Phone className="w-[12px] h-[12px] text-[#595858] mt-[3px]" />
                        ) : (
                          <span
                            className={`text-[12px] font-semibold leading-[14px] text-center ${
                              isSelected
                                ? "text-white"
                                : isPast
                                  ? "text-[#B5B5B5]"
                                  : !noDealsMessage && (isDefault || isCheapest)
                                    ? "text-emerald-700"
                                    : "text-[#595858]"
                            }`}
                          >
                            {displayPrice}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <FlightSummary
          selectedDeal={selectedDeal}
          taxPerNight={taxPerNight}
          location={location}
          onBookNow={onBookNow}
          saveText={saveText}
        />

        {/* <button type="button" onClick={() => onEnquire?.()} disabled={isSearching}
          className="px-8 w-full bg-pml-primary hover:bg-pink-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-2.5 rounded-[8px] transition-all duration-200 text-[16px] mt-4"
        >
          Enquiry now
        </button> */}
    </div>
  );
}

