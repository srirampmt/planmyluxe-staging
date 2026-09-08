"use client";

import { useState, useRef, useEffect } from "react";
import DOMPurify from "dompurify";
import { useUtmPhone } from "@/components/utm/UtmPhoneProvider";

interface HolidayDealCardProps {
  aboutTheDeal?: string;
  whyWeLoveThisHotel: string;
  aboutTheHotel: string;
  offerMode?: boolean;
}

const TRUNCATE_HEIGHT = 200;

export default function HolidayDealCard({
  aboutTheDeal,
  whyWeLoveThisHotel,
  aboutTheHotel,
  offerMode,
}: HolidayDealCardProps) {
  useUtmPhone();

  const contentRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);

  useEffect(() => {
    if (!offerMode || !contentRef.current) return;
    setNeedsTruncation(contentRef.current.scrollHeight > TRUNCATE_HEIGHT);
  }, [aboutTheDeal, offerMode]);

  const renderRichText = (html: string, variant: "aboutDeal" | "whyLove" | "aboutHotel") => {
    const safe = DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
    });

    const baseClass =
      "text-[#595858] text-[14px] font-medium leading-[22px] [&_p]:my-2 [&_li]:my-1";

    const variantClass =
      variant === "aboutDeal"
        ? "[&>p:first-child]:mb-5 [&>p:first-child]:text-[14px] [&>p:first-child]:font-medium [&>p:first-child]:leading-[22px] md:[&>p:first-child]:text-[18px] md:[&>p:first-child]:leading-[28px] [&_h1]:mt-5 [&_h1]:text-[18px] [&_h1]:font-semibold [&_h1]:leading-[32px] [&_h1]:text-pml-primary md:[&_h1]:text-[20px] md:[&_h1]:leading-[36px] [&_h2]:mt-5 [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:leading-[32px] [&_h2]:text-pml-primary md:[&_h2]:text-[20px] md:[&_h2]:leading-[36px] [&_h3]:mt-5 [&_h3]:text-[18px] [&_h3]:font-semibold [&_h3]:leading-[32px] [&_h3]:text-pml-primary md:[&_h3]:text-[20px] md:[&_h3]:leading-[36px] [&_h4]:mt-5 [&_h4]:text-[18px] [&_h4]:font-semibold [&_h4]:leading-[32px] [&_h4]:text-pml-primary md:[&_h4]:text-[20px] md:[&_h4]:leading-[36px] [&_ul]:my-3 [&_ul]:list-none [&_ul]:space-y-3 [&_li]:relative [&_li]:pl-8 [&_li]:text-[14px] [&_li]:leading-[28px] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[3px] [&_li]:before:flex [&_li]:before:h-5 [&_li]:before:w-5 [&_li]:before:items-center [&_li]:before:justify-center [&_li]:before:rounded-full [&_li]:before:border-2 [&_li]:before:border-green-500 [&_li]:before:text-[11px] [&_li]:before:font-bold [&_li]:before:leading-none [&_li]:before:text-green-500 [&_li]:before:content-['✓']"
        : variant === "whyLove"
          ? "[&_ol]:my-1 [&_ol]:ml-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ul]:my-1 [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_p]:my-1 [&_p]:text-[14px] [&_p]:font-medium [&_p]:leading-[22px] [&_li]:text-[14px] [&_li]:font-medium [&_li]:leading-[24px] md:[&_li]:leading-[32px]"
          : "[&_h1]:mt-5 [&_h1]:text-[18px] [&_h1]:font-semibold [&_h1]:leading-[32px] [&_h1]:text-pml-primary md:[&_h1]:text-[20px] md:[&_h1]:leading-[36px] [&_h2]:mt-5 [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:leading-[32px] [&_h2]:text-pml-primary md:[&_h2]:text-[20px] md:[&_h2]:leading-[36px] [&_h3]:mt-5 [&_h3]:text-[18px] [&_h3]:font-semibold [&_h3]:leading-[32px] [&_h3]:text-pml-primary md:[&_h3]:text-[20px] md:[&_h3]:leading-[36px] [&_p]:my-1 [&_p]:text-[14px] [&_p]:font-semibold [&_p]:leading-[20px] md:[&_p]:leading-[22px]";

    return (
      <div
        className={`${baseClass} ${variantClass}`}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    );
  };

  return (
    <div className="mx-auto w-full max-w-[840px] rounded-2xl border border-green-100 bg-green-50 p-4 font-['Montserrat'] text-[#595858] md:p-6">
      {offerMode && (
        <div className="w-full">
          <div
            ref={contentRef}
            className={`relative overflow-hidden${!isExpanded && needsTruncation ? " max-h-[250px]" : ""}`}
          >
            {renderRichText(aboutTheDeal ?? "", "aboutDeal")}
            {!isExpanded && needsTruncation && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-50 to-transparent" />
            )}
          </div>
          {needsTruncation && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="mt-4 inline-flex items-center gap-1 rounded-full bg-green-600/10 px-4 py-2 text-[13px] font-bold text-green-700 transition-colors duration-200 hover:bg-green-600/20 active:scale-95"
            >
              {isExpanded ? "Read Less" : "Read More"} <span aria-hidden="true">{isExpanded ? "↑" : "→"}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
