"use client";
 
import Image from "next/image";
import { useState, useEffect } from "react";
import { GitBranch, Plane } from "lucide-react";
import SearchBar from "./search/searchbar";
import MultiCenterSearchBar from "./search/MultiCenterSearchBar";
 
const FALLBACK_HERO_IMAGE = "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2500&q=80%22";
 
const ACTIVE_TAB_STORAGE_KEY = "pml_active_search_tab";
 
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
 
export function Banner({
  title,
  description,
  image,
  priority = false,
  showFlightsTab = true,
  initialDest,
  disablePrefill,
}: BannerProps) {
  const [activeTab, setActiveTab] = useState<TabId>("packages");
 
  useEffect(() => {
    try {
      const savedTab = sessionStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
      if (savedTab === "multi-center" || savedTab === "packages") {
        setActiveTab(savedTab as TabId);
      }
    } catch {
      // ignore
    }
  }, []);
 
  const handleTabClick = (tab: TabId) => {
    setActiveTab(tab);
    try {
      sessionStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tab);
    } catch {
      // ignore
    }
  };
 
  const heroImage = typeof image === "string" && image.length > 0 ? image : null;
  const heroImageSrc = heroImage || FALLBACK_HERO_IMAGE;
 
  return (
    <div data-testid="home-page" className="relative w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] font-['Montserrat']">
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
 
      {/* Floating Search Tabs Section */}
      <div className="relative z-20 mx-auto -mt-36 sm:-mt-44 md:-mt-52 mb-10 md:mb-16 max-w-[1380px] px-4 sm:px-6 lg:px-8">
        {showFlightsTab ? (
          <div className="relative z-20 mb-3 sm:mb-4 flex justify-center">
            <div className="isolate relative inline-flex h-[46px] items-center gap-1.5 rounded-[12px] border border-white/20 bg-black/40 p-1.5 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] backdrop-blur-[12px]">
              <button
                type="button"
                onClick={() => handleTabClick("packages")}
                className={`z-[1] flex h-8 cursor-pointer items-center gap-2 whitespace-nowrap rounded-[12px] px-4 py-2 text-xs uppercase leading-4 tracking-[0.6px] transition-colors focus:outline-none ${
                  activeTab === "packages"
                    ? "bg-pml-primary font-bold text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
                    : "bg-transparent font-semibold text-white/80 hover:text-white"
                }`}
              >
                <Plane className={`h-[12px] w-[14px] ${activeTab === "packages" ? "text-white" : "text-white/80"}`} />
                <span>Flight + Hotel</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick("multi-center")}
                className={`z-[2] flex h-8 cursor-pointer items-center gap-2 whitespace-nowrap rounded-[12px] px-4 py-2 text-xs uppercase leading-4 tracking-[0.6px] transition-colors focus:outline-none ${
                  activeTab === "multi-center"
                    ? "bg-pml-primary font-bold text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
                    : "bg-transparent font-semibold text-white/80 hover:text-white"
                }`}
              >
                <GitBranch className={`h-[13px] w-3 ${activeTab === "multi-center" ? "text-white" : "text-white/80"}`} />
                <span>Multi-Centre</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Search Bar Container Card */}
        <div className="relative z-30">
          <div className="relative flex w-full min-h-[76px] items-center overflow-visible rounded-[18px] border border-gray-100/90 bg-white p-2 shadow-[0_16px_40px_rgba(0,0,0,0.08)] sm:min-h-[88px] sm:p-3">
            {activeTab === "packages" ? (
              <div className="w-full min-w-0">
                <SearchBar initialDest={initialDest} disablePrefill={disablePrefill} />
              </div>
            ) : null}

            {activeTab === "multi-center" ? (
              <div className="w-full min-w-0">
                <MultiCenterSearchBar />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default Banner;