"use client";
import { useUtmPhone } from "@/components/utm/UtmPhoneProvider";

import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import EnquiryForm, { type EnquiryInitialValues } from "./EnquiryForm";
import MobileEnquiryForm from "./MobileEnquiryForm";
import { HotelDeal, StaticPricingSeason } from "@/types/hotel";
import {
  formatAirline,
  formatAirport,
  formatDateTime,
  formatNights,
  getBoardBasisText,
  getEffectivePrice,
  calculateTotalTax,
  getPricePerPerson,
} from "@/lib/hotel-utils";
import { createIdempotencyKey } from "@/lib/clientIdempotency";
import { sanitizeEnquirySource } from "@/lib/source-builder";
import { markThankyouUrl, restoreThankyouUrl } from "@/lib/thankyou-url";
import { getSubmissionUtmParams } from "@/lib/utm-client";
import { MessageCircle, PhoneCall, X } from "lucide-react";
// MobileEnquiryFormWrapper wires up form state and sticky submit button for mobile
import { useState, useMemo, useEffect } from "react";
function MobileEnquiryFormWrapper({ initialValues, onClose }: { initialValues?: EnquiryInitialValues; onClose?: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fields, setFields] = useState({
    fullName: { value: initialValues?.fullName ?? "", touched: false, focused: false },
    contactNumber: { value: initialValues?.contactNumber ?? "", touched: false, focused: false },
    email: { value: initialValues?.email ?? "", touched: false, focused: false },
    message: { value: initialValues?.message ?? "", touched: false, focused: false },
  });
  useEffect(() => {
    setSubmitted(false);
    setSubmitError("");
    setSubmitting(false);
    // Do not reset fields here to avoid resetting on every initialValues change
  }, [initialValues]);
  const errors = useMemo(() => {
    const fullName = fields.fullName.value.trim();
    const contactNumber = fields.contactNumber.value.trim();
    const email = fields.email.value.trim();
    return {
      fullName: fullName ? "" : "Full name is required.",
      contactNumber: contactNumber ? (contactNumber.replace(/\D/g, "").length === 11 ? "" : "Contact number must be exactly 11 digits.") : "Contact number is required.",
      email: email ? (/^[^\s@]+@[^-\s@]+\.[^\s@]+$/.test(email) ? "" : "Please enter a valid email address.") : "Email address is required.",
      message: "",
    };
  }, [fields]);
  const canSubmit = useMemo(() => !errors.fullName && !errors.contactNumber && !errors.email, [errors]);
  const setValue = (name: keyof typeof fields, value: string) => setFields((prev) => ({ ...prev, [name]: { ...prev[name], value } }));
  const setFocused = (name: keyof typeof fields, focused: boolean) => setFields((prev) => ({ ...prev, [name]: { ...prev[name], focused } }));
  const setTouched = (name: keyof typeof fields) => setFields((prev) => ({ ...prev, [name]: { ...prev[name], touched: true } }));
  const showError = (name: keyof typeof fields) => fields[name].touched && !!errors[name];

  const handleSubmit = async () => {
    if (submitting) return;
    (Object.keys(fields) as Array<keyof typeof fields>).forEach((k) => setTouched(k));
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError("");
    // Compose enquiryText
    const message = fields.message.value.trim();
    const enquiryTextFinal = message.trim() || "General enquiry";
    const utm = getSubmissionUtmParams();
    // Compose payload for JSON submission
    const payload: Record<string, any> = {
      firstName: fields.fullName.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.contactNumber.value.trim(),
      enquiry: enquiryTextFinal,
      enquiry_source: sanitizeEnquirySource(initialValues?.source),
      badge_text: sanitizeEnquirySource(initialValues?.source),
      quote_reference: initialValues?.quoteRefForSubmit || initialValues?.quoteRef || "",
      deal_data_json: initialValues?.dealdata || null,
      ...utm,
    };
    try {
      const res = await fetch("/api/submit-enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": createIdempotencyKey("submit-enquiry"),
        },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null));
      if (!res.ok || !data?.success) {
        setSubmitError(data?.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
      markThankyouUrl();
    } catch {
      setSubmitError("Failed to send enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  // Sticky footer submit button
  return (
    <>
      <MobileEnquiryForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitError={submitError}
        submitted={submitted}
        onClose={onClose}
        fields={fields}
        setValue={setValue}
        setFocused={setFocused}
        setTouched={setTouched}
        errors={errors}
        showError={showError}
        canSubmit={canSubmit}
      />
      {!submitted && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-pml-primary/15 px-4 py-3 z-[1002] shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          <button
            type="button"
            className="w-full bg-pml-primary hover:bg-[#a81a6f] hover:shadow-lg text-white font-bold py-3 rounded-2xl shadow-md transition-all duration-200 active:scale-[0.98] text-[16px] disabled:opacity-60"
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting…" : "Submit enquiry"}
          </button>
        </div>
      )}
    </>
  );
}


export default function MobileDealSheet({
  open,
  onOpenChange,
  deal,
  seasonInfo,
  enquiryInitialValues,
  taxPerNight,
  location,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: HotelDeal | null;
  seasonInfo?: StaticPricingSeason | null;
  enquiryInitialValues: EnquiryInitialValues;
  taxPerNight?: number;
  location?: string;
}) {
  const { phoneDisplay, phoneTel } = useUtmPhone();

  // Mobile-only render: keep desktop unchanged.
  if (!deal && !seasonInfo) return null;

  const roundedBasePrice = deal ? Math.round(getEffectivePrice(deal)) : null;
  const totalTax = deal ? calculateTotalTax(deal, taxPerNight, location) : 0;
  const pricePerPerson = deal
    ? getPricePerPerson(roundedBasePrice! + Math.round(totalTax))
    : null;

  // Calculate breakdown for display
  const priceBeforeTax = roundedBasePrice;
  const priceBeforeTaxPerPerson = priceBeforeTax != null ? getPricePerPerson(priceBeforeTax) : null;
  const taxPerPerson = getPricePerPerson(totalTax);
  const showTaxBreakdown = totalTax > 0;

  const handleSheetOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      restoreThankyouUrl();
    }
  };

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side="right"
          className="w-screen max-w-none h-screen overflow-y-auto bg-[#FAF3F8] z-[1001] p-0"
        >
          <SheetHeader className="sticky top-0 bg-white z-10 py-4 px-4 border-b shadow-sm">
            <SheetTitle className="flex items-center justify-between text-[16px] font-bold text-pml-primary font-['Montserrat']">
              <span className="text-[16px] font-bold">{enquiryInitialValues.resort}</span>
              <SheetClose aria-label="Close" className="rounded-full p-1 hover:bg-pml-primary/10">
                <X size={20} className="cursor-pointer" />
              </SheetClose>
            </SheetTitle>
          </SheetHeader>

          <div className="px-2 py-2 space-y-4 font-['Montserrat']">
            {/* Luxury Themed Deal Summary */}
            <div className="rounded-2xl bg-white shadow-xl shadow-pml-primary/5 p-4 font-['Montserrat']">
              {deal ? (
                <>
                  {!!deal.hotel.boardBasis && (
                    <div className="flex items-center justify-between text-black text-[15px] leading-[24px] font-normal border-b border-black/10 pb-2 font-['Montserrat']">
                      <div className="flex items-center gap-1">
                        <span className="p-1 inline-flex items-center justify-center w-7 h-7">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.4063 2.1875L17.4053 17.2012C17.6741 17.6436 17.9522 17.8136 18.1854 17.8125C18.4168 17.8114 18.6919 17.6393 18.9555 17.2102L18.2357 9.5418L18.2273 9.4484L18.2849 9.37394C19.112 8.31266 19.4011 6.4791 19.1651 4.92824C19.0471 4.15277 18.8002 3.4509 18.4544 2.95473C18.1644 2.53863 17.8184 2.2732 17.4064 2.1875H17.4063ZM2.86043 2.18766L2.8598 4.8098L2.36918 4.80918V2.18781H1.81039L1.81047 4.8093H1.31914V2.18781H0.75V6.22016C0.749961 6.66613 0.993359 6.91344 1.37656 7.06633L1.53516 7.12969L1.53164 7.30039C1.45352 10.6039 1.37629 13.9074 1.29875 17.2109C1.56594 17.648 1.84039 17.8136 2.06891 17.8125C2.29742 17.8114 2.57164 17.6415 2.83543 17.2097C2.745 13.9071 2.65457 10.6044 2.5643 7.30172L2.55961 7.12984L2.71871 7.06711C3.12199 6.90672 3.3843 6.63453 3.3843 6.22039V2.18766H2.86043ZM10.0005 3.71094C8.33258 3.71094 6.73294 4.37353 5.55351 5.55296C4.37408 6.73239 3.71148 8.33204 3.71148 10C3.71148 11.668 4.37408 13.2676 5.55351 14.447C6.73294 15.6265 8.33258 16.2891 10.0005 16.2891C11.6685 16.2891 13.2682 15.6265 14.4476 14.447C15.627 13.2676 16.2896 11.668 16.2896 10C16.2896 8.33204 15.627 6.73239 14.4476 5.55296C13.2682 4.37353 11.6685 3.71094 10.0005 3.71094Z" fill="#CB2187" />
                          </svg>
                        </span>
                        <span className="font-medium text-[#CB2187] font-['Montserrat']">{getBoardBasisText(deal.hotel.boardBasis)}</span>
                      </div>

                      <span className="font-bold text-[#595858] text-[16px] font-['Montserrat'] tracking-wide">{formatNights(deal.hotel.duration ?? deal.hotel.nights ?? 0)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-start border-t border-black/10 pt-3">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-semibold text-[#595858] font-['Montserrat']">
                        Price Per Person
                      </span>
                      <span className="text-[10px] text-[#CB2187] font-medium">(Flights Included)</span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-end justify-end text-[22px] font-extrabold text-[#CB2187] font-['Montserrat'] tracking-wide leading-tight">
                        <div className="flex items-end justify-end text-[12px] pr-1 font-medium leading-[14px] text-pml-primary mb-1">
                          <span>from</span>
                        </div>
                        {pricePerPerson}<span className="text-[14px] font-bold text-[#595858]"> PP</span>
                      </div>
                      {showTaxBreakdown && (
                        <div className="text-[12px] text-[#6B6B6B] mt-1">
                          {priceBeforeTaxPerPerson} + {taxPerPerson} (Local tax)
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : seasonInfo ? (
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-semibold text-[#595858] font-['Montserrat']">
                      {seasonInfo.name}
                    </span>
                    <span className="text-[10px] text-[#CB2187] font-medium">{seasonInfo.dates}</span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-end justify-end text-[22px] font-extrabold text-[#CB2187] font-['Montserrat'] tracking-wide leading-tight">
                      <div className="flex items-end justify-end text-[12px] pr-1 font-medium leading-[14px] text-pml-primary mb-1">
                        <span>from</span>
                      </div>
                      £{seasonInfo.price}<span className="text-[14px] font-bold text-[#595858]"> PP</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Mobile Enquiry Form with sticky submit button */}
            <MobileEnquiryFormWrapper
              initialValues={enquiryInitialValues}
              onClose={() => handleSheetOpenChange(false)}
            />
            {/* <div className="text-[12px] text-[#595858] text-center">
              Need help sooner? Call{" "}
              <a className="underline" href={`tel:${phoneTel}`}>
                {phoneDisplay}
              </a>
              <span className="mx-1"> or </span>
              <a
                className="inline-flex items-center gap-1 underline"
                href="https://wa.me/442037400744?text=Hello%20there"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-current text-[#595858]"
                  aria-hidden="true"
                >
                  <path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c7.905 4.27 17.661-1.4 17.665-10.449 0-3.176-1.24-6.165-3.495-8.402ZM22.002 11.866c-.006 7.633-8.385 12.4-15.012 8.504l-.36-.214-3.75.975 1.005-3.645-.239-.375C-.478 10.546 4.26 1.966 12.072 1.966c2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99Z" />
                  <path d="M17.507 14.307c-2.199-1.096-2.429-1.242-2.713-.816-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.293-.506.32-.578.878-1.634.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.576-.05-.997-.042-1.368.344-1.614 1.774-1.207 3.604.174 5.55 2.714 3.552 4.16 4.206 6.804 5.114.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345Z" />
                </svg>
                <span>WhatsApp</span>
              </a>
            </div> */}

          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
