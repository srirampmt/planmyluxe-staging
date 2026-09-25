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
  public_path?: string;
}

interface PopularResortsProps {
  title?: string;
  subtitle?: string;
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
          {title && (
            <h2 className="font-['Montserrat'] text-[24px] font-semibold leading-[30px] tracking-[-0.005em] text-[#4c4c4c] md:text-[48px] md:leading-[1.15]">
              {title}
            </h2>
          )}

          <Carousel
            opts={{ align: "start", loop: false }}
            className="mt-[10px] w-full md:mt-[20px]"
          >
            <CarouselContent className="-ml-4 flex snap-x snap-mandatory">
              {resorts.map((resort, index) => (
                <CarouselItem
                  key={resort.id ?? resort.slug ?? index}
                  className="basis-auto pl-4"
                >
                  <div className="w-[210px] snap-start">
                    <Link
                      href={resort.public_path || (resort.slug ? `/destinations/${resort.slug}` : "#")}
                      className="group relative block h-80 overflow-hidden rounded-[8px] shadow-lg transition-all duration-300 hover:shadow-2xl"
                    >
                      <img
                        src={resort.card_image || "https://planmylux.s3.eu-west-2.amazonaws.com/placeholder.webp"}
                        alt={resort.name || "Resort"}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="rounded-[8px] border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md">
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
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
