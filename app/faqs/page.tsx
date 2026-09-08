import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Metadata } from "next";

interface FAQItem {
  question: string;
  answer: string;
  order?: number;
  active?: boolean;
}

const faqItems: FAQItem[] = [
    {
        question: "What is PlanMyLuxe?",
        answer: "PlanMyLuxe is a luxury holiday provider that offers exclusive 5-star holiday packages to destinations around the world. We specialize in creating unforgettable travel experiences tailored to your preferences and budget.",
    },
    {
        question: "How do I book a holiday with PlanMyLuxe?",
        answer: "Booking a holiday with PlanMyLuxe is easy! Simply browse our website for available packages, select your desired destination and dates, and follow the booking process. You can also contact our customer support team for assistance.",
    },
    {
        question: "What payment options are available?",
        answer: "We offer a variety of payment options to suit your needs, including credit/debit cards, bank transfers, and installment plans. Please visit our Payment Options page for more details.",
    },
    {
        question: "Can I customize my holiday package?",
        answer: "Yes! We offer flexible booking options that allow you to customize your holiday package according to your preferences. Contact our travel experts to discuss your requirements.",
    },
    {
        question: "What is your cancellation policy?",
        answer: "Our cancellation policy varies depending on the specific holiday package. Please refer to our Terms and Conditions or contact our customer support team for detailed information regarding cancellations and refunds.",
    },
];
export const metadata: Metadata = {
	title: "FAQs | Plan My Luxe Travel Questions Answered",
	description: "Find answers to common questions about bookings, payments, travel plans, cancellations and luxury holiday services.",
};
export default function FAQs() {
//   if (!faqItems || faqItems.length === 0) return null;
  return (
    <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-white font-['Montserrat'] my-2 md:my-8">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
        <div className="w-full max-w-[1280px] mx-auto">
          {/* Title */}
          <h2 className="text-[#C8105B] text-[18px] md:text-[24px] lg:text-[24px] font-semibold mb-4 leading-[32px] max-w-[571px]">
            Frequently asked questions
          </h2>

          {/* Description */}
          <p className="text-[#4c4c4c] text-[12px] md:text-[16px] lg:text-[16px] leading-[24px] mb-8 md:mb-10 lg:mb-12 max-w-[571px]">
            Find answers to some of the most commonly asked questions about booking
            your luxury holiday with PlanMyLuxe.
          </p>

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