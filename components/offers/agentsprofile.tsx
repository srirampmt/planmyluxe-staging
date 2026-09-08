"use client";
import React from "react";
import EnquiryModal from "../hotels/EnquiryModal";
import PhoneNumber from "@/components/utm/PhoneNumber";
import { buildEnquirySource } from "@/lib/source-builder";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Expert {
  id: number;
  name: string;
  description: string;
  image: string;
}

const experts: Expert[] = [
  {
    id: 1,
    name: "Suzannah",
    description:
      "Lorem ipsum dolor sit amet consectetur. Lorem et magna facilisis velit amet a pellentesque.",
    image: "/assets/images/user-1.png",
  },
  {
    id: 2,
    name: "Suzannah",
    description:
      "Lorem ipsum dolor sit amet consectetur. Lorem et magna facilisis velit amet a pellentesque.",
    image: "/assets/images/user-2.png",
  },
  {
    id: 3,
    name: "Suzannah",
    description:
      "Lorem ipsum dolor sit amet consectetur. Lorem et magna facilisis velit amet a pellentesque.",
    image: "/assets/images/user-3.png",
  },
  {
    id: 4,
    name: "Suzannah",
    description:
      "Lorem ipsum dolor sit amet consectetur. Lorem et magna facilisis velit amet a pellentesque.",
    image: "/assets/images/user-4.png",
  },
  {
    id: 5,
    name: "Suzannah",
    description:
      "Lorem ipsum dolor sit amet consectetur. Lorem et magna facilisis velit amet a pellentesque.",
    image: "/assets/images/user-1.png",
  },
  {
    id: 6,
    name: "Suzannah",
    description:
      "Lorem ipsum dolor sit amet consectetur. Lorem et magna facilisis velit amet a pellentesque.",
    image: "/assets/images/user-2.png",
  },
  {
    id: 7,
    name: "Suzannah",
    description:
      "Lorem ipsum dolor sit amet consectetur. Lorem et magna facilisis velit amet a pellentesque.",
    image: "/assets/images/user-3.png",
  },
  {
    id: 8,
    name: "Suzannah",
    description:
      "Lorem ipsum dolor sit amet consectetur. Lorem et magna facilisis velit amet a pellentesque.",
    image: "/assets/images/user-4.png",
  },
];

export default function AgentsProfile() {
  const [isEnquiryOpen, setIsEnquiryOpen] = React.useState(false);
  const [pageRoute, setPageRoute] = React.useState<string>("/");

  React.useEffect(() => {
      if (typeof window === "undefined") return;
      const nextRoute = `${window.location.pathname || ""}${window.location.search || ""}`;
      setPageRoute(nextRoute || "/");
  }, []);
  const handleEnquireNow = () => {
      setIsEnquiryOpen(true);
  };

  const handleCloseEnquiry = () => {
      setIsEnquiryOpen(false);
  };
  return (
    <>
      <EnquiryModal
        open={isEnquiryOpen}
        onClose={handleCloseEnquiry}
        initialValues={{
          destination: "",
          resort: "",
          quoteRef: "",
          dealdata: null,
          source: buildEnquirySource({ section: "agent", pathname: pageRoute }),
        }}
      />
      <section className="w-full bg-white py-12 md:py-16 lg:py-20 font-['Montserrat']">
        <div className="max-w-7xl mx-auto px-[16px] sm:px-[24px] md:px-[24px] lg:px-[32px]">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-8 mb-4 md:mb-16">
            <h2 className="text-[18px] md:text-[32px] lg:text-[32px] font-semibold text-[#4c4c4c] leading-tight mb:2 md:mb-4">
              Chat with our experts
            </h2>
            <p className="text-[#4c4c4c] text-[14px] md:text-[18px] max-w-3xl">
              Pur destination experts have a wealth of experience and are ready to
              help you realise your dream holiday.
            </p>
          </div>

          {/* Carousel */}
          <div className="relative mb-12">
            <Carousel
              opts={{
                align: "start",
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-3 gap-3 md:gap-10">
                {experts.map((expert) => (
                  <CarouselItem
                    key={expert.id}
                    className="pl-3 md:pl-4 basis-3/5 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <div className="flex flex-col items-center text-center w-[220px] md:w-[340px]">
                      {/* Circular Image */}
                      <div className="relative w-[200px] h-[200px] md:w-[280px] md:h-[280px] mb-6 rounded-full overflow-hidden">
                        <img
                          src={expert.image}
                          alt={expert.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Name */}
                      <h3 className="text-[18px] md:text-[24px] font-medium text-[#4c4c4c] mb-3">
                        {expert.name}
                      </h3>

                      {/* Description */}
                      <p className="text-[#4c4c4c] text-[12px] md:text-[14px] leading-relaxed mb-6 px-4">
                        {expert.description}
                      </p>

                      {/* Let's Chat Button */}
                      <button className="border border-pml-primary text-pml-primary px-6 md:px-8 py-2.5 rounded-[8px] font-normal text-[14px] md:text-[15px] hover:bg-pml-primary hover:text-white transition-colors duration-300">
                        Let&apos;s Chat
                      </button>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:items-start ">
              <h3 className="text-[#4c4c4c] text-[14px] md:text-[18px] font-regular uppercase">
                SPEAK TO ONE OF OUR TAILOR-MADE TRAVEL EXPERTS NOW ON
              </h3>
              <div className="flex items-center gap-12">
                <PhoneNumber
                  asLink
                  className="text-[#4c4c4c] text-[16px] md:text-[32px] lg:text-[36px] font-bold hover:text-pml-primary transition-colors"
                />
                <div className="flex items-center gap-2 text-green-600 text-[13px] md:text-[14px]">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span className="text-[#2980B9]">Open today: 08:30 - 19:30</span>
                </div>
              </div>
            </div>

            {/* Enquiry Button */}
            <button onClick={handleEnquireNow} className="bg-pml-primary text-white px-8 py-3.5 rounded-[8px] font-bold text-[15px] md:text-[16px] hover:bg-[#a01a6e] transition-colors duration-300 whitespace-nowrap">
              Enquire Now
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
