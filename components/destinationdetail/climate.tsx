"use client";

import { useMemo } from "react";
import { Sun, Thermometer, Leaf } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface WeatherDataPoint {
  month_name?: string;
  month?: string;
  temperature?: string | number;
  temp?: string | number;
  [key: string]: any;
}

interface ClimateProps {
  destinationName: string;
  weatherData?: WeatherDataPoint[] | "" | null;
  embedded?: boolean;
  linked?: boolean;
  setApi?: (api: CarouselApi) => void;
}

interface MonthDefinition {
  full: string;
  abbr: string;
  color: string;
}

// 12 Standard Calendar Months with design-system accent indicator colors
const MONTHS: readonly MonthDefinition[] = [
  { full: "january", abbr: "Jan", color: "bg-sky-400" },
  { full: "february", abbr: "Feb", color: "bg-sky-400" },
  { full: "march", abbr: "Mar", color: "bg-emerald-400" },
  { full: "april", abbr: "Apr", color: "bg-emerald-400" },
  { full: "may", abbr: "May", color: "bg-amber-400" },
  { full: "june", abbr: "Jun", color: "bg-orange-400" },
  { full: "july", abbr: "Jul", color: "bg-rose-500" },
  { full: "august", abbr: "Aug", color: "bg-rose-500" },
  { full: "september", abbr: "Sep", color: "bg-orange-400" },
  { full: "october", abbr: "Oct", color: "bg-amber-400" },
  { full: "november", abbr: "Nov", color: "bg-sky-400" },
  { full: "december", abbr: "Dec", color: "bg-sky-400" },
];

const cleanTemp = (tempStr: string | number | undefined | null): string => {
  if (tempStr === undefined || tempStr === null) return "...";
  const str = String(tempStr).trim();
  if (!str || str === "..." || str === "N/A") return str || "...";
  let cleaned = str.replace(/[\uFFFD\u00B0]/g, "°").trim();
  if (!cleaned.includes("°")) {
    cleaned += "°";
  }
  if (!cleaned.endsWith("C") && !cleaned.endsWith("F")) {
    cleaned += "C";
  }
  return cleaned;
};

export default function Climate({ destinationName, weatherData, embedded = false, linked = false, setApi }: ClimateProps) {
  // Check if valid weather data actually exists
  const hasValidWeather = useMemo(() => {
    if (!Array.isArray(weatherData) || weatherData.length === 0) {
      return false;
    }
    return weatherData.some((item) => {
      if (!item || typeof item !== "object") return false;
      const rawTemp = item.temperature ?? item.temp;
      if (rawTemp === undefined || rawTemp === null) return false;
      const str = String(rawTemp).trim();
      return str !== "" && str !== "..." && str !== "N/A";
    });
  }, [weatherData]);

  // Map standard 12 calendar months to weather data
  const list = useMemo(() => {
    if (!hasValidWeather || !Array.isArray(weatherData)) {
      return [];
    }

    // Build normalized map for O(1) lookup
    const tempByMonth = new Map<string, string | number>();
    for (const item of weatherData) {
      if (item && typeof item === "object") {
        const rawMonth = item.month_name || item.month || item.name;
        const rawTemp = item.temperature ?? item.temp;
        if (rawMonth && rawTemp !== undefined && rawTemp !== null) {
          const normalized = String(rawMonth).trim().toLowerCase();
          tempByMonth.set(normalized, rawTemp);
          tempByMonth.set(normalized.slice(0, 3), rawTemp);
        }
      }
    }

    return MONTHS.map((m) => {
      const temp = tempByMonth.get(m.full) ?? tempByMonth.get(m.full.slice(0, 3)) ?? "...";
      return {
        month: m.abbr,
        temp,
        color: m.color,
      };
    });
  }, [weatherData, hasValidWeather]);

  if (!hasValidWeather) {
    return null;
  }

  const monthCard = (data: { month: string; temp: string | number; color: string }) => (
    <div
      key={data.month}
      className="w-full bg-white rounded-[8px] border border-gray-100 shadow-sm py-2 px-0.5 sm:py-2.5 sm:px-1.5 md:py-3 md:px-2 text-center flex flex-col items-center justify-between min-h-[80px] sm:min-h-[90px] md:min-h-[100px] xl:min-h-[112px] hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-0.5 group relative overflow-hidden"
    >
      <span className="text-[12px] sm:text-[13.2px] md:text-[12px] font-semibold text-[#808080] uppercase tracking-wider mb-0.5 sm:mb-1">
        {data.month}
      </span>
      <div className="py-0.5 sm:py-1 text-amber-500 fill-amber-500 transform group-hover:scale-105 transition-transform duration-300">
        <Sun className="fill-current w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
      </div>
      <span className="text-[13.2px] sm:text-[15.6px] md:text-[14px] xl:text-[15px] font-bold text-gray-800 leading-none mt-0.5 sm:mt-1">
        {cleanTemp(data.temp)}
      </span>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${data.color}`} />
    </div>
  );

  const monthGroups = Array.from({ length: Math.ceil(list.length / 3) }, (_, index) => list.slice(index * 3, index * 3 + 3));

  const months = linked ? (
    <Carousel opts={{ align: "start", loop: false }} setApi={setApi} className="w-full">
      <CarouselContent className="-ml-4">
        {monthGroups.map((group, index) => (
          <CarouselItem key={index} className="pl-4 basis-[80%] md:basis-1/2 lg:basis-1/4">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 md:gap-3">
              {group.map((data) => monthCard(data))}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  ) : (
    <div className="grid grid-cols-4 md:grid-cols-6 xl:grid-cols-12 gap-1.5 sm:gap-2.5 md:gap-3 xl:gap-3.5">
      {list.map((data) => monthCard(data))}
    </div>
  );

  if (embedded) {
    return (
      <div className="mb-8">
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7C7C7C]">
          Average monthly highs
        </p>
        {months}
      </div>
    );
  }

  return (
    <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-[#F9FAFB] font-['Montserrat']">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-4 md:py-6">
        <div className="w-full max-w-[1280px] mx-auto bg-white rounded-[8px] border border-gray-200/80 shadow-sm p-5 sm:p-6 md:p-8 relative overflow-hidden">

          {/* Background Scenic Illustration */}
          <div className="absolute top-0 right-0 h-40 w-1/2 hidden lg:block select-none pointer-events-none">
            {/* <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent z-10" /> */}
            {/* <img
              src="/spain_climate_landscape.png"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-right opacity-[0.85]"
            /> */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent z-10" />

            <img
              src="/images/image.png"
              alt="Mediterranean Landscape"
              className="w-full h-full object-cover object-right opacity-[0.85]"
            />
          </div>

          <div className="relative z-10 space-y-6 sm:space-y-8">
            {/* Header Title */}
            <div>
              <h2 className="font-['Montserrat'] text-[24px] md:text-[48px] font-semibold text-[#4c4c4c] leading-[30px] md:leading-[1.15] tracking-[-0.005em]">
                {destinationName} Climate
              </h2>
              <p className="font-['Montserrat'] text-[15px] md:text-[16px] leading-7 text-[#4c4c4c] mt-2">
                Average Monthly Highs (°C)
              </p>
              <div className="w-14 h-1 bg-amber-400 rounded-[8px] mt-3 sm:mt-3.5" />
            </div>

            {/* Months Card Grid: 4 columns x 3 rows on mobile */}
            <div className="pt-2 sm:pt-4">{months}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

