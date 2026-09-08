"use client";

import { useState } from "react";

type ExperienceProps = {
  best_experience_title?: string;
  best_experience_line_1?: string;
  best_experience_line_2?: string;
  best_experience_line_3?: string;
  best_experience_image_1?: string;
};

export default function Experience({
  best_experience_title,
  best_experience_line_1,
  best_experience_line_2,
  best_experience_line_3,
  best_experience_image_1,
}: ExperienceProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const title = best_experience_title ?? "Experience the best of Mallorca";
  const line1 =
    best_experience_line_1 ??
    "Mallorca is an island that blends everything you want from a Mediterranean escape, from golden beaches and clear blue waters to charming coastal towns and stylish resorts offering exceptional value. The island has a natural warmth and beauty that makes every day feel relaxed and inviting, with sun soaked moments and scenic views wherever you wander.";
  const line2 =
    best_experience_line_2 ??
    "From peaceful coves on the east coast to the livelier stretches of the south, Mallorca offers a holiday style for every traveller. Explore historic Palma, enjoy gentle coastal walks, or unwind on soft sands as the Balearic sunshine brightens your day.";
  const line3 =
    best_experience_line_3 ??
    "Our handpicked Mallorca hotels combine comfort, style, and brilliant value, with added extras and exclusive offers prepared each week by our travel experts. With so much to explore and enjoy, Mallorca remains one of the most accessible and rewarding destinations in the Mediterranean.";
  const imageSrc = best_experience_image_1 || "/assets/images/brochure.png";

  return (
    <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-white py-8 md:py-16 lg:py-20 font-['Montserrat']">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
        <div className="w-full max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          {/* Right Column - Brochure Card (shown first on mobile/tablet) */}
          <div className="lg:order-2 flex justify-center lg:justify-end">
            <div className="w-full lg:w-[325px]">
              {/* Card Container */}
              <div className="relative rounded-[8px] overflow-hidden shadow-xl">
                {/* Background Image */}
                <img
                  src={imageSrc}
                  alt="Summer Collection"
                  className="w-full lg:w-[325px] h-auto lg:h-[459px] object-cover"
                />
              </div>
              
              {/* Bottom Content - Outside Image */}
              <div className="text-start mt-2 md:mt-3">
                {/* <h4 className="text-pml-primary text-[18px] md:text-[22px] lg:text-[24px] font-bold mb-2">
                  Summer 2026 Collection
                </h4> */}
                <a
                  id="seo-broucher-download"
                  href="https://accelerate-digital.paperturn-view.com/?pid=ODg8871976&v=8.5&p=1&source=qr"
                  className="text-[#4c4c4c] text-[16px] font-normal underline hover:text-[#C8105B] transition-colors tracking-[0.01em]"
                >
                  Download Now
                </a>
              </div>
            </div>
          </div>

          {/* Left Column - Text Content (2 parts, shown second on mobile/tablet) */}
          <div className="lg:col-span-2 lg:order-1 space-y-6 ">
            {/* Title */}
            <h2 className="text-[#4c4c4c] text-[28px] md:text-[48px] lg:text-[48px] font-semibold leading-[30px] md:leading-[60px] max-w-[626px]">
                {title}
            </h2>

            {/* Paragraph 1 */}
            <p className="text-[#4C4C4C] text-[16px] md:text-[18px] lg:text-[18px] leading-[28px]">
                {line1}
            </p>

            {/* Paragraph 2 (always visible on desktop) */}
            {line2 ? (
              <p className="hidden lg:block text-[#4C4C4C] text-[16px] md:text-[18px] lg:text-[18px] leading-[28px]">
                {line2}
              </p>
            ) : null}

            {/* Paragraphs 2 & 3 (shown only when expanded, on all breakpoints) */}
            {isExpanded && (
              <>
                {line2 ? (
                  <p className="lg:hidden text-[#4C4C4C] text-[16px] md:text-[18px] lg:text-[18px] leading-[28px]">
                    {line2}
                  </p>
                ) : null}

                {line3 ? (
                  <p className="text-[#4C4C4C] text-[16px] md:text-[18px] lg:text-[18px] leading-[28px]">
                    {line3}
                  </p>
                ) : null}
              </>
            )}

            {/* Read More / Read Less (works on desktop + mobile) */}
            <button
              onClick={() => setIsExpanded((v) => !v)}
              aria-expanded={isExpanded}
              className="text-pml-primary text-[14px] font-semibold underline hover:text-[#a01a6e] transition-colors"
            >
              {isExpanded ? "Read Less" : "Read More"}
            </button>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}