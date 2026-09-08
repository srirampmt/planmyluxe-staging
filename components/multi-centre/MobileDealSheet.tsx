"use client";
import { useUtmPhone } from "@/components/utm/UtmPhoneProvider";

import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import EnquiryForm, { type EnquiryInitialValues } from "@/components/hotels/EnquiryForm";
import MobileEnquiryForm from "@/components/multi-centre/MobileEnquiryForm";
import { HotelDeal } from "@/types/hotel";
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
      quote_reference: initialValues?.quoteRef || "",
      // If a full hotel deal is provided use it, otherwise construct minimal multi-centre deal data
      deal_data_json: initialValues?.dealdata
        ? JSON.stringify(initialValues.dealdata)
        : initialValues?.selectedDate
          ? JSON.stringify({
            type: "multi-centre",
            checkInDate: initialValues.selectedDate,
            // basePrice should be the price excluding tax. Prefer explicit `basePrice`,
            // otherwise if `selectedPrice` appears to be a total use (selectedPrice - localTax).
            basePrice:
              initialValues.basePrice ??
              (initialValues.selectedPrice != null && typeof initialValues.localTax === "number"
                ? initialValues.selectedPrice - initialValues.localTax
                : initialValues.selectedPrice ?? null),
            localTax: initialValues.localTax ?? null,
            totalPrice:
              initialValues.totalPrice ??
              (initialValues.basePrice != null
                ? initialValues.basePrice + (initialValues.localTax ?? 0)
                : initialValues.selectedPrice != null && typeof initialValues.localTax === "number"
                  ? initialValues.selectedPrice
                  : null),
            resort: initialValues.resort,
            destinations: initialValues.destinations ?? null,
          })
          : null,
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
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[#CB2187]/30 px-4 py-3 z-[1002]">
          <button
            type="button"
            className="w-full bg-[#CB2187] hover:bg-pink-800 text-white font-semibold py-3 rounded-[8px] transition-all duration-200 text-[16px] disabled:opacity-60"
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
  enquiryInitialValues,
  taxPerNight,
  location,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: HotelDeal | null;
  enquiryInitialValues: EnquiryInitialValues;
  taxPerNight?: number;
  location?: string;
}) {
  const { phoneDisplay, phoneTel } = useUtmPhone();

  // Mobile-only render: keep desktop unchanged.
  const isHotelDeal = !!deal;

  // Hotel deal variables (only valid when isHotelDeal)
  const outbound = isHotelDeal ? formatDateTime(deal!.flight!.outboundDepartureDate) : undefined;
  const outboundArrival = isHotelDeal ? formatDateTime(deal!.flight!.outboundArrivalDate) : undefined;
  const inbound = isHotelDeal ? formatDateTime(deal!.flight!.inboundDepartureDate) : undefined;
  const inboundArrival = isHotelDeal ? formatDateTime(deal!.flight!.inboundArrivalDate) : undefined;

  const outboundFlightNumber = isHotelDeal ? `${formatAirline(deal!.flight!.outboundFlightSupplier)} - ${deal!.flight!.outboundFlightNumber}` : undefined;
  const inboundFlightNumber = isHotelDeal ? `${formatAirline(deal!.flight!.inboundFlightSupplier)} - ${deal!.flight!.inboundFlightNumber}` : undefined;

  const departureCode = isHotelDeal ? `${formatAirport(deal!.flight!.departureAirportCode)}` : undefined;
  const arrivalCode = isHotelDeal ? `${formatAirport(deal!.flight!.arrivalAirportCode)}` : undefined;

  const roundedBasePrice = isHotelDeal ? Math.round(getEffectivePrice(deal!)) : undefined;
  const pricePerPerson = isHotelDeal
    ? getPricePerPerson(roundedBasePrice! + Math.round(calculateTotalTax(deal!, taxPerNight, location)))
    : undefined;

  // Calculate breakdown for display (hotel)
  const priceBeforeTax = isHotelDeal ? roundedBasePrice : undefined;
  const totalTax = isHotelDeal ? calculateTotalTax(deal!, taxPerNight, location) : undefined;
  const priceBeforeTaxPerPerson = isHotelDeal ? getPricePerPerson(priceBeforeTax!) : undefined;
  const taxPerPerson = isHotelDeal ? getPricePerPerson(totalTax!) : undefined;
  const showTaxBreakdown = !!(totalTax && totalTax > 0);

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
          className="w-screen max-w-none h-screen overflow-y-auto bg-white z-[1001] p-0"
        >
          <SheetHeader className="sticky top-0 bg-white z-10 py-4 px-4 border-b">
            <SheetTitle className="flex items-center justify-between text-[16px] font-semibold text-pml-primary font-['Montserrat']">
              <span className="text-[16px] font-semibold">{enquiryInitialValues.resort}</span>
              <SheetClose aria-label="Close">
                <X size={20} className="cursor-pointer" />
              </SheetClose>
            </SheetTitle>
          </SheetHeader>

          <div className="px-2 py-2 space-y-4 font-['Montserrat']">
            {/* Luxury Themed Deal Summary */}
            {isHotelDeal ? (
              <div className=" rounded-[4px] bg-white border border-black/10 p-4 font-['Montserrat']">
                {!!deal!.hotel.boardBasis && (
                  <div className="flex items-center justify-between text-black text-[15px] leading-[24px] font-normal border-b border-black/10 pb-2 font-['Montserrat']">
                    <div className="flex items-center gap-1">
                      <span className="p-1 inline-flex items-center justify-center w-7 h-7">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.4063 2.1875L17.4053 17.2012C17.6741 17.6436 17.9522 17.8136 18.1854 17.8125C18.4168 17.8114 18.6919 17.6393 18.9555 17.2102L18.2357 9.5418L18.2273 9.4484L18.2849 9.37394C19.112 8.31266 19.4011 6.4791 19.1651 4.92824C19.0471 4.15277 18.8002 3.4509 18.4544 2.95473C18.1644 2.53863 17.8184 2.2732 17.4064 2.1875H17.4063ZM2.86043 2.18766L2.8598 4.8098L2.36918 4.80918V2.18781H1.81039L1.81047 4.8093H1.31914V2.18781H0.75V6.22016C0.749961 6.66613 0.993359 6.91344 1.37656 7.06633L1.53516 7.12969L1.53164 7.30039C1.45352 10.6039 1.37629 13.9074 1.29875 17.2109C1.56594 17.648 1.84039 17.8136 2.06891 17.8125C2.29742 17.8114 2.57164 17.6415 2.83543 17.2097C2.745 13.9071 2.65457 10.6044 2.5643 7.30172L2.55961 7.12984L2.71871 7.06711C3.12199 6.90672 3.3843 6.63453 3.3843 6.22039V2.18766H2.86043ZM10.0005 3.71094C8.33258 3.71094 6.73294 4.37353 5.55351 5.55296C4.37408 6.73239 3.71148 8.33204 3.71148 10C3.71148 11.668 4.37408 13.2676 5.55351 14.447C6.73294 15.6265 8.33258 16.2891 10.0005 16.2891C11.6685 16.2891 13.2682 15.6265 14.4476 14.447C15.627 13.2676 16.2896 11.668 16.2896 10C16.2896 8.33204 15.627 6.73239 14.4476 5.55296C13.2682 4.37353 11.6685 3.71094 10.0005 3.71094Z" fill="#CB2187" />
                        </svg>
                      </span>
                      <span className="font-medium text-[#CB2187] font-['Montserrat']">{getBoardBasisText(deal!.hotel.boardBasis)}</span>
                    </div>

                    <span className="font-bold text-[#595858] text-[16px] font-['Montserrat'] tracking-wide">{formatNights(deal!.hotel.duration ?? deal!.hotel.nights ?? 0)}</span>
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
              </div>
            ) : (
              <div className="rounded-[4px] bg-white border border-black/10 p-5 font-['Montserrat']">
                <div className="flex justify-between items-start">

                  {/* LEFT SIDE */}
                  <div className="flex flex-col">
                    <span className="text-[15px] font-semibold text-[#595858]">
                      Price Per Person
                    </span>
                    <span className="text-[12px] text-[#CB2187] font-medium mt-1">
                      (Flights Included)
                    </span>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="flex flex-col items-end">

                    {/* Main Price */}
                    <div>
                      {enquiryInitialValues?.selectedPrice ? (
                        <div className="flex items-baseline gap-1">
                          <div className="flex items-end justify-end text-[12px] pr-1 font-medium leading-[14px] text-pml-primary mb-1">
                            <span>from</span>
                          </div>
                          <span className="text-[26px] font-extrabold text-[#CB2187]">
                            £{Math.round(enquiryInitialValues.selectedPrice)}
                          </span>
                          <span className="text-[14px] font-bold text-[#595858]">
                            PP
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-pml-primary font-bold">
                          Select a Date to View the Deal Price
                        </span>
                      )}
                    </div>

                    {/* Tax Breakdown */}
                    {enquiryInitialValues?.selectedPrice && typeof enquiryInitialValues.localTax === "number" && enquiryInitialValues.localTax > 0 && (
                      <div className="text-[13px] text-[#7A7A7A] mt-1">
                        {(() => {
                          const base =
                            enquiryInitialValues.basePrice ??
                            (typeof enquiryInitialValues.totalPrice === "number" &&
                              typeof enquiryInitialValues.localTax === "number"
                              ? enquiryInitialValues.totalPrice -
                              enquiryInitialValues.localTax
                              : null);

                          const localTax =
                            typeof enquiryInitialValues.localTax === "number"
                              ? enquiryInitialValues.localTax
                              : null;

                          if (base == null) return null;

                          return (
                            <>
                              £{Math.round(base)}
                              {localTax != null && (
                                <>
                                  {" + "}
                                  £{Math.round(localTax)} (Local tax)
                                </>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Enquiry Form with sticky submit button */}
            <MobileEnquiryFormWrapper
              initialValues={enquiryInitialValues}
              onClose={() => handleSheetOpenChange(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
