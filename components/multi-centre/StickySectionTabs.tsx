import ItinerarySection, { type ItineraryItem } from "@/components/multi-centre/ItinerarySection";
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import styles from "@/components/hotels/hotelRichText.module.css";
import McCtaButtons from "./McCtaButtons";

type Props = {
  highlights: string;
  whatsIncluded: string;
  itinerary: ItineraryItem[];
  hotels: Array<{ location: string; description: string; images: string[] }>;
};

export default function StickySectionTabs({
  highlights,
  whatsIncluded,
  itinerary,
  hotels,
}: Props) {


  const renderGalleryCarousel = (images: Array<{ alt: string; src: string }>) => (
    <>
      {/* {JSON.stringify(images)} */}
      <div className="relative">
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent className="-ml-3">
            {images.map((img, idx) => (
              <CarouselItem key={`${img.src}-${idx}`} className="basis-1/2 pl-3 md:basis-1/4">
                <div className="relative h-[120px] w-full rounded-[8px] overflow-hidden">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    style={{ objectFit: 'cover' }}
                    className="rounded-[8px]"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute -left-5 top-1/2 -translate-y-1/2 z-10" />
          <CarouselNext className="absolute -right-5 top-1/2 -translate-y-1/2 z-10" />
        </Carousel>
      </div>
    </>
  );

  return (
    <>
      {/* Highlights Section */}
      <section id="mc-highlights" className="scroll-mt-[120px]">
        <h2 className="text-[18px] md:text-[20px] font-semibold text-pml-primary mb-3">Highlights</h2>
        <div
          className={`${styles.hotelRichText} text-sm md:text-base font-montserrat text-[#595858]`}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(highlights, { USE_PROFILES: { html: true } }) }}
        />
      </section>

      {/* What's Included Section */}
      <section id="whats-included" className="scroll-mt-[120px] mt-8">
        <h2 className="text-[18px] md:text-[20px] font-semibold text-pml-primary mb-3">{"What's Included"}</h2>
        <div
          className={`${styles.hotelRichText} text-sm md:text-base font-montserrat text-[#595858]`}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(whatsIncluded, { USE_PROFILES: { html: true } }) }}
        />
      </section>

      {/* Itinerary Section */}
      <section id="mc-itinerary" className="scroll-mt-[120px] mt-8">

        <div className="rounded-[8px] border border-[#EDEDED] bg-white overflow-hidden">
          <div className="bg-[#F8F8F8] px-4 py-3 border-b border-[#EDEDED]">
            <h3 className="text-[16px] md:text-[18px] font-semibold text-pml-primary">
              Itinerary Details
            </h3>
          </div>
          <div className="max-h-[500px] overflow-y-auto p-4">
            <ItinerarySection itinerary={itinerary} />
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="hotel-details" className="scroll-mt-[120px] mt-8">
        {hotels?.length ? (
          <>
            <div className="space-y-6">
              {hotels.map((h) => (
                <div key={h.location} className="space-y-3">
                  <h2 className="text-[18px] md:text-[20px] font-semibold text-pml-primary">
                    {h.location}
                  </h2>
                  <p className="font-montserrat text-sm text-[#595858]">{h.description}</p>
                  {(() => {
                    const list = Array.isArray(h.images) ? h.images.filter(Boolean) : [];
                    if (!list.length) {
                      return (
                        <div className="h-[120px] w-full rounded-[8px] bg-gray-100 flex items-center justify-center text-sm text-gray-400">
                          No images available
                        </div>
                      );
                    }

                    const normalized = list.map((src, idx) => {
                      const raw = String(src);
                      const isAbsolute = /^https?:\/\//i.test(raw);
                      const normalizedSrc = isAbsolute
                        ? raw
                        : raw.startsWith("/")
                          ? raw
                          : `/${raw}`;

                      return {
                        src: normalizedSrc,
                        alt: `${h.location} ${idx + 1}`,
                      };
                    });

                    return renderGalleryCarousel(normalized);
                  })()}
                </div>
              ))}
            </div>
          </>
        ) : null}
      </section>
      <McCtaButtons />
    </>
  );
}

