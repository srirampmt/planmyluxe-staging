"use client";
import React, { useMemo } from "react";
import { PriceButton } from "./priceButton";
import type { MultiCentreSnapshot } from "@/types/homepage";

type OfferdealsProps = {
  title?: string;
  subtitle?: string;
  hotels?: MultiCentreSnapshot[] | "" | null;
};


/* MAIN COMPONENT (ALL IN ONE FILE) */
export default function TrendingMultiCentre({ title, subtitle, hotels }: OfferdealsProps) {
  const dealsList: MultiCentreSnapshot[] = useMemo(
    () => (Array.isArray(hotels) ? hotels : []),
    [hotels]
  );

  if (!title || dealsList.length === 0) return null;

  return (
      <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-white font-['Montserrat']">
        <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-8 md:py-20">
          <div className="w-full max-w-[1280px] mx-auto">
            {/* Header Section */}
            <h2 className="font-['Montserrat'] text-[24px] md:text-[48px] lg:text-[48px] font-semibold text-[#4c4c4c] leading-tight max-w-[626px]">
              {title}
            </h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
              <p className="text-[#4c4c4c] font-['Montserrat'] mt-2 max-w-xl text-[14px] md:text-[16px] lg:text-[16px] font-normal line-clamp-2 md:line-clamp-none lg:line-clamp-none ">
                {subtitle || ""}
              </p>

              <a href="/holiday-styles/multi-centre" className="font-['Montserrat'] text-[12px] text-right text-[#4c4c4c] underline hover:text-[#CB2187] whitespace-nowrap ml-0 md:ml-4 mt-2 md:mt-0">
                view all PlanMyLuxe exclusives
              </a>
            </div>
            {dealsList.map((deal, idx) => {
              const rating = Math.max(
                0,
                Math.min(5, Math.round(Number.parseFloat(String(deal.property_rating ?? "0"))))
              );
              const country = (deal.location || "").toUpperCase() || "";
              const href = deal.slug ? `/multi-centre/${deal.slug}` : "#";
              const image = deal.image || " ";
              return (
                <div key={`${deal.id}-${deal.slug}-${idx}`} className="bg-white rounded-[8px] overflow-hidden border border-[#ececec] my-5 md:my-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* LEFT: IMAGE */}
                    <div className="relative h-[260px] md:h-[320px] overflow-hidden">
                      <img
                        src={image}
                        alt="Featured Escape"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105 group-hover:scale-105 will-change-transform"
                      />

                      <div className="absolute top-5 right-2 -rotate-[30deg] pointer-events-none">
                        {deal.offer_tag_type ? (
                          <>
                            <img
                              src={deal.offer_tag_type}
                              alt="Offer Tag"
                              className=""
                            />
                          </>
                        ) : null}
                      </div>
                    </div>

                    {/* RIGHT: DETAILS */}
                    <div className="p-[8px] md:p-[16px] flex flex-col">
                      <div className="font-semibold text-[#4c4c4c] text-[14px] p-[4px]">
                        {country}
                      </div>

                      <div className="text-pml-primary p-[4px]">
                        <span className="text-pml-primary text-[14px]">
                          {Array.from({ length: rating || 5 }).map((_, i) => (
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
                                fill="#CB2187"
                              />
                            </svg>
                          ))}
                        </span>
                      </div>

                      <h3 className="text-[16px] font-semibold text-[#4c4c4c] leading-[24px] p-[4px] line-clamp-2 md:line-clamp-none lg:line-clamp-none ">
                        {deal.title || ""}
                      </h3>

                      <p className="text-pml-primary text-[14px] font-semibold p-[4px] leading-[140%]">
                        {deal.extras || ""}
                      </p>

                      {/* <p className="text-[#7C7C7C] font-['Montserrat'] text-[14px] font-bold p-[4px] leading-[18px] tracking-[0.02em] line-clamp-4">
                        {deal.board_basis || ""}
                      </p> */}
                      <p className="text-[#7C7C7C] font-['Montserrat'] text-[12px] md:text-[14px] font-normal leading-[16px] md:leading-[20px] tracking-[0.02em] w-full md:w-[592px] p-[4px] line-clamp-3 mb-[10px]">
                        {deal.intro_text || ""}
                      </p>

                      {/* Price Button (Async) */}
                      <PriceButton
                        starting_price={deal.starting_price ?? null}
                        nights={deal.nights ?? null}
                        href={href}
                      />
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
