import React, { useState, memo } from "react";
import Image from "next/image";
import {
  Star,
  MapPin,
  Image as ImageIcon,
  Utensils,
  Sparkles,
  Building2,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { formatMultiCentreDuration } from "@/lib/mappings/duration";

interface HotelData {
  id?: string | number;
  location: string;
  description: string;
  images: string[];
  rating?: number;
  duration?: string; // e.g., "2", "3 Nights", "4 Nihgts"
  hotelName?: string;
  board?: string;
  extras?: string[];
}

interface FeaturedPackageHotelsProps {
  hotels: HotelData[];
}

export const FeaturedPackageHotels: React.FC<FeaturedPackageHotelsProps> = memo(
  ({ hotels }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [open, setOpen] = useState(false);

    if (!hotels || hotels.length === 0) return null;

    const currentHotel = hotels[activeTab] || hotels[0];
    const normalizedImages = currentHotel.images || [];
    const hasMoreImages = normalizedImages.length > 0;
    const maxVisibleThumbs = 7;
    const remainingImagesCount = Math.max(
      0,
      normalizedImages.length - maxVisibleThumbs,
    );

    

    const getRatingBadgeText = () => {
      const ratings = hotels
        .map((h) => h.rating)
        .filter((r): r is number => r !== undefined);
      if (ratings.length === 0) return "Handpicked Properties";
      const uniqueRatings = [...new Set(ratings)];
      if (uniqueRatings.length === 1) {
        return `${uniqueRatings[0]}★ Handpicked Properties`;
      }
      return "Ratings as per Itinerary";
    };

    const handleTabChange = (index: number) => {
      setActiveTab(index);
      setActiveImageIndex(0);
    };

    return (
      <section className="my-8 max-w-6xl mx-auto bg-white border border-gray-200/80 rounded-[16px] p-4 sm:p-7 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 ">
          <h2 className="text-[18px] sm:text-2xl font-extrabold text-black">
            Featured Package Hotels
          </h2>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{getRatingBadgeText()}</span>
          </div>
        </div>

        {/* Location Tabs */}
        <div className="border-b border-gray-200 mb-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-4 sm:gap-8 min-w-max pb-1">
            {hotels.map((h, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={h.id ?? idx}
                  onClick={() => handleTabChange(idx)}
                  className={`text-sm sm:text-base font-bold pb-3 transition-all relative whitespace-nowrap ${
                    isActive
                      ? "text-[#CB2187]"
                      : "text-black/60 hover:text-black"
                  }`}
                >
                  {`${idx + 1}. ${h.location}`}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#CB2187] rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Card */}
        <div className="md:p-2 shadow-xs">
          {/* Card Header & Badges */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {currentHotel.rating ?? 4}★ Hotel
                </span>
                <span className="bg-pink-50 text-[#CB2187] text-xs font-bold px-3 py-1 rounded-full border border-pink-100">
                  {formatMultiCentreDuration(currentHotel.duration)}
                </span>
              </div>

              <h3 className="text-[18px] sm:text-xl font-extrabold text-black">
                {currentHotel.hotelName}
              </h3>

              <p className="text-xs sm:text-sm text-gray-500 font-medium flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{currentHotel.location}</span>
              </p>
            </div>

            {/* Trigger Sheet */}
            {hasMoreImages && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#E4E4E7] bg-white px-3.5 py-2 text-xs font-semibold text-[#1a1a1a] shadow-xs transition-colors hover:border-[#CB2187] hover:bg-[#CB2187] hover:text-white"
              >
                <ImageIcon className="w-4 h-4" />
                <span>View All {normalizedImages.length} Photos</span>
              </button>
            )}
          </div>

          {/* Featured Image */}
          <div className="relative w-full h-[240px] sm:h-[380px] md:h-[420px] rounded-xl sm:rounded-2xl overflow-hidden mb-4 bg-gray-100">
            <Image
              src={normalizedImages[activeImageIndex] || normalizedImages[0]}
              alt={currentHotel.hotelName || "Hotel Image"}
              fill
              className="object-cover transition-all duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              priority
            />
          </div>

          {/* Thumbnails Row */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 p-1 mb-6 scrollbar-none">
            {normalizedImages.slice(0, maxVisibleThumbs).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  activeImageIndex === idx
                    ? "border-[#CB2187] scale-105 shadow-md"
                    : "border-transparent opacity-75 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}

            {remainingImagesCount > 0 && (
              <button
                onClick={() => setOpen(true)}
                className="shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-[#CB2187] to-[#E91E63] text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
              >
                +{remainingImagesCount} More
              </button>
            )}
          </div>

          {/* Description & Amenities */}
          <div className="bg-gray-50/80 rounded-2xl p-4 sm:p-6 border border-gray-100">
            <p className="text-black text-xs sm:text-sm leading-relaxed mb-4">
              {currentHotel.description}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-medium text-black shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-[#CB2187]" />
                Central Location
              </span>
              {currentHotel.board && (
                <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-medium text-black shadow-2xs">
                  <Utensils className="w-3.5 h-3.5 text-[#CB2187]" />
                  {currentHotel.board} Included
                </span>
              )}
              {currentHotel.extras?.map((extra, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-medium text-black shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#CB2187]" />
                  {extra}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sheet Modal */}
        <Sheet
          open={hasMoreImages ? open : false}
          onOpenChange={hasMoreImages ? setOpen : undefined}
        >
          <SheetContent
            side="bottom"
            className="z-[1001] flex h-[100svh] w-full flex-col overflow-hidden bg-white md:h-auto md:max-h-[100vh] p-0"
          >
            <SheetHeader className="sticky top-0 z-20 border-b bg-white px-[20px] py-4 pt-[calc(env(safe-area-inset-top)+16px)] md:px-[128px]">
              <SheetTitle className="relative flex items-center justify-center text-lg font-semibold md:text-xl">
                <span>{currentHotel.hotelName} — More Photos</span>
                <SheetClose asChild>
                  <button
                    type="button"
                    aria-label="Close"
                    className="absolute right-0 top-1/2 -translate-y-1/2 rounded-md p-2 hover:bg-black/5 transition-colors"
                  >
                    <X size={20} className="cursor-pointer text-black" />
                  </button>
                </SheetClose>
              </SheetTitle>
            </SheetHeader>

            {/* Photo Grid */}
            <div className="flex-1 overflow-y-auto px-[20px] pb-8 md:px-[128px] lg:px-[200px]">
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 md:mt-8 md:gap-6">
                {open && hasMoreImages
                  ? normalizedImages.map((img, i) => (
                      <div
                        key={i}
                        className="w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shadow-xs"
                      >
                        <Image
                          src={img}
                          width={600}
                          height={400}
                          alt={`${currentHotel.hotelName} photo ${i + 1}`}
                          loading="lazy"
                          quality={75}
                          className="w-full h-auto object-cover"
                          sizes="(max-width: 768px) 100vw, 600px"
                        />
                      </div>
                    ))
                  : null}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </section>
    );
  },
);

FeaturedPackageHotels.displayName = "FeaturedPackageHotels";
