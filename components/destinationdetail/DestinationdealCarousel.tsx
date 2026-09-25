"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomPriceButton } from "../CustomPriceButton";


export default function DestinationDealCarousel({
  trending_deals_title_1,
  trending_deals_subtitle_1,
  trending_deals_1,
  sectionClassName = "",
  viewAllHref,
  viewAllLabel = "View all deals",
}: {
  trending_deals_title_1?: string;
  trending_deals_subtitle_1?: string;
  trending_deals_1: any[];
  sectionClassName?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(4);

  const title = trending_deals_title_1 || "Trending Deals";
  const subtitle = trending_deals_subtitle_1 || "";
  const deals = trending_deals_1 || [];
  const visibleDeals = deals.slice(0, visibleCount);
  const hasMore = visibleCount < deals.length;

  if (deals.length === 0) return null;

  // ...existing code...
  return (
    <section className={`w-full bg-[#F9FAFB] font-['Montserrat'] ${sectionClassName}`}>
      <div className="mx-auto w-full max-w-[1440px] px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
        <div className="mx-auto w-full max-w-[1280px]">
            <div className="relative">
            <div className="relative">
              <div className="flex flex-row items-center justify-between gap-3">
                <div className="max-w-[720px] text-left">
                  <h2 className="mb-2 font-['Montserrat'] text-[22px] font-semibold leading-snug tracking-[-0.01em] text-[#1a1a1a] md:text-[32px]">
                    {title}
                  </h2>

                  {subtitle ? (
                    <p className="text-[15px] leading-7 text-[#5c6370] md:text-[16px]">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
                {viewAllHref ? (
                  <Link
                    href={viewAllHref}
                    className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[8px] border border-pml-primary bg-white px-[16px] py-[5px] text-[14px] font-semibold leading-none text-pml-primary transition-colors hover:bg-pml-primary hover:text-white md:text-[16px]"
                  >
                    <span className="md:hidden">Explore deals</span>
                    <span className="hidden md:inline">{viewAllLabel}</span>
                  </Link>
                ) : null}
              </div>

              <div className="relative mt-6 md:mt-8">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {visibleDeals.map((deal, idx) => {
                      const href = deal?.slug ? `/hotels/${deal.slug}` : "#";

                      return (
                        <div key={deal?.slug || idx} className="h-[360px] cursor-pointer font-['Montserrat'] sm:h-[420px] lg:h-[436px]">
                          <div
                            className="group flex h-full flex-col overflow-hidden rounded-[8px] border border-gray-200/70 bg-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]"
                            role={deal?.slug ? "link" : undefined}
                            tabIndex={deal?.slug ? 0 : undefined}
                            onKeyDown={(e) => {
                              if (!deal?.slug) return;
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                router.push(href);
                              }
                            }}
                            onClick={(e) => {
                              if (!deal?.slug) return;
                              const target = e.target as Element | null;
                              if (target?.closest("a, button")) return;
                              router.push(href);
                            }}
                          >
                            {/* IMAGE */}
                            <div className="relative h-[140px] w-full overflow-hidden bg-[#f3f4f6] sm:h-[190px] lg:h-[210px]">
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
                              <div className="min-h-[24px] w-full line-clamp-1 p-[4px] text-[11px] font-semibold leading-[1.4] text-[#4c4c4c] sm:min-h-[28px] sm:text-[14px]">
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
                              <h3 className="mb-[8px] min-h-[32px] w-full truncate p-[4px] text-[13px] font-semibold leading-[20px] text-pml-primary sm:mb-[10px] sm:text-[14px] md:text-[16px] md:leading-[24px]">
                                {deal?.name || deal?.title || ""}
                              </h3>

                              {/* OFFER BOX */}
                              <div
                                className={`mb-[9px] hidden min-h-[48px] w-full items-center justify-center rounded-[8px] text-center text-[12px] font-medium text-[#4c4c4c] sm:flex ${
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
                              <div className="mt-auto w-full">
                                <CustomPriceButton
                                  starting_price={deal.starting_price}
                                  api_url={deal.api_url}
                                  href={href}
                                  variant="primary"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                {hasMore ? (
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((count) => Math.min(count + 4, deals.length))}
                      className="rounded-[8px] border border-pml-primary bg-pml-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-pml-primary/90"
                    >
                      View more deals
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}