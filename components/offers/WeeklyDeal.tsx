"use client";
import React, { useEffect, useRef, useState } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { CircleChevronRight } from "lucide-react";
import type { Deal, HotDeal, MultiCentreSnapshot } from "@/types/homepage";
import { PriceButton } from "../PriceButton";

/* MAIN COMPONENT (ALL IN ONE FILE) */

async function requestCardMeta(
  apiUrl: string,
  signal?: AbortSignal
): Promise<{ price: number | null; durationMax: number | null }> {
  const url = apiUrl?.trim();
  if (!url) return { price: null, durationMax: null };

  const res = await fetch(`/api/cardprice?${url}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });

  const json = await res.json().catch(() => null);
  const rawPrice = json?.price;
  const p = typeof rawPrice === "number" ? rawPrice : rawPrice != null ? Number(rawPrice) : NaN;

  const rawDuration = json?.durationMax;
  const d = typeof rawDuration === "number" ? rawDuration : rawDuration != null ? Number(rawDuration) : NaN;

  return {
    price: Number.isFinite(p) && p > 0 ? p : null,
    durationMax: Number.isFinite(d) && d > 0 ? d : null,
  };
}

function formatGBP(amount: number): string {
  return `£${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(amount)}`;
}

function normalizeApiUrl(raw: string): string {
  const input = (raw ?? "").trim();
  // If backend gives a full dpSearch URL, keep only the querystring.
  const qs = input.includes("?") ? input.split("?").slice(1).join("?") : input;
  return qs.replace(/^\?/, "").replace(/cheapestPerDay=\d+/, "cheapestPerDuration=0");
}

export default function WeeklyDeal({
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
  Weekly_hot_deal?: HotDeal | MultiCentreSnapshot | null;
  Weekly_deals_hotels?: Deal[];
  card_image?: string | null;
  add_title?: string;
  add_subtitle?: string;
  add_link?: string;
}) {
  const featuredDeal = Weekly_hot_deal ?? null;
  // toptrendingdeals/ sends a HotDeal (card_image/offer_header/name/api_url);
  // toptrendingmulticentre/ sends a MultiCentreSnapshot (image/title/extras/slug+nights). Normalize both here.
  const dealImage = featuredDeal
    ? (featuredDeal as HotDeal).card_image || (featuredDeal as MultiCentreSnapshot).image
    : undefined;
  const dealBadge = featuredDeal ? (featuredDeal as HotDeal).offer_on_card : undefined;
  const dealTitle = featuredDeal
    ? (featuredDeal as HotDeal).offer_header || (featuredDeal as MultiCentreSnapshot).title
    : undefined;
  const dealSubtitle = featuredDeal
    ? (featuredDeal as HotDeal).name || (featuredDeal as MultiCentreSnapshot).extras
    : undefined;
  const dealApiUrl = featuredDeal ? (featuredDeal as HotDeal).api_url : undefined;
  const dealNights = featuredDeal ? (featuredDeal as MultiCentreSnapshot).nights : undefined;
  const dealLocalTax = featuredDeal ? (featuredDeal as MultiCentreSnapshot).local_tax : undefined;
  const dealHref = featuredDeal
    ? dealApiUrl
      ? `/hotels/${featuredDeal.slug || ""}`
      : `/multi-centre/${featuredDeal.slug || ""}`
    : "#";

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
              href="/all-offers"
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
                      dealImage ||
                      "https://planmylux.s3.eu-west-2.amazonaws.com/placeholder.webp"
                    }
                    alt="Featured Escape"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105 group-hover:scale-105 will-change-transform"
                  />

                  {dealBadge ? (
                    <span className="absolute top-0 left-0 bg-white text-[#CB2187] pr-[32px] pl-[12px] pt-[4px] pb-[4px] text-[11px] md:text-[13px] font-semibold max-w-[70%] leading-[18px] tracking-[0.015em] rounded-br-[167px] pointer-events-none">
                      {dealBadge}
                    </span>
                  ) : null}

                  {/* Exclusive Tag SVG */}
                  {featuredDeal?.offer_tag_type ? (
                    <img
                      src={featuredDeal.offer_tag_type}
                      alt="Offer Tag"
                      className="absolute top-5 right-2 -rotate-[30deg] pointer-events-none"
                    />
                  ) : null}
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
                    {dealTitle}
                  </h3>

                  <p className="text-pml-primary text-[14px] font-semibold p-[4px] leading-[140%]">
                    {dealSubtitle}
                  </p>

                  <p className="text-[#7C7C7C] font-['Montserrat'] text-[12px] font-normal p-[4px] leading-[18px] tracking-[0.02em] line-clamp-2 md:line-clamp-none lg:line-clamp-none mb-[10px]">
                    {featuredDeal.intro_text}
                  </p>

                  <PriceButton
                    starting_price={featuredDeal.starting_price}
                    api_url={dealApiUrl}
                    slug={!dealApiUrl ? featuredDeal.slug : undefined}
                    nights={dealNights}
                    local_tax={dealLocalTax}
                    href={dealHref}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
