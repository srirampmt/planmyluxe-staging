"use client";
import Image from "next/image";

export function Broucher() {
  return (
    <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] font-['Montserrat'] bg-[#FFF7FC]">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-[16px] sm:py-[18px] md:py-[22px] lg:py-[32px]">
        <div className="w-full max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-[24px] sm:gap-[30px] md:gap-[40px] lg:gap-[60px] xl:gap-[80px]">
            {/* Brochure Image */}
            <div className="w-full md:flex-shrink-0 md:w-auto md:max-w-[220px] lg:max-w-[240px] xl:max-w-[260px]">
              <div className="relative shadow-md rounded-[8px] overflow-hidden">
                <Image
                  src="https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/homepage/brochure.png"
                  alt="Summer Sun 2025 Collection Brochure"
                  width={260}
                  height={367}
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              {/* Heading */}
              <h2 className="font-['Montserrat'] text-pml-primary text-[18px] sm:text-[20px] md:text-[22px] lg:text-[26px] xl:text-[28px] font-medium leading-[1.25] sm:leading-[1.3] md:leading-[1.35] tracking-[-0.01em] mb-[12px] sm:mb-[14px] md:mb-[16px] lg:mb-[20px] xl:mb-[24px]">
                Discover Luxury Holidays & Free Extras – All in One<br className="hidden lg:block" /> Download
              </h2>
              {/* Description */}
              <p className="font-['Montserrat'] text-[#555555] text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-normal leading-[1.6] sm:leading-[1.65] md:leading-[1.7] mb-[20px] sm:mb-[24px] md:mb-[28px] lg:mb-[32px] xl:mb-[36px] max-w-[500px] sm:max-w-[550px] md:max-w-[600px] lg:max-w-[700px] mx-auto md:mx-0 text-justify">
                  Download our latest brochure to explore a handpicked collection of exclusive destinations at unbeatable prices. From sun-soaked escapes to cultural gems, you&apos;ll also find a selection of amazing FREE added extras waiting just for you!
              </p>

              {/* Download Button */}
              <button id="seo-broucher-download" onClick={() => window.open("https://accelerate-digital.paperturn-view.com/?pid=ODg8871976&v=8.5&p=1&source=qr", "_blank")} className="inline-flex items-center justify-center gap-[8px] sm:gap-[10px] px-[20px] sm:px-[24px] md:px-[28px] lg:px-[32px] xl:px-[40px] py-[10px] md:py-[12px] border-[1px] border-pml-primary rounded-[10px] bg-[#EFEFEF] hover:bg-pml-primary group transition-all duration-300">
                <span className="font-['Montserrat'] text-pml-primary text-[14px] font-semibold uppercase tracking-[0.05em] group-hover:text-white transition-colors duration-300 leading-[22px]">
                  Download Now
                </span>
                <svg 
                  width="17" 
                  height="21" 
                  viewBox="0 0 17 21" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[12px] h-[15px] sm:w-[14px] sm:h-[17px] md:w-[15px] md:h-[19px] lg:w-[17px] lg:h-[21px] transition-colors duration-300"
                >
                  <path 
                    d="M8.22917 0.9375V15.5208M8.22917 15.5208L1.97917 9.27083M8.22917 15.5208L14.4792 9.27083M0.9375 19.6875H15.5208" 
                    className="stroke-[#D61D8C] group-hover:stroke-white transition-colors duration-300"
                    strokeWidth="1.875" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Broucher;
