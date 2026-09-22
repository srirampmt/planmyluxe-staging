"use client";

import React, { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { Star, Check } from "lucide-react";
import { parseHtmlItems } from "@/lib/html-list";

type HighlightsProps = {
  highlights: string;
  title?: string;
};

const parseListItems = parseHtmlItems;

export default function Highlights({
  highlights,
  title = "Handpicked Highlights",
}: HighlightsProps) {
  const items = useMemo(() => parseListItems(highlights), [highlights]);

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FBE8F4] text-pml-primary">
          <Star className="h-5 w-5 fill-current" />
        </div>
        <h2 className="text-[18px] font-semibold text-[#1a1b4b] md:text-[20px]">
          {title}
        </h2>
      </div>

      {/* Content */}
      {items.length > 0 ? (
        <ul className="space-y-4 text-[14px] leading-[160%] text-[#1a1b4b] md:text-[15px]">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              {/* Solid Magenta Badge Icon */}
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pml-primary text-white">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div
          className="text-sm md:text-base text-[#1a1b4b]"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(highlights, {
              USE_PROFILES: { html: true },
            }),
          }}
        />
      )}
    </>

  );
}
