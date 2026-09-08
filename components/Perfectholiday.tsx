"use client";

import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";

interface PerfectHolidayProps {
  perfect_holiday_title?: string;
  perfect_holiday_subtitle?: string;
  perfect_holiday_types?: {
    id?: number | string;
    name?: string;
    slug?: string;
    card_image?: string;
    card_subtitle?: string;
  }[];
}

export function Perfectholiday({
  perfect_holiday_title,
  perfect_holiday_subtitle,
  perfect_holiday_types,
}: PerfectHolidayProps) {
  const isDestinations = (perfect_holiday_title || "")
    .trim()
    .toLowerCase()
    .includes("destinations");
  const viewAllHref = isDestinations ? "/destinations" : "/holiday-styles";
  const cardBaseHref = isDestinations ? "/destinations" : "/holiday-styles";

  return (
    <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-white font-['Montserrat']">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-8 md:py-20">
        <div className="w-full max-w-[1280px] mx-auto">
          {/* Header Section */}
          <h2 className="font-['Montserrat'] text-[24px] md:text-[48px] lg:text-[48px] font-semibold text-[#4c4c4c] leading-tight max-w-[626px]">
            {perfect_holiday_title}
          </h2>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
            <p className="text-[#4c4c4c] font-['Montserrat'] mt-2 max-w-xl text-[14px] md:text-[16px] lg:text-[16px] font-normal line-clamp-2 md:line-clamp-none lg:line-clamp-none ">
              {perfect_holiday_subtitle}
            </p>

            <a
              href={viewAllHref}
              className="font-['Montserrat'] text-[12px] text-right text-[#4c4c4c] underline hover:text-[#CB2187] whitespace-nowrap ml-0 md:ml-4 mt-2 md:mt-0"
            >
              view all PlanMyLuxe exclusives
            </a>
          </div>

          {/* Cards Carousel */}
          <Carousel
            opts={{ align: "start", loop: false }}
            className="w-full mt-[20px] md:mt-[40px]"
          >
            <CarouselContent className="-ml-4">
              {(perfect_holiday_types || []).map((card) => (
                <CarouselItem key={String(card.id ?? card.slug ?? "")} className="pl-4 basis-[240px]">
                  <Link
                    href={`${cardBaseHref}/${card.slug || ""}`}
                    className="block group transform hover:-translate-y-[2px] transition-transform duration-300"
                  >
                    <div className="relative overflow-hidden aspect-[3/4] mb-3">
                      <Image
                        src={card.card_image || ""}
                        alt={card.card_image || "Perfect Holiday Image"}
                        width={800}
                        height={300}
                        className="w-full h-[300px] object-cover"
                      />
                    </div>

                    <div>
                      <p className="font-['Montserrat'] text-[#666666] text-[14px] mb-1 tracking-[1px]">
                        LUXURY
                      </p>

                      <h3 className="font-['Montserrat'] text-pml-primary text-[20px] font-semibold">
                        {card.name?.toUpperCase()}
                      </h3>
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

export default Perfectholiday;
