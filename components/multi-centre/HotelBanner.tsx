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
import { ImagesIcon, X } from "lucide-react";
import { formatGbpPrice } from "@/lib/multi-centre-selected-price";

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
  const formatPrice = (v?: number | null) => (v == null ? "---" : `£${Math.round(v)}`);
  const [open, setOpen] = useState(false);

  const normalizeImageSrc = (img: string) => {
    const trimmed = (img || "").trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith("/")) return trimmed;
    if (trimmed.startsWith("public/")) return `/${trimmed.slice("public/".length)}`;
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
      <section className=" relative bg-white font-['Montserrat']">
        <div className="w-full max-w-[1440px] mx-auto py-[14px] md:pt-[24px]">
          <div className="w-full max-w-[1280px] mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-0 md:mb-4">
              <div className="flex-1 max-w-[843px]">
                <div className="text-[#4c4c4c] text-[14px] md:text-[16px] font-semibold uppercase mb-0 md:mb-2 leading-[24px]">
                  {location}
                </div>

                <h1 className="text-pml-primary text-[18px] md:text-[24px] font-semibold leading-[24px] md:leading-[32px] mb-2">
                  {title}
                </h1>

                <p className="text-[#000000] text-[14px] md:text-[16px] lg:text-[16px] leading-[140%]">
                  {subtitle}
                </p>
              </div>

              {/* Price */}
              <div className=" flex-shrink-0 lg:pt-2">
                <div className="hidden md:flex px-5 w-full bg-white justify-between z-50 md:relative md:inset-auto md:px-0 md:w-auto md:bg-transparent md:z-auto  items-center gap-6" >
                  {(totalPrice != null || price) && (
                    <div className="flex flex-col items-end text-[#4c4c4c] text-[14px] leading-[22px] tracking-[0.01em] font-normal">
                      
                      <div className="mb-1">{priceLabel}</div>
                      {isLoadingPrice ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pml-primary"></div>
                          <span className="text-[#4c4c4c] text-[12px]">Loading...</span>
                        </div>
                      ) : (
                        <div className="w-full text-right">
                          <div className="text-[#CB2187] text-[24px] md:text-[28px] font-bold">
                            {totalPrice != null ? formatPrice(totalPrice) : formatGbpPrice(price)}
                            <span className="text-[#4c4c4c] text-[12px]"> pp</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleCtaClick}
                    className="bg-[#CB2187] text-white text-[13px] md:text-[16px] font-semibold px-5 py-2 md:px-6 md:py-3 rounded-[10px]"
                  >
                    Enquire Now
                  </button>
                </div>
              </div>
            </div>

            {/* IMAGES GRID - Optimized with Next.js Image */}
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-2 md:gap-4 items-start">
              {/* Large image - full width on mobile, left side on md+ */}
              <div className="relative cursor-pointer" onClick={() => setOpen(true)}>
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
                    width={850}
                    height={450}
                    className="w-full h-[200px] sm:h-[300px] md:h-[360px] lg:h-[450px] object-cover rounded-[8px]"
                    alt={`${title} main view`}
                    loading="eager"
                    priority
                    quality={75}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 850px"
                  />
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-rows-2 md:grid-cols-1 gap-2 md:gap-4">
                {/* Top/Left image */}
                {thumbnail_2 && (
                  <div className="cursor-pointer" onClick={() => setOpen(true)}>
                    <Image
                      src={thumbnail_2}
                      width={420}
                      height={216}
                      className="w-full h-[120px] sm:h-[150px] md:h-[175px] lg:h-[216px] object-cover rounded-[8px]"
                      alt={`${title} view 2`}
                      quality={75}
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 420px"
                    />
                  </div>
                )}

                {/* Bottom/Right image WITH MORE ICON */}
                {thumbnail_3 && (
                  <div className="relative cursor-pointer" onClick={() => setOpen(true)}>
                    <Image
                      src={thumbnail_3}
                      width={420}
                      height={216}
                      className="w-full h-[120px] sm:h-[150px] md:h-[175px] lg:h-[216px] object-cover rounded-[8px]"
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
                          <span className="text-[14px] font-medium leading-[24px] hidden md:block ">More Images</span>
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

      <Sheet open={hasMoreImages ? open : false} onOpenChange={hasMoreImages ? setOpen : undefined}>
        <SheetContent
          side="bottom"
          className="z-[1001] flex h-[100svh] w-full flex-col overflow-hidden bg-white md:h-auto md:max-h-[100vh]"
        >
          <SheetHeader className="sticky top-0 z-20 border-b bg-white px-[20px] py-4 pt-[calc(env(safe-area-inset-top)+16px)] md:px-[128px]">
            <SheetTitle className="relative flex items-center justify-center text-lg font-semibold md:text-xl">
              <span>More Photos</span>
              <SheetClose asChild>
                <button type="button" aria-label="Close" className="absolute right-0 top-1/2 -translate-y-1/2 rounded-md p-2 hover:bg-black/5" >
                  <X size={20} className="cursor-pointer" />
                </button>
              </SheetClose>
            </SheetTitle>
          </SheetHeader>

          {/* PHOTO GRID - Only load when sheet is open */}
          <div className="flex-1 overflow-y-auto px-[20px] pb-8 md:px-[300px]">
            <div className="mt-4 grid grid-cols-1 gap-3 md:mt-8 md:gap-6">
              {open && hasMoreImages
                ? normalizedImages.map((img, i) => (
                    <div key={i} className="mx-auto w-full max-w-[800px]">
                      <Image
                        src={img}
                        width={800}
                        height={467}
                        alt={`${title} photo ${i + 1}`}
                        loading="lazy"
                        quality={75}
                        className="w-full rounded-[8px] object-cover shadow-sm transition-shadow hover:shadow-md"
                        sizes="(max-width: 768px) 100vw, 800px"
                      />
                    </div>
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


