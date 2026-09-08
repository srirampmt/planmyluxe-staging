"use client";

import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

type Props = {
  offers_title?: string;
  offers_subtitle?: string;

  offer_1_title?: string;
  offer_1_subtitle?: string;
  offer_1_image?: string;
  offer_1_url?: string;

  offer_2_title?: string;
  offer_2_subtitle?: string;
  offer_2_image?: string;
  offer_2_url?: string;

  offer_3_title?: string;
  offer_3_subtitle?: string;
  offer_3_image?: string;
  offer_3_url?: string;

  offer_4_title?: string;
  offer_4_subtitle?: string;
  offer_4_image?: string;
  offer_4_url?: string;
};

export default function Handpickedescapes(props: Props) {
  const {
    offers_title,
    offers_subtitle,
    offer_1_title,
    offer_1_subtitle,
    offer_1_image,
    offer_1_url,
    offer_2_title,
    offer_2_subtitle,
    offer_2_image,
    offer_2_url,
    offer_3_title,
    offer_3_subtitle,
    offer_3_image,
    offer_3_url,
    offer_4_title,
    offer_4_subtitle,
    offer_4_image,
    offer_4_url,
  } = props;

  const escapeCards = [
    {
      id: 1,
      label: "DISCOVER EXCLUSIVES",
      title: offer_1_title,
      discount: offer_1_subtitle,
      textColor: "text-[#d63384]",
      image: offer_1_image,
      url: offer_1_url,
    },
    {
      id: 2,
      label: "DISCOVER EXCLUSIVES",
      title: offer_2_title,
      discount: offer_2_subtitle,
      textColor: "text-[#fce4ec]",
      image: offer_2_image,
      url: offer_2_url,
    },
    {
      id: 3,
      label: "DISCOVER EXCLUSIVES",
      title: offer_3_title,
      discount: offer_3_subtitle,
      textColor: "text-[#d63384]",
      image: offer_3_image,
      url: offer_3_url,
    },
    {
      id: 4,
      label: "DISCOVER EXCLUSIVES",
      title: offer_4_title,
      discount: offer_4_subtitle,
      textColor: "text-[#d63384]",
      image: offer_4_image,
      url: offer_4_url,
    },
  ];

  const visibleCards = escapeCards.filter(
    (card) => Boolean(card.title) && Boolean(card.url)
  );

  return (
    <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-white font-['Montserrat']">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-[20px] md:py-[50px] lg:py-[50px]">
        <div className="w-full max-w-[1280px] mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-[10px] md:mb-[20px] lg:mb-[25px]">
            <div className="max-w-[624px] mb-[12px] lg:mb-0">
              <h2 className="font-['Montserrat'] text-[#4c4c4c] text-[24px] sm:text-[32px] md:text-[40px] lg:text-[48px] font-semibold leading-[30px] sm:leading-[30px] md:leading-[60px] lg:leading-[60px] tracking-[-0.005em] mb-[12px] sm:mb-[16px] md:mb-[20px] lg:mb-[24px]">
                {offers_title || "Explore handpicked luxury escapes for less"}
              </h2>

              <p className="font-['Montserrat'] text-[#4c4c4c] text-[14px] sm:text-[16px] md:text-[16px] lg:text-[18px] font-normal leading-[20px] md:leading-[28px] lg:leading-[28px] tracking-[0] max-w-[624px] line-clamp-2 md:line-clamp-none lg:line-clamp-none">
                {offers_subtitle ||
                  "Each week our travel experts handpick the best value four and five star escapes securing unbeatable offers upgrades and added extras."}
              </p>
            </div>

            <div className="lg:pb-[8px]">
              <Link
                href="/all-offers"
                className="font-['Montserrat'] text-[#666666] text-[12px] font-normal underline hover:text-[#4c4c4c] underline-offset-[3px]"
              >
                view all PlanMyLuxe exclusives
              </Link>
            </div>
          </div>

          {/* Carousel */}
          <Carousel opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent className="-ml-4">
              {visibleCards.map((card) => (
                <CarouselItem
                  key={card.id}
                  className="pl-4 basis-[280px] sm:basis-[320px] md:basis-[360px] lg:basis-[405px] transition-transform hover:-translate-y-[2px] cursor-pointer"
                >
                  <Link
                    href={card.url as string}
                    className={`relative overflow-hidden rounded-[16px] sm:rounded-[18px] md:rounded-[20px] p-[24px] sm:p-[28px] md:p-[32px] lg:p-[36px] h-[144px] sm:h-[164px] md:h-[185px] lg:h-[208px] flex flex-col justify-center items-center text-center`}
                  >
                    {/* IMAGE ONLY (no icons now) */}
                    {card.image && (
                      <img
                        src={card.image}
                        alt={String(card.title)}
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      />
                    )}

                    <div className="relative z-10 mt-8">
                      <span
                        className={`${card.textColor} text-[10px] sm:text-[11px] md:text-[12px] font-semibold tracking-[1.5px] leading-[1%] uppercase mb-[4px] sm:mb-[6px] md:mb-[8px] block`}
                      >
                        {card.label}
                      </span>

                      <h3
                        className={`${card.textColor} text-[18px] sm:text-[22px] md:text-[24px] lg:text-[24px] font-bold leading-[1.2] mb-[6px] sm:mb-[7px] md:mb-[8px] lg:mb-[10px]`}
                      >
                        {card.title}
                      </h3>

                      <span className="inline-block bg-[#f5d742] text-[#4c4c4c] text-[8px] sm:text-[10px] md:text-[14px] font-bold px-[14px] sm:px-[16px] md:px-[18px] lg:px-[20px] py-[6px] rounded-full">
                        {card.discount}
                      </span>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
