"use client";

import { useState, useEffect } from "react";
import { Clock, Info, Tag, Calendar, ChevronUp, ChevronDown, Check, Phone } from "lucide-react";
import { StaticPricingData, StaticPricingSeason } from "@/types/hotel";
import { attachCurrentPageToWhatsAppHref, getWhatsAppUrl } from "@/lib/utils";
import { WhatsAppIcon, WhatsAppOutlineIcon } from "./icons";

interface StaticPricingCardProps {
  data: StaticPricingData;
  phoneTel: string;
  onSeasonInfoChange?: (season: StaticPricingSeason | null) => void;
  onSeasonClick?: () => void;
  whatsappSource?: string;
  whatsappContextLine?: string;
}

export default function StaticPricingCard({ data, phoneTel, onSeasonInfoChange, onSeasonClick, whatsappSource, whatsappContextLine }: StaticPricingCardProps) {
  const [isDatesExpanded, setIsDatesExpanded] = useState(true);
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const { totalDuration, fromPrice, seasons, departureDates, localTaxes } = data;

  // Fall back to deriving departure-date rows from the season data when the
  // API doesn't send a dedicated departureDates breakdown for this hotel.
  const departureRows =
    departureDates && departureDates.length > 0
      ? departureDates
      : (seasons ?? []).map((season) => ({ price: season.price, dates: [season.dates] }));

  // Keep the parent's season-info state (used for banner/details-tabs/mobile-sheet
  // price) in sync with the selected card — fires for the default selection on
  // mount too, not just clicks. When there are no season cards at all, fall back
  // to the overview "from" price so the rest of the page doesn't show a blank
  // placeholder instead of the price already displayed above in this component.
  useEffect(() => {
    if (seasons && seasons.length > 0) {
      onSeasonInfoChange?.(seasons[selectedSeasonIndex] ?? null);
    } else if (fromPrice) {
      onSeasonInfoChange?.({ name: "Price Per Person", dates: totalDuration, price: fromPrice });
    } else {
      onSeasonInfoChange?.(null);
    }
  }, [selectedSeasonIndex, seasons, fromPrice, totalDuration]);

  return (
    <div className="p-3 flex flex-col gap-6 font-['Montserrat']">

      {/* Top Overview Section */}
      <div className="flex justify-between items-end pb-5 border-b border-gray-100">
        <div>
          <p className="text-sm text-[#595858] mb-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Total Duration
          </p>
          <p className="text-2xl font-semibold text-pml-primary ">{totalDuration}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#595858] mb-1 flex items-center justify-end gap-1">
            From (incl. Flights) <Info className="w-3 h-3" />
          </p>
          <p className="text-4xl font-extrabold tracking-tight text-pml-primary">£{fromPrice}</p>
        </div>
      </div>

      {/* Seasonal Pricing List */}
      {seasons && seasons.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#242F40] uppercase tracking-wider">Seasonal Pricing</h3>
          <div className="flex flex-col gap-3">
            {seasons.map((season, idx) => {
              const isSelected = idx === selectedSeasonIndex;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedSeasonIndex(idx);
                    onSeasonClick?.();
                  }}
                  className={`relative flex flex-row justify-between items-center gap-2 sm:gap-4 p-4 rounded-[14px] transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-pml-primary-soft/20 border-2 border-pml-primary"
                      : "bg-white border-2 border-gray-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute -top-2 right-3 flex items-center gap-1 bg-pml-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                      <Check className="w-3 h-3" /> Selected
                    </span>
                  )}
                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="text-[16px] font-bold text-[#242F40] tracking-wide truncate">{season.name}</p>
                    <p className="text-[12px] sm:text-[13px] text-[#595858] mt-0.5">{season.dates}</p>
                  </div>

                  <div className="flex flex-col items-end w-auto gap-2 shrink-0">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[10px] text-[#9F9F9F] uppercase font-bold tracking-wider">from</span>
                      <span className="text-xl sm:text-2xl font-black text-pml-primary leading-none tracking-tight">{season.price}</span>
                      <span className="text-[10px] text-[#9F9F9F] uppercase font-bold ml-0.5">pp</span>
                    </div>
                    <div className={`flex items-center gap-2 rounded-full px-1.5 py-1 transition-all duration-200 ${ isSelected ? "border-pml-primary bg-pml-primary shadow-sm" : "border-gray-200 bg-white hover:border-pml-primary/40" }`} >
                      <a
                        href={`tel:${phoneTel}`}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Call"
                        className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full transition-colors ${
                          isSelected
                            ? "bg-white/15 text-white hover:bg-white/25"
                            : "bg-pml-primary-soft/30 text-pml-primary hover:bg-pml-primary-soft/50"
                        }`}
                      >
                        <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                      </a>

                      <a href={getWhatsAppUrl({ source: whatsappSource, contextLine: whatsappContextLine })} onClick={(e) => { e.stopPropagation(); attachCurrentPageToWhatsAppHref(e, { source: whatsappSource, contextLine: whatsappContextLine, }); }} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full transition-colors ${ isSelected ? "bg-white/15 text-white hover:bg-white/25" : "bg-green-50 text-[#25D366] hover:bg-green-100" }`} >
                        <WhatsAppIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ):null}

      {/* Departure Dates Section */}
      {departureRows.length > 0 ? (
        <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setIsDatesExpanded(!isDatesExpanded)}
            className={`w-full px-4 py-3.5 flex justify-between items-center transition-colors bg-white hover:bg-pml-primary/5 ${
              isDatesExpanded ? "border-b border-gray-100" : ""
            }`}
          >
            <h3 className="text-sm font-bold text-[#242F40] flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-pml-primary" />
              Detailed Departure Dates
            </h3>
            {isDatesExpanded ? <ChevronUp className="w-4 h-4 text-[#595858]" /> : <ChevronDown className="w-4 h-4 text-[#595858]" />}
          </button>

          {isDatesExpanded && (
            <div className="px-4 divide-y divide-[#F5F5F5]">
              {departureRows.map((group, idx) => (
                <div key={idx} className="flex items-start gap-6 py-3">
                  <div className="flex items-baseline gap-1 shrink-0 w-[70px] rounded-[8px] bg-pml-primary/5 px-2 py-1">
                    <span className="text-[15px] font-bold text-pml-primary">£{group.price}</span>
                    <span className="text-[11px] text-[#9F9F9F] font-medium">pp</span>
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    {group.dates.map((dateLine, dIdx) => (
                      <span key={dIdx} className="text-[13px] text-[#595858]">
                        {dateLine}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ):null}

      {/* Local Taxes Disclaimer */}
      {localTaxes.length > 0 && (
        <div className="bg-pml-primary/5 border border-pml-primary/15 rounded-[8px] p-3 flex items-start gap-3">
          <Tag className="w-5 h-5 text-pml-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-pml-primary mb-1.5">Local Tax</h4>
            <ul className="space-y-1.5 list-disc pl-4">
              {localTaxes.map((tax, idx) => (
                <li key={idx} className="text-xs text-[#595858] leading-relaxed">
                  {tax}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
