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
import { ImagesIcon, X, Compass } from "lucide-react";
import { formatGbpPrice } from "@/lib/multi-centre-selected-price";
import ShareOffer from "@/components/hotels/ShareOffer";

interface HotelBannerProps {
  location: string;
  title: string;
  subtitle: string;
  priceLabel?: string;
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
  slug?: string;
}

const HotelBanner = memo(function HotelBanner({
  location,
  title,
  subtitle,
  priceLabel = "Price starting from",
  price = "£199",
  ctaText = "View Options",
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
}: HotelBannerProps) {
  const formatPrice = (v?: number | null) =>
    v == null ? "---" : `£${Math.round(v)}`;
  const [open, setOpen] = useState(false);

  const normalizeImageSrc = (img: string) => {
    const trimmed = (img || "").trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith("/")) return trimmed;
    if (trimmed.startsWith("public/"))
      return `/${trimmed.slice("public/".length)}`;
    return `/${trimmed.replace(/^\.\/?/, "")}`;
  };

  const normalizedImages = (Array.isArray(images) ? images : [])
    .map(normalizeImageSrc)
    .filter((img) => img.length > 0);

  const hasMoreImages = normalizedImages.length > 0;

  const handleCtaClick = () => {
    onEnquire?.();
  };
  return (
    <>
      {/* --- MAIN BANNER SECTION --- */}
      <section className=" relative font-['Montserrat']">
        <div className="absolute top-4 right-0 z-10 md:hidden">
          <ShareOffer variant="icon" />
        </div>
        <div className="w-full max-w-[1440px] mx-auto py-[16px]">
          <div className="w-full max-w-[1280px] mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 ">
              <div className="flex-1 max-w-3xl pr-12 md:pr-0">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-pml-primary-soft mb-3 bg-pml-light px-3 py-1 sm:px-4 sm:py-1.5 shadow-xs">
                  <Compass
                    className="h-3.5 w-3.5 shrink-0 text-pml-primary"
                    aria-hidden="true"
                  />
                  <span className="text-pml-primary text-[10px] sm:text-[12px] font-bold uppercase tracking-wide leading-none">
                    {location}
                  </span>
                </div>

                <h1 className="text-pml-primary text-[20px] font-semibold sm:text-[24px] sm:font-extrabold tracking-tight leading-snug pb-3 md:pb-3">
                  {title}
                </h1>

                <p className="text-black text-xs sm:text-[14px] leading-[140%] mb-3">
                  {subtitle}
                </p>
              </div>

              {/* Unified Responsive Price Card */}
              <div className="w-full hidden md:block lg:w-auto flex-shrink-0 mt-2 lg:mt-0">
                {/* Added items-baseline to align everything to their text baseline */}
                <div className="sm:p-5 md:pr-0 flex flex-row items-end justify-between sm:justify-start gap-4 sm:gap-2">
                  {(totalPrice != null || price) && (
                    /* Removed pt-10 to let the layout align naturally */
                    <div className="flex flex-col sm:items-baseline">
                      {isLoadingPrice ? (
                        <div className="flex items-center gap-2 py-1">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#CB2187] border-t-transparent"></div>
                          <span className="text-gray-500 text-xs">
                            Loading...
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-0.5 text-[#1a1a1a]">
                          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            <span className="text-sm font-medium">From</span>{" "}
                            {totalPrice != null
                              ? formatPrice(totalPrice)
                              : formatGbpPrice(price)}
                            /
                          </span>
                          <span className="text-sm font-semibold ml-[-5px]">
                            pp
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    type="button"
                    onClick={handleCtaClick}
                    className="group inline-flex items-center justify-center gap-1.5 bg-[#CB2187] hover:bg-[#b01c74] text-white font-bold text-sm sm:text-base px-5 py-3 rounded-full shadow-md shadow-[#CB2187]/20 transition-all duration-200 active:scale-95 whitespace-nowrap"
                  >
                    <span>Enquire Now</span>
                  </button>

                  <ShareOffer variant="icon" className="mb-1.5" />
                </div>
              </div>
            </div>

            {/* IMAGES GRID - hero plus two stacked photos, bottoms aligned */}
            <div className="grid grid-cols-1 gap-1.5 overflow-hidden rounded-[16px] md:h-[292px] md:grid-cols-[2fr_1fr] lg:h-[365px]">
              {/* Large image - full width on mobile, left side on md+ */}
              <div
                className="relative h-[180px] min-h-0 cursor-pointer overflow-hidden sm:h-[243px] md:h-auto"
                onClick={() => setOpen(true)}
              >
                {badgeText && (
                  <img
                    className="absolute top-3 left-3 z-10 pointer-events-none"
                    src={badgeText}
                    width={300}
                    height={20}
                    alt="badge"
                    loading="lazy"
                    decoding="async"
                  />
                )}

                {thumbnail_1 && (
                  <Image
                    src={thumbnail_1}
                    fill
                    className="object-cover"
                    alt={`${title} main view`}
                    loading="eager"
                    priority
                    quality={75}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 850px"
                  />
                )}
              </div>

              <div className="grid h-[108px] min-h-0 grid-cols-2 gap-1.5 sm:h-[121px] md:h-auto md:grid-cols-1 md:grid-rows-2">
                {/* Top/Left image */}
                {thumbnail_2 && (
                  <div
                    className="relative min-h-0 cursor-pointer overflow-hidden"
                    onClick={() => setOpen(true)}
                  >
                    <Image
                      src={thumbnail_2}
                      fill
                      className="object-cover"
                      alt={`${title} view 2`}
                      quality={75}
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 420px"
                    />
                  </div>
                )}

                {/* Bottom/Right image WITH MORE ICON */}
                {thumbnail_3 && (
                  <div
                    className="relative min-h-0 cursor-pointer overflow-hidden"
                    onClick={() => setOpen(true)}
                  >
                    <Image
                      src={thumbnail_3}
                      fill
                      className="object-cover"
                      alt={`${title} view 3`}
                      quality={75}
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 420px"
                    />

                    {/* --- MORE PHOTOS BUTTON --- */}
                    {hasMoreImages ? (
                      <button
                        className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-[#CB2187] p-2 rounded-full shadow-md pointer-events-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(true);
                        }}
                        aria-label="View more images"
                      >
                        <span className="flex items-center gap-[4px] px-[2px] md:px-[8px] py-[2px]">
                          <ImagesIcon size={18} />
                          <span className="text-[14px] font-medium leading-[24px] hidden md:block">
                            More Images
                          </span>
                        </span>
                      </button>
                    ) : null}
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

      <Sheet
        open={hasMoreImages ? open : false}
        onOpenChange={hasMoreImages ? setOpen : undefined}
      >
        <SheetContent
          side="bottom"
          className="z-[1001] flex h-[100svh] w-full flex-col overflow-hidden border-0 bg-[#FAF3F8]"
        >
          <SheetHeader className="sticky top-0 z-20 bg-[#FAF3F8] px-[20px] py-5 pt-[calc(env(safe-area-inset-top)+20px)] md:px-[64px]">
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

          <div className="flex-1 overflow-y-auto px-[20px] pb-10 md:px-[64px]">
            <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {open && hasMoreImages
                ? normalizedImages.map((img, i) => (
                    <Image
                      key={i}
                      src={img}
                      width={700}
                      height={360}
                      alt={`${title} photo ${i + 1}`}
                      loading="lazy"
                      quality={75}
                      className="h-[220px] w-full rounded-2xl object-cover shadow-md"
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
