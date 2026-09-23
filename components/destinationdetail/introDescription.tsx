"use client";

import React, { useState, Fragment } from "react";
import Link from "next/link";

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
}

export default function IntroDescription({
  title,
  line1,
  line2,
  line3,
  defaultText = "",
  breadcrumbs = [],
}: IntroDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine if we have additional paragraphs to expand
  const hasExtraContent = Boolean(line2 || line3);

  return (
    <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-[#F9FAFB] font-['Montserrat']">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-4 md:py-6">
        <div className="w-full max-w-[1280px] mx-auto border border-slate-200/80 rounded-[8px] p-5 sm:p-6 md:px-8 md:py-6 bg-white shadow-sm space-y-2">
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

          <h2 className="text-[22px] sm:text-[28px] lg:text-[32px] font-semibold text-black tracking-tight leading-tight lg:whitespace-nowrap lg:leading-none">
            {title}
          </h2>

          <div className="space-y-4">
            {line1 || line2 || line3 ? (
              <>
                {line1 && (
                  <p className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] text-[#4c4c4c] leading-[22px] sm:leading-[24px] md:leading-[28px] lg:leading-[30px] font-normal max-w-[720px]">
                    {line1}
                  </p>
                )}

                {isExpanded && (
                  <div className="space-y-4 transition-all duration-300 ease-in-out">
                    {line2 && (
                      <p className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] text-[#4c4c4c] leading-[22px] sm:leading-[24px] md:leading-[28px] lg:leading-[30px] font-normal max-w-[720px]">
                        {line2}
                      </p>
                    )}
                    {line3 && (
                      <p className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] text-[#4c4c4c] leading-[22px] sm:leading-[24px] md:leading-[28px] lg:leading-[30px] font-normal max-w-[720px]">
                        {line3}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : defaultText ? (
              <p className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] text-[#4c4c4c] leading-[22px] sm:leading-[24px] md:leading-[28px] lg:leading-[30px] font-normal max-w-[720px]">
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
        </div>
      </div>
    </section>
  );
}
