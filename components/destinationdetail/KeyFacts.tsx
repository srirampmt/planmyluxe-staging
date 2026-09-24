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
      label: "FLIGHT TIME",
      value: flight.value,
      detail: flight.detail,
      icon: <Plane size={19} className="stroke-[1.9] rotate-45 transform" />,
    },
    {
      label: "TIME DIFFERENCE",
      value: timeDiffFact.value,
      detail: timeDiffFact.detail,
      icon: <Clock size={19} className="stroke-[1.9]" />,
    },
    {
      label: "CURRENCY",
      value: currencyFact.value,
      detail: currencyFact.detail,
      icon: <Wallet size={19} className="stroke-[1.9]" />,
    },
    {
      label: "LANGUAGE",
      value: languageFact.value,
      detail: languageFact.detail,
      icon: <Languages size={19} className="stroke-[1.9]" />,
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
    <section className={`w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] font-['Montserrat'] py-6 md:py-8 ${className}`}>
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
        <div className="w-full max-w-[1280px] mx-auto">
          <div className={`grid ${gridClass} gap-2.5 sm:gap-3 md:gap-4`}>
            {activeCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[8px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] py-3.5 px-3 sm:py-4 sm:px-3.5 flex flex-col items-center justify-center text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-default"
              >
                {/* Icon Inside Pink Rounded Badge */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[8px] bg-[#fdf0f7] text-[#cb2187] flex items-center justify-center mb-2.5 sm:mb-3 transition-transform duration-300 group-hover:scale-110 shrink-0 shadow-2xs">
                  {card.icon}
                </div>

                {/* Constant Category Label */}
                <span className="font-montserrat text-[9.5px] sm:text-[10.5px] font-bold text-[#8E98A8] uppercase tracking-[0.08em] select-none">
                  {card.label}
                </span>

                {/* Subtle Pink Accent Divider Line */}
                <div className="w-4 sm:w-5 h-[1.5px] bg-[#cb2187] rounded-full my-1.5 sm:my-2" />

                {/* Dynamic Primary Metric Value */}
                <h3 className="font-['Montserrat'] text-[15px] md:text-[16px] font-semibold text-[#1a1a1a] leading-snug mb-0.5">
                  {card.value}
                </h3>

                {/* Dynamic Detail / Context Description (if available) */}
                {card.detail ? (
                  <p className="font-montserrat text-[10.5px] sm:text-[11.5px] font-medium text-[#6B7280] leading-snug">
                    {card.detail}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export { KeyFacts };
