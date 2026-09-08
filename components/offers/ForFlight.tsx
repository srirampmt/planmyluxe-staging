"use client";

import React from "react";
import EnquiryModal from "../hotels/EnquiryModal";
import { buildEnquirySource } from "@/lib/source-builder";

export default function ForFlight() {
  
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
          source: buildEnquirySource({ section: "flight", pathname: pageRoute }),
        }}
      />
      <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-white font-['Montserrat']">
        <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-8 md:py-20">
          <div className="w-full max-w-[1280px] mx-auto relative h-[420px] md:h-[560px] lg:h-[664px]">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 rounded-[8px] mx-[0px] md:mx-[0px] "> 
              <img
                src="/assets/images/looking-for-flight.png"
                alt="Travel background"
                className="w-full h-full object-cover rounded-[8px]"
              />
              <div className="absolute inset-0 bg-black/20 rounded-[8px]"></div>
            </div>

            {/* Content Container */}
            <div className="relative max-w-6xl mx-[16px] md:mx-auto px-4 md:px-6 lg:px-8 h-[420px] md:h-[560px] lg:h-[664px] flex justify-center items-center">
              {/* Card with backdrop blur */}
              <div className="bg-white/40 backdrop-blur-sm md:backdrop-blur-md lg:backdrop-blur-lg rounded-[16px] p-4 md:p-12 shadow-2xl border border-white/30 w-full max-w-4xl md:max-w-5xl flex flex-col justify-center items-center">
                {/* Header */}
                <div className="text-center py-12 sm:py-16 md:py-16 ">
                  <h2 className="text-[24px] md:text-[48px] lg:text-[48px] font-extrabold text-white mb-6 drop-shadow-lg">
                    Looking for a flight?
                  </h2>
                  <p className="text-white text-[12px] md:text-[16px] lg:text-[16px] leading-relaxed max-w-4xl mx-auto drop-shadow-md line-clamp-2 md:line-clamp-none">
                    We&apos;re firm believers that planning a holiday should feel exciting, not overwhelming. We&apos;re here to make it
                    personal, thoughtful and completely stress-free. We&apos;ll get to know you properly, design a trip that&apos;s perfect for you,
                    and support you every step of the way.
                  </p>
                  {/* CTA Button */}
                  <div className="text-center mt-8">
                    <button onClick={handleEnquireNow} className="bg-[#4c4c4c] text-white px-3 md:px-10 py-3.5 rounded-[8px] text-[14px] md:text-[18px] font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                      Let&apos;s Start Planning
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>  
      </section>
    </>
  );
}