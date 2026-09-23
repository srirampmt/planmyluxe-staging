"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { Package, Check, ChevronDown, ChevronUp } from "lucide-react";
import { parseHtmlItems } from "@/lib/html-list";

const COLLAPSED_HEIGHT = 240;

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
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(items.length > 4);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setOverflows(el.scrollHeight > COLLAPSED_HEIGHT + 8);
  }, [items, whatsIncluded]);

  const collapsed = overflows && !expanded;

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E6F4EA] text-[#16A34A]">
          <Package className="h-5 w-5" />
        </div>
        <h2 className="text-[18px] font-semibold text-black md:text-[20px]">
          {title}
        </h2>
      </div>

      <div className="relative">
        <div
          ref={contentRef}
          className={collapsed ? "max-h-[240px] overflow-hidden" : undefined}
        >
          {items.length > 0 ? (
            <ul className="space-y-4 text-[14px] leading-[160%] text-black md:text-[15px]">
              {items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 stroke-[2.5] text-[#16A34A]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div
              className="text-sm md:text-base text-black"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(whatsIncluded, {
                  USE_PROFILES: { html: true },
                }),
              }}
            />
          )}
        </div>
        {collapsed && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>

      {overflows && (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-pml-primary transition-colors hover:text-pml-primary/80"
        >
          {expanded ? (
            <>
              Read less
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Read more
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </>
  );
}
