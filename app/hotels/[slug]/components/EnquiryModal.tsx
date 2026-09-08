"use client";
import EnquiryForm, { type EnquiryInitialValues } from "./EnquiryForm";
import { useCallback, useEffect } from "react";
import PhoneNumber from "@/components/utm/PhoneNumber";
import { sanitizeEnquirySource } from "@/lib/source-builder";
import { MessageCircle, PhoneCall, X } from "lucide-react";
import { restoreThankyouUrl } from "@/lib/thankyou-url";
import { attachCurrentPageToWhatsAppHref, getWhatsAppUrl } from "@/lib/utils";

type EnquiryModalProps = {
  open: boolean;
  onClose: () => void;
  initialValues?: EnquiryInitialValues;
};
export default function EnquiryModal({ open, onClose, initialValues }: EnquiryModalProps) {
  const whatsappSource = sanitizeEnquirySource(initialValues?.source, "");
  const whatsappContextLine = initialValues?.quoteRefForWhatsApp || initialValues?.quoteRef || undefined;
  const handleClose = useCallback(() => {
    restoreThankyouUrl();
    onClose();
  }, [onClose]);

  // ESC + body scroll lock
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, handleClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close enquiry"
        className="absolute inset-0 bg-black/60"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[560px] max-h-[calc(100vh-2rem)] bg-[#FFFFFF] rounded-2xl overflow-hidden shadow-2xl font-['Montserrat'] flex flex-col"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#4C4C4C] shadow-md hover:bg-white transition-transform duration-200 hover:scale-105"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 md:p-7">
          <div className="pr-10">
            <div className="text-pml-primary text-[24px] md:text-[30px] font-extrabold tracking-tight leading-tight">
              Contact a Luxury Advisor
            </div>
            <div className="mt-2 text-[#595858] text-[14px] md:text-[16px]">
              Call, WhatsApp, or send an enquiry. We’ll get back to you.
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 md:gap-3">
            <PhoneNumber>
              {({ phoneDisplay, phoneTel }) => (
                <a
                  href={`tel:${phoneTel}`}
                  className="inline-flex min-w-0 items-center justify-center gap-1.5 md:gap-2 rounded-2xl border-2 border-pml-primary/30 bg-white px-2 md:px-4 py-2.5 md:py-3 text-[13px] md:text-[15px] font-bold text-pml-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-pml-primary/5 active:scale-95"
                  aria-label={`Call ${phoneDisplay}`}
                >
                  <PhoneCall className="h-5 w-5 text-pml-primary" />
                  <span className="truncate text-pml-primary">{phoneDisplay}</span>
                </a>
              )}
            </PhoneNumber>

            <a
              href={getWhatsAppUrl({
                source: whatsappSource,
                contextLine: whatsappContextLine,
              })}
              onClick={(event) =>
                attachCurrentPageToWhatsAppHref(event, {
                  source: whatsappSource,
                  contextLine: whatsappContextLine,
                })
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-0 items-center justify-center gap-1.5 md:gap-2 rounded-2xl bg-[#25D366] px-2 md:px-4 py-2.5 md:py-3 text-[13px] md:text-[15px] font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
              aria-label="Chat on WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="sm:hidden">WhatsApp</span>
              <span className="hidden sm:inline">Chat on WhatsApp</span>
            </a>
          </div>

          <div className="mt-4">
            <EnquiryForm
              initialValues={initialValues}
              onClose={handleClose}
              showQuickHelp={false}
              messageRows={3}
              containerClassName="bg-white rounded-2xl p-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
