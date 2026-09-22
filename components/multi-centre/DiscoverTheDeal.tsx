"use client";

import DOMPurify from "isomorphic-dompurify";
import { parseHtmlItems } from "@/lib/html-list";
import { Tag, TagIcon } from "lucide-react";
import React from "react";

type Props = {
  title?: string;
  content: string;
};

// Checkmark SVG for the list items
const CheckCircleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className="mt-0.5 h-5 w-5 shrink-0 text-pml-primary"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM16.707 9.707L10.707 15.707C10.512 15.902 10.256 16 10 16C9.744 16 9.488 15.902 9.293 15.707L7.293 13.707C6.902 13.316 6.902 12.684 7.293 12.293C7.684 11.902 8.316 11.902 8.707 12.293L10 13.586L15.293 8.293C15.684 7.902 16.316 7.902 16.707 8.293C17.098 8.684 17.098 9.316 16.707 9.707Z"
    />
  </svg>
);

// Helper component for the styled wrapper
const StyledWrapper = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section
    className="relative mt-4 w-full rounded-[16px] bg-gradient-to-br bg-[#fdf3f8] border border-[#FCE7F3] p-4 md:mt-8 md:p-8"
    data-testid="discover-the-deal"
  >
    {/* Badge */}
    <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-pml-primary px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white md:text-xs">
      <TagIcon className="h-3 w-3 shrink-0" />
      PlanMyLuxe Exclusive Perk
    </div>

    {/* Title */}
    <h2 className="mb-6 text-[18px] font-bold leading-[140%] text-[#1a1b4b] md:text-[20px]">
      {title}
    </h2>

    {/* Content Area */}
    {children}
  </section>
);

export default function DiscoverTheDeal({
  title = "Discover The Deal: Added Value Included",
  content,
}: Props) {
  const raw = (content || "").trim();

  const parseItemsFromHtml = (html: string) => parseHtmlItems(html);

  const items = parseItemsFromHtml(raw);

  const renderSanitizedHtml = (html: string) => {
    const safe = DOMPurify.sanitize(html || "", {
      USE_PROFILES: { html: true },
    });
    return <div dangerouslySetInnerHTML={{ __html: safe }} />;
  };

  // 1. If we parsed items, render as a 2-column grid with checkmarks.
  if (items.length) {
    return (
      <StyledWrapper title={title}>
        <ul className="grid grid-cols-1 gap-x-6 gap-y-4 text-[14px] leading-[160%] text-[#1a1b4b]  md:text-[15px]">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircleIcon />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </StyledWrapper>
    );
  }

  // 2. Fallback: if no HTML items, try splitting by newline
  const paragraphs = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (paragraphs.length > 1) {
    return (
      <StyledWrapper title={title}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 text-[14px] leading-[160%] text-[#1a1b4b] md:grid-cols-2 md:text-[15px]">
          {paragraphs.map((paragraph, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircleIcon />
              <p>{paragraph}</p>
            </div>
          ))}
        </div>
      </StyledWrapper>
    );
  }

  // 3. Final fallback: render sanitized HTML or raw text
  return (
    <StyledWrapper title={title}>
      <div className="text-[14px] leading-[160%] text-[#1a1b4b] md:text-[15px]">
        {raw ? renderSanitizedHtml(raw) : null}
      </div>
    </StyledWrapper>
  );
}
