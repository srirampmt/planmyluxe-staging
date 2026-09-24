"use client";

import React, { useState, useRef, useEffect } from "react";

export interface DestinationHighlightsProps {
  destinationName?: string;
  highlights?: string;
  className?: string;
}

function isEmptyHtml(html?: string): boolean {
  if (!html) return true;
  const stripped = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  return stripped.length === 0;
}

export default function DestinationHighlights({
  highlights,
  className = "",
}: DestinationHighlightsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Check if the actual content height exceeds the collapsed preview threshold
      const isOverflowing = contentRef.current.scrollHeight > 155;
      setShowToggle(isOverflowing);
    }
  }, [highlights]);

  if (isEmptyHtml(highlights)) {
    return null;
  }

  return (
    <section className={`w-full py-6 font-['Montserrat'] md:py-8 ${className}`}>
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
        <div className="w-full max-w-[1280px] mx-auto">
          <div className="bg-white rounded-[16px] border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8 md:p-10 transition-all duration-300">
            {/* Highlights Content Container with Expand/Collapse */}
            <div
              ref={contentRef}
              className={`relative transition-all duration-300 ${
                !isExpanded ? "max-h-[140px] sm:max-h-[160px] overflow-hidden" : "max-h-none"
              }`}
            >
              <div
                className="font-['Montserrat'] text-[15px] md:text-[16px] text-[#4c4c4c] leading-7 prose max-w-none [&_h1]:text-[24px] [&_h1]:md:text-[32px] [&_h1]:font-semibold [&_h1]:text-[#4c4c4c] [&_h1]:leading-tight [&_h2]:text-[20px] [&_h2]:md:text-[24px] [&_h2]:font-semibold [&_h2]:text-[#4c4c4c] [&_h2]:leading-snug [&_h3]:text-[16px] [&_h3]:md:text-[18px] [&_h3]:font-semibold [&_h3]:text-[#1a1a1a] [&_h4]:text-[16px] [&_h4]:font-semibold [&_h4]:text-[#1a1a1a] [&_strong]:text-[#1a1a1a] [&_strong]:font-semibold [&_a]:text-[#cb2187] [&_a]:underline [&_a]:font-semibold hover:[&_a]:text-[#a01869] [&_a]:cursor-pointer [&_a]:transition-colors [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 [&_li]:leading-7 [&_p]:mb-3"
                dangerouslySetInnerHTML={{ __html: highlights! }}
              />

              {/* Bottom gradient fade when collapsed */}
              {!isExpanded && showToggle && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/85 to-transparent" />
              )}
            </div>

            {/* Read More / Read Less button on bottom right */}
            {showToggle && (
              <div className="flex justify-end mt-3 sm:mt-4">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="font-montserrat text-[14px] sm:text-[15px] font-semibold text-[#cb2187] hover:underline transition-colors flex items-center gap-1 cursor-pointer outline-none select-none"
                >
                  {isExpanded ? "Read Less ‹" : "Read More ›"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export { DestinationHighlights };
