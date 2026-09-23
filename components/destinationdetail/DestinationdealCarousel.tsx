"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CircleChevronRight } from "lucide-react";
import { CustomPriceButton } from "../CustomPriceButton";


export default function DestinationDealCarousel({
  trending_deals_title_1,
  trending_deals_subtitle_1,
  trending_deals_1,
}: {
  trending_deals_title_1?: string;
  trending_deals_subtitle_1?: string;
  trending_deals_1: any[];
}) {
  const router = useRouter();
  const cardPointerDownRef = React.useRef<{
    x: number;
    y: number;
    pointerId: number;
  } | null>(null);

  const [activeFilter] = useState("Popular");

  const title = trending_deals_title_1 || "Trending Deals";
  const subtitle = trending_deals_subtitle_1 || "";
  const deals = trending_deals_1 || [];

  // ...existing code...
  return (
    <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] font-['Montserrat']">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
        <div className="w-full max-w-[1280px] mx-auto">
            <div className="bg-gradient-to-br from-[#1a9b9e] via-[#2ab5b8] to-[#5bc9cc] w-full py-8 md:py-10 relative z-0">
            <div
              className="absolute top-0 bottom-0 bg-cover bg-center bg-no-repeat pointer-events-none"
              style={{
                backgroundImage:
                  "url('https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/homepage/destination-carousel-bg.png')",
                width: "100vw",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <div className="absolute inset-0 bg-black opacity-10"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-left md:mb-10">
                <h2 className="text-[24px] md:text-[48px] font-semibold text-white leading-[30px] md:leading-[60px] tracking-[-0.005em] max-w-[626px] mb-4 md:md-8">
                  {title}
                </h2>

                <p className="text-white max-w-[624px] text-[14px] md:text-[16px] leading-[24px] line-clamp-2 md:line-clamp-none lg:line-clamp-none">
                  {subtitle}
                </p>
              </div>

              <div className="relative mt-5 md:mt-10">
                <Carousel opts={{ align: "start" }} className="w-full relative">
                  <CarouselContent>
                    {deals.map((deal, idx) => {
                      const href = deal?.slug ? `/hotels/${deal.slug}` : "#";

                      return (
                      <CarouselItem key={idx} className="basis-auto">
                        <div className="cursor-pointer flex-[0_0_auto] w-[270px] sm:w-[300px] md:w-[360px] h-[436px] font-['Montserrat']">
                          <div
                            className="bg-white rounded-[8px] overflow-hidden flex flex-col h-full border border-[#e0e0e0] group"
                            role={deal?.slug ? "link" : undefined}
                            tabIndex={deal?.slug ? 0 : undefined}
                            onKeyDown={(e) => {
                              if (!deal?.slug) return;
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                router.push(href);
                              }
                            }}
                            onPointerDownCapture={(e) => {
                              if (!deal?.slug) return;
                              const target = e.target as Element | null;
                              if (target?.closest("a")) return;
                              cardPointerDownRef.current = {
                                x: e.clientX,
                                y: e.clientY,
                                pointerId: e.pointerId,
                              };
                            }}
                            onPointerUpCapture={(e) => {
                              if (!deal?.slug) return;
                              const target = e.target as Element | null;
                              if (target?.closest("a")) return;

                              const down = cardPointerDownRef.current;
                              cardPointerDownRef.current = null;
                              if (!down || down.pointerId !== e.pointerId) return;

                              const dx = Math.abs(e.clientX - down.x);
                              const dy = Math.abs(e.clientY - down.y);
                              if (dx > 8 || dy > 8) return;

                              router.push(href);
                            }}
                          >
                            {/* IMAGE */}
                            <div className="relative w-full overflow-hidden bg-[#f5f5f5] h-[225px]">
                              <img
                                src={
                                  deal?.card_image ||
                                  "https://planmylux.s3.eu-west-2.amazonaws.com/placeholder.webp"
                                }
                                alt={deal?.name || "Hotel"}
                                className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105 group-hover:scale-105 will-change-transform"
                              />

                              {/* BADGE */}
                              {Boolean((deal?.offer_on_card || "").trim()) && (
                                <span className="absolute top-0 left-0 bg-white text-[#CB2187] pr-[32px] pl-[12px] pt-[4px] pb-[4px] text-[11px] md:text-[13px] font-semibold uppercase max-w-[70%] leading-[18px] tracking-[0.015em] rounded-br-[167px] pointer-events-none">
                                  {deal.offer_on_card}
                                </span>
                              )}

                              {/* SVG TAG FROM API */}
                              {deal?.offer_tag_type && (
                                <img
                                  className="absolute top-5 right-2 pointer-events-none -rotate-[30deg]"
                                  src={deal.offer_tag_type}
                                  alt="tag"
                                />
                              )}
                            </div>

                            {/* CONTENT */}
                            <div className="pt-[6px] pr-[8px] pb-[14px] pl-[8px] flex-grow flex flex-col justify-start items-start text-left bg-white">
                              {/* LOCATION */}
                              <div className="text-[14px] font-semibold text-[#4c4c4c] leading-[1.4] p-[4px] w-full line-clamp-1 min-h-[28px]">
                                {deal?.location || ""}
                              </div>

                              {/* ⭐️ RATING */}
                              <div className="flex items-center justify-start p-[4px] min-h-[28px]">
                                <span className="text-pml-primary text-[14px]">
                                  {Array.from({ length: 5 }).map((_, i) => (
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
                                        fill={
                                          Math.round(
                                            Number(deal?.property_rating) || 0
                                          ) >=
                                          i + 1
                                            ? "#CB2187"
                                            : "#E0E0E0"
                                        }
                                      />
                                    </svg>
                                  ))}
                                </span>
                              </div>

                              {/* TITLE */}
                              <h5 className="text-[14px] md:text-[16px] font-semibold text-pml-primary leading-[24px] mb-[10px] p-[4px] w-full min-h-[32px] truncate">
                                {deal?.name || deal?.title || ""}
                              </h5>

                              {/* OFFER BOX */}
                              <div
                                className={`rounded-[8px] text-[12px] text-[#4c4c4c] font-medium mb-[9px] w-full min-h-[48px] flex items-center justify-center text-center ${
                                  Boolean((deal?.intro_text || deal?.extras || "").trim())
                                    ? "bg-[#EDEDED] border border-[#DFDEDE] px-[6px] md:px-[12px] py-[6px]"
                                    : ""
                                }`}
                              >
                                {Boolean((deal?.intro_text || deal?.extras || "").trim()) ? (
                                  <span className="line-clamp-2 leading-[18px] tracking-[0.02em]">
                                    {deal?.intro_text || deal?.extras}
                                  </span>
                                ) : null}
                              </div>

                              {/* PRICE CTA */}
                              
                              <CustomPriceButton
                                starting_price={deal.starting_price}
                                api_url={deal.api_url}
                                href={href}
                                variant="primary"
                              />
                            </div>
                          </div>
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
          </div>
        </div>
      </div>
    </section>
  );
}