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
import { CustomPriceButton } from "./CustomPriceButton";

function InlineSpinner({ className }: { className?: string }) {
  return (
    <span
      className={
        className ??
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-pml-primary border-t-transparent align-middle"
      }
      aria-label="Loading"
    />
  );
}

// Filter Tab
const FilterTab = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`capitalize shrink-0 px-[14px] py-[10px] text-[10px] md:text-[12px] border leading-[140%] tracking-[0px] rounded-[25px] transition ${
      active
        ? "bg-[#FBE3F1] text-[#595858] border-[#9F9F9F]"
        : "text-[#7c7c7c] border-[#d0d0d0] hover:bg-[#FFF0F9] hover:text-[#CB2187] hover:border-[#CB2187]"
    }`}
  >
    {label}
  </button>
);
// Main Component
export default function DealCollections(props: any) {
  const { deal_collection_title, ...rest } = props;
  const router = useRouter();
  const cardPointerDownRef = React.useRef<{
    x: number;
    y: number;
    pointerId: number;
  } | null>(null);

  // Build dynamic tag + deal pairs
  const tabs: { label: string; deals: any[] }[] = [];

  Object.entries(rest).forEach(([key, value]) => {
    if (key.startsWith("deal_collection_tag_")) {
      const num = key.replace("deal_collection_tag_", "");
      const dealsKey = `tag_${num}_deals`;

      const label = typeof value === "string" ? value.trim() : "";
      if (!label) return;

      if (rest[dealsKey] && Array.isArray(rest[dealsKey]) && rest[dealsKey].length > 0) {
        tabs.push({
          label,
          deals: rest[dealsKey] as any[],
        });
      }
    }
  });

  const [activeFilter, setActiveFilter] = React.useState(tabs?.[0]?.label || "");

  React.useEffect(() => {
    if (tabs.length === 0) {
      if (activeFilter) setActiveFilter("");
      return;
    }
    if (!activeFilter || !tabs.some((t) => t.label === activeFilter)) {
      setActiveFilter(tabs[0].label);
    }
  }, [activeFilter, tabs]);

  const activeDeals = tabs.find((t) => t.label === activeFilter)?.deals || [];
  // ...existing code...

  return (
    <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] font-['Montserrat']">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-[20px] md:py-[50px] lg:py-[50px]">
        <div className="w-full max-w-[1280px] mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-3 md:mb-5">
            <h2 className="text-[24px] md:text-[48px] font-semibold text-[#4c4c4c] leading-[30px] md:leading-[60px] tracking-[-0.005em] max-w-[626px]">
              {deal_collection_title}
            </h2>

            <a
              href="/holiday-styles"
              className="text-gray-500 text-xs underline hover:text-[#CB2187] self-start md:self-end mt-2 md:mt-0"
            >
              view all PlanMyLuxe exclusives
            </a>
          </div>

          {/* Filter Tabs */}
          {tabs.length > 0 ? (
            <div className="flex overflow-x-auto scrollbar-hide gap-3 mb-5">
              {tabs.map((tab, index) => (
                <FilterTab
                  key={index}
                  label={tab.label}
                  active={activeFilter === tab.label}
                  onClick={() => setActiveFilter(tab.label)}
                />
              ))}
            </div>
          ) : null}

          {/* Carousel */}
          {activeDeals.length > 0 ? (
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent>
                {activeDeals.map((deal: any, idx: number) => {
                  const href = deal.slug ? `/hotels/${deal.slug}` : "#";

                  return (
                    <CarouselItem key={idx} className="basis-auto">
                      <div className="flex-[0_0_auto] w-[270px] sm:w-[300px] md:w-[360px] h-[436px] font-['Montserrat']">
                        <div

                          className="cursor-pointer bg-white rounded-[8px] overflow-hidden flex flex-col h-full border border-[#e0e0e0] group"
                          role={deal?.slug ? "link" : undefined}
                          tabIndex={deal?.slug ? 0 : undefined}
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
                          onKeyDown={(e) => {
                            if (!deal?.slug) return;
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              router.push(href);
                            }
                          }}
                        >
                        {/* Image Container */}
                        <div className="relative w-full overflow-hidden bg-[#f5f5f5] h-[225px]">
                          <img
                            src={
                              deal.card_image ||
                              "https://planmylux.s3.eu-west-2.amazonaws.com/placeholder.webp"
                            }
                            alt={deal.name}
                            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105 group-hover:scale-105 will-change-transform"
                          />

                          {/* Location Badge */}
                          {deal.offer_on_card && (
                            <span className="absolute top-0 left-0 bg-white text-[#CB2187] pr-[32px] pl-[12px] pt-[4px] pb-[4px] text-[11px] md:text-[13px] font-semibold uppercase max-w-[70%] leading-[18px] tracking-[0.015em] rounded-br-[167px] pointer-events-none">
                              {deal.offer_on_card}
                            </span>
                          )}

                          {deal?.offer_tag_type && (
                            <img
                              className="absolute top-5 right-2 pointer-events-none -rotate-[30deg]"
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

                          {/* ⭐ Rating Stars */}
                          <div className="flex items-center justify-start p-[4px] min-h-[28px]">
                            {Array.from({ length: 5 }).map((_, i) => {
                              const rating = Number(deal.property_rating) || 0;
                              const filled = i < Math.round(rating);

                              return (
                                <svg
                                  key={i}
                                  width="14"
                                  height="14"
                                  viewBox="0 0 14 14"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="inline-block mr-[1px]"
                                >
                                  <path
                                    d="M14.0001 5.4091L8.91313 5.07466L6.99734 0.261719L5.08156 5.07466L0.0001297 5.4091L3.89754 8.7184L2.61862 13.7384L6.99734 10.9707L11.3761 13.7384L10.0972 8.7184L14.0001 5.4091Z"
                                    fill={filled ? "#CB2187" : "#E0E0E0"}
                                  />
                                </svg>
                              );
                            })}
                          </div>

                          <h3 className="text-[14px] md:text-[16px] font-semibold text-pml-primary leading-[24px] mb-[10px] p-[4px] w-full min-h-[32px] truncate">
                            {deal.name || deal.title || ""}
                          </h3>

                          <div
                            className={`rounded-[8px] text-[12px] text-[#4c4c4c] font-medium mb-[9px] w-full min-h-[48px] flex items-center justify-center text-center ${
                              Boolean((deal.intro_text || deal.extras || "").trim())
                                ? "bg-[#EDEDED] border border-[#DFDEDE] px-[6px] md:px-[12px] py-[6px]"
                                : ""
                            }`}
                          >
                            {Boolean((deal.intro_text || deal.extras || "").trim()) ? (
                              <span className="line-clamp-2 leading-[18px] tracking-[0.02em]">
                                {deal.intro_text || deal.extras}
                              </span>
                            ) : null}
                          </div>
                          <CustomPriceButton
                            starting_price={deal.starting_price}
                            api_url={deal.api_url}
                            href={href}
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
          ) : null}
        </div>
      </div>
    </section>
  );
}
