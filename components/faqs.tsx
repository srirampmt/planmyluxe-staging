"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import DOMPurify from "isomorphic-dompurify";

interface FAQItem {
  question: string;
  answer: string;
  order?: number;
  active?: boolean;
}

type FAQsProps = {
  faqItems?: FAQItem[];
  sectionClassName?: string;
  variant?: "full" | "card";
  id?: string;
  title?: string;
  eyebrow?: string;
};

export default function FAQs({
  faqItems,
  sectionClassName = "my-2 md:my-8",
  variant = "full",
  id,
  title = "Frequently asked questions",
  eyebrow,
}: FAQsProps) {
  if (!faqItems || faqItems.length === 0) return null;
  const isCard = variant === "card";

  return (
    <section
      id={id}
      className={`relative bg-white font-['Montserrat'] ${
        isCard
          ? "scroll-mt-28 rounded-[8px] border border-gray-200/80 p-5 shadow-sm sm:p-6 md:p-8"
          : "left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] w-screen"
      } ${sectionClassName}`}
    >
      <div
        className={
          isCard
            ? "w-full"
            : "mx-auto w-full max-w-[1440px] px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]"
        }
      >
        <div className={isCard ? "w-full" : "mx-auto w-full max-w-[1280px]"}>
          {eyebrow ? (
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-pml-primary">
              {eyebrow}
            </p>
          ) : null}
          <h2
            className={`font-['Montserrat'] font-semibold tracking-[-0.005em] text-[#4c4c4c] ${
              isCard
                ? "mb-5 text-[24px] leading-[30px] md:text-[32px]"
                : "mb-4 text-[24px] leading-[30px] md:text-[48px] md:leading-[1.15]"
            }`}
          >
            {title}
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-[#FBE8F4] rounded-[8px] px-6 border-0"
              >
                <AccordionTrigger className="text-[#1a1a1a] text-[15px] md:text-[16px] font-semibold hover:no-underline">
                  {item.question}
                </AccordionTrigger>

                <AccordionContent className="text-[#4c4c4c] text-[15px] md:text-[16px] leading-7 pt-2 pb-4">
                  <div
                    className="[&_a]:font-semibold [&_a]:text-[#CB2187] [&_a]:underline [&_p:not(:last-child)]:mb-3"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(item.answer),
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}