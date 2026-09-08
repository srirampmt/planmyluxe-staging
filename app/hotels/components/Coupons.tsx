"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface Coupon {
  title: string;
  subtitle: string;
  image: string;
  buttonText?: string;
  bullet1?: string;
  bullet2?: string;
  url?: string;
}

type OfferCard = {
  banner_title?: string;
  banner_image?: string;
  offer_card_title?: string;
  offer_card_content_1?: string;
  offer_card_content_2?: string;
  url?: string;
};

const coupons: Coupon[] = [
  {
    title: "Multi-Centre Holidays",
    subtitle: "",
    image: "/assets/images/Multi_Centre_Holidays.webp",
    buttonText: "Discover Now",
    bullet1: "Save upto 50% off on our FLASH-SALE DEALS",
    bullet2: "Best-selling resorts & peak dates included",
    url: "/holiday-styles/multi-centre"
  },
  {
    title: "SUMMER 2026 SALE NOW ON",
    subtitle: "",
    image: "/assets/images/coupon-2.png",
    buttonText: "Discover Now",
    bullet1: "Early access to Summer 2026 availability",
    bullet2: "Best-selling resorts & peak dates included",
    url: "/offers/summer-deals"
  },
  {
    title: "LAST MINUTE BARGAIN BREAKS",
    subtitle: "",
    image: "/assets/images/coupon-4.png",
    buttonText: "Discover Now",
    bullet1: "Grab a late bargain from a selected partners",
    bullet2: "Limited availability clearance deals",
    url: "/offers/last-minute"
  },
  {
    title: "TRENDING DEALS SALE NOW ON",
    subtitle: "",
    image: "/assets/images/coupon-1.png",
    buttonText: "Discover Now",
    bullet1: "Save upto 60% off on our FLASH-SALE DEALS",
    bullet2: "Holidays included FREE ADDED EXTRAS!",
    url: "/top-trending-deals"
  },
  {
    title: "MITSIS HOTELS LUXURY ALL-INCLUSIVES",
    subtitle: "",
    image: "/assets/images/coupon-5.png",
    buttonText: "Discover Now",
    bullet1: "Save upto 30% off on premium resorts in Greece",
    bullet2: "Enjoy 24-hour All-Inclusive deals at early-booking £’s",
    url: "/offers/mitsis-hotel-group"
  },
  {
    title: "5-STAR LUXURY FOR LESS!",
    subtitle: "",
    image: "/assets/images/coupon-6.png",
    buttonText: "Discover Now",
    bullet1: "Elevated stays, expertly selected",
    bullet2: "Luxury holidays made more accessible",
    url: "/offers/top-luxury"
  },
];

type CouponsProps = {
  offercards?: OfferCard[];
  autoplayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
};

export default function Coupons({
  offercards,
  autoplayInterval = 5000,
  showDots = true,
  showArrows = true,
}: CouponsProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const [autoplay, setAutoplay] = React.useState<any>(null);

  React.useEffect(() => {
    let active = true;
    import("embla-carousel-autoplay").then((module) => {
      if (!active) return;
      const AutoplayCreator = module.default;
      setAutoplay(() =>
        AutoplayCreator({
          delay: autoplayInterval,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        })
      );
    });
    return () => {
      active = false;
    };
  }, [autoplayInterval]);

  const onDotButtonClick = React.useCallback(
    (index: number) => {
      if (!api) return;
      api.scrollTo(index);
      try {
        autoplay?.reset();
      } catch {}
    },
    [api, autoplay]
  );

  const onPrevButtonClick = React.useCallback(() => {
    if (!api) return;
    api.scrollPrev();
    try {
      autoplay?.reset();
    } catch {}
  }, [api, autoplay]);

  const onNextButtonClick = React.useCallback(() => {
    if (!api) return;
    api.scrollNext();
    try {
      autoplay?.reset();
    } catch {}
  }, [api, autoplay]);

  const onSelect = React.useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) return;
    setSelectedIndex(carouselApi.selectedScrollSnap());
  }, []);

  React.useEffect(() => {
    if (!api) return;

    const handleReInit = () => {
      setScrollSnaps(api.scrollSnapList());
      onSelect(api);
    };

    const handleSelect = () => {
      onSelect(api);
    };

    handleReInit();
    api.on("reInit", handleReInit);
    api.on("select", handleSelect);

    return () => {
      api.off("reInit", handleReInit);
      api.off("select", handleSelect);
    };
  }, [api, onSelect]);

  const resolvedCoupons: Coupon[] =
    offercards && offercards.length > 0
      ? offercards.map((card) => ({
          title: card.offer_card_title || card.banner_title || "",
          subtitle: "",
          image: card.banner_image || "/assets/images/coupon-1.png",
          buttonText: "Discover Now",
          bullet1: card.offer_card_content_1 || "",
          bullet2: card.offer_card_content_2 || "",
          url: card.url || "",
        }))
      : coupons;

  return (
    <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-white font-['Montserrat'] overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-0 md:py-10 ">
        <div className="w-full max-w-[1280px] mx-auto relative">
          {/* Carousel Container */}
          <div className="relative w-full min-h-[400px] md:min-h-[520px] lg:min-h-[520px]">
            <Carousel
              opts={{
                align: "start",
                loop: true,
                containScroll: "keepSnaps",
              }}
              plugins={autoplay ? [autoplay] : []}
              setApi={setApi}
              className="w-full select-none touch-pan-y"
              onPointerDownCapture={() => autoplay?.stop()}
              onPointerUpCapture={() => autoplay?.reset()}
              onMouseLeave={() => autoplay?.reset()}
              onFocusCapture={() => autoplay?.stop()}
              onBlurCapture={() => autoplay?.reset()}
            >
              {showArrows ? (
                <>
                  <button
                    type="button"
                    onClick={onPrevButtonClick}
                    className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-black p-2 md:p-2.5 rounded-full transition-colors duration-200 shadow-lg"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={onNextButtonClick}
                    className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-black p-2 md:p-2.5 rounded-full transition-colors duration-200 shadow-lg"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </>
              ) : null}

              <CarouselContent className="ml-0 cursor-grab active:cursor-grabbing">
                  {resolvedCoupons.map((coupon, index) => (
                    <CarouselItem
                      key={index}
                      className="pl-0 pr-0"
                    >
                      <div className="relative h-[400px] md:h-[520px] lg:h-[520px] rounded-[16px] overflow-hidden">
                        {/* Background Image */}
                        <img
                          src={coupon.image}
                          alt={coupon.title}
                          draggable={false}
                          className="w-full h-full object-cover pointer-events-none select-none"
                        />

                        {/* Gradient Overlay - subtle */}
                        <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10 lg:p-12">
                          {/* Top Content with Bullet Point */}
                            <div>
                                <h3 className="text-white text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] font-bold leading-tight flex items-center">
                                <span className="inline-block mr-2 sm:mr-3 md:mr-4 align-middle">
                                    <svg
                                    className="w-[30px] h-[35px] sm:w-[40px] sm:h-[47px] md:w-[50px] md:h-[59px]"
                                    viewBox="0 0 50 59"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    >
                                    <path
                                        d="M21.0122 1.18507C25.7094 3.04818 28.7549 6.35765 30.2653 11.1024C30.8447 12.9227 30.9528 14.7867 30.8832 16.6754C30.8086 18.6965 31.0791 20.653 31.9376 22.5101C32.8074 24.3916 34.464 25.9626 36.4394 26.6445C35.4129 24.9433 34.8738 23.1686 35.1453 21.3137C35.3976 19.5906 35.8911 17.8953 36.3818 16.2181C36.6113 15.4338 37.2477 15.2213 37.9196 15.6462C45.1037 20.1899 49.9416 26.3017 49.6665 35.1824C49.4068 43.5666 45.78 50.3146 38.4853 54.8171C36.3484 56.136 34.0066 56.9873 31.5489 57.5038C31.308 57.5545 31.0012 57.5795 30.7972 57.4751C27.7734 55.9287 24.9032 54.1634 22.7582 51.4496C19.6104 47.4668 19.1747 43.035 20.6364 38.3017C21.4382 35.7051 23.0436 32.497 24.2696 31.0788C26.919 33.4322 28.4825 36.3516 28.9531 39.8598C29.4089 43.2579 28.864 46.5278 27.6922 49.7183C27.6121 49.9365 27.4532 50.2118 27.523 50.3815C27.6838 50.7724 27.8828 51.265 28.213 51.4407C28.69 51.6946 29.2384 51.4634 29.4338 50.9125C31.6001 44.8074 32.1445 38.731 28.5582 32.9535C27.5885 31.3915 26.0969 30.1441 24.7905 28.8053C24.2873 28.2896 23.631 28.3359 23.1836 28.9422C19.738 33.6118 17.2961 38.6731 17.838 44.6541C18.2342 49.0272 20.3138 52.6262 23.7077 55.4175C24.8518 56.3584 26.1027 57.1695 27.5298 58.2029C26.2428 58.2029 25.1742 58.2366 24.1084 58.1971C19.1673 58.0142 14.4578 56.9592 10.1796 54.3699C4.9277 51.1912 1.80201 46.4865 0.573325 40.5447C-1.07344 32.5811 0.84891 25.4741 6.06154 19.2603C8.55853 16.2837 11.2334 13.4925 14.3982 11.185C16.4977 9.65419 17.1976 7.09564 16.3055 4.64979C15.9475 3.66811 15.3401 2.77997 14.9185 1.81762C14.7454 1.42259 14.5629 0.809114 14.7455 0.538265C14.9639 0.21444 15.6079 -0.060947 15.999 0.011755C17.6624 0.32099 19.3004 0.766757 21.0122 1.18507Z"
                                        fill="white"
                                    />
                                    </svg>
                                </span>
                                {coupon.title}
                                </h3>
                            </div>
                            <div className="flex flex-col justify-end">
                                <div className="flex justify-between text-white text-[14px] sm:text-[18px] md:text-[24px] lg:text-[28px] xl:text-[32px] font-bold leading-snug">
                                    <span className="max-w-[280px] sm:max-w-[350px] md:max-w-[420px] lg:max-w-[480px] flex items-start">
                                        <span className="inline-block mr-2 sm:mr-3 md:mr-4 flex-shrink-0">•</span>
                                  <span>{coupon.bullet1 || ""}</span>
                                    </span>
                                    <span className="max-w-[280px] sm:max-w-[350px] md:max-w-[420px] lg:max-w-[480px] flex items-start">
                                        <span className="inline-block mr-2 sm:mr-3 md:mr-4 flex-shrink-0">•</span>
                                  <span>{coupon.bullet2 || ""}</span>
                                    </span>
                                </div>
                                {/* Bottom Right Button */}
                                <div className="flex justify-end mt-3 sm:mt-4 md:mt-6">
                                  <a href={coupon.url || "#"} className="bg-pml-primary hover:bg-[#a00d4a] text-white px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-[8px] md:rounded-[12px] font-bold text-[12px] sm:text-[14px] md:text-[16px] transition-colors duration-300">
                                    Discover Now
                                  </a>
                                </div>
                            </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {showDots ? (
                  <div
                    className="mt-4 flex items-center justify-center gap-2"
                    aria-label="Carousel pagination"
                  >
                    {scrollSnaps.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => onDotButtonClick(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-current={selectedIndex === index ? "true" : undefined}
                        className={
                          selectedIndex === index
                            ? "h-2.5 w-2.5 rounded-full bg-pml-primary"
                            : "h-2.5 w-2.5 rounded-full bg-pml-primary/30"
                        }
                      />
                    ))}
                  </div>
                ) : null}
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}


