import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { DestinationHotel } from "@/types/destinationHotels";

const PLACEHOLDER_IMAGE =
  "https://planmylux.s3.eu-west-2.amazonaws.com/placeholder.webp";

function HotelCard({
  hotel,
  destinationName,
}: {
  hotel: DestinationHotel;
  destinationName: string;
}) {
  const rating = Math.max(
    0,
    Math.min(5, Math.round(Number.parseFloat(String(hotel.property_rating || 0)) || 0)),
  );
  const freeAddon = hotel.addons.find(
    (addon) => addon.price?.trim().toLowerCase() === "free",
  );
  const badge =
    hotel.offer_on_card ||
    (hotel.offer_mode && hotel.saveuptotext
      ? `Save up to ${hotel.saveuptotext}%`
      : hotel.holiday_styles[0]?.label || "Preferred");
  const price = Number(hotel.display_starting_price || 0);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[8px] border border-gray-200/80 bg-white shadow-[0_8px_24px_-16px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-16px_rgba(0,0,0,0.35)]">
      <div className="relative h-[190px] overflow-hidden bg-gray-100">
        <Image
          src={hotel.card_image || PLACEHOLDER_IMAGE}
          alt={`${hotel.name} in ${destinationName}`}
          fill
          sizes="(max-width: 640px) 88vw, (max-width: 1280px) 50vw, 430px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {badge ? (
          <span className="absolute left-3 top-3 max-w-[80%] rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-pml-primary shadow-sm">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div
          className="flex items-center gap-0.5 text-pml-primary"
          aria-label={`${rating} star hotel`}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`h-3.5 w-3.5 ${
                index < rating ? "fill-current" : "text-gray-300"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        <h3 className="mt-2 text-[18px] font-semibold leading-6 text-[#1a1a1a]">
          {hotel.name}
        </h3>
        {hotel.location ? (
          <p className="mt-1 flex items-start gap-1.5 text-[12px] leading-5 text-[#667085]">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pml-primary" />
            {hotel.location}
          </p>
        ) : null}

        {freeAddon?.title ? (
          <p className="mt-3 rounded-[8px] bg-[#FBE8F4] px-3 py-2 text-[11px] font-semibold text-[#4c4c4c]">
            Free {freeAddon.title}
          </p>
        ) : hotel.intro_text ? (
          <p className="mt-3 line-clamp-2 text-[11px] leading-5 text-[#667085]">
            {hotel.intro_text}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-gray-100 pt-4">
          <p className="text-[12px] leading-4 text-[#667085]">
            From
            <span className="ml-1 text-[20px] font-bold text-pml-primary">
              £{price.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
            </span>
            <span className="block">per person</span>
          </p>
          <Link
            href={`/hotels/${hotel.slug}`}
            className="inline-flex items-center gap-1 rounded-[8px] bg-pml-primary px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#a81970] focus:outline-none focus:ring-2 focus:ring-pml-primary focus:ring-offset-2"
          >
            View hotel
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function DestinationHotelCarousel({
  id,
  title,
  description,
  hotels,
  destinationName,
}: {
  id: string;
  title: string;
  description?: string;
  hotels: DestinationHotel[];
  destinationName: string;
}) {
  if (hotels.length === 0) return null;

  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-[8px] border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6 md:p-8"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-pml-primary">
        Hotel collection
      </p>
      <h2 className="mt-2 text-[24px] font-semibold leading-tight tracking-[-0.02em] text-[#1a1a1a] md:text-[32px]">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-3xl text-[14px] leading-6 text-[#5c6370] md:text-[15px]">
          {description}
        </p>
      ) : null}

      <Carousel
        opts={{ align: "start", loop: false }}
        className="mt-6"
        aria-label={title}
      >
        <CarouselContent className="-ml-3">
          {hotels.map((hotel) => (
            <CarouselItem
              key={hotel.slug}
              className="basis-[88%] pl-3 sm:basis-1/2"
            >
              <HotelCard hotel={hotel} destinationName={destinationName} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-4 flex justify-end gap-2">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>
      </Carousel>
    </section>
  );
}
