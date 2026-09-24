"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
  order?: number;
  active?: boolean;
}


export default function FAQs({ faqItems, sectionClassName = "my-2 md:my-8" }: { faqItems?: FAQItem[]; sectionClassName?: string }) {
  if (!faqItems || faqItems.length === 0) return null;
  return (
    <section className={`w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-white font-['Montserrat'] ${sectionClassName}`}>
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
        <div className="w-full max-w-[1280px] mx-auto">
          {/* Title */}
          <h2 className="font-['Montserrat'] text-[24px] md:text-[48px] font-semibold text-[#4c4c4c] leading-[30px] md:leading-[1.15] tracking-[-0.005em] mb-4">
            Frequently asked questions
          </h2>

          {/* Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-[#FBE8F4] rounded-[10px] px-6 border-0"
              >
                <AccordionTrigger className="text-[#1a1a1a] text-[15px] md:text-[16px] font-semibold hover:no-underline">
                  {item.question}
                </AccordionTrigger>

                <AccordionContent className="text-[#4c4c4c] text-[15px] md:text-[16px] leading-7 pt-2 pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}