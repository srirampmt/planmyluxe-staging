"use client";

import React, { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { Package, Check } from "lucide-react";
import { parseHtmlItems } from "@/lib/html-list";

type WhatsIncludedProps = {
  whatsIncluded: string;
  title?: string;
};

const parseListItems = parseHtmlItems;

export default function WhatsIncluded({
  whatsIncluded,
  title = "What's Included",
}: WhatsIncludedProps) {
  const items = useMemo(() => parseListItems(whatsIncluded), [whatsIncluded]);

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E6F4EA] text-[#16A34A]">
          <Package className="h-5 w-5" />
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
              {/* Emerald Green Icon */}
              <Check className="mt-0.5 h-5 w-5 shrink-0 stroke-[2.5] text-[#16A34A]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div
          className="text-sm md:text-base text-[#1a1b4b]"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(whatsIncluded, {
              USE_PROFILES: { html: true },
            }),
          }}
        />
      )}
    </>
  );
}
