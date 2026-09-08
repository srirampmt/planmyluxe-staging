"use client";
import { useUtmPhone } from "@/components/utm/UtmPhoneProvider";
import { type EnquiryInitialValues } from "./EnquiryForm";
import { sanitizeEnquirySource } from "@/lib/source-builder";
import { MessageCircle, PhoneCall } from "lucide-react";
import { attachCurrentPageToWhatsAppHref, getWhatsAppUrl } from "@/lib/utils";

export default function MobileEnquiryForm({
  initialValues,
  onSubmit,
  submitting,
  submitError,
  submitted,
  onClose,
  fields,
  setValue,
  setFocused,
  setTouched,
  errors,
  showError,
  canSubmit,
}: {
  initialValues?: EnquiryInitialValues;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string;
  submitted: boolean;
  onClose?: () => void;
  fields: any;
  setValue: any;
  setFocused: any;
  setTouched: any;
  errors: any;
  showError: any;
  canSubmit: boolean;
}) {
  const { phoneDisplay, phoneTel } = useUtmPhone();
  const whatsappSource = sanitizeEnquirySource(initialValues?.source, "");
  const whatsappContextLine = initialValues?.quoteRefForWhatsApp || initialValues?.quoteRef || undefined;

  // No quoteRef field, reduced input heights, sticky submit button
  return (
    <div className="bg-[#FBF3F8] rounded-2xl p-3 pb-24">
      {submitted ? (
        <div className="rounded-2xl border-2 border-green-500 bg-green-50 p-5 shadow-md text-[#4C4C4C]">
          <div className="font-semibold">Message sent!</div>
          <div className="text-sm mt-1">Thank you for your enquiry. We’ll be in touch shortly.</div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full bg-pml-primary hover:bg-[#a81a6f] hover:shadow-lg text-white font-bold py-3 rounded-2xl shadow-md transition-all duration-200 active:scale-[0.98] text-[16px]"
            >
              Close
            </button>
          ) : null}
        </div>
      ) : (
        <form className="space-y-3" onSubmit={e => { e.preventDefault(); onSubmit(); }}>
          {submitError ? (
            <div className="rounded-xl border-2 border-red-500 bg-red-50 p-3 text-[13px] text-red-700 shadow-sm">
              {submitError}
            </div>
          ) : null}
          <div>
            <input
              type="text"
              placeholder="Full name"
              className={`w-full bg-white px-3 py-2 text-[14px] outline-none border-2 rounded-xl transition-colors ${fields.fullName.focused ? "border-blue-600" : fields.fullName.touched && errors.fullName ? "border-red-600" : fields.fullName.touched && !errors.fullName && fields.fullName.value.trim() ? "border-green-600" : "border-[#9F9F9F]"}`}
              value={fields.fullName.value}
              onChange={(e) => setValue("fullName", e.target.value)}
              onFocus={() => setFocused("fullName", true)}
              onBlur={() => {
                setFocused("fullName", false);
                setTouched("fullName");
              }}
            />
            {showError("fullName") && (
              <div className="mt-2 inline-block bg-red-600 text-white text-[12px] px-3 py-2 rounded-lg">
                {errors.fullName}
              </div>
            )}
          </div>
          <div>
            <input
              type="tel"
              placeholder="Contact number"
              className={`w-full bg-white px-3 py-2 text-[14px] outline-none border-2 rounded-xl transition-colors ${fields.contactNumber.focused ? "border-blue-600" : fields.contactNumber.touched && errors.contactNumber ? "border-red-600" : fields.contactNumber.touched && !errors.contactNumber && fields.contactNumber.value.trim() ? "border-green-600" : "border-[#9F9F9F]"}`}
              value={fields.contactNumber.value}
              onChange={(e) => setValue("contactNumber", e.target.value)}
              onFocus={() => setFocused("contactNumber", true)}
              onBlur={() => {
                setFocused("contactNumber", false);
                setTouched("contactNumber");
              }}
            />
            {showError("contactNumber") && (
              <div className="mt-2 inline-block bg-red-600 text-white text-[12px] px-3 py-2 rounded-lg">
                {errors.contactNumber}
              </div>
            )}
          </div>
          <div>
            <input
              type="email"
              placeholder="Email address"
              className={`w-full bg-white px-3 py-2 text-[14px] outline-none border-2 rounded-xl transition-colors ${fields.email.focused ? "border-blue-600" : fields.email.touched && errors.email ? "border-red-600" : fields.email.touched && !errors.email && fields.email.value.trim() ? "border-green-600" : "border-[#9F9F9F]"}`}
              value={fields.email.value}
              onChange={(e) => setValue("email", e.target.value)}
              onFocus={() => setFocused("email", true)}
              onBlur={() => {
                setFocused("email", false);
                setTouched("email");
              }}
            />
            {showError("email") && (
              <div className="mt-2 inline-block bg-red-600 text-white text-[12px] px-3 py-2 rounded-lg">
                {errors.email}
              </div>
            )}
          </div>
          <div>
            <textarea
              placeholder="Message (optional)"
              rows={3}
              className={`w-full bg-white px-3 py-2 text-[14px] outline-none border-2 rounded-xl transition-colors resize-none ${fields.message.focused ? "border-blue-600" : fields.message.touched && errors.message ? "border-red-600" : fields.message.touched && !errors.message && fields.message.value.trim() ? "border-green-600" : "border-[#9F9F9F]"}`}
              value={fields.message.value}
              onChange={(e) => setValue("message", e.target.value)}
              onFocus={() => setFocused("message", true)}
              onBlur={() => {
                setFocused("message", false);
                setTouched("message");
              }}
            />
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-2 md:gap-3">
              <a
                href={`tel:${phoneTel}`}
                className="inline-flex min-w-0 items-center justify-center gap-1.5 md:gap-2 rounded-2xl border-2 border-pml-primary/30 bg-white px-2 md:px-4 py-2.5 md:py-3 text-[13px] md:text-[15px] font-bold text-pml-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-pml-primary/5 active:scale-95"
                aria-label={`Call ${phoneDisplay}`}
              >
                <PhoneCall className="h-5 w-5 text-pml-primary" />
                <span className="truncate text-pml-primary">{phoneDisplay}</span>
              </a>
  
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
        </form>
      )}
    </div>
  );
}
