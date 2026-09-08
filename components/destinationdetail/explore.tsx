"use client";

import { useState } from "react";

interface ExploreProps {
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
}

export default function Explore(props: ExploreProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggleExpanded = (idx: number) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // 🔥 Convert props into array safely
  const exploreItems = [
    {
      tagline: props.explore_subtitle_1,
      title: props.explore_title_1,
      description: props.explore_description_1,
      image: props.explore_image_1,
    },
    {
      tagline: props.explore_subtitle_2,
      title: props.explore_title_2,
      description: props.explore_description_2,
      image: props.explore_image_2,
    },
    {
      tagline: props.explore_subtitle_3,
      title: props.explore_title_3,
      description: props.explore_description_3,
      image: props.explore_image_3,
    },
    {
      tagline: props.explore_subtitle_4,
      title: props.explore_title_4,
      description: props.explore_description_4,
      image: props.explore_image_4,
    },
  ]
    // remove empty items if backend sends less
    .filter(
      (item) => item.tagline || item.title || item.description || item.image
    );

  return (
    <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-white font-['Montserrat']">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-8 md:py-[60px] lg:py-[80px]">
        <div className="w-full max-w-[1280px] mx-auto space-y-8 md:space-y-20 lg:space-y-24">
          {exploreItems.map((item, index) => {
            const isImageRight = index % 2 === 0;

            return (
              <div
                key={index}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 lg:gap-12 items-center"
              >
                {/* Image */}
                <div
                  className={`lg:col-span-1 ${
                    isImageRight ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title || "Explore"}
                      className="w-full aspect-[4/3] lg:w-[405px] lg:h-[480px] object-cover rounded-[10px]"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] lg:w-[405px] lg:h-[480px] bg-[#D9D9D9] rounded-[10px] flex items-center justify-center">
                      <svg
                        width="80"
                        height="80"
                        viewBox="0 0 80 80"
                        fill="none"
                      >
                        <rect
                          x="10"
                          y="15"
                          width="60"
                          height="50"
                          rx="4"
                          stroke="#9CA3AF"
                          strokeWidth="2"
                        />
                        <circle cx="25" cy="30" r="5" fill="#9CA3AF" />
                        <path
                          d="M10 55 L30 35 L45 50 L55 40 L70 55"
                          stroke="#9CA3AF"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Text */}
                <div
                  className={`lg:col-span-2 ${
                    isImageRight ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div className="max-w-[843px]">
                    <p className="text-[#7C7C7C] text-[16px] font-semibold leading-[24px] tracking-wide uppercase">
                      {item.tagline}
                    </p>

                    <h2 className="text-[#7C7C7C] text-[28px] md:text-[48px] lg:text-[48px] font-semibold leading-[36px] md:leading-[60px] tracking-[0.05em] max-w-[626px]">
                      {item.title}
                    </h2>

                    <p
                      className={`text-[#7C7C7C] text-[16px] md:text-[18px] leading-[28px] font-normal ${
                        expanded[index] ? "" : "line-clamp-4 md:line-clamp-none"
                      }`}
                    >
                      {item.description}
                    </p>

                    <button
                      className="md:hidden text-pml-primary text-[14px] font-semibold underline hover:text-[#a01a6e] transition-colors mt-2"
                      onClick={() => toggleExpanded(index)}
                    >
                      {expanded[index] ? "Read Less" : "Read More"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}