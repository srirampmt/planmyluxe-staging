"use client";

import { useState } from "react";
import { HotelDeal } from "@/types/hotel";
import {
  getEffectivePrice,
  calculateTotalTax,
  getPricePerPerson,
  formatAirport,
  calculateSaveStrikePricing,
  getBoardBasisText,
} from "@/lib/hotel-utils";
import { useUtmPhone } from "@/components/utm/UtmPhoneProvider";
import {
  Plane,
  Info,
  Zap,
  Building2,
  Ticket,
  Copy,
  Check,
  ShieldCheck,
  Utensils,
} from "lucide-react";

type FlightSummaryProps = {
  selectedDeal?: HotelDeal | null;
  emptyStateMessage?: string;
  onBookNow?: () => void;
  taxPerNight?: number;
  location?: string;
  saveText?: string;
};

export default function FlightSummary({
  selectedDeal,
  emptyStateMessage =
    "We couldn't find any offers that match your current search, but don't worry - our team is ready to help! Please call us or send an enquiry, and we'll create the perfect travel plan tailored just for you.",
  onBookNow,
  taxPerNight,
  location,
  saveText,
}: FlightSummaryProps) {
  const { phoneDisplay, phoneTel } = useUtmPhone();
  const [copied, setCopied] = useState(false);
  const [showTaxDetails, setShowTaxDetails] = useState(true);

  /* ── Empty state ──────────────────────────────────────────── */
  if (!selectedDeal) {
    return (
      <button
        type="button"
        onClick={onBookNow}
        disabled={!onBookNow}
        className="mt-2 inline-flex h-[46px] w-full items-center justify-center rounded-[8px] bg-pml-primary text-[17px] font-bold leading-[14px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.2)] transition-colors hover:bg-[#a81a6f] disabled:cursor-not-allowed disabled:opacity-70"
      >
        Enquire now
      </button>
    );
  }

  /* ── Price calculations ─────────────────────────────────────────── */
  const roundedBasePrice = Math.round(getEffectivePrice(selectedDeal));
  const totalTax = calculateTotalTax(selectedDeal, taxPerNight, location);
  const roundedTax = Math.round(totalTax);
  const totalPrice   = roundedBasePrice + roundedTax;
  const priceStr     = getPricePerPerson(roundedBasePrice);
  const baseStr      = getPricePerPerson(roundedBasePrice);
  const taxStr       = getPricePerPerson(roundedTax);
  const totalPriceStr = getPricePerPerson(totalPrice);
  const showTax      = roundedTax > 0;
  const airportCode  = selectedDeal.flight?.departureAirportCode ?? selectedDeal.hotel?.fromAirport ?? "";
  const airportName  = formatAirport(airportCode);
  const packageLabel = getBoardBasisText(selectedDeal.hotel.boardBasis);
  const { saveBadgeText, hasStrikePrice, strikePriceValue } =
    calculateSaveStrikePricing(roundedBasePrice, saveText);
  const strikePriceStr =
    hasStrikePrice && strikePriceValue != null
      ? getPricePerPerson(strikePriceValue)
      : "";

  const handleCopyQuoteRef = async () => {
    if (!selectedDeal.quoteReference) return;
    await navigator.clipboard.writeText(selectedDeal.quoteReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 w-full rounded-2xl border border-gray-200 p-4 font-['Montserrat'] text-[#595858]">
      {/* Includes flights pill */}

      {/* Package label + price (left) / save badge + strike price (right) */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="inline-flex items-center text-unwrap gap-1.5 rounded-full bg-pml-primary/10 px-3 py-1 text-[10px] md:text-[11px] font-bold uppercase tracking-wide text-pml-primary">
            <span>Includes flights</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-pml-primary/10 px-3 py-1 text-[10px] md:text-[11px] font-bold uppercase tracking-wide text-pml-primary">
            <span>{packageLabel}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            {hasStrikePrice ? (
              <p className="relative inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[14px] font-medium leading-[14px] text-gray-500">
                <span className="relative">
                  {strikePriceStr}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[1.25px] w-[120%] -translate-x-1/2 -translate-y-1/2 rotate-[-1deg] bg-gray-500"
                  />
                </span>
              </p>
            ) : null}
            {saveBadgeText ? (
              <div className="inline-flex h-[24px] shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-[#25D366] px-[10px] text-[12px] font-semibold leading-[14px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.2)]">
                <Zap className="h-3 w-3" fill="currentColor" />
                Save&nbsp;{saveBadgeText}%
              </div>
            ) : null}
          </div>
          <div className="flex items-baseline gap-1 text-[30px] font-extrabold leading-[32px] text-pml-primary">
            <span className="text-[12px] font-semibold leading-[14px] text-pml-primary/70">from</span>
            <span>{priceStr}</span>
            <span className="text-[14px] font-medium leading-[16px] text-pml-primary/70">pp</span>
          </div>
        </div>
      </div>

      {/* Departure Airport + Quote Ref */}
      <div className="mt-3 divide-y divide-gray-200 rounded-[8px] border border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="flex items-center gap-2 text-[13px] font-medium leading-[14px] text-[#595858]">
            <Building2 className="h-4 w-4 text-[#8A8A8A]" />
            Departure Airport
          </span>
          <span className="text-[14px] font-semibold leading-[20px] text-[#242F40]">{airportName}</span>
        </div>
        {!!selectedDeal.flight && (
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="flex items-center gap-2 text-[13px] font-medium leading-[14px] text-[#595858]">
              <Ticket className="h-4 w-4 text-[#8A8A8A]" />
              Quote Ref
            </span>
            <span className="flex items-center gap-1.5 text-[14px] font-semibold leading-[20px] text-[#242F40]">
              {selectedDeal.quoteReference}
              <button
                type="button"
                onClick={handleCopyQuoteRef}
                aria-label="Copy quote reference"
                className="text-[#8A8A8A] hover:text-pml-primary"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Local hotel tax alert */}
      {showTax && location && (
        <div className="mt-3 rounded-[8px] border border-fuchsia-100 bg-fuchsia-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[13px] font-bold leading-[16px] text-[#3A3A3A]">
              <Info className="h-[16px] w-[16px] shrink-0 text-pml-primary" />
              Local Hotel Tax Alert
            </span>
            <button
              type="button"
              onClick={() => setShowTaxDetails((v) => !v)}
              className="shrink-0 text-[12px] font-semibold text-pml-primary underline underline-offset-2"
            >
              {showTaxDetails ? "Hide" : "Details"}
            </button>
          </div>
          <p className="mt-1.5 text-[13px] font-medium leading-[20px] text-[#3A3A3A]">
            <span className="capitalize">{location}</span> local tax of{" "}
            <span className="font-bold text-pml-primary">{taxStr}</span> per guest apply.
          </p>
          {showTaxDetails && (
            <p className="mt-1.5 text-[13px] font-medium leading-[20px] text-[#3A3A3A]">
              Properties in <span className="font-bold text-pml-primary">{location}</span> collect this local
              tax payable directly at the hotel at check-in or check-out — it is not paid to us. Calculated
              using live exchange rates, so the final figure can shift slightly.
            </p>
          )}
          <div className="mt-2 flex items-center justify-between rounded-[8px] bg-white px-3 py-2 text-[13px]">
            <span className="text-[#595858]">Package + Tax estimate:</span>
            <span className="font-bold text-[#242F40]">
              {priceStr} + <span className="text-pml-primary">{taxStr}</span> ={" "}
              <span className="text-pml-primary">{totalPriceStr}</span>
            </span>
          </div>
        </div>
      )}

      <button
        id="seo-enquire-button-hotels"
        type="button"
        onClick={onBookNow}
        disabled={!onBookNow}
        className="mt-2 inline-flex h-[46px] w-full items-center justify-center rounded-[8px] bg-pml-primary text-[17px] font-bold leading-[14px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.2)] transition-colors hover:bg-[#a81a6f] disabled:cursor-not-allowed disabled:opacity-70"
      >
        Enquire Now
      </button>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium leading-[14px] text-[#8A8A8A]">
        <ShieldCheck className="h-3.5 w-3.5 text-pml-primary" />
        Secure Price &amp; Quote Protection Included
      </p>
      <div id="flight-summary-end" className="h-px" />
    </div>
  );
}
