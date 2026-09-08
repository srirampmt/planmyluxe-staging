"use client";

import { useState, memo } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { calculateSaveStrikePricing } from "@/lib/hotel-utils";
import { ImagesIcon, X, Info, MapPin } from "lucide-react";
import Breadcrumbs from "./Breadcrumbs";
import ShareOffer from "./ShareOffer";
import { StarRating, LocationPinIcon } from "./icons";

interface HotelBannerProps {
  title: string;
  subtitle: string;
  saveText?: string;
  price?: string;
  ctaText?: string;
  images: string[];
  badgeText?: string;
  thumbnail_1?: string;
  thumbnail_2?: string;
  thumbnail_3?: string;
  isLoadingPrice?: boolean;
  // Optional breakdown for banner (base price excluding tax, local tax, and total)
  basePrice?: number | null;
  localTax?: number | null;
  totalPrice?: number | null;
  onEnquire?: () => void;
  isSearching?: boolean;
  hidePriceSection?: boolean;
  offerMode?: boolean;
  rating?: number;
  destination?: string;
  slug?: string;
}

const HotelBanner = memo(function HotelBanner({
  title,
  subtitle,
  saveText,
  price = "£199",
  ctaText = "Enquire Now",
  images,
  thumbnail_1,
  thumbnail_2,
  thumbnail_3,
  badgeText = "Prices include FREE Attraction Entry",
  isLoadingPrice = false,
  basePrice,
  localTax,
  totalPrice,
  onEnquire,
  isSearching = false,
  hidePriceSection = false,
  offerMode = false,
  rating,
  destination,
  slug,
}: HotelBannerProps) {
  const formatPrice = (v?: number | null) => (v == null ? "---" : `£${Math.round(v)}`);
  const isFiniteNumber = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value);
  const [open, setOpen] = useState(false);

  const roundedBasePrice = isFiniteNumber(basePrice)
    ? Math.round(basePrice)
    : isFiniteNumber(totalPrice) && isFiniteNumber(localTax)
      ? Math.round(totalPrice - localTax)
      : null;
  const { saveBadgeText, hasStrikePrice, strikePriceValue } =
    calculateSaveStrikePricing(roundedBasePrice, saveText);
  const strikePriceStr =
    hasStrikePrice && strikePriceValue != null
      ? formatPrice(strikePriceValue)
      : "";

  return (
    <>
      {/* --- MAIN BANNER SECTION --- */}
      <section className="relative font-['Montserrat']">
        <div className="absolute top-4 right-4 z-10 md:hidden">
          <ShareOffer variant="icon" />
        </div>
        <div className="mx-auto w-full max-w-[1440px] py-[16px] md:py-[20px]">
          <div className="w-full max-w-[1280px] mx-auto">
            {/* Header */}
            <div className="mb-3 flex flex-col gap-3 md:mb-[18px] md:gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-[860px] flex-1 pr-12 md:pr-0">
                <Breadcrumbs destination={destination} slug={slug} className="mb-2" />
                {!offerMode && (
                  <div className="mb-1 flex flex-nowrap items-center gap-2 md:mb-2 md:gap-4">
                    {typeof rating === "number" && <StarRating rating={rating} />}
                    <span className="flex items-center gap-1 whitespace-nowrap text-[14px] font-medium leading-[20px] text-[#595858] md:text-[14px] md:leading-[14px]">
                      <MapPin className="w-4 h-4" />
                      {subtitle}
                    </span>
                  </div>
                )}
                {offerMode ? (
                  <h2 className="mb-1 text-[24px] font-extrabold leading-[30px] tracking-tight text-[#595858] md:mb-[2px] md:text-[24px] md:leading-[34px]">
                    {title}
                  </h2>
                ) : (
                  <h1 className="mb-1 text-[24px] font-extrabold leading-[30px] tracking-tight text-[#595858] md:mb-[2px] md:text-[28px] md:leading-[34px]">
                    {title}
                  </h1>
                )}
              </div>

              {/* Price */}
              <div className="flex-shrink-0 md:pt-1">
                <div className="hidden items-center gap-[18px] md:flex">
                  {!hidePriceSection && (
                    <div className="flex flex-col items-end text-[14px] font-medium leading-[16px] text-[#595858]">
                      <div className="mb-[4px] flex flex-wrap items-center justify-end gap-2">
                        {saveBadgeText ? (
                          <div className="inline-flex h-[24px] items-center justify-center rounded-[4px] bg-[#1B7A44] px-[10px] text-[12px] font-bold leading-[14px] text-white shadow-[0px_2px_6px_rgba(37,211,102,0.35)]">
                            Save&nbsp;{saveBadgeText}%
                          </div>
                        ) : null}
                        {saveBadgeText && hasStrikePrice ? (
                          <p className="relative inline-flex items-center text-[16px] font-bold leading-[14px] text-[#595858]">
                            <span>{strikePriceStr}</span>
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[130%] -translate-x-1/2 -translate-y-1/2 rotate-[-10deg] bg-[#595858]"
                            />
                          </p>
                        ) : null}
                      </div>
                      {isLoadingPrice ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pml-primary"></div>
                          <span className="text-[#4c4c4c] text-[12px]">Loading...</span>
                        </div>
                      ) : (
                        <div className="w-full text-right">
                          <div className="flex items-baseline text-[28px] font-extrabold leading-[38px] tracking-tight text-pml-primary">
                            <div className="flex items-end justify-end text-[14px] pr-1 font-semibold leading-[14px] text-pml-primary/90 mb-1.5">
                              <span>from</span>
                            </div>
                            {roundedBasePrice != null ? formatPrice(roundedBasePrice) : price}/
                            <span className="text-[16px] font-medium leading-[30px] text-pml-primary/90 md:text-[16px] lg:leading-[16px]">
                              pp
                            </span>
                          </div>
                          {/* {localTax != null && localTax !== 0 && (
                            <div className="mt-[2px] flex items-center justify-end gap-1 text-[12px] font-medium leading-[14px] text-[#595858]">
                              <span>{formatPrice(basePrice ?? 0)}</span>
                              <span className="mx-1">+</span>
                              <span>£{Math.round(localTax ?? 0)}</span>
                              <span className="ml-1">(Local Tax)</span>
                              <span className="group relative inline-flex">
                                <Info className="h-3.5 w-3.5 cursor-help text-pml-primary" />
                                <span className="pointer-events-none absolute top-full right-0 z-20 mt-2 hidden w-[220px] rounded-[8px] bg-[#242F40] p-2.5 text-left text-[11px] font-medium leading-[16px] text-white shadow-lg group-hover:block">
                                  <span className="absolute right-2 bottom-full h-0 w-0 border-x-[5px] border-b-[6px] border-x-transparent border-b-[#242F40]" />
                                  Local tax is collected directly by the hotel at check-in or check-out — it is not paid to us. It applies to every guest, no matter who they booked through, and the amount may vary slightly based on current exchange rates.
                                </span>
                              </span>
                            </div>
                          )} */}
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    id="seo-enquire-button-hotels"
                    type="button"
                    onClick={() => onEnquire?.()} disabled={isSearching}
                    className="flex h-[50px] w-[150px] items-center justify-center rounded-[12px] bg-pml-primary hover:bg-[#a81a6f] px-[10px] py-[10px] text-[18px] font-bold leading-[56px] text-white shadow-[0_8px_24px_rgba(203,33,135,0.4)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    Enquire Now
                  </button>
                </div>
              </div>
            </div>

            {/* IMAGES GRID - Optimized with Next.js Image */}
            <div className="grid cursor-pointer grid-cols-1 items-start gap-2 md:grid-cols-[2fr_1fr] md:gap-3 xl:grid-cols-[964px_300px] xl:gap-[18px]" onClick={() => setOpen(true)} >
              {/* Large image - full width on mobile, left side on md+ */}
              <div className="relative overflow-hidden rounded-2xl">
                {badgeText && (
                  <div className="absolute top-2 md:top-5 left-2 md:left-5 z-10 flex flex-row items-center gap-2 h-8 px-3 py-[6px] bg-[#595858] border border-white font-['Montserrat']">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="shrink-0"
                    >
                      <rect x="0" y="0" width="16" height="5.57" fill="white" />
                      <rect x="1.11" y="6.51" width="13.78" height="0.94" fill="white" />
                      <rect x="1.74" y="8.39" width="1.87" height="4.49" fill="white" />
                      <rect x="5.29" y="8.39" width="1.87" height="4.49" fill="white" />
                      <rect x="8.84" y="8.39" width="1.87" height="4.49" fill="white" />
                      <rect x="12.39" y="8.39" width="1.87" height="4.49" fill="white" />
                      <rect x="0" y="13.81" width="16" height="2.19" fill="white" />
                    </svg>
                    <span className="text-[14px] font-normal leading-[140%] text-white whitespace-nowrap">
                      {badgeText}
                    </span>
                  </div>
                )}

                {thumbnail_1 && (
                  <Image
                    src={thumbnail_1}
                    width={964}
                    height={458}
                    className="h-[220px] w-full rounded-2xl object-cover transition-transform duration-300 hover:scale-[1.02] sm:h-[320px] md:h-[380px] xl:h-[458px]"
                    alt={`${title} main view`}
                    loading="eager"
                    priority
                    quality={68}
                    sizes="(max-width: 768px) 100vw, (max-width: 1279px) 66vw, 964px"
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-1 md:grid-rows-2 md:gap-3 xl:gap-[18px]">
                {/* Top/Left image */}
                {thumbnail_2 && (
                  <Image
                    src={thumbnail_2}
                    width={300}
                    height={220}
                    className="h-[130px] w-full rounded-2xl object-cover transition-transform duration-300 hover:scale-[1.02] sm:h-[170px] md:h-[184px] xl:h-[220px]"
                    alt={`${title} view 2`}
                    quality={75}
                    sizes="(max-width: 768px) 50vw, (max-width: 1279px) 33vw, 300px"
                  />
                )}

                {/* Bottom/Right image WITH MORE ICON */}
                {thumbnail_3 && (
                  <div className="relative overflow-hidden rounded-2xl">
                    <Image
                      src={thumbnail_3}
                      width={300}
                      height={220}
                      className="h-[130px] w-full rounded-2xl object-cover transition-transform duration-300 hover:scale-[1.02] sm:h-[170px] md:h-[184px] xl:h-[220px]"
                      alt={`${title} view 3`}
                      quality={75}
                      sizes="(max-width: 768px) 50vw, (max-width: 1279px) 33vw, 300px"
                    />

                    {/* --- MORE PHOTOS BUTTON --- */}
                    <button
                      className="absolute bottom-3 right-3 rounded-full bg-white/95 p-2 text-pml-primary shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-white"
                      onClick={() => setOpen(true)}
                      aria-label="View more images"
                    >
                      <span className="flex items-center gap-[4px] px-[2px] md:px-[8px] py-[2px]">
                        <ImagesIcon size={18} />
                        <span className="text-[14px] font-semibold leading-[24px] hidden md:block ">More Images</span>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/*           SHEET — SIDE PANEL WITH ALL PHOTOS             */}
      {/* ========================================================= */}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="z-[1001] flex h-[100svh] w-full flex-col overflow-hidden bg-[#FAF3F8] md:h-auto md:max-h-[100vh]"
        >
          <SheetHeader className="sticky top-0 z-20 border-b bg-white px-[20px] py-4 pt-[calc(env(safe-area-inset-top)+16px)] md:px-[128px]">
            <SheetTitle className="relative flex items-center justify-center text-lg font-bold text-pml-primary md:text-xl">
              <span>More Photos</span>
              <SheetClose asChild>
                <button
                  type="button"
                  aria-label="Close"
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#595858] hover:bg-pml-primary/10"
                >
                  <X size={20} className="cursor-pointer" />
                </button>
              </SheetClose>
            </SheetTitle>
          </SheetHeader>

          {/* PHOTO GRID - Only load when sheet is open */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-[20px] pb-8 md:px-[64px]">
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-8 md:gap-6 lg:grid-cols-3">
              {open
                ? images.map((img, i) => (
                    <Image
                      key={i}
                      src={(img || "").trim()}
                      width={700}
                      height={360}
                      alt={`${title} photo ${i + 1}`}
                      loading="lazy"
                      quality={75}
                      className="mx-auto h-[220px] w-full rounded-2xl object-cover shadow-md transition-transform duration-200 hover:scale-[1.02] hover:shadow-xl"
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
                    />
                  ))
                : null}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
});

export default HotelBanner;
