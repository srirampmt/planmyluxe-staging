"use client";

import { CircleChevronRight } from "lucide-react";
// ...existing code...
import type { HotDeal } from "@/types/homepage";
import { PriceButton } from "./PriceButton";


export default function Largecard({
  title,
  deal,
}: {
  title?: string;
  deal?: HotDeal | null;
}) {
  const featuredDeal = deal ?? null;
  return (
    <div className="max-w-7xl mx-auto px-[16px] sm:px-[24px] md:px-[24px] lg:px-[8px] font-['Montserrat']">
      <div className="bg-white rounded-xl overflow-hidden group">
        <div className="max-w-[700px] mb-[12px] lg:mb-0">
          <h2 className="font-['Montserrat'] text-[#4c4c4c] text-[24px] sm:text-[32px] md:text-[40px] lg:text-[48px] font-semibold leading-[30px] md:leading-[60px] tracking-[-0.005em] mb-[12px] sm:mb-[16px] md:mb-[20px] lg:mb-[24px] max-w-[626px]">
            {title || "Check out our featured destination of the week"}
          </h2>
        </div>
        {featuredDeal && (
        <div className="bg-white rounded-[8px] overflow-hidden border border-[#ececec] my-5 md:my-6">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* LEFT: IMAGE */}
            <div className="relative h-[260px] md:h-[320px] overflow-hidden">
              <img
                src={
                  featuredDeal.card_image ||
                  "https://planmylux.s3.eu-west-2.amazonaws.com/placeholder.webp"
                }
                alt="Featured Escape"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105 group-hover:scale-105 will-change-transform"
              />

              {featuredDeal.offer_on_card && featuredDeal.offer_on_card.trim() !== "" && (
                <span className="absolute top-0 left-0 bg-white text-[#CB2187] pr-[32px] pl-[12px] pt-[4px] pb-[4px] text-[11px] md:text-[13px] font-semibold max-w-[70%] leading-[18px] tracking-[0.015em] rounded-br-[167px] pointer-events-none">
                  {featuredDeal.offer_on_card}
                </span>
              )}

              {/* Exclusive Tag SVG */}
              {featuredDeal.offer_tag_type && featuredDeal.offer_tag_type.trim() !== "" && (
                <img
                  className="absolute top-5 right-2 pointer-events-none -rotate-[30deg]"
                  src={featuredDeal.offer_tag_type}
                  alt="tag"
                />
              )}
            </div>

            {/* RIGHT: DETAILS */}
            <div className="p-[8px] md:p-[16px] flex flex-col">
              <div className="font-semibold text-[#4c4c4c] text-[14px] p-[4px]">
                {featuredDeal.location}
              </div>

              <div className="text-pml-primary p-[4px]">
                <span className="text-pml-primary text-[14px]">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const rating = Number(featuredDeal?.property_rating || 0);
                    return (
                      <svg
                        key={i}
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline-block mr-[1px]"
                      >
                        <path
                          d="M14.0001 5.4091L8.91313 5.07466L6.99734 0.261719L5.08156 5.07466L0.0001297 5.4091L3.89754 8.7184L2.61862 13.7384L6.99734 10.9707L11.3761 13.7384L10.0972 8.7184L14.0001 5.4091Z"
                          fill={rating >= i + 1 ? "#CB2187" : "#E0E0E0"}
                        />
                      </svg>
                    );
                  })}
                </span>
              </div>

              <h3 className="text-[16px] font-semibold text-[#4c4c4c] leading-[24px] p-[4px] line-clamp-2 md:line-clamp-none lg:line-clamp-none ">
                {featuredDeal.offer_header}
              </h3>

              <p className="text-pml-primary text-[14px] font-semibold p-[4px] leading-[140%]">
                {featuredDeal.name}
              </p>

              <p className="text-[#7C7C7C] font-['Montserrat'] text-[12px] font-normal p-[4px] leading-[18px] tracking-[0.02em] line-clamp-2 md:line-clamp-none lg:line-clamp-none mb-[10px]">
                {featuredDeal.intro_text}
              </p>

              {/* Price Button */}
              
              <PriceButton starting_price={featuredDeal.starting_price} api_url={featuredDeal.api_url} href={featuredDeal.slug ? `/hotels/${featuredDeal.slug}` : "#"} />
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};