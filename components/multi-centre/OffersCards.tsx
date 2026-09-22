"use client";
 
import React, { useEffect, useState } from "react";
import { CircleChevronRight } from "lucide-react";
 
type TrendingCarouselDeal = {
  id?: number | string;
  image?: string;
  badge?: string;
  location?: string;
  title?: string;
  extras?: string;
  price?: string | null;
  slug?: string;
  property_rating?: string | number;
  offer_tag_type?: string;
  starting_price?: string | null;
  nights?: number | string;
};
 
export default function OfferCards({
  offers,
}: {
  offers?: Array<TrendingCarouselDeal>;
}) {
  const allOffers = offers ?? [];
  const cardsPerRow = 4;
  const [visibleCount, setVisibleCount] = useState(cardsPerRow);
 
  useEffect(() => {
    setVisibleCount(cardsPerRow);
  }, [allOffers.length]);
 
  const visibleOffers = allOffers.slice(0, visibleCount);
 
  const hasMoreOffers = visibleCount < allOffers.length;
 
  return (
    <>
      {allOffers.length > 0 && (
        <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] font-['Montserrat']">
          <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] pb-[20px] md:pb-[50px] lg:pb-[50px]">
            <div className="w-full max-w-[1280px] mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-3 md:mb-5">
                <h2 className="text-[24px] md:text-[48px] font-semibold text-[#1a1b4b] leading-[30px] md:leading-[60px] tracking-[-0.005em] max-w-[626px]">
                  {"Similar Offers"}
                </h2>
                <a
                  href="/trending-multi-centres"
                  className="text-gray-500 text-xs underline hover:text-[#CB2187] self-start md:self-end mt-2 md:mt-0"
                >
                  view all Multi Centres
                </a>
              </div>
 
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {visibleOffers.map((deal, idx) => {
                  const href = deal.slug ? (deal.slug === "#" ? "#" : `/multi-centre/${deal.slug}`) : "#";
                  const displayPrice = Number(deal.starting_price ?? 0) || 0;
 
                  return (
                    <div key={idx} className="w-full h-[436px] font-['Montserrat']">
                      <a href={href} className="bg-white rounded-[8px] overflow-hidden flex flex-col h-full border border-[#e0e0e0] group no-underline">
                        <div className="relative w-full overflow-hidden bg-[#f5f5f5] h-[225px]">
                          <img
                            src={deal.image || " "}
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
                              <img
                                className="absolute top-5 right-2 pointer-events-none -rotate-[30deg]"
                                src={deal.offer_tag_type}
                                alt="tag"
                              />
                            )}
                          </div>
                        </div>
 
                        <div className="pt-[6px] pr-[8px] pb-[14px] pl-[8px] flex-grow flex flex-col justify-start items-start text-left bg-white">
                          <div className="text-[14px] font-semibold text-[#1a1b4b] leading-[1.4] p-[4px] w-full line-clamp-1 min-h-[28px]">{deal.location || ""}</div>
 
                          <div className="flex items-center justify-start p-[4px] min-h-[28px]">
                            <div className="flex gap-[2px]">
                              {Number(deal?.property_rating || 0) > 0 && (
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
                              )}
                            </div>
                          </div>
 
                          <h5 className="text-[14px] md:text-[16px] font-semibold text-pml-primary leading-[24px] mb-[10px] p-[4px] w-full min-h-[32px] truncate">{deal.title || ""}</h5>
 
                          <div className={`rounded-[8px] text-[12px] text-[#1a1b4b] font-medium mb-[9px] w-full min-h-[48px] flex items-center justify-center text-center ${Boolean((deal.extras || "").trim()) ? "bg-[#EDEDED] border border-[#DFDEDE] px-[6px] md:px-[12px] py-[6px]" : ""}`}>
                            {Boolean((deal.extras || "").trim()) ? <span className="line-clamp-2 leading-[18px] tracking-[0.02em]">{deal.extras}</span> : null}
                          </div>
 
                          <div className="mt-auto ml-auto flex items-center justify-end gap-[8px] w-full max-w-[289px] px-[8px] font-['Montserrat']">
                            <div className="flex items-center gap-[6px]">
                              <span className="text-[14px] text-[#1a1b4b] whitespace-nowrap">
                                {String(deal.nights ?? "00").padStart(2, "0")} nights from
                              </span>
 
                              <span className="text-[16px] font-semibold text-[#CB2187] whitespace-nowrap">
                                £{displayPrice.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
                              </span>
 
                              <span className="text-[14px] text-[#1a1b4b] whitespace-nowrap">
                                Per Person
                              </span>
                            </div>
 
                            <CircleChevronRight className="h-[24px] w-[24px] shrink-0 text-[#CB2187]" />
                          </div>
                        </div>
                      </a>
                    </div>
                  );
                })}
              </div>
 
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (!hasMoreOffers) return;
                    setVisibleCount((prev) => prev + cardsPerRow);
                  }}
                  disabled={!hasMoreOffers}
                  className="px-6 py-2.5 rounded-[8px] border border-[#CB2187] text-[#CB2187] font-semibold text-[14px] hover:bg-[#CB2187] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#CB2187]"
                >
                  Load More
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}