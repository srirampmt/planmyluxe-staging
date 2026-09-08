"use client";

import Image from "next/image";
import { useState } from "react";
import { Plane, Umbrella } from "lucide-react";
import SearchBar from "./search/searchbar";

const FALLBACK_HERO_IMAGE =
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2500&q=80";


type BannerProps = {
  title?: string;
  description?: string;
  image?: string;
  priority?: boolean;
  showFlightsTab?: boolean;
  initialDest?: string;
  disablePrefill?: boolean;
};

type TabId = "packages" | "multi-center";

export function Banner({ title, description, image, priority = false, showFlightsTab = true, initialDest, disablePrefill }: BannerProps) {
  const [activeTab, setActiveTab] = useState<TabId>("packages");
  const heroImage = typeof image === "string" && image.length > 0 ? image : null;
  const heroImageSrc = heroImage || FALLBACK_HERO_IMAGE;
  // const data = await getHomePageResponse();
  const tabs = [
    { id: "packages" as const, label: "Holiday Packages", icon: Umbrella },
    { id: "multi-center" as const, label: "Multi-Center", icon: Plane },
  ];

  return (
    <div data-testid="home-page" className="relative w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw]">
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[480px] w-full overflow-hidden flex items-start justify-center">
        {/* Background Image */}
        <Image
          src={heroImageSrc}
          alt={title || "Luxury Resort"}
          fill
          priority={priority}
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          sizes="100vw"
          className="scale-105 object-cover"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-transparent z-[5]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/20 to-transparent z-[5]" />

        {/* Hero Text Content */}
        <div className="relative z-10 mx-auto w-full max-w-[1380px] px-4 text-center pt-[60px] sm:px-6 lg:px-8">
          <div className="mb-3 md:mb-6 block w-fit mx-auto rounded-full border border-white/30 bg-white/10 px-2 md:px-4 py-1 md:py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md text-center">
            Elevate Your Escape
          </div>

          <div className="mx-auto max-w-[980px] text-center">
            <h1 className="mb-3 font-serif text-3xl sm:text-5xl font-bold leading-tight tracking-tighter text-white drop-shadow-2xl md:text-7xl">
              {title}
            </h1>

            <p className="hidden sm:block mx-auto max-w-5xl text-lg font-light tracking-wide text-white/90 drop-shadow-md md:text-2xl">
              {description}
            </p>
          </div>
        </div>
      </section>

      {/* Floating Search Tabs Section - 50% on hero image, 50% on white section below */}
      <div className="relative z-20 mx-auto -mt-40 md:-mt-52 mb-10 md:mb-16 max-w-[1380px] px-4 sm:px-6 lg:px-8">
        {/* Tab Row (Left: Flights + Hotel, Right: Pill Tabs) */}
        <div className="flex items-end justify-between -mb-px relative z-20">
          {showFlightsTab ? (
            <div className="inline-flex items-center gap-2 bg-white rounded-t-[16px] px-5 sm:px-6 py-2.5 sm:py-3 font-semibold text-[#cb2187] text-[14px] sm:text-[15px] shadow-sm border-t border-l border-r border-gray-100 border-b-2 border-b-[#cb2187]">
              <div className="w-6 h-6 rounded-full bg-[#cb2187] text-white flex items-center justify-center">
                <Plane size={14} className="text-white" />
              </div>
              <span className="text-[#cb2187]">Flights + Hotel</span>
            </div>
          ) : (
            <div />
          )}
        </div>

        {/* Search Bar Container Card */}
        <div className="relative z-50">
          <div className={`bg-white/95 backdrop-blur-2xl ${showFlightsTab ? 'rounded-b-[16px] rounded-tr-[16px] rounded-tl-none -mt-px' : 'rounded-[16px]'} shadow-[0_12px_36px_rgba(0,0,0,0.1)] border border-white p-1 md:p-3 transform transition-all duration-500 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] relative overflow-visible z-10`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#fdb900]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>

            {activeTab === "packages" ? (
              <div className="block">
                <SearchBar initialDest={initialDest} disablePrefill={disablePrefill} />
              </div>
            ) : null}

            {activeTab === "multi-center" ? (
              <div className="relative z-10 flex items-center justify-center h-[76px] gap-3 overflow-hidden">
                <div className="relative flex items-center justify-center pl-5">
                  <span className="absolute inline-flex h-16 w-16 rounded-full bg-[#fdb900]/20 animate-ping" />
                  <span className="absolute inline-flex h-12 w-12 rounded-full bg-[#fdb900]/30 animate-ping [animation-delay:300ms]" />
                  <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fdb900]/20">
                    <Plane size={15} className="text-[#fdb900]" />
                  </span>
                </div>
                <p className="text-sm font-bold tracking-widest text-[#fdb900] uppercase animate-pulse">
                  Coming Soon — Multi-Center search is on its way.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner;


