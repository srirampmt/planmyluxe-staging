"use client";

import Link from "next/link";
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export interface ResortCardData {
  id?: string | number;
  name?: string;
  slug?: string;
  card_image?: string;
  subtitle?: string;
}

interface PopularResortsProps {
  title?: string;
  subtitle?: string; // Default tag/subtitle displayed above each resort name if not specified on the individual resort
  resorts?: ResortCardData[];
}

export default function PopularResorts({
  title,
  subtitle,
  resorts,
}: PopularResortsProps) {
  if (!resorts || resorts.length === 0) return null;

  return (
    <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-white font-['Montserrat']">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-6">
        <div className="w-full max-w-[1280px] mx-auto">
          {/* Component Title */}
          {title && (
          <h2 className="font-['Montserrat'] text-[24px] md:text-[48px] lg:text-[48px] font-semibold text-[#4c4c4c] leading-tight lg:leading-[1.15] lg:whitespace-nowrap max-w-[626px] lg:max-w-none">
              {title}
            </h2>
          )}

          {/* Carousel Layout - single row, custom smaller card size */}
          <Carousel
            opts={{ align: "start", loop: false }}
            className="w-full mt-[10px] md:mt-[20px]"
          >
            <CarouselContent className="-ml-4">
              {resorts.map((resort, index) => {
                const cardSubtitle = resort.subtitle || subtitle;
                return (
                  <CarouselItem
                    key={resort.id ?? resort.slug ?? index}
                    className="pl-4 basis-[220px] md:basis-1/4"
                  >
                    <Link
                      href={resort.slug ? `/destinations/${resort.slug}` : "#"}
                      className="relative group block aspect-[3/4] w-full rounded-[8px] overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.09)] transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {/* Background Image */}
                      <img
                        src={resort.card_image || "https://planmylux.s3.eu-west-2.amazonaws.com/placeholder.webp"}
                        alt={resort.name || "Resort"}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      {/* Dark Vignette Overlay for Better Contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-80 pointer-events-none" />

                      {/* Frosted Glass Floating Card Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 bg-black/65 backdrop-blur-md border border-white/10 rounded-[8px] py-2.5 px-3 flex flex-col justify-end text-left transition-all duration-300 group-hover:bg-black/75">
                        {/* Small category / region tag */}
                        <span className="text-[8px] sm:text-[9px] md:text-[10px] font-semibold text-gray-300/90 uppercase tracking-[0.12em] mb-1 block leading-none">
                        Luxury
                        </span>
                        {/* Resort Name */}
                        <h3 className="text-[13px] sm:text-[14px] md:text-[16px] font-bold text-white uppercase leading-snug tracking-wide line-clamp-2">
                          {resort.name}
                        </h3>
                      </div>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
