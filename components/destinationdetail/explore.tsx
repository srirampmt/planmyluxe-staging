"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Download } from "lucide-react";

export interface ExploreProps {
  explore_title_1?: string;
  explore_subtitle_1?: string;
  explore_description_1?: string;
  explore_image_1?: string;

  explore_title_2?: string;
  explore_subtitle_2?: string;
  explore_description_2?: string;
  explore_image_2?: string;

  explore_title_3?: string;
  explore_subtitle_3?: string;
  explore_description_3?: string;
  explore_image_3?: string;

  explore_title_4?: string;
  explore_subtitle_4?: string;
  explore_description_4?: string;
  explore_image_4?: string;
  best_experience_image_1?: string;
}

// Category icons for the mobile drawer / modal
const categoryIcons = [
  // 1. Sightseeing / Compass
  (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  // 2. Beach / Sun / Umbrella
  (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  ),
  // 3. Culture / Landmark / Building
  (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 10h1" />
      <path d="M9 14h1" />
      <path d="M14 10h1" />
      <path d="M14 14h1" />
      <path d="M9 21v-3a3 3 0 0 1 6 0v3" />
    </svg>
  ),
  // 4. Hotel / Resort / Bed
  (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16" />
      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <path d="M2 17h20" />
      <path d="M6 8v9" />
    </svg>
  ),
];

const BROCHURE_URL =
  "https://accelerate-digital.paperturn-view.com/?pid=ODg8871976&v=8.5&p=1&source=qr";

interface ActiveDrawerItem {
  tagline?: string;
  title?: string;
  description?: string;
  image?: string;
  iconIndex?: number;
}

export default function Explore(props: ExploreProps) {
  const [activeModalItem, setActiveModalItem] = useState<ActiveDrawerItem | null>(null);

  // Lock body scroll when side sheet is open
  useEffect(() => {
    if (activeModalItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeModalItem]);

  // Handle Escape key to close side sheet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModalItem(null);
      }
    };
    if (activeModalItem) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModalItem]);

  // Convert props into array safely
  const exploreItems = [
    {
      tagline: props.explore_subtitle_1,
      title: props.explore_title_1 || "Affordable Luxury Holidays to Cancun & Riviera Maya",
      description:
        props.explore_description_1 ||
        "Mexico's Caribbean coast offers the perfect mix of white-sand beaches, turquoise waters, and five-star experiences—making Cancun and the Riviera Maya a dream destination for affordable luxury.",
      image:
        props.explore_image_1 ||
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
    },
    {
      tagline: props.explore_subtitle_2,
      title: props.explore_title_2 || "Best Beaches in Cancun & Riviera Maya",
      description:
        props.explore_description_2 ||
        "The coastline from Cancun to Tulum is world-famous for its powdery white sand and clear, warm sea. Discover iconic beaches, scenic spots, and breathtaking views.",
      image:
        props.explore_image_2 ||
        "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=85",
    },
    {
      tagline: props.explore_subtitle_3,
      title: props.explore_title_3 || "Best Places of Interest in Cancun & Riviera Maya",
      description:
        props.explore_description_3 ||
        "From ancient ruins to vibrant culture, explore the must-visit attractions of this magical region—packed with history, adventure, and natural wonders.",
      image:
        props.explore_image_3 ||
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85",
    },
    {
      tagline: props.explore_subtitle_4,
      title: props.explore_title_4 || "Best Resorts for a Luxury Holiday in Cancun & Riviera Maya",
      description:
        props.explore_description_4 ||
        "Luxury beachfront resorts offering infinity pools, gourmet dining, and all-inclusive ease—perfect for romantic getaways, family escapes, and more.",
      image:
        props.explore_image_4 ||
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=85",
    },
  ].filter(
    (item) => item.tagline || item.title || item.description || item.image
  );

  if (exploreItems.length === 0) return null;

  return (
    <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-[#F9FAFB] font-['Montserrat'] py-4 md:py-6">
        <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
          <div className="w-full max-w-[1280px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
              
              {/* ============================================================== */}
              {/* LEFT COLUMN: Stack of 4 Destination Cards (6 cols)             */}
              {/* ============================================================== */}
              <div className="lg:col-span-6 flex flex-col gap-3 lg:gap-3.5 justify-between h-full">
                {exploreItems.map((item, index) => {
                  const btnText = item.tagline
                    ? (item.tagline.toLowerCase().startsWith("explore") ? item.tagline : `Explore ${item.tagline}`)
                    : (index === 0 ? "Explore Sightseeing" : index === 1 ? "Explore Beaches" : index === 2 ? "Explore Culture" : "Explore Resorts");

                  return (
                    <div
                      key={index}
                      onClick={() => setActiveModalItem({ ...item, iconIndex: index })}
                      className="bg-white rounded-[8px] border border-gray-200/80 shadow-xs p-3.5 sm:p-4 lg:p-3.5 xl:p-4 flex gap-3.5 sm:gap-4 lg:gap-3.5 xl:gap-4 items-center hover:shadow-md hover:border-gray-300 transition-all duration-300 flex-1 cursor-pointer group"
                    >
                      <div className="w-[95px] h-[95px] sm:w-[110px] sm:h-[95px] lg:w-[115px] lg:h-[95px] xl:w-[125px] xl:h-[102px] rounded-[8px] overflow-hidden shrink-0 bg-slate-100 relative">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title || "Explore"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              className="text-slate-400"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="M21 15l-5-5L5 21" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
                        <h4 className="font-montserrat text-[13.5px] sm:text-[15px] lg:text-[14.5px] xl:text-[16px] font-semibold text-[#7C7C7C] uppercase tracking-wide leading-[17px] sm:leading-[20px] lg:leading-[19px] xl:leading-[22px] line-clamp-2 group-hover:text-[var(--brand-primary)] transition-colors">
                          {item.title}
                        </h4>
                        <p className="font-montserrat text-[11.5px] sm:text-[12.5px] lg:text-[12px] xl:text-[13px] font-normal text-[#4c4c4c] leading-[16px] sm:leading-[18px] lg:leading-[17px] xl:leading-[19px] line-clamp-2">
                          {item.description}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModalItem({ ...item, iconIndex: index });
                          }}
                          className="font-montserrat text-[11.5px] sm:text-[12.5px] lg:text-[12px] xl:text-[13px] font-semibold text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] underline mt-0.5 sm:mt-1 flex items-center gap-1 cursor-pointer"
                        >
                          {btnText}
                          <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ============================================================== */}
              {/* RIGHT COLUMN: Plan My Luxe product brochure                     */}
              {/* ============================================================== */}
              <div className="lg:col-span-6 relative flex h-full min-h-[460px] flex-col overflow-hidden rounded-[8px] border border-[#E2E8F0] bg-[#0a1128] shadow-xs">
                {exploreItems[0]?.image ? (
                  <img
                    src={exploreItems[0].image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1128] via-[#0a1128]/75 to-[#0a1128]/15" />

                <div className="relative z-10 mt-auto px-6 pb-7 pt-24 text-left [container-type:inline-size] sm:px-8 sm:pb-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                    Brochure
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <h2 className="min-w-0 whitespace-nowrap text-[clamp(15px,4.4cqw,30px)] font-semibold leading-tight text-white">
                      Download our holiday brochure
                    </h2>
                    <a
                      id="seo-broucher-download"
                      href={BROCHURE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Download brochure"
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#cb2187] text-white transition hover:brightness-110"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Full-Screen Sheet Modal for "Explore More" (Mobile View) */}
        <div
          className={`fixed inset-0 z-[9999] bg-white flex flex-col h-full w-full overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
            activeModalItem
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-full pointer-events-none"
          }`}
        >
          {/* Top Sticky Navigation Bar */}
          <div className="sticky top-0 z-20 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between shadow-xs">
            <div />
            {/* Right Close Button */}
            <button
              onClick={() => setActiveModalItem(null)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors focus:outline-none cursor-pointer"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Scrollable Content Container */}
          <div className="overflow-y-auto flex-1 w-full bg-[#F9FAFB] font-['Montserrat']">
            <div className="max-w-[960px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
              {/* Hero Image */}
              {activeModalItem?.image && (
                <div className="relative w-full h-[240px] xs:h-[280px] sm:h-[380px] md:h-[440px] rounded-[18px] sm:rounded-[24px] overflow-hidden shadow-md mb-6 sm:mb-8 bg-slate-100">
                  <img
                    src={activeModalItem.image}
                    alt={activeModalItem.title || "Detail View"}
                    className="w-full h-full object-cover"
                    style={{
                      imageRendering: "-webkit-optimize-contrast",
                    }}
                  />
                  <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

                  {/* Caption badge overlay on image */}
                  <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-[12px] sm:text-[13px] font-semibold border border-white/20">
                    {categoryIcons[(activeModalItem?.iconIndex ?? 0) % categoryIcons.length]}
                    <span>{activeModalItem?.tagline || "Highlights"}</span>
                  </div>
                </div>
              )}

              {/* Main Content Card */}
              <div className="bg-white rounded-[18px] sm:rounded-[24px] p-5 sm:p-8 md:p-10 border border-slate-200/80 shadow-xs space-y-5 sm:space-y-6">
                <div>
                  <h1 className="text-[22px] sm:text-[32px] md:text-[38px] font-extrabold text-[#1a1a1a] tracking-tight leading-tight mb-3">
                    {activeModalItem?.title}
                  </h1>
                  <div className="w-14 h-1 bg-[#cb2187] rounded-full" />
                </div>

                <p className="text-[#4c4c4c] text-[15px] sm:text-[17px] leading-[26px] sm:leading-[32px] font-normal whitespace-pre-line">
                  {activeModalItem?.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Details Lightbox Modal for "Explore More" (Desktop View) */}
        {activeModalItem && (
          <div className="fixed inset-0 z-[9999] hidden md:flex items-center justify-center bg-black/75 p-4 md:p-6 backdrop-blur-sm font-['Montserrat']">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => setActiveModalItem(null)} />
            
            <div className="relative bg-white rounded-[10px] max-w-[650px] w-full overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh] border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
              {/* Close Button */}
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/75 text-white text-[24px] transition-colors focus:outline-none z-20 leading-none cursor-pointer"
                aria-label="Close modal"
              >
                &times;
              </button>

              {/* Modal Image */}
              {activeModalItem.image && (
                <div className="relative w-full h-[250px] sm:h-[300px] bg-slate-900 overflow-hidden shrink-0">
                  <img
                    src={activeModalItem.image}
                    alt={activeModalItem.title || "Detail View"}
                    className="w-full h-full object-cover object-center transition-all duration-300"
                    style={{
                      imageRendering: "-webkit-optimize-contrast",
                    }}
                  />
                </div>
              )}

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto flex flex-col">
                <h3 className="text-[#1a1a1a] text-[20px] sm:text-[24px] font-bold leading-tight mb-4 tracking-tight">
                  {activeModalItem.title}
                </h3>
                <p className="text-[#4c4c4c] text-[14px] sm:text-[15px] leading-[24px] sm:leading-[26px] font-normal whitespace-pre-line">
                  {activeModalItem.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
  );
}
