"use client";

import React, { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ChevronRight } from "lucide-react";

const FilterTab = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`capitalize rounded-full text-xs md:text-sm px-5 py-2 md:px-6 md:py-2.5 font-semibold tracking-wide my-1 mx-1 font-['Montserrat'] whitespace-nowrap shrink-0 ${
      active
        ? "bg-gradient-to-r from-[#cb2187] to-[#9c1866] text-white scale-[1.03]"
        : "bg-white text-[#4C4C4C] border border-gray-200 hover:border-[#cb2187] hover:text-[#cb2187]"
    }`}
  >
    {label}
  </button>
);

export default function DestinationCarousel(props: any) {
  const { Destination_collection_title, description, ...rest } = props;

  // Default description (shown if none passed)
  const fallbackDescription =
    "Discover hand-picked destinations crafted for unforgettable journeys — from serene escapes to vibrant city adventures.";

  // Build dynamic tag + destination mapping
  const tabs: { label: string; destinations: any[] }[] = [];

  Object.entries(rest).forEach(([key, value]) => {
    if (key.startsWith("Destination_collection_tag_")) {
      const num = key.replace("Destination_collection_tag_", "");
      const destKey = `tag_${num}_destination`;

      const label = typeof value === "string" ? value.trim() : "";
      if (!label) return;

      if (rest[destKey] && Array.isArray(rest[destKey]) && rest[destKey].length > 0) {
        tabs.push({
          label,
          destinations: rest[destKey] as any[],
        });
      }
    }
  });

  const [activeFilter, setActiveFilter] = useState(tabs?.[0]?.label || "");

  React.useEffect(() => {
    if (tabs.length === 0) {
      if (activeFilter) setActiveFilter("");
      return;
    }
    if (!activeFilter || !tabs.some((t) => t.label === activeFilter)) {
      setActiveFilter(tabs[0].label);
    }
  }, [activeFilter, tabs]);

  const activeDestinations =
    tabs.find((t) => t.label === activeFilter)?.destinations || [];

  return (
    <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] font-['Montserrat']">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
        <div className="w-full max-w-[1280px] mx-auto">
          <div className=" w-full py-[36px] md:py-[70px] md:pt-20 md:pb-24 lg:pt-24 lg:pb-[80px] relative z-0">
            {/* BACKGROUND */}
            <div className="absolute top-0 bottom-0 left-1/2 w-screen -translate-x-1/2 pointer-events-none overflow-hidden">
              <img
                src="https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/homepage/destination-carousel-bg.png"
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black opacity-10"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
              {/* HEADER */}
              <div className="text-left md:mb-5">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
                  <h2 className="text-[24px] md:text-[48px] font-semibold text-white leading-[30px] md:leading-[60px] tracking-[-0.005em] max-w-[626px] mb-4 md:mb-0">
                    {Destination_collection_title || ""}
                  </h2>
                  {/* DESCRIPTION (default if missing) */}
                  {/* <p className="text-[#4C4C4C] max-w-[624px] text-[14px] md:text-[16px] leading-[24px] line-clamp-2 md:line-clamp-none lg:line-clamp-none">
                    {description || fallbackDescription}
                  </p> */}

                  <a
                    href="/destinations"
                    className="font-['Montserrat'] text-[12px] md:text-[14px] text-right text-white underline hover:text-[#CB2187] whitespace-nowrap ml-0 md:ml-4 mt-2 md:mt-0 self-end md:self-auto"
                  >
                    view all PlanMyLuxe exclusives
                  </a>
                </div>

                {/* FILTER TABS */}
                <div className="flex flex-nowrap gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                  {tabs.map((tab) => (
                    <FilterTab
                      key={tab.label}
                      label={tab.label}
                      active={activeFilter === tab.label}
                      onClick={() => setActiveFilter(tab.label)}
                    />
                  ))}
                </div>
              </div>

              {/* DESTINATION CARDS */}
              <div className="relative mt-4">

                <Carousel opts={{ align: "start" }} className="w-full relative">

                  <CarouselContent className="flex snap-x snap-mandatory">

                    {activeDestinations.map((destination: any) => (

                      <CarouselItem key={destination.id} className="basis-auto">

                        <div className="w-[210px] snap-start">

                          

                          <a

                            href={`/destinations/${destination.slug || ""}`}

                            className="relative block h-80 rounded-[12px] overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300"

                          >

                            {/* Image */}

                            <img

                              src={destination.banner_image || destination.card_image || ""}

                              alt={destination.name}

                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"

                              onError={(e) => {

                                e.currentTarget.onerror = null;

                                e.currentTarget.src = "";

                              }}

                            />



                            {/* Dark Gradient Overlay */}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />



                            {/* Bottom Content */}

                            <div className="absolute bottom-4 left-4 right-4">

                              <div className="bg-white/10 backdrop-blur-md rounded-[12px] px-4 py-3 border border-white/20">

                                <div className="text-[10px] tracking-widest text-white/70">

                                  {activeFilter.toUpperCase()}

                                </div>



                                <div className="text-lg font-semibold text-white leading-tight">

                                  {destination.name.toUpperCase()}

                                </div>

                              </div>

                            </div>

                          </a>

                        </div>

                      </CarouselItem>

                    ))}

                  </CarouselContent>

                </Carousel>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


