"use client";
import React, { useMemo } from "react";
import { PriceButton } from "../PriceButton";

type OfferDealHotel = {
  starting_price?: string | null;
  id?: number;
  slug?: string;
  name?: string;
  location?: string;
  property_rating?: string;
  offer_header?: string;
  info_paragraph?: string;
  card_image?: string;
  api_url?: string | null;
  offer_tag_type?: string; // Added property
  offer_on_card?: string; // Added property to fix error
  intro_text?: string; // Added property to fix error
};

type OfferdealsProps = {
  title?: string;
  subtitle?: string;
  hotels?: OfferDealHotel[] | "" | null;
};


/* MAIN COMPONENT (ALL IN ONE FILE) */
export default function Offerdeals({ title, subtitle, hotels }: OfferdealsProps) {
  const hotelsList: OfferDealHotel[] = useMemo(
    () => (Array.isArray(hotels) ? hotels : []),
    [hotels]
  );

  return (
      <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-white font-['Montserrat']">
        <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-8 md:py-20">
          <div className="w-full max-w-[1280px] mx-auto">
            {/* Header Section */}
            <h2 className="font-['Montserrat'] text-[24px] md:text-[48px] lg:text-[48px] font-semibold text-[#4c4c4c] leading-tight max-w-[626px]">
              {title || (
                <>
                  Unmissable stylish <br /> escapes this week
                </>
              )}
            </h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
              <p className="text-[#4c4c4c] font-['Montserrat'] mt-2 max-w-xl text-[14px] md:text-[16px] lg:text-[16px] font-normal line-clamp-2 md:line-clamp-none lg:line-clamp-none ">
                {subtitle || "Step into this weeks collection of stylish escapes where beach bliss meets a sensible service and added luxuries come together to elevate your getaway to new heights."}
              </p>

              <a href="/all-offers" className="font-['Montserrat'] text-[12px] text-right text-[#4c4c4c] underline hover:text-[#CB2187] whitespace-nowrap ml-0 md:ml-4 mt-2 md:mt-0">
                view all PlanMyLuxe exclusives
              </a>
            </div>
            {hotelsList.map((hotel, idx) => {
              const rating = Math.max( 0, Math.min(5, Math.round(Number.parseFloat(hotel.property_rating || "0"))));
              const country = (hotel.location || "").toUpperCase() || "";
              const href = hotel.slug ? `/hotels/${hotel.slug}` : "#";
              const image = hotel.card_image || " ";
              return (
                <div key={`${hotel.id ?? 'noid'}-${hotel.slug ?? 'noslug'}-${idx}`} className="bg-white rounded-[8px] overflow-hidden border border-[#ececec] my-5 md:my-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* LEFT: IMAGE */}
                    <div className="relative h-[260px] md:h-[320px] overflow-hidden">
                      <img
                        src={image}
                        alt="Featured Escape"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105 group-hover:scale-105 will-change-transform"
                      />

                      {hotel?.offer_on_card && (
                        <span className="absolute top-0 left-0 bg-white text-[#CB2187] pr-[32px] pl-[12px] pt-[4px] pb-[4px] text-[11px] md:text-[13px] font-semibold max-w-[70%] leading-[18px] tracking-[0.015em] rounded-br-[167px] pointer-events-none">
                          {hotel.offer_on_card}
                        </span>
                      )}

                      <div className="absolute top-5 right-2 -rotate-[30deg] pointer-events-none">
                        {hotel.offer_tag_type ? (
                          <>
                            <img
                              src={hotel?.offer_tag_type}
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
                        {hotel.offer_header || ""}
                      </h3>

                      <p className="text-pml-primary text-[14px] font-semibold p-[4px] leading-[140%]">
                        {hotel.name || ""}
                      </p>

                      <p className="text-[#7C7C7C] font-['Montserrat'] text-[12px] font-normal p-[4px] leading-[18px] tracking-[0.02em] line-clamp-4 mb-[10px]">
                        {hotel.intro_text}
                      </p>

                      {/* Price Button (Async) */}
                      <PriceButton starting_price={hotel.starting_price} api_url={hotel.api_url} href={href} />
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
