"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CircleChevronRight } from "lucide-react";
import type { MultiCentreSnapshot } from "@/types/homepage";

type Props = {
  title?: string;
  subtitle?: string;
  hotels?: MultiCentreSnapshot[] | "" | null;
};

function getDisplayPrice(startingPrice?: string | null): string {
  const raw = String(startingPrice ?? "").trim();
  const num = Number(raw);
  if (raw && Number.isFinite(num) && num > 0) {
    return num.toLocaleString("en-GB", { maximumFractionDigits: 0 });
  }
  return "1,999";
}

export default function TrendingMultiCenterCards({ title, subtitle, hotels }: Props) {
  const deals = Array.isArray(hotels) ? hotels : [];

  if (deals.length === 0) return null;

  return (
    <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] font-['Montserrat']">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] pb-[20px] md:pb-[50px] lg:pb-[50px]">
        <div className="w-full max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-3 md:mb-5">
            <div>
              <h2 className="text-[24px] md:text-[48px] font-semibold text-[#4c4c4c] leading-[30px] md:leading-[60px] tracking-[-0.005em] max-w-[626px]">
                {title || "Luxury Multi-Centre Holiday Deals"}
              </h2>
              {subtitle ? (
                <p className="text-[#4c4c4c] mt-2 max-w-xl text-[14px] md:text-[16px] font-normal">{subtitle}</p>
              ) : null}
            </div>
            <a
              href="/trending-multi-centres"
              className="text-gray-500 text-xs underline hover:text-[#CB2187] self-start md:self-end mt-2 md:mt-0"
            >
              view all Multi Centres
            </a>
          </div>

          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent>
              {deals.map((deal, idx) => {
                const nights = deal.nights ? Number(deal.nights) : 7;
                const href = deal.slug ? `/multi-centre/${deal.slug}` : "#";

                return (
                  <CarouselItem key={`${deal.id}-${deal.slug}-${idx}`} className="basis-auto">
                    <div className="flex-[0_0_auto] w-[270px] sm:w-[300px] md:w-[360px] h-[436px] font-['Montserrat']">
                      <a href={href} className="bg-white rounded-[8px] overflow-hidden flex flex-col h-full border border-[#e0e0e0] group no-underline">
                        <div className="relative w-full overflow-hidden bg-[#f5f5f5] h-[225px]">
                          <img
                            src={deal.image || " "}
                            alt={deal.title || "Hotel"}
                            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105 group-hover:scale-105 will-change-transform"
                          />

                          {Boolean((deal.tag_for_card || "").trim()) && (
                            <span className="absolute top-0 left-0 bg-white text-[#CB2187] pr-[32px] pl-[12px] pt-[4px] pb-[4px] text-[11px] md:text-[13px] font-semibold uppercase max-w-[70%] leading-[18px] tracking-[0.015em] rounded-br-[167px] pointer-events-none">
                              {deal.tag_for_card}
                            </span>
                          )}

                          <div className="absolute top-0 right-[-25px] pointer-events-none">
                            {deal.offer_tag_type && deal.offer_tag_type.trim() !== "" && (
                              <img
                                className="absolute top-5 right-2 pointer-events-none -rotate-[30deg]"
                                src={deal.offer_tag_type}
                                alt="tag"
                              />
                            )}
                          </div>
                        </div>

                        <div className="pt-[6px] pr-[8px] pb-[14px] pl-[8px] flex-grow flex flex-col justify-start items-start text-left bg-white">
                          <div className="text-[14px] font-semibold text-[#4c4c4c] leading-[1.4] p-[4px] w-full line-clamp-1 min-h-[28px]">{deal.location || ""}</div>

                          <div className="flex items-center justify-start p-[4px] min-h-[28px]">
                            <span className="text-pml-primary text-[14px]">
                              {Array.from({ length: 5 }).map((_, i) => {
                                const rating = Number(deal?.property_rating || 0);
                                return (
                                  <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mr-[1px]">
                                    <path d="M14.0001 5.4091L8.91313 5.07466L6.99734 0.261719L5.08156 5.07466L0.0001297 5.4091L3.89754 8.7184L2.61862 13.7384L6.99734 10.9707L11.3761 13.7384L10.0972 8.7184L14.0001 5.4091Z" fill={rating >= i + 1 ? "#CB2187" : "#E0E0E0"} />
                                  </svg>
                                );
                              })}
                            </span>
                          </div>

                          <h5 className="text-[14px] md:text-[16px] font-semibold text-pml-primary leading-[24px] mb-[10px] p-[4px] w-full min-h-[32px] truncate">{deal.title || ""}</h5>

                          <div className={`rounded-[8px] text-[12px] text-[#4c4c4c] font-medium mb-[9px] w-full min-h-[48px] flex items-center justify-center text-center ${Boolean((deal.extras || "").trim()) ? "bg-[#EDEDED] border border-[#DFDEDE] px-[6px] md:px-[12px] py-[6px]" : ""}`}>
                            {Boolean((deal.extras || "").trim()) ? <span className="line-clamp-2 leading-[18px] tracking-[0.02em]">{deal.extras}</span> : null}
                          </div>

                          <div className="mt-auto ml-auto flex h-[30px] w-full max-w-[289px] self-end items-center justify-end gap-[8px] px-[8px] font-['Montserrat']">
                            <div className="flex h-[30px] w-[241px] items-end p-0">
                              <div className="flex h-[30px] w-[100px] items-center justify-center px-[2px] py-[4px]">
                                <span className="h-[22px] w-[96px] whitespace-nowrap text-[14px] font-normal leading-[22px] tracking-[0.01em] text-[#4C4C4C]">{nights} nights from</span>
                              </div>

                              <div className="flex h-[28px] items-center justify-end px-[4px] py-[2px] min-w-[48px] max-w-[110px]">
                                <span className="h-[24px] whitespace-nowrap text-[16px] font-semibold leading-[24px] text-[#CB2187] text-right">£{getDisplayPrice(deal.starting_price)}</span>
                              </div>

                              <div className="flex h-[30px] w-[82px] items-center justify-center px-[2px] py-[4px]">
                                <span className="h-[22px] w-[78px] whitespace-nowrap text-[14px] font-normal leading-[22px] tracking-[0.01em] text-[#4C4C4C]">per person</span>
                              </div>
                            </div>

                            <CircleChevronRight className="h-[24px] w-[24px] shrink-0 text-[#CB2187]" />
                          </div>
                        </div>
                      </a>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselNext className="hidden md:flex" />
            <CarouselPrevious className="hidden md:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
