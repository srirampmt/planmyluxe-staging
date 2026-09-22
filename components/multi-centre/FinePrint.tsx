"use client";

import { useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { parseHtmlItems } from "@/lib/html-list";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

const FINE_PRINT_ITEMS = [
  "Our prices are per person, based on two people sharing, and are subject to availability.",
  "Prices are correct at time of publish and subject to change at any time.",
  "Our offers are extremely popular as many are exclusive or have added value therefore they operate on a first come first served basis with limited availability.",
  "Any upgrades and extras not outlined with the promotional offers can be added however all costs will be an additional cost payable by the customer.",
  "Once flights are confirmed this will be an actual cost to the offer with online check-in, if you require this service or additional support from the team, a charge will apply.",
  "Our premium support package is not included in the deal.",
  "This website (including images) does not list live pricing; we will endeavour to keep our prices updated as close to live prices as possible.",
  "Please note that all bookings are price service providing website and its services is assist customers in sourcing the availability of travel-related goods and services and to make permissible reservations or otherwise perform business with suppliers. We do not operate any suppliers.",
  "We do not share our client data with any third parties.",
  "We are TTA bonded and ATOL protected.",
  "If you are banned from flying, which can arise as a result of a cancelled flight for a refund would be processed without any notice.",
  "Any refunds made by us will take 7-10 business days.",
  "We hold the right to ask you for any identity proof or payment authorisation code(s) in order to avoid any fraudulent transactions.",
];

const COLLAPSED_ITEMS = 4;

export default function FinePrint(content: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const html =
    typeof content === "string"
      ? content
      : content && typeof content.content === "string"
        ? content.content
        : "";

  const getFinePrintItems = (rawHtml: string) => parseHtmlItems(rawHtml);

  const renderRichText = (rawHtml: string) => {
    const safe = DOMPurify.sanitize(rawHtml || "", {
      USE_PROFILES: { html: true },
    });
    return (
      <div
        className="text-xs text-gray-500 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-amber-600 [&_li]:mb-2"
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    );
  };

  const contentItems = getFinePrintItems(html);
  const sourceItems = contentItems.length
    ? contentItems
    : html.trim()
      ? []
      : FINE_PRINT_ITEMS;
  const displayedItems = isExpanded
    ? sourceItems
    : sourceItems.slice(0, COLLAPSED_ITEMS);

  return (
    <section
      className="w-full mb-2 rounded-2xl border border-amber-200/60 bg-amber-50/50 p-3.5 md:p-5"
      data-testid="fine-print"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Info className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-lg font-bold text-[#1a1b4b]">
            Fine Print & Important Information
          </h2>
        </div>
      </div>

      {contentItems.length ? (
        <ul className="space-y-2 text-[#1a1b4b] text-[13px] md:text-[15px] leading-[140%] list-disc pl-5 marker:text-amber-600">
          {displayedItems.map((item, idx) => (
            <li key={idx} className="pl-1">
              {item}
            </li>
          ))}
        </ul>
      ) : html.trim() ? (
        <div className="mb-0">{renderRichText(html)}</div>
      ) : (
        <ul className="space-y-2 text-[#1a1b4b] text-[13px] md:text-[15px] leading-[140%] list-disc pl-5 marker:text-amber-600">
          {displayedItems.map((item, idx) => (
            <li key={idx} className="pl-1">
              {item}
            </li>
          ))}
        </ul>
      )}

      {sourceItems.length > COLLAPSED_ITEMS && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex ml-2 mt-3 items-center gap-1 text-pml-primary hover:text-pml-primary/80 text-[14px] font-semibold transition-colors"
          data-testid="fine-print-toggle"
        >
          {isExpanded ? (
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
    </section>
  );
}
