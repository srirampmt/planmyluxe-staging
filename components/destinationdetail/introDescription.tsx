"use client";

import React, { useState, Fragment } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

interface Crumb {
  name: string;
  slug: string;
}

interface IntroDescriptionProps {
  title: string;
  line1?: string;
  line2?: string;
  line3?: string;
  defaultText?: string;
  breadcrumbs?: Crumb[];
  destinationName?: string;
  goodForItems?: Array<{
    title?: string;
    description?: string;
  }>;
}

export default function IntroDescription({
  title,
  line1,
  line2,
  line3,
  defaultText = "",
  breadcrumbs = [],
  destinationName,
  goodForItems = [],
}: IntroDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleGoodForItems = goodForItems.filter(
    (item) => item.title?.trim() || item.description?.trim()
  );

  // Determine if we have additional paragraphs to expand
  const hasExtraContent = Boolean(line2 || line3);

  return (
    <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-[#F9FAFB] font-['Montserrat']">
      <div className="mx-auto mt-6 w-full max-w-[1440px] px-[16px] py-6 sm:px-[24px] md:mt-8 md:px-[32px] md:py-8 lg:px-[40px]">
        <div className="w-full max-w-[1280px] mx-auto overflow-hidden rounded-[8px] border border-slate-200/80 bg-white shadow-sm">
          <div className="h-1.5 bg-[#CB2187]" />
          <div className="space-y-2 p-5 sm:p-6 md:px-8 md:py-6">
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumbs" className="flex flex-wrap items-center text-[11px] font-medium leading-4 text-slate-500">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <Fragment key={crumb.slug || idx}>
                    {idx > 0 && <span className="text-slate-300 mx-1.5 sm:mx-2 font-normal select-none">›</span>}
                    {isLast ? (
                      <span className="text-[#1a1a1a] font-semibold">{crumb.name}</span>
                    ) : (
                      <Link
                        href={crumb.slug}
                        className="text-slate-500 hover:text-[#cb2187] transition-colors font-medium"
                      >
                        {crumb.name}
                      </Link>
                    )}
                  </Fragment>
                );
              })}
            </nav>
          )}

          <h2 className="font-['Montserrat'] text-[24px] md:text-[48px] font-semibold text-[#4c4c4c] leading-[30px] md:leading-[1.15] tracking-[-0.005em]">
            {title}
          </h2>

          <div className="space-y-4">
            {line1 || line2 || line3 ? (
              <>
                {line1 && (
                  <p className="text-[15px] md:text-[16px] leading-7 text-[#4c4c4c] font-normal w-full">
                    {line1}
                  </p>
                )}

                {isExpanded && (
                  <div className="space-y-4 transition-all duration-300 ease-in-out">
                    {line2 && (
                      <p className="text-[15px] md:text-[16px] leading-7 text-[#4c4c4c] font-normal w-full">
                        {line2}
                      </p>
                    )}
                    {line3 && (
                      <p className="text-[15px] md:text-[16px] leading-7 text-[#4c4c4c] font-normal w-full">
                        {line3}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : defaultText ? (
              <p className="text-[15px] md:text-[16px] leading-7 text-[#4c4c4c] font-normal w-full">
                {defaultText}
              </p>
            ) : null}

            {hasExtraContent && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="text-[14px] font-bold text-[#cb2187] hover:underline focus:outline-none block mt-3 cursor-pointer"
              >
                {isExpanded ? "Read Less" : "Read More"}
              </button>
            )}
          </div>

          {visibleGoodForItems.length > 0 ? (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <h3 className="text-[16px] font-semibold text-[#1a1a1a] md:text-[18px]">
                {destinationName ? `${destinationName} — perfect for` : "Perfect for"}
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {visibleGoodForItems.map((item, index) => (
                  <div key={index} className="min-w-0 rounded-[8px] bg-[#FDF2F8] px-3 py-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[#CB2187]">
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <div className="min-w-0">
                        {item.title ? (
                          <p className="text-[13px] font-semibold leading-5 text-[#1a1a1a] md:text-[14px]">
                            {item.title}
                          </p>
                        ) : null}
                        {item.description ? (
                          <p className="mt-0.5 text-[12px] leading-5 text-[#667085] md:text-[13px]">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
