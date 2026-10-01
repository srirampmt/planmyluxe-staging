import Image from "next/image";
import Link from "next/link";
import { CircleChevronRight, Star } from "lucide-react";

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

function durationMin(apiUrl?: string | null): number | null {
  const match = String(apiUrl ?? "").match(/(?:^|[?&])durationMin=(\d+)/);
  const value = match ? Number.parseInt(match[1], 10) : NaN;
  return Number.isFinite(value) && value > 0 ? value : null;
}

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
  const price = Number(hotel.display_starting_price || 0);
  const nights = durationMin(hotel.api_url) ?? 7;
  const summary = freeAddon?.title
    ? `Free ${freeAddon.title}`
    : hotel.info_paragraph || hotel.intro_text || "";

  return (
    <Link
      href={`/hotels/${hotel.slug}`}
      className="group flex h-full w-[260px] flex-col overflow-hidden rounded-[12px] border border-[#ececec] bg-white shadow-[0_6px_20px_-12px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-16px_rgba(203,33,135,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-pml-primary sm:w-[280px]"
    >
      <div className="relative h-[160px] shrink-0 overflow-hidden bg-[#f5f5f5]">
        <Image
          src={hotel.card_image || PLACEHOLDER_IMAGE}
          alt={`${hotel.name} in ${destinationName}`}
          fill
          sizes="280px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2">
        <p className="line-clamp-1 min-h-[20px] text-[13px] font-semibold leading-5 text-[#4c4c4c]">
          {hotel.location || destinationName}
        </p>

        <div
          className="mt-1 flex items-center gap-0.5 text-pml-primary"
          aria-label={`${rating} star hotel`}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`h-4 w-4 ${
                index < rating ? "fill-current" : "fill-[#E0E0E0] text-[#E0E0E0]"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        <h3 className="mt-1 truncate text-[16px] font-semibold leading-6 text-pml-primary">
          {hotel.name}
        </h3>

        {summary ? (
          <p className="mt-1.5 flex min-h-[40px] items-center justify-center rounded-[8px] border border-[#e4e4e4] bg-[#f3f3f3] px-3 py-1 text-center text-[11.5px] font-medium leading-[17px] text-[#4c4c4c]">
            <span className="line-clamp-2">{summary}</span>
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-end gap-1.5 pt-2 text-[13px] text-[#4c4c4c] sm:text-[14px]">
          <span className="whitespace-nowrap">
            {nights} nights from{" "}
            <span className="text-[16px] font-semibold text-pml-primary">
              £{price.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
            </span>{" "}
            per person
          </span>
          <CircleChevronRight
            className="h-5 w-5 shrink-0 text-pml-primary transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
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
      className="scroll-mt-28 rounded-[8px] border border-gray-200/80 bg-white p-4 shadow-sm sm:p-5 md:p-6"
    >
      <Carousel opts={{ align: "start", loop: false }} aria-label={title}>
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-[20px] font-semibold leading-tight tracking-[-0.02em] text-[#1a1a1a] md:text-[24px]">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 line-clamp-1 text-[13px] leading-5 text-[#5c6370]">
                {description}
              </p>
            ) : null}
          </div>
          <div className="hidden shrink-0 gap-2 sm:flex">
            <CarouselPrevious className="static h-8 w-8 translate-y-0" />
            <CarouselNext className="static h-8 w-8 translate-y-0" />
          </div>
        </div>

        <CarouselContent className="-ml-4 mt-3 py-1">
          {hotels.map((hotel) => (
            <CarouselItem
              key={hotel.slug}
              className="basis-auto pl-4"
            >
              <HotelCard hotel={hotel} destinationName={destinationName} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
