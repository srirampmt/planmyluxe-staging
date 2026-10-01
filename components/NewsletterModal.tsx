"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Mail, X } from "lucide-react";
import { createIdempotencyKey } from "@/lib/clientIdempotency";
import { markThankyouUrl, restoreThankyouUrl } from "@/lib/thankyou-url";
import { isValidPersonName } from "@/lib/utils";

type NewsletterModalProps = {
  open: boolean;
  onClose: () => void;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

type FieldName = "fullName" | "email";

type FieldState = {
  value: string;
  touched: boolean;
  focused: boolean;
};

export default function NewsletterModal({ open, onClose }: NewsletterModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const handleClose = useCallback(() => {
    restoreThankyouUrl();
    onClose();
  }, [onClose]);

  const [fields, setFields] = useState<Record<FieldName, FieldState>>({
    fullName: { value: "", touched: false, focused: false },
    email: { value: "", touched: false, focused: false },
  });

  // Reset when opened
  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    setSubmitError("");
    setSubmitting(false);
    setFields({
      fullName: { value: "", touched: false, focused: false },
      email: { value: "", touched: false, focused: false },
    });
  }, [open]);

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

  const errors = useMemo(() => {
    const fullName = fields.fullName.value.trim();
    const email = fields.email.value.trim();

    return {
      fullName: !fullName
        ? "Full name is required."
        : isValidPersonName(fullName)
          ? ""
          : "Only letters (A–Z), spaces, \".\" and \"-\" are allowed.",
      email: email ? (isValidEmail(email) ? "" : "Please enter a valid email address.") : "Email address is required.",
    };
  }, [fields]);

  const canSubmit = useMemo(() => {
    return !errors.fullName && !errors.email;
  }, [errors]);

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
    const err = errors[name];

    if (state.focused) return "border-[#CB2187] ring-2 ring-[#CB2187]/20";
    if (state.touched && err) return "border-red-500";
    if (state.touched && !err && state.value.trim()) return "border-green-600";
    return "border-gray-200 hover:border-gray-300";
  };

  const showError = (name: FieldName) => {
    return fields[name].touched && !!errors[name];
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    (Object.keys(fields) as FieldName[]).forEach((k) => setTouched(k));
    if (!canSubmit) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        fullName: fields.fullName.value.trim(),
        email: fields.email.value.trim(),
      };

      const res = await fetch("/api/submit-newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": createIdempotencyKey("newsletter"),
        },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? ((await res.json().catch(() => null)) as any)
        : null;

      if (!res.ok) {
        const msg =
          data?.error ||
          data?.message ||
          `Request failed with status ${res.status} ${res.statusText}`;
        setSubmitError(msg);
        setSubmitting(false);
        return;
      }

      if (data && data.success === false) {
        setSubmitError(data?.error || data?.message || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      markThankyouUrl();
    } catch {
      setSubmitError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close newsletter signup"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-modal-title"
        className="relative w-full max-w-[480px] max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[18px] border border-gray-100 bg-white p-6 shadow-[0_20px_50px_rgba(30,12,26,0.18)] font-['Montserrat'] sm:p-8"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-slate-500 transition-colors hover:bg-[#CB2187]/10 hover:text-[#CB2187]"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="pt-2 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 id="newsletter-modal-title" className="text-[22px] font-semibold text-[#4c4c4c]">
              You’re subscribed!
            </h2>
            <p className="mt-2 text-[14px] leading-[22px] text-[#7C7C7C]">
              Thank you. You’ll now receive our weekly offers.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 w-full rounded-xl bg-pml-primary py-3.5 text-[14px] font-semibold text-white transition-all duration-200 hover:bg-pink-800"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 pr-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#CB2187]/10 text-[#CB2187]">
                  <Mail className="h-5 w-5" />
                </div>
                <h2 id="newsletter-modal-title" className="text-[22px] font-semibold leading-tight text-[#4c4c4c] sm:text-[26px]">
                  Signup &amp; Save
                </h2>
              </div>
              <p className="mt-2 text-[14px] leading-[22px] text-[#7C7C7C]">
                Get exclusive deals, free extras and flash sales sent straight to your inbox.
              </p>
            </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {submitError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
                    {submitError}
                  </div>
                ) : null}

                <div>
                  <label htmlFor="newsletter-full-name" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Full name
                  </label>
                  <input
                    id="newsletter-full-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-[14px] font-medium text-gray-800 outline-none transition-all placeholder:font-normal placeholder:text-gray-400 ${getBorderClass(
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
                    <p className="mt-1.5 text-[12px] font-medium text-red-600">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="newsletter-email" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Email address
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-[14px] font-medium text-gray-800 outline-none transition-all placeholder:font-normal placeholder:text-gray-400 ${getBorderClass(
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
                    <p className="mt-1.5 text-[12px] font-medium text-red-600">{errors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-pml-primary py-3.5 text-[14px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-pink-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!canSubmit || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Subscribing…
                    </>
                  ) : (
                    "Sign me up"
                  )}
                </button>

                <p className="text-center text-[11px] leading-[16px] text-gray-400">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
          </>
        )}
      </div>
    </div>
  );
}
