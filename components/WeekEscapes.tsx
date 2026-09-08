
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
// ...existing code...
import type { Deal, HotDeal } from "@/types/homepage";
import Image from "next/image";
import { CustomPriceButton } from "./CustomPriceButton";
import { PriceButton } from "./PriceButton";
import AddsBanner from "./AddsBanner";
/* MAIN COMPONENT (ALL IN ONE FILE) */





export default function WeekEscapes({
  Weekly_deals_title,
  Weekly_deals_subtitle,
  Weekly_hot_deal,
  Weekly_deals_hotels,

  card_image,
  add_title,
  add_subtitle,
  add_link,
}: {
  Weekly_deals_title?: string;
  Weekly_deals_subtitle?: string;
  Weekly_hot_deal?: HotDeal | null;
  Weekly_deals_hotels?: Deal[];
  card_image?: string | null;
  add_title?: string;
  add_subtitle?: string;
  add_link?: string;
}) {
  const router = useRouter();
  const cardPointerDownRef = React.useRef<{
    x: number;
    y: number;
    pointerId: number;
  } | null>(null);

  const featuredDeal = Weekly_hot_deal ?? null;
  const hotels = Weekly_deals_hotels ?? [];
  // ...existing code...
  return (
    <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-[#FFF7FC] font-['Montserrat']">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-[20px] md:py-[50px] lg:py-[50px]">
        <div className="w-full max-w-[1280px] mx-auto">
          {/* <HeaderSection /> */}
          <h2 className="font-['Montserrat'] text-[24px] md:text-[48px] lg:text-[48px] font-semibold text-[#4c4c4c] leading-tight max-w-[626px]">
            {Weekly_deals_title || ""}
          </h2>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
            <p className="text-[#4c4c4c] font-['Montserrat'] mt-2 max-w-xl text-[14px] md:text-[16px] lg:text-[16px] font-normal line-clamp-2 md:line-clamp-none lg:line-clamp-none ">
              {Weekly_deals_subtitle || ""}
            </p>

            <a
              href="/holiday-styles"
              className="font-['Montserrat'] text-xs text-right text-[#4c4c4c] underline hover:text-[#CB2187] whitespace-nowrap ml-0 md:ml-4 mt-2 md:mt-0"
            >
              view all PlanMyLuxe exclusives
            </a>
          </div>
          {/* <FeaturedCard /> */}
          {featuredDeal && (
            <div className="bg-white rounded-[8px] overflow-hidden border border-[#ececec] group my-5 md:my-6">
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

                  {Boolean((featuredDeal.offer_on_card || "").trim()) && (
                    <span className="absolute top-0 left-0 bg-white text-[#CB2187] pr-[32px] pl-[12px] pt-[4px] pb-[4px] text-[11px] md:text-[13px] font-semibold max-w-[70%] leading-[18px] tracking-[0.015em] rounded-br-[167px] pointer-events-none">
                      {featuredDeal.offer_on_card}
                    </span>
                  )}

                  {/* Exclusive Tag SVG */}
                  {featuredDeal?.offer_tag_type && (
                    <img
                      className="absolute top-5 right-2 pointer-events-none -rotate-[30deg] "
                      src={featuredDeal.offer_tag_type}
                      alt="tag"
                    />
                  )}
                </div>

                {/* RIGHT: DETAILS */}
                <div className="p-[8px] md:p-[16px] flex flex-col">
                  <div className="font-semibold text-[#4c4c4c] text-[14px] p-[4px] w-full line-clamp-1 min-h-[28px]">
                    {featuredDeal.location || ""}
                  </div>

                  <div className="text-pml-primary p-[4px] min-h-[28px]">
                    <span className="text-pml-primary text-[14px]">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const rating = Number(
                          featuredDeal?.property_rating || 0,
                        );
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

                  <h3 className="text-[16px] font-semibold text-[#4c4c4c] leading-[24px] p-[4px] w-full line-clamp-1 min-h-[32px]">
                    {featuredDeal.offer_header || ""}
                  </h3>

                  <p className="text-pml-primary text-[14px] font-semibold p-[4px] leading-[140%] w-full line-clamp-1 min-h-[28px]">
                    {featuredDeal.name || ""}
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

          {/* <TrendingCarousel /> */}
          <Carousel opts={{ align: "start" }} className="w-full mb-4 md:mb-8">
            <CarouselContent>
              {hotels.map((deal, idx) => {
                const rating = Number(deal?.property_rating || 0);
                const href = deal?.slug ? `/hotels/${deal.slug}` : "#";

                return (
                  <CarouselItem key={idx} className="basis-auto">
                    <div className="flex-[0_0_auto] w-[270px] sm:w-[300px] md:w-[360px] h-[436px] font-['Montserrat']">
                      <div
                        className="cursor-pointer bg-white rounded-[8px] overflow-hidden flex flex-col h-full border border-[#e0e0e0] group"
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
                        {/* Image Container */}
                        <div className="relative w-full overflow-hidden bg-[#f5f5f5] h-[225px]">
                          <img
                            src={
                              deal.card_image ||
                              "https://planmylux.s3.eu-west-2.amazonaws.com/placeholder.webp"
                            }
                            alt={deal.name || "Hotel"}
                            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105 group-hover:scale-105 will-change-transform"
                          />

                          {/* Location Badge */}
                          {Boolean((deal.offer_on_card || "").trim()) && (
                            <span className="absolute top-0 left-0 bg-white text-[#CB2187] pr-[32px] pl-[12px] pt-[4px] pb-[4px] text-[11px] md:text-[13px] font-semibold uppercase max-w-[70%] leading-[18px] tracking-[0.015em] rounded-br-[167px] pointer-events-none">
                              {deal.offer_on_card}
                            </span>
                          )}

                          {/* Exclusive Tag SVG from API */}
                          {deal?.offer_tag_type && (
                            <img
                              className="absolute top-5 right-2 pointer-events-none -rotate-[30deg] w-auto h-auto max-h-[84px] object-contain"
                              src={deal.offer_tag_type}
                              alt="tag"
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="pt-[6px] pr-[8px] pb-[14px] pl-[8px] flex-grow flex flex-col justify-start items-start text-left bg-white">
                          <div className="text-[14px] font-semibold text-[#4c4c4c] leading-[1.4] p-[4px] w-full line-clamp-1 min-h-[28px]">
                            {deal.location || ""}
                          </div>

                          {/* Rating */}
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
                                      rating >= i + 1 ? "#CB2187" : "#E0E0E0"
                                    }
                                  />
                                </svg>
                              ))}
                            </span>
                          </div>

                          <h5 className="text-[14px] md:text-[16px] font-semibold text-pml-primary leading-[24px] mb-[10px] p-[4px] w-full min-h-[32px] truncate">
                            {deal.name || deal.title || ""}
                          </h5>

                          <div
                            className={`rounded-[8px] text-[12px] text-[#4c4c4c] font-medium mb-[9px] w-full min-h-[48px] flex items-center justify-center text-center ${
                              Boolean(
                                (
                                  deal.intro_text ||
                                  deal.extras ||
                                  ""
                                ).trim(),
                              )
                                ? "bg-[#EDEDED] border border-[#DFDEDE] px-[6px] md:px-[12px] py-[6px]"
                                : ""
                            }`}
                          >
                            {Boolean(
                              (deal.intro_text || deal.extras || "").trim(),
                            ) ? (
                              <span className="line-clamp-2 leading-[18px] tracking-[0.02em]">
                                {deal.intro_text || deal.extras}
                              </span>
                            ) : null}
                          </div>
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

          <AddsBanner image={card_image} title={add_title} subtitle={add_subtitle} addlink={add_link} />
        </div>
      </div>
    </section>
  );
}


