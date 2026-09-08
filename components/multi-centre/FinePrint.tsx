"use client";

import { useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { ChevronDown, ChevronUp } from "lucide-react";

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

  const getFinePrintItems = (rawHtml: string) => {
    const trimmed = (rawHtml || "").trim();
    if (!trimmed) return [] as string[];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed, "text/html");

      const liNodes = Array.from(doc.querySelectorAll("li"));
      if (liNodes.length > 0) {
        return liNodes.map((li) => (li.textContent || "").trim()).filter(Boolean);
      }

      const pNodes = Array.from(doc.querySelectorAll("p"));
      if (pNodes.length > 0) {
        return pNodes.map((p) => (p.textContent || "").trim()).filter(Boolean);
      }

      // fallback: split by <br> or newlines from body text
      const bodyText = doc.body.textContent || "";
      const parts = bodyText.split(/<br\s*\/?>|\r?\n/).map((s) => s.trim()).filter(Boolean);
      if (parts.length > 0) return parts;

      return [bodyText.trim()].filter(Boolean);
    } catch {
      return [] as string[];
    }
  };

  const renderRichText = (rawHtml: string) => {
    const safe = DOMPurify.sanitize(rawHtml || "", { USE_PROFILES: { html: true } });
    return (
      <div
        className="text-xs text-gray-500 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2"
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    );
  };

  const contentItems = getFinePrintItems(html);
  const sourceItems = contentItems.length ? contentItems : FINE_PRINT_ITEMS;
  const displayedItems = isExpanded ? sourceItems : sourceItems.slice(0, COLLAPSED_ITEMS);

  return (
    <section 
      className="w-full rounded-[8px] bg-[#FBE8F4] p-6 md:p-8"
      data-testid="fine-print"
    >
      <h2 className="text-[18px] md:text-[20px] font-bold text-pml-primary mb-4">
        Fine Print
      </h2>
      
      {contentItems.length ? (
        <ul className="space-y-2 text-[#595858] text-[13px] md:text-[16px] leading-[140%] font-[montserrat] list-disc pl-5">
          {displayedItems.map((item, idx) => (
            <li key={idx} className="text-[#595858]">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        html.trim() ? (
          <div className="mb-0">{renderRichText(html)}</div>
        ) : (
          <ul className="space-y-2 text-[#595858] text-[13px] md:text-[16px] leading-[140%] font-[montserrat] list-disc pl-5">
            {displayedItems.map((item, idx) => (
              <li key={idx} className="text-[#595858]">
                {item}
              </li>
            ))}
          </ul>
        )
      )}

      {sourceItems.length > COLLAPSED_ITEMS && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 inline-flex items-center gap-1 text-pml-primary text-[14px] font-semibold hover:underline transition-colors"
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