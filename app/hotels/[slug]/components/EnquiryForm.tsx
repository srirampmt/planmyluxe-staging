"use client";

import { HotelDeal } from "@/types/hotel";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useUtmPhone } from "@/components/utm/UtmPhoneProvider";
import { createIdempotencyKey } from "@/lib/clientIdempotency";
import { sanitizeEnquirySource } from "@/lib/source-builder";
import { markThankyouUrl } from "@/lib/thankyou-url";
import { appendUtmParamsToFormData, getSubmissionUtmParams } from "@/lib/utm-client";
import { attachCurrentPageToWhatsAppHref, getWhatsAppUrl } from "@/lib/utils";

export type EnquiryInitialValues = {
  fullName?: string;
  contactNumber?: string;
  email?: string;
  destination?: string;
  destinations?: string[];
  resort?: string;
  quoteRef?: string;
  source?: string;
  message?: string;
  // Value actually sent as quote_reference on submit; falls back to quoteRef.
  // Lets non-API deals carry a backend trace marker (e.g. "STATIC-DEAL") without
  // that marker leaking into the visible "Quote Ref:" line, WhatsApp context, or enquiry text.
  quoteRefForSubmit?: string;
  // Short-code trace marker (e.g. "SD"/"MCAL") used only in the WhatsApp message context line.
  quoteRefForWhatsApp?: string;
  dealdata?: HotelDeal | null;
  selectedDate?: string;
  selectedPrice?: number | null;
};

type FieldName =
  | "fullName"
  | "contactNumber"
  | "email"
  | "destination"
  | "resort"
  | "source"
  | "message";

type FieldState = {
  value: string;
  touched: boolean;
  focused: boolean;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11;
}

export default function EnquiryForm({
  initialValues,
  onClose,
  showQuickHelp = true,
  containerClassName = "bg-white rounded-2xl p-4",
  messageRows = 4,
}: {
  initialValues?: EnquiryInitialValues;
  onClose?: () => void;
  showQuickHelp?: boolean;
  containerClassName?: string;
  messageRows?: number;
}) {
  const { phoneDisplay, phoneTel } = useUtmPhone();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const [fields, setFields] = useState<Record<FieldName, FieldState>>({
    fullName: { value: initialValues?.fullName ?? "", touched: false, focused: false, },
    contactNumber: { value: initialValues?.contactNumber ?? "", touched: false, focused: false, },
    email: { value: initialValues?.email ?? "", touched: false, focused: false },
    destination: { value: initialValues?.destination ?? "", touched: false, focused: false, },
    resort: { value: initialValues?.resort ?? "", touched: false, focused: false },
    source: { value: initialValues?.source ?? "", touched: false, focused: false },
    message: { value: initialValues?.message ?? "", touched: false, focused: false },
  });

  // Reset when initialValues change (e.g. different deal/date in sheet)
  useEffect(() => {
    setSubmitted(false);
    setSubmitError("");
    setSubmitting(false);
    setFields({
      fullName: { value: initialValues?.fullName ?? "", touched: false, focused: false, },
      contactNumber: { value: initialValues?.contactNumber ?? "", touched: false, focused: false, },
      email: { value: initialValues?.email ?? "", touched: false, focused: false },
      destination: { value: initialValues?.destination ?? "", touched: false, focused: false, },
      resort: { value: initialValues?.resort ?? "", touched: false, focused: false, },
      source: { value: initialValues?.source ?? "", touched: false, focused: false, },
      message: { value: initialValues?.message ?? "", touched: false, focused: false, },
    });
  }, [ initialValues?.fullName, initialValues?.contactNumber, initialValues?.email, initialValues?.destination, initialValues?.resort, initialValues?.source, initialValues?.message, initialValues?.quoteRef, ]);

  const errors = useMemo(() => {
    const fullName = fields.fullName.value.trim();
    const contactNumber = fields.contactNumber.value.trim();
    const email = fields.email.value.trim();

    return {
      fullName: fullName ? "" : "Full name is required.",
      contactNumber: contactNumber
        ? isValidPhone(contactNumber)
          ? ""
          : "Contact number must be exactly 11 digits."
        : "Contact number is required.",
      email: email
        ? isValidEmail(email)
          ? ""
          : "Please enter a valid email address."
        : "Email address is required.",
      destination: "",
      resort: "",
      source: "",
      message: "",
    };
  }, [fields]);

  const canSubmit = useMemo(() => {
    return !errors.fullName && !errors.contactNumber && !errors.email;
  }, [errors]);
  const whatsappSource = sanitizeEnquirySource(fields.source.value || initialValues?.source, "");
  const whatsappContextLine = initialValues?.quoteRefForWhatsApp || initialValues?.quoteRef || undefined;

  const setValue = (name: FieldName, value: string) => {
    setFields((prev) => ({
      ...prev,
      [name]: { ...prev[name], value },
    }));
  };

  const setFocused = (name: FieldName, focused: boolean) => {
    setFields((prev) => ({
      ...prev,
      [name]: { ...prev[name], focused },
    }));
  };

  const setTouched = (name: FieldName) => {
    setFields((prev) => ({
      ...prev,
      [name]: { ...prev[name], touched: true },
    }));
  };

  const getBorderClass = (name: FieldName) => {
    const state = fields[name];
    const err = (errors as any)[name] as string;

    if (state.focused) return "border-blue-600";
    if (state.touched && err) return "border-red-600";
    if (state.touched && !err && state.value.trim()) return "border-green-600";
    return "border-[#9F9F9F]";
  };

  const showError = (name: FieldName) => {
    return fields[name].touched && !!(errors as any)[name];
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (submitting) return;

    (Object.keys(fields) as FieldName[]).forEach((k) => setTouched(k));

    if (!canSubmit) return;

    setSubmitting(true);
    setSubmitError("");

    const utm = getSubmissionUtmParams();

    const destination = fields.destination.value.trim();
    const resort = fields.resort.value.trim();
    const message = fields.message.value.trim();

    // Handle destinations array for multi-centre pages
    const destinationsText = initialValues?.destinations && initialValues.destinations.length > 0
      ? `Destinations: ${initialValues.destinations.join(", ")}`
      : destination ? `Destination: ${destination}` : "";

    const enquiryText =
      message ||
      [
        destinationsText,
        resort ? `Resort: ${resort}` : "",
        initialValues?.quoteRef ? `Quote Ref: ${initialValues.quoteRef}` : "",
      ]
        .filter(Boolean)
        .join("\n");

    const enquiryTextFinal = enquiryText.trim() || "General enquiry";

    const form = new FormData();
    form.set("firstName", fields.fullName.value.trim());
    form.set("email", fields.email.value.trim());
    form.set("phone", fields.contactNumber.value.trim());
    form.set("enquiry", enquiryTextFinal);

    const sourceValue = sanitizeEnquirySource(fields.source.value);
    form.set("enquiry_source", sourceValue);
    form.set("badge_text", sourceValue);
    form.set("quote_reference", initialValues?.quoteRefForSubmit ?? initialValues?.quoteRef ?? "");

    // For multi-centre enquiries, set destination field to match backend expectations
    if (initialValues?.destinations && initialValues.destinations.length > 0) {
      form.set("destination", initialValues.destinations.join(", "));
      // For multi-centre, set resort to indicate it's a multi-centre package
      form.set("resort", "Multi-Centre Package");
    } else if (initialValues?.destination) {
      form.set("destination", initialValues.destination);
      if (initialValues?.resort) {
        form.set("resort", initialValues.resort);
      }
    }

    if (initialValues?.dealdata) {
      try {
        const dealData = { ...initialValues.dealdata };
        // Add selected date and price to deal data for multi-centre enquiries
        if (initialValues?.selectedDate) {
          dealData.hotel.checkInDate = initialValues.selectedDate;
        }
        if (initialValues?.selectedPrice !== null && initialValues?.selectedPrice !== undefined) {
          dealData.totalPrice = initialValues.selectedPrice;
        }
        form.set("deal_data_json", JSON.stringify(dealData));
      } catch {
        // ignore serialization issues
      }
    } else if (initialValues?.selectedDate) {
      // For multi-centre enquiries without existing deal data, create a minimal deal data object
      try {
        const dealData: any = {
          type: "multi-centre",
          destinations: initialValues.destinations,
        };
        if (initialValues?.selectedDate) {
          dealData.checkInDate = initialValues.selectedDate;
        }
        if (initialValues?.selectedPrice !== null && initialValues?.selectedPrice !== undefined) {
          dealData.totalPrice = initialValues.selectedPrice;
        }
        form.set("deal_data_json", JSON.stringify(dealData));
      } catch {
        // ignore serialization issues
      }
    }

    appendUtmParamsToFormData(form, utm);

    try {
      const res = await fetch("/api/submit-enquiry", {
        method: "POST",
        headers: {
          "Idempotency-Key": createIdempotencyKey("submit-enquiry"),
        },
        body: form,
      });

      const data = (await res.json().catch(() => null)) as any;
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

  return (
    <div className={containerClassName}>
      <div className="flex items-center justify-between text-[#4C4C4C] text-[14px] font-semibold mb-3">
        Contact details
        {/* {fields.source.value ? (
          <span className="bg-[#FFE6A9] text-[#9A6B00] text-[12px] font-medium px-2 py-0.5 rounded max-w-[160px] truncate inline-block">
            {fields.source.value}
          </span>
        ) : null} */}
      </div>

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
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError ? (
            <div className="rounded-xl border-2 border-red-500 bg-red-50 p-3 text-[13px] text-red-700 shadow-sm">
              {submitError}
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Full name"
                className={`w-full bg-white px-3 py-3 text-[14px] outline-none rounded-xl border-2 transition-colors ${getBorderClass(
                  "fullName"
                )}`}
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
                className={`w-full bg-white px-3 py-3 text-[14px] outline-none rounded-xl border-2 transition-colors ${getBorderClass(
                  "contactNumber"
                )}`}
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
                className={`w-full bg-white px-3 py-3 text-[14px] outline-none rounded-xl border-2 transition-colors ${getBorderClass(
                  "email"
                )}`}
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
                rows={messageRows}
                className={`w-full bg-white px-3 py-3 text-[14px] outline-none rounded-xl border-2 resize-y overflow-y-auto transition-colors ${getBorderClass(
                  "message"
                )}`}
                value={fields.message.value}
                onChange={(e) => setValue("message", e.target.value)}
                onFocus={() => setFocused("message", true)}
                onBlur={() => {
                  setFocused("message", false);
                  setTouched("message");
                }}
              />
            </div>
          </div>

          {initialValues?.quoteRef ? (
            <div className="text-[12px] text-[#595858]">
              Quote Ref: <span className="font-semibold">{initialValues.quoteRef}</span>
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full bg-pml-primary hover:bg-[#a81a6f] hover:shadow-lg text-white font-bold py-3 rounded-2xl shadow-md transition-all duration-200 active:scale-[0.98] text-[16px] disabled:opacity-60 disabled:hover:shadow-none"
            disabled={!canSubmit || submitting}
          >
            {submitting ? "Submitting…" : "Submit enquiry"}
          </button>

          {showQuickHelp ? (
            <div className="flex items-center justify-center gap-1 text-[12px] text-[#595858] whitespace-nowrap">
              <span>Need help sooner? Call</span>
              <a className="underline shrink-0" href={`tel:${phoneTel}`}>
                {phoneDisplay}
              </a>
              <span className="shrink-0">or</span>
              <a
                className="inline-flex items-center gap-1 underline shrink-0"
                href={getWhatsAppUrl({
                  source: whatsappSource,
                  contextLine: whatsappContextLine,
                })}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                onClick={(event) =>
                  attachCurrentPageToWhatsAppHref(event, {
                    source: whatsappSource,
                    contextLine: whatsappContextLine,
                  })
                }
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
            </div>
          ) : null}
        </form>
      )}
    </div>
  );
}

