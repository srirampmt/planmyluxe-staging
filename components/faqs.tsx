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


export default function FAQs({ faqItems }: { faqItems?: FAQItem[] }) {
  if (!faqItems || faqItems.length === 0) return null;
  return (
    <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-white font-['Montserrat'] my-2 md:my-8">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
        <div className="w-full max-w-[1280px] mx-auto">
          {/* Title */}
          <h2 className="text-[#C8105B] text-[18px] md:text-[24px] lg:text-[24px] font-semibold mb-4 leading-[32px] max-w-[571px]">
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
                <AccordionTrigger className="text-[#4c4c4c] text-[16px] md:text-[20px] font-medium hover:no-underline">
                  {item.question}
                </AccordionTrigger>

                <AccordionContent className="text-[#666666] text-[12px] md:text-[14px] leading-relaxed pt-2 pb-4">
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