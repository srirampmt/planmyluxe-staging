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
import { CircleChevronRight } from "lucide-react";
import { PriceButton } from "./PriceButton";
import { CustomPriceButton } from "./CustomPriceButton";

type TrendingCarouselDeal = {
  id?: number | string;
  image?: string;
  badge?: string;
  location?: string;
  title?: string;
  extras?: string;
  price?: string | null;
  slug?: string;
  api_url?: string | null;
  property_rating?: string | number;
  offer_tag_type?: string;
  starting_price?: string | null;
};

const CARDS_PER_ROW = 4;
const GRID_STEP = CARDS_PER_ROW * 2;

export default function DealCollections({
  title,
  deal_collection,
  viewAllHref = "/all-offers",
  layout = "carousel",
}: {
  title?: string;
  deal_collection?: any[];
  viewAllHref?: string;
  layout?: "carousel" | "grid";
}) {
  const router = useRouter();
  const cardPointerDownRef = React.useRef<{
    x: number;
    y: number;
    pointerId: number;
  } | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(CARDS_PER_ROW);

  const hotels = deal_collection ?? [];

  const deals: TrendingCarouselDeal[] = hotels.map((d: any) => ({
    id: d?.id ?? d?.slug,
    image: d?.card_image || d?.image ,
    badge: d?.offer_on_card ?? d?.badge ?? "",
    location: d?.location ?? "",
    title: d?.name ?? d?.title ?? "",
    extras: d?.intro_text ?? d?.extras ?? "",
    price: d?.price ?? null,
    slug: d?.slug ?? "",
    api_url: d?.api_url ?? null,
    property_rating: d?.property_rating ?? "",
    offer_tag_type: d?.offer_tag_type ?? "",
    starting_price: d?.starting_price ?? null,
  }));

  const renderDeal = (deal: TrendingCarouselDeal, idx: number, shellClass: string) => {
    const href = deal.slug ? `/hotels/${deal.slug}` : "#";
    return (
      <div key={idx} className={shellClass}>
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
          <div className="relative w-full overflow-hidden bg-[#f5f5f5] h-[225px]">
            <img
              src={deal.image || "https://planmylux.s3.eu-west-2.amazonaws.com/placeholder.webp"}
              alt={deal.title || "Hotel"}
              className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105 group-hover:scale-105 will-change-transform"
            />
            {Boolean((deal.badge || "").trim()) && (
              <span className="absolute top-0 left-0 bg-white text-[#CB2187] pr-[32px] pl-[12px] pt-[4px] pb-[4px] text-[11px] md:text-[13px] font-semibold uppercase max-w-[70%] leading-[18px] tracking-[0.015em] rounded-br-[167px] pointer-events-none">
                {deal.badge}
              </span>
            )}
            <div className="absolute top-0 right-[-25px] pointer-events-none">
              {deal.offer_tag_type && deal.offer_tag_type.trim() !== "" && (
                <img className="absolute top-5 right-2 pointer-events-none -rotate-[30deg]" src={deal.offer_tag_type} alt="tag" />
              )}
            </div>
          </div>
          <div className="pt-[6px] pr-[8px] pb-[14px] pl-[8px] flex-grow flex flex-col justify-start items-start text-left bg-white">
            <div className="text-[14px] font-semibold text-[#4c4c4c] leading-[1.4] p-[4px] w-full line-clamp-1 min-h-[28px]">
              {deal.location || ""}
            </div>
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
            <h5 className="text-[14px] md:text-[16px] font-semibold text-pml-primary leading-[24px] mb-[10px] p-[4px] w-full min-h-[32px] truncate">
              {deal.title || ""}
            </h5>
            <div className={`rounded-[8px] text-[12px] text-[#4c4c4c] font-medium mb-[9px] w-full min-h-[48px] flex items-center justify-center text-center ${Boolean((deal.extras || "").trim()) ? "bg-[#EDEDED] border border-[#DFDEDE] px-[6px] md:px-[12px] py-[6px]" : ""}`}>
              {Boolean((deal.extras || "").trim()) ? (
                <span className="line-clamp-2 leading-[18px] tracking-[0.02em]">{deal.extras}</span>
              ) : null}
            </div>
            <CustomPriceButton starting_price={deal.starting_price} api_url={deal.api_url} href={href} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] font-['Montserrat']" >
      <div className={`mx-auto w-full max-w-[1440px] px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] ${layout === "grid" ? "py-6 md:py-8" : "py-[20px] md:py-[50px] lg:py-[50px]"}`}>
        <div className="w-full max-w-[1280px] mx-auto">
          {/* Header */}
          <div className="mb-3 flex flex-row items-center justify-between gap-3 md:mb-5">
            <h2 className="min-w-0 flex-1 font-['Montserrat'] text-[24px] font-semibold leading-[30px] tracking-[-0.005em] text-[#4c4c4c] md:text-[48px] md:leading-[1.15]">
              {title}
            </h2>

            {layout === "grid" ? (
              <a
                href={viewAllHref}
                className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[8px] border border-pml-primary bg-white px-[16px] py-[5px] text-[16px] font-semibold leading-none text-pml-primary transition-colors hover:bg-pml-primary hover:text-white"
              >
                <span className="md:hidden">Explore deals</span>
                <span className="hidden md:inline">Explore more deals</span>
              </a>
            ) : (
              <a
                href={viewAllHref}
                className="shrink-0 whitespace-nowrap text-xs text-gray-500 underline hover:text-[#CB2187]"
              >
                view all PlanMyLuxe exclusives
              </a>
            )}
          </div>
          {layout === "grid" ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {deals.slice(0, visibleCount).map((deal, idx) => renderDeal(deal, idx, "h-[436px] w-full font-['Montserrat']"))}
              </div>
              {visibleCount < deals.length && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => Math.min(count + GRID_STEP, deals.length))}
                    className="rounded-[8px] border border-pml-primary bg-pml-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-pml-primary/90"
                  >
                    View more deals
                  </button>
                </div>
              )}
            </>
          ) : (
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent>
              {deals.map((deal, idx) => (
                  <CarouselItem key={idx} className="basis-auto">
                    {renderDeal(deal, idx, "flex-[0_0_auto] w-[270px] sm:w-[300px] md:w-[360px] h-[436px] font-['Montserrat']")}
                  </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselNext className="hidden md:flex" />
            <CarouselPrevious className="hidden md:flex" />
          </Carousel>
          )}
        </div>
      </div>
    </section>
  );
}


