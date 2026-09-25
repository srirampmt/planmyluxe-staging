"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Climate from "@/components/destinationdetail/climate";

type SeasonCard = {
  image?: string;
  title?: string;
  description?: string;
};

const MONTH_INDEX: Record<string, number> = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
};

function monthIndexesInTitle(title: string): number[] {
  const parts = title.toLowerCase().split(/\s*[–—-]\s*/);
  const indexes = parts
    .map((part) => MONTH_INDEX[part.trim().split(/\s+/)[0] ?? ""])
    .filter((index): index is number => index !== undefined);
  if (indexes.length < 2) return indexes;
  const [start, end] = indexes;
  const span: number[] = [];
  let cursor = start;
  while (span.length < 12) {
    span.push(cursor);
    if (cursor === end) break;
    cursor = (cursor + 1) % 12;
  }
  return span;
}

function parseTemp(value: string | number | undefined | null): number | null {
  if (value === undefined || value === null) return null;
  const match = String(value).match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const number = Number(match[0]);
  return Number.isFinite(number) ? number : null;
}

function formatTemp(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function seasonCaption(title: string | undefined, description: string | undefined, temps: Array<number | null>): string {
  const editorial = (description || "").split("|")[0]?.trim() || "";
  const indexes = title ? monthIndexesInTitle(title) : [];
  const values = indexes.map((index) => temps[index]).filter((value): value is number => value !== null);
  if (!values.length) return editorial || (description || "");
  const low = Math.min(...values);
  const high = Math.max(...values);
  const range = low === high ? `${formatTemp(low)}°C` : `${formatTemp(low)}°C – ${formatTemp(high)}°C`;
  return editorial ? `${editorial} | ${range}` : range;
}

type WeatherProps = {
  Weather_title?: string;
  Weather_subtitle?: string;
  seasonCards?: SeasonCard[];
  destinationName?: string;
  weatherData?: Array<{ month_name?: string; month?: string; temperature?: string | number; temp?: string | number; metric?: "daily_max" }> | "" | null;
};

export default function Weather({ Weather_title, Weather_subtitle, seasonCards, destinationName, weatherData }: WeatherProps) {
  const title =
    Weather_title ||
    (destinationName ? `What to expect from ${destinationName} weather` : "Destination weather");
  const subtitle = Weather_subtitle || "";

  const cardsToRender: SeasonCard[] = Array.isArray(seasonCards)
    ? seasonCards.filter((c) => Boolean(c?.image) || Boolean(c?.title) || Boolean(c?.description))
    : [];

  const hasWeatherCopy = Boolean(Weather_title || Weather_subtitle);
  const hasMonthly = Array.isArray(weatherData) && weatherData.length > 0;
  const monthlyTemps = Array.from({ length: 12 }, () => null as number | null);
  if (Array.isArray(weatherData)) {
    for (const item of weatherData) {
      const rawMonth = String(item?.month_name || item?.month || "").trim().toLowerCase();
      const index = MONTH_INDEX[rawMonth] ?? MONTH_INDEX[rawMonth.slice(0, 3)];
      const value = parseTemp(item?.temperature ?? item?.temp);
      if (index !== undefined && value !== null) monthlyTemps[index] = value;
    }
  }
  const [seasonApi, setSeasonApi] = useState<CarouselApi>();
  const [monthApi, setMonthApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!seasonApi || !monthApi) return;
    let active: "season" | "month" | null = null;
    const copy = (from: CarouselApi, to: CarouselApi) => {
      if (!from || !to) return;
      to.containerNode().style.transform = from.containerNode().style.transform;
    };
    const onSeasonScroll = () => {
      if (active === "month") return;
      copy(seasonApi, monthApi);
    };
    const onMonthScroll = () => {
      if (active === "season") return;
      copy(monthApi, seasonApi);
    };
    const onSeasonDown = () => {
      active = "season";
    };
    const onMonthDown = () => {
      active = "month";
    };
    const clearActive = () => {
      active = null;
    };
    seasonApi.on("pointerDown", onSeasonDown);
    monthApi.on("pointerDown", onMonthDown);
    seasonApi.on("scroll", onSeasonScroll);
    monthApi.on("scroll", onMonthScroll);
    seasonApi.on("select", onSeasonScroll);
    seasonApi.on("settle", clearActive);
    monthApi.on("settle", clearActive);
    return () => {
      seasonApi.off("pointerDown", onSeasonDown);
      monthApi.off("pointerDown", onMonthDown);
      seasonApi.off("scroll", onSeasonScroll);
      monthApi.off("scroll", onMonthScroll);
      seasonApi.off("select", onSeasonScroll);
      seasonApi.off("settle", clearActive);
      monthApi.off("settle", clearActive);
    };
  }, [seasonApi, monthApi]);

  if (!cardsToRender.length && !hasWeatherCopy && !hasMonthly) return null;

  return (
    <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-white font-['Montserrat']">
      <div className="mx-auto w-full max-w-[1440px] px-[16px] py-6 sm:px-[24px] md:px-[32px] md:py-8 lg:px-[40px]">
        <div className="w-full max-w-[1280px] mx-auto">
          {/* Title Section */}
          <div className="mb-6">
            <h2 className="font-['Montserrat'] text-[24px] md:text-[48px] font-semibold text-[#4c4c4c] leading-[30px] md:leading-[1.15] tracking-[-0.005em] mb-3">
              {title}
            </h2>
            {subtitle ? (
              <p className="text-[15px] md:text-[16px] leading-7 text-[#4c4c4c] w-full">
                {subtitle}
              </p>
            ) : null}
          </div>

          <Climate destinationName={destinationName || ""} weatherData={weatherData} embedded linked={cardsToRender.length > 0} setApi={setMonthApi} />

          {cardsToRender.length > 0 && (
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            setApi={setSeasonApi}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {cardsToRender.map((card, index) => (
                <CarouselItem key={index} className="pl-4 basis-[80%] md:basis-1/2 lg:basis-1/4">
                  <div className="relative group overflow-hidden rounded-[8px]">
                    {/* Background Image */}
                    <div className="relative w-full h-[340px]">
                      <img
                        src={card.image}
                        alt={card.title || "Weather"}
                        className="w-full h-[340px] object-cover"
                      />
                      
                      {/* Overlay */}
                      {/* <div className="absolute inset-0 bg-[#2980B9]"></div> */}
                      <div className="absolute inset-0 bg-black/10"></div>
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 text-white text-center mb-[8px]">
                        <h3 className="text-[24px] md:text-[28px] leading-[36px] font-medium mb-2">
                          {card.title}
                        </h3>
                        <p className="text-[12px] font-semibold leading-[18px] tracking-[0.02em] mb-2">
                          {hasMonthly ? seasonCaption(card.title, card.description, monthlyTemps) : card.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          )}
        </div>
      </div>
    </section>
  );
}