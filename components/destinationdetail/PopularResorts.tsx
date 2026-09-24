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
  resorts,
}: PopularResortsProps) {
  if (!resorts || resorts.length === 0) return null;

  return (
    <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-white font-['Montserrat']">
      <div className="mx-auto w-full max-w-[1440px] px-[16px] py-6 sm:px-[24px] md:px-[32px] md:py-8 lg:px-[40px]">
        <div className="w-full max-w-[1280px] mx-auto">
          {/* Component Title */}
          {title && (
          <h2 className="font-['Montserrat'] text-[24px] md:text-[48px] font-semibold text-[#4c4c4c] leading-[30px] md:leading-[1.15] tracking-[-0.005em]">
              {title}
            </h2>
          )}

          {/* Carousel Layout - single row, custom smaller card size */}
          <Carousel
            opts={{ align: "start", loop: false }}
            className="w-full mt-[10px] md:mt-[20px]"
          >
            <CarouselContent className="-ml-4 flex snap-x snap-mandatory">
              {resorts.map((resort, index) => {
                return (
                  <CarouselItem
                    key={resort.id ?? resort.slug ?? index}
                    className="basis-auto pl-4"
                  >
                    <div className="w-[210px] snap-start">
                      <Link
                        href={resort.slug ? `/destinations/${resort.slug}` : "#"}
                        className="relative block h-80 overflow-hidden rounded-[12px] shadow-lg transition-all duration-300 group hover:shadow-2xl"
                      >
                        <img
                          src={resort.card_image || "https://planmylux.s3.eu-west-2.amazonaws.com/placeholder.webp"}
                          alt={resort.name || "Resort"}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="rounded-[12px] border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md">
                            <div className="text-[10px] tracking-widest text-white/70">
                              LUXURY
                            </div>
                            <div className="text-lg font-semibold leading-tight text-white">
                              {(resort.name || "").toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
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
