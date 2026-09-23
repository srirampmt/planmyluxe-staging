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
        <h2 className="text-[18px] font-semibold text-black md:text-[20px]">
          {title}
        </h2>
      </div>

      {/* Content */}
      {items.length > 0 ? (
        <ul className="space-y-4 text-[14px] leading-[160%] text-black md:text-[15px]">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              {/* Solid Magenta Badge Icon */}
              <Check className="mt-0.5 h-5 w-5 shrink-0 stroke-[2.5] text-[#16A34A]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div
          className="text-sm md:text-base text-black"
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
