"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { PriceData } from "@/types/multi-centre";
import { getAirportNameWithCode } from "@/lib/mappings/airports";
import { buildEnquirySource } from "@/lib/source-builder";
import { openTawkChat } from "@/lib/tawk";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Check, Copy, Crown, Info, Phone, Plane, ShieldCheck } from "lucide-react";
import { useUtmPhone } from "../utm/UtmPhoneProvider";
import {
  attachCurrentPageToWhatsAppHref,
  formatWhatsAppDateLine,
  getWhatsAppUrl,
} from "@/lib/utils";

type AirportOption = { id: string; label: string };

type Props = {
  priceData: PriceData;
  listOfAirports: number[];
  selectedAirportId: string;
  onAirportChange: (airportId: string) => void;
  boardBasis: string;
  duration: string;
  location?: string;
  pricingSourceMode?: "manual" | "builder";
  landingDealDate: string;
  selectedDate: string;
  onDateSelect: (dateIso: string) => void;
  onBookNow: (date?: string) => void;
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const formatPrice = (price: number) => `£${Math.round(price)}`;

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

const getStartDay = (year: number, month: number) => new Date(year, month, 1).getDay();

function resolveVisibleMonth(landingDealDate: string, priceData: PriceData): { year: number; month: number } {
  const landingParts = landingDealDate.split("-").map(Number);
  const landingYear = landingParts[0];
  const landingMonth = landingParts[1];
  if (
    Number.isFinite(landingYear) &&
    Number.isFinite(landingMonth) &&
    landingMonth >= 1 &&
    landingMonth <= 12
  ) {
    return { year: landingYear, month: landingMonth - 1 };
  }

  const firstAvailableDate = priceData[0]?.date ?? "";
  const [priceYear, priceMonth] = firstAvailableDate.split("-").map(Number);
  if (
    Number.isFinite(priceYear) &&
    Number.isFinite(priceMonth) &&
    priceMonth >= 1 &&
    priceMonth <= 12
  ) {
    return { year: priceYear, month: priceMonth - 1 };
  }

  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() };
}

export default function MultiCentreCalendar({
  priceData,
  listOfAirports,
  selectedAirportId,
  onAirportChange,
  boardBasis,
  duration,
  location,
  pricingSourceMode,
  landingDealDate,
  selectedDate,
  onDateSelect,
  onBookNow,
}: Props) {
  const pathname = usePathname();
  const [currentYear, setCurrentYear] = useState(() => resolveVisibleMonth(landingDealDate, priceData).year);
  const [currentMonth, setCurrentMonth] = useState(() => resolveVisibleMonth(landingDealDate, priceData).month);
  const [showTaxDetails, setShowTaxDetails] = useState(true);
  const [copiedRef, setCopiedRef] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const { phoneDisplay, phoneTel } = useUtmPhone();
  const whatsappSource = buildEnquirySource({ section: "multi-centre", pathname });
  const today = useMemo(() => new Date(), []);
  const todayIso = today.toISOString().split("T")[0];

  // Navigate to the month of landingDealDate when it changes
  useEffect(() => {
    const { year, month } = resolveVisibleMonth(landingDealDate, priceData);
    setCurrentYear(year);
    setCurrentMonth(month);
  }, [landingDealDate, priceData]);

  // Map listOfAirports to airport options
  const availableAirports = useMemo(() => {
    return listOfAirports.map(code => ({
      id: String(code),
      label: getAirportNameWithCode(String(code))
    }));
  }, [listOfAirports]);

  // Filter months with prices
  const availableMonths = useMemo(() => {
    const months: Array<{ year: number; month: number }> = [];
    priceData.forEach(({ date }) => {
      const [y, m] = date.split("-").map(Number);
      const monthKey = { year: y, month: m - 1 };
      if (!months.some((m) => m.year === monthKey.year && m.month === monthKey.month)) {
        months.push(monthKey);
      }
    });
    return months.sort((a, b) => a.year - b.year || a.month - b.month);
  }, [priceData]);

  const monthOptions = useMemo(() => {
    return availableMonths.map(({ year, month }) => ({
      value: `${year}-${month}`,
      label: `${monthNames[month]} ${year}`,
    }));
  }, [availableMonths]);

  const handleMonthChange = useCallback((direction: "prev" | "next") => {
    const currentIndex = availableMonths.findIndex(m => m.year === currentYear && m.month === currentMonth);
    if (direction === "prev" && currentIndex > 0) {
      const prev = availableMonths[currentIndex - 1];
      setCurrentYear(prev.year);
      setCurrentMonth(prev.month);
    } else if (direction === "next" && currentIndex < availableMonths.length - 1) {
      const next = availableMonths[currentIndex + 1];
      setCurrentYear(next.year);
      setCurrentMonth(next.month);
    }
  }, [availableMonths, currentYear, currentMonth]);

  const handleMonthYearSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const [yearStr, monthStr] = e.target.value.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    setCurrentYear(year);
    setCurrentMonth(month);
  }, []);

  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    priceData.forEach((p) => map.set(p.date, p.price));
    return map;
  }, [priceData]);

  const cheapestPriceInMonth = useMemo(() => {
    if (!priceData.length) return null;
    // Filter prices for current month only
    const currentMonthPrices = priceData
      .filter(({ date }) => {
        const [y, m] = date.split("-").map(Number);
        return y === currentYear && m - 1 === currentMonth && date > todayIso;
      })
      .map(p => p.price);
    
    return currentMonthPrices.length > 0 ? Math.min(...currentMonthPrices) : null;
  }, [priceData, currentYear, currentMonth, todayIso]);

  const days = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const startDay = getStartDay(currentYear, currentMonth);
    const arr: Array<{ day: number; iso: string; price: number | null; isPastOrToday: boolean }> = [];

    for (let i = 0; i < startDay; i++) {
      arr.push({ day: 0, iso: "", price: null, isPastOrToday: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const price = priceMap.get(iso) ?? null;
      const isPastOrToday = iso <= todayIso;
      arr.push({ day: d, iso, price, isPastOrToday });
    }

    return arr;
  }, [currentYear, currentMonth, priceMap, todayIso]);

  const selectedDatePrice = useMemo(() => {
    if (!selectedDate) return null;
    return priceMap.get(selectedDate) ?? null;
  }, [selectedDate, priceMap]);

  const selectedPriceItem = useMemo(() => {
    if (!selectedDate) return null;
    return priceData.find((p) => p.date === selectedDate) as (PriceData extends Array<infer U> ? U : any) | undefined | null;
  }, [selectedDate, priceData]);

  const whatsappContextLine = pricingSourceMode === "builder" && (selectedPriceItem as any)?.referenceId
    ? (selectedPriceItem as any).referenceId
    : formatWhatsAppDateLine(selectedDate);

  const handleOpenChat = () => {
    openTawkChat();
  };

  const handleCopyReferenceId = async () => {
    const refId = (selectedPriceItem as any)?.referenceId;
    if (!refId) return;
    await navigator.clipboard.writeText(refId);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2600);
  };

  return (
    <div id="multi-centre-calendar" className="w-full overflow-hidden rounded-[16px] border border-[#EDEDED] bg-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.08),0_0_20px_0_rgba(192,24,120,0.03)]">
      <div className="flex items-center justify-between border-b border-[#1a1a1a]/60 bg-gradient-to-r from-pml-dark via-[#1a1a1a] to-pml-dark px-6 py-4 text-white">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
          <Crown className="h-[11px] w-[11px] text-amber-400" /> Luxury Escape
        </span>
        <span className="flex items-center gap-2 text-[11px] font-medium text-slate-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Live Prices
        </span>
      </div>

      <div className="p-4">
      <div className="mb-3">
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Departing from</div>
        <div className="relative">
          <select
            value={selectedAirportId}
            onChange={(e) => onAirportChange(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-[#EDEDED] bg-[#FAFAFA] p-2.5 pr-9 text-[14px] font-semibold text-[#595858] transition-colors hover:bg-[#F5F5F5]"
          >
            {availableAirports.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8A8A8A]" />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3" id="holiday-calendar-grid">
        <div>
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Board basis</div>
          <div className="rounded-2xl border border-[#EDEDED] bg-[#FAFAFA] p-2.5 text-[14px] font-semibold text-[#595858]">
            {boardBasis}
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Duration</div>
          <div className="rounded-2xl border border-[#EDEDED] bg-[#FAFAFA] p-2.5 text-[14px] font-semibold text-[#595858]">
            {duration}
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-1 rounded-2xl border border-[#EDEDED] bg-[#FAFAFA] p-1.5">
        <button
          onClick={() => handleMonthChange("prev")}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8A8A8A] transition-all hover:bg-white hover:text-pml-primary hover:shadow-sm disabled:pointer-events-none disabled:opacity-40"
          disabled={availableMonths.findIndex(m => m.year === currentYear && m.month === currentMonth) === 0}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <div className="relative flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-pml-primary" />
          <select
            value={`${currentYear}-${currentMonth}`}
            onChange={handleMonthYearSelect}
            className="appearance-none bg-transparent text-[14px] font-bold tracking-wide text-[#242F40] focus:outline-none"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => handleMonthChange("next")}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8A8A8A] transition-all hover:bg-white hover:text-pml-primary hover:shadow-sm disabled:pointer-events-none disabled:opacity-40"
          disabled={availableMonths.findIndex(m => m.year === currentYear && m.month === currentMonth) === availableMonths.length - 1}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-[12px] font-semibold text-[#595858]">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((cell, idx) => {
          if (cell.day === 0) {
            return <div key={idx} className="h-[52px]" />;
          }

          const hasPrice = cell.price !== null;
          const isSelected = cell.iso === selectedDate;
          const isCheapestInMonth = hasPrice && cell.price === cheapestPriceInMonth;
          const isDisabledDate = cell.isPastOrToday;
          const showPhoneIcon = !hasPrice && !isDisabledDate;

          return (
            <button
              key={cell.iso}
              onClick={() => {
                if (isDisabledDate) return;
                // select date (even if no price) and open booking flow
                onDateSelect(cell.iso);
                onBookNow(cell.iso);
              }}
              className={`relative h-[52px] rounded-[12px] border text-center flex flex-col items-center justify-center transition-all duration-200 ${
                isDisabledDate
                  ? "border-[#F2F2F2] bg-[#FAFAFA] opacity-50 cursor-not-allowed"
                  : isSelected
                    ? "border-transparent bg-gradient-to-br from-pml-primary to-[#a81a6f] text-white shadow-md"
                    : isCheapestInMonth
                      ? "border-transparent bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg"
                      : hasPrice
                        ? "border-[#EDEDED] bg-white hover:-translate-y-0.5 hover:border-pml-primary/40 hover:bg-pml-primary/5 hover:shadow-md"
                        : "border-[#F0F0F0] bg-[#FAFAFA] cursor-pointer hover:-translate-y-0.5 hover:bg-[#F5F5F5]"
              }`}
              disabled={isDisabledDate}
            >
              {isSelected && (
                <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full border-2 border-white bg-amber-300" />
              )}
              {isCheapestInMonth && !isSelected && (
                <span className="absolute -top-1.5 -right-1 rounded-full bg-amber-300 px-1 text-[8px] font-bold uppercase text-[#242F40] shadow-sm">
                  Save
                </span>
              )}
              <div className={`text-[13px] font-semibold ${isSelected || isCheapestInMonth ? "text-white" : "text-[#595858]"}`}>
                {cell.day}
              </div>
              <div className={`text-[11px] font-medium ${isSelected || isCheapestInMonth ? "text-white" : hasPrice ? "text-[#595858]" : "text-[#8A8A8A]"}`}>
                {isDisabledDate ? "" : showPhoneIcon ? <Phone className="h-3 w-3" /> : hasPrice ? formatPrice(cell.price!) : "-"}
              </div>
            </button>
          );
        })}
      </div>
      {/* Small card that displays selected date, base price, tax and total so user has clarity */}
      {selectedDate && selectedPriceItem ? (
        <div className="relative mt-4 mb-2 w-full overflow-hidden rounded-2xl border border-pml-primary/20 bg-gradient-to-br from-pink-50/50 via-white to-[#FAFAFA] p-4 shadow-sm">
          <div className="absolute bottom-0 left-0 top-0 w-1.5 rounded-r-full bg-pml-primary" />

          <div className="mb-3 flex items-center justify-between gap-2 pl-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pml-primary px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white shadow-sm">
              <Plane className="h-3 w-3" />
              Flights&nbsp;included
            </span>

            {pricingSourceMode === "builder" && (selectedPriceItem as any)?.referenceId && (
              <div className="flex items-center gap-1.5 rounded-xl border border-[#EDEDED] bg-white/90 px-2.5 py-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#8A8A8A]">Ref:</span>
                <span className="font-mono text-[11px] font-bold text-[#595858]">{(selectedPriceItem as any).referenceId}</span>
                <button
                  type="button"
                  onClick={handleCopyReferenceId}
                  title="Copy reference code"
                  className="ml-0.5 text-[#8A8A8A] transition-colors hover:text-pml-primary"
                >
                  {copiedRef ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-end justify-between gap-4 pl-1.5">
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A8A8A]">
                Departure Date
              </span>
              <div className="mt-1 flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pml-primary/10 text-pml-primary">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-sm font-bold leading-tight text-[#242F40] sm:text-base">
                    {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="block text-xs font-medium text-[#8A8A8A]">
                    {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A8A8A]">Starting From</span>
              <div className="mt-0.5 flex items-baseline justify-end gap-0.5">
                <span className="text-2xl font-extrabold tracking-tight text-pml-primary">
                  {formatPrice((selectedPriceItem as any).price)}
                </span>
                <span className="text-xs font-semibold text-[#8A8A8A]">/pp</span>
              </div>
              <span className="block text-[10px] font-medium text-[#8A8A8A]">based on 2 guests</span>
            </div>
          </div>
        </div>
      ) : null}

      {selectedPriceItem && (selectedPriceItem as any).localTax > 0 && location && (
        <div className="mb-2 rounded-2xl border border-amber-200/60 bg-amber-50/50 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Info className="h-3.5 w-3.5" />
              </div>
              <h4 className="text-xs font-bold text-[#3A3A3A]">Local Hotel Tax Note</h4>
            </div>
            <button
              type="button"
              onClick={() => setShowTaxDetails((v) => !v)}
              className="shrink-0 text-[11px] font-semibold text-pml-primary hover:underline"
            >
              {showTaxDetails ? "Hide" : "Details"}
            </button>
          </div>
          <div className="mt-2.5 space-y-2 pl-8 text-[11px] leading-relaxed text-[#595858]">
            <p>
              <span className="capitalize">{location}</span> local tax of{" "}
              <strong className="font-bold text-[#3A3A3A]">{formatPrice((selectedPriceItem as any).localTax)}</strong> per guest applies.
            </p>
            {showTaxDetails && (
              <p className="text-[10.5px] text-[#8A8A8A]">
                Payable directly at the hotel at check-in or check-out — it is not paid to us. Calculated
                using live exchange rates, so the final figure can shift slightly.
              </p>
            )}
            <div className="mt-2 flex items-center justify-between rounded-xl border border-amber-200/50 bg-white/90 px-2.5 py-2 text-xs font-semibold text-[#595858]">
              <span className="font-medium text-[#8A8A8A]">Package + Tax estimate:</span>
              <span className="font-bold text-[#242F40]">
                {formatPrice((selectedPriceItem as any).price)} + <span className="text-pml-primary">{formatPrice((selectedPriceItem as any).localTax)}</span> ={" "}
                <span className="font-extrabold text-pml-primary">{formatPrice((selectedPriceItem as any).totalPrice)}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 text-[#595858]">
        <a
          href={`tel:${phoneTel}`}
          data-testid="mc-cta-call"
          className="inline-flex items-center justify-center gap-1.5 rounded-2xl px-2 py-2 text-[12px] font-semibold leading-[140%] bg-gradient-to-br from-[#d81b60] to-[#c01878] text-white border border-transparent shadow-[0_8px_20px_-4px_rgba(203,33,135,0.35)] transition-all duration-200 hover:opacity-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pml-primary focus-visible:ring-offset-2"
          aria-label={`Call ${phoneDisplay}`}
        >
          <Phone className="h-3.5 w-3.5" />
          <span>{phoneDisplay}</span>
        </a>

        <button
          type="button"
          onClick={handleOpenChat}
          data-testid="mc-cta-chat"
          className="inline-flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-[12px] font-semibold leading-[140%] bg-white text-pml-primary border-2 border-pml-primary transition-all duration-200 hover:bg-pml-primary/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pml-primary focus-visible:ring-offset-2"
          aria-label="Open chat"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 23 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.25 21C5.13975 21 5.02875 20.9753 4.9245 20.9257C4.66575 20.8005 4.5 20.5387 4.5 20.25V16.5H2.25C1.0095 16.5 0 15.4905 0 14.25V2.25C0 1.0095 1.0095 0 2.25 0H20.25C21.4905 0 22.5 1.0095 22.5 2.25V14.25C22.5 15.4905 21.4905 16.5 20.25 16.5H11.1383L5.71875 20.8358C5.583 20.9445 5.41725 21 5.25 21ZM2.25 1.5C1.836 1.5 1.5 1.83675 1.5 2.25V14.25C1.5 14.6632 1.836 15 2.25 15H5.25C5.66475 15 6 15.3352 6 15.75V18.69L10.4062 15.1642C10.5398 15.0577 10.704 15 10.875 15H20.25C20.664 15 21 14.6632 21 14.25V2.25C21 1.83675 20.664 1.5 20.25 1.5H2.25Z"
              fill="#CB2187"
            />
            <path
              d="M17.25 7.5H5.25C4.83525 7.5 4.5 7.164 4.5 6.75C4.5 6.336 4.83525 6 5.25 6H17.25C17.6648 6 18 6.336 18 6.75C18 7.164 17.6648 7.5 17.25 7.5Z"
              fill="#CB2187"
            />
            <path
              d="M11.25 10.5H5.25C4.83525 10.5 4.5 10.164 4.5 9.75C4.5 9.336 4.83525 9 5.25 9H11.25C11.6648 9 12 9.336 12 9.75C12 10.164 11.6648 10.5 11.25 10.5Z"
              fill="#CB2187"
            />
          </svg>
          chat online
        </button>

        <a
          href={getWhatsAppUrl({
            source: whatsappSource,
            contextLine: whatsappContextLine,
          })}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) =>
            attachCurrentPageToWhatsAppHref(event, {
              source: whatsappSource,
              contextLine: whatsappContextLine,
            })
          }
          data-testid="mc-cta-whatsapp"
          className="inline-flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-[12px] font-semibold leading-[140%] bg-pml-whatsapp text-white border border-pml-whatsapp shadow-[0_8px_20px_-4px_rgba(37,211,102,0.35)] transition-all duration-200 hover:bg-pml-whatsapp/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pml-whatsapp focus-visible:ring-offset-2"
          aria-label="Send a WhatsApp message"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 fill-current"
            aria-hidden="true"
          >
            <path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c7.905 4.27 17.661-1.4 17.665-10.449 0-3.176-1.24-6.165-3.495-8.402ZM22.002 11.866c-.006 7.633-8.385 12.4-15.012 8.504l-.36-.214-3.75.975 1.005-3.645-.239-.375C-.478 10.546 4.26 1.966 12.072 1.966c2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99Z" />
            <path d="M17.507 14.307c-2.199-1.096-2.429-1.242-2.713-.816-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.293-.506.32-.578.878-1.634.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.576-.05-.997-.042-1.368.344-1.614 1.774-1.207 3.604.174 5.55 2.714 3.552 4.16 4.206 6.804 5.114.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345Z" />
          </svg>
          whatsapp
        </a>
      </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 border-t border-[#EDEDED] bg-[#FAFAFA] px-6 py-3">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        <p className="text-[10px] font-medium tracking-wide text-[#8A8A8A]">
          ATOL Protected &bull; 100% Financial Guarantee
        </p>
      </div>

      {showCopyToast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-2xl bg-slate-900/90 px-4 py-3 text-xs font-medium text-white shadow-2xl backdrop-blur-md">
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span>Reference code copied to clipboard</span>
        </div>
      )}
    </div>
  );
}