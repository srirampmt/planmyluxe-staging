"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

const NewsletterModal = dynamic(() => import("./NewsletterModal"), {
  ssr: false,
});

export function Signup() {
  const [open, setOpen] = useState(false);
  const [shouldRenderNewsletterModal, setShouldRenderNewsletterModal] = useState(false);

  const handleOpenNewsletterModal = () => {
    setShouldRenderNewsletterModal(true);
    setOpen(true);
  };

  return (
    <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-pml-primary font-['Montserrat'] overflow-hidden h-auto lg:h-[380px]">
      {shouldRenderNewsletterModal ? (
        <NewsletterModal open={open} onClose={() => setOpen(false)} />
      ) : null}
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-[40px] sm:py-[50px] md:py-[60px] lg:py-0 h-full flex items-center">
        <div className="w-full max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-[30px] md:gap-[40px] lg:gap-[60px]">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left z-10">
              {/* Heading */}
              <h2 className="font-['Montserrat'] text-white text-[24px] sm:text-[28px] md:text-[32px] lg:text-[40px] xl:text-[40px] font-bold leading-[1.15] sm:leading-[1.2] tracking-[-0.01em] mb-[16px] sm:mb-[20px] md:mb-[24px]">
                Sign up to receive Our
                <br />
                exclusive Weekly Offers.
              </h2>

              {/* Description */}
              <p className="font-['Montserrat'] text-white/80 text-[12px] md:text-[16px] lg:text-[16px] font-normal leading-[1.6] sm:leading-[1.65] md:leading-[1.7] mb-[24px] sm:mb-[28px] md:mb-[32px] max-w-[500px] sm:max-w-[550px] md:max-w-[600px] mx-auto lg:mx-0">
                Stay one step ahead with exclusive weekly offers, insider savings and standout deals you won&apos;t see everywhere else.
              </p>

              {/* Signup Button */}
              <button
                type="button"
                onClick={handleOpenNewsletterModal}
                className="inline-flex items-center justify-center px-[24px] sm:px-[28px] md:px-[32px] lg:px-[36px] py-[8px] md:py-[12px] bg-white rounded-[8px] hover:bg-gray-100 transition-all duration-300"
              >
                <span className="font-['Montserrat'] text-[#4c4c4c] text-[14px] md:text-[16px] font-semibold tracking-[0.02em]">
                  Signup & Save
                </span>
              </button>
            </div>

            {/* Right Side - Curved Images (Desktop only - above 1260px) */}
            <div className="absolute top-[60%] -translate-y-1/2 right-0 w-[650px] h-[300px] hidden xl:block">
              <Image
                src="/assets/images/Mask_group.png"
                alt="Luxury travel destination"
                fill
                className="object-fit object-left"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Signup;
