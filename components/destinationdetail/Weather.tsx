"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type SeasonCard = {
  image?: string;
  title?: string;
  description?: string;
};

type WeatherProps = {
  Weather_title?: string;
  Weather_subtitle?: string;
  seasonCards?: SeasonCard[];
};

export default function Weather({ Weather_title, Weather_subtitle, seasonCards }: WeatherProps) {
  const title = Weather_title || "What to expect from Mallorcas weather";
  const subtitle =
    Weather_subtitle ||
    "Mallorca enjoys warm sunshine long summers and mild pleasant winters creating ideal conditions for beach days coastal walks and relaxed outdoor living. Temperatures rise through the spring and stay consistently high through late summer with clear skies gentle breezes and bright Mediterranean light. Autumn brings softer warmth and quieter days while winter remains comfortable with cool evenings and plenty of blue sky moments.";

  const cardsToRender: SeasonCard[] = Array.isArray(seasonCards)
    ? seasonCards.filter((c) => Boolean(c?.image) || Boolean(c?.title) || Boolean(c?.description))
    : [];

  if (!cardsToRender.length) return null;

  return (
    <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-white font-['Montserrat']">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] pb-10">
        <div className="w-full max-w-[1280px] mx-auto">
          {/* Title Section */}
          <div className="mb-6 max-w-[720px] lg:max-w-none">
            <h2 className="text-black text-[28px] md:text-[40px] font-semibold leading-tight lg:whitespace-nowrap mb-3">
              {title}
            </h2>
            <p className="text-black/70 text-[16px] leading-7 max-w-[720px]">
              {subtitle}
            </p>
          </div>

          {/* Weather Cards Carousel */}
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {cardsToRender.map((card, index) => (
                <CarouselItem key={index} className="pl-4 basis-[80%] md:basis-1/2 lg:basis-1/4">
                  <div className="relative group overflow-hidden rounded-[8px]">
                    {/* Background Image */}
                    <div className="relative w-full h-[340px]">
                      <img
                        src={card.image}
                        alt={card.title || "Weather"}
                        className="w-full h-[340px] object-cover"
                      />
                      
                      {/* Overlay */}
                      {/* <div className="absolute inset-0 bg-[#2980B9]"></div> */}
                      <div className="absolute inset-0 bg-black/10"></div>
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 text-white text-center mb-[8px]">
                        <h3 className="text-[24px] md:text-[28px] leading-[36px] font-medium mb-2">
                          {card.title}
                        </h3>
                        <p className="text-[12px] font-semibold leading-[18px] tracking-[0.02em] mb-2">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
}