"use client";

import React from "react";
import { Plane, Clock, Wallet, Languages } from "lucide-react";

export interface KeyFactField {
  value?: string;
  detail?: string;
}

export interface KeyFactsProps {
  destinationName?: string;

  // Card 1: Flight Time
  flight_time?: KeyFactField | string;
  flightTime?: string;
  flightDetail?: string;

  // Card 2: Time Difference
  time_difference?: KeyFactField | string;
  timeDiff?: string;
  timeDetail?: string;

  // Card 3: Currency
  currency?: KeyFactField | string;
  currencyDetail?: string;

  // Card 4: Language
  language?: KeyFactField | string;
  languageDetail?: string;

  className?: string;
}

function extractFact(
  field: KeyFactField | string | undefined,
  directVal?: string,
  directDetail?: string
): { value: string; detail: string } {
  let value = "";
  let detail = "";

  if (typeof directVal === "string") {
    value = directVal.trim();
  }
  if (typeof directDetail === "string") {
    detail = directDetail.trim();
  }

  if (field && typeof field === "object") {
    if (!value && typeof field.value === "string") {
      value = field.value.trim();
    }
    if (!detail && typeof field.detail === "string") {
      detail = field.detail.trim();
    }
  } else if (typeof field === "string" && field.trim()) {
    if (!value) {
      value = field.trim();
    }
  }

  return { value, detail };
}

export default function KeyFacts({
  flight_time,
  flightTime,
  flightDetail,
  time_difference,
  timeDiff,
  timeDetail,
  currency,
  currencyDetail,
  language,
  languageDetail,
  className = "",
}: KeyFactsProps) {
  const flight = extractFact(flight_time, flightTime, flightDetail);
  const timeDiffFact = extractFact(time_difference, timeDiff, timeDetail);
  const currencyFact = extractFact(currency, undefined, currencyDetail);
  const languageFact = extractFact(language, undefined, languageDetail);

  const allCards = [
    {
      label: "Flight time",
      value: flight.value,
      detail: flight.detail,
      icon: <Plane size={18} className="stroke-[1.9] rotate-45" />,
      watermark: <Plane size={88} className="stroke-[1.2] rotate-45" />,
      tone: "bg-[#F3F8FF] text-[#1D4ED8]",
      wash: "text-[#1D4ED8]",
    },
    {
      label: "Time difference",
      value: timeDiffFact.value,
      detail: timeDiffFact.detail,
      icon: <Clock size={18} className="stroke-[1.9]" />,
      watermark: <Clock size={88} className="stroke-[1.2]" />,
      tone: "bg-[#FFF6EB] text-[#C2410C]",
      wash: "text-[#C2410C]",
    },
    {
      label: "Currency",
      value: currencyFact.value,
      detail: currencyFact.detail,
      icon: <Wallet size={18} className="stroke-[1.9]" />,
      watermark: <Wallet size={88} className="stroke-[1.2]" />,
      tone: "bg-[#F1FBF4] text-[#15803D]",
      wash: "text-[#15803D]",
    },
    {
      label: "Language",
      value: languageFact.value,
      detail: languageFact.detail,
      icon: <Languages size={18} className="stroke-[1.9]" />,
      watermark: <Languages size={88} className="stroke-[1.2]" />,
      tone: "bg-[#FDF2F8] text-[#BE185D]",
      wash: "text-[#BE185D]",
    },
  ];

  // Only cards with non-empty string values are shown
  const activeCards = allCards.filter(
    (card) => typeof card.value === "string" && card.value.trim().length > 0
  );

  // If no dynamic data is available for this destination, don't render the component
  if (activeCards.length === 0) {
    return null;
  }

  // Responsive grid based on active card count
  const gridClass =
    activeCards.length === 1
      ? "grid-cols-1 max-w-sm mx-auto"
      : activeCards.length === 2
      ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
      : activeCards.length === 3
      ? "grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto"
      : "grid-cols-2 lg:grid-cols-4";

  return (
    <section className={`w-full bg-[#F9FAFB] font-['Montserrat'] py-6 md:py-8 ${className}`}>
      <div className="mx-auto w-full max-w-[1440px] px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
        <div className={`mx-auto grid w-full max-w-[1280px] gap-3 sm:gap-4 ${gridClass}`}>
            {activeCards.map((card, idx) => (
              <div
                key={idx}
                className="relative min-h-[148px] overflow-hidden rounded-[8px] border border-black/5 bg-white px-5 py-5 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.25)]"
              >
                <div className={`pointer-events-none absolute -right-3 -bottom-4 opacity-[0.12] ${card.wash}`}>
                  {card.watermark}
                </div>
                <div className="relative flex items-start justify-between gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] ${card.tone}`}>
                    {card.icon}
                  </div>
                  <p className={`rounded-[8px] px-2.5 py-1 text-right text-[11px] font-semibold uppercase leading-tight tracking-[0.08em] ${card.tone}`}>
                    {card.label}
                  </p>
                </div>
                <h3 className="relative mt-5 text-[22px] font-bold leading-none text-[#111827] md:text-[26px]">
                  {card.value}
                </h3>
                {card.detail ? (
                  <p className="relative mt-2 text-[13px] leading-5 text-[#4B5563]">{card.detail}</p>
                ) : null}
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

export { KeyFacts };
