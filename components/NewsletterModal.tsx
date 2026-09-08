"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { createIdempotencyKey } from "@/lib/clientIdempotency";
import { markThankyouUrl, restoreThankyouUrl } from "@/lib/thankyou-url";

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
      fullName: fullName ? "" : "Full name is required.",
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

    if (state.focused) return "border-blue-600";
    if (state.touched && err) return "border-red-600";
    if (state.touched && !err && state.value.trim()) return "border-green-600";
    return "border-[#9F9F9F]";
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
        className="absolute inset-0 bg-black/60"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[560px] max-h-[calc(100vh-2rem)] bg-white rounded-[4px] overflow-hidden shadow-2xl font-['Montserrat']"
      >
        <div className="flex items-center justify-between bg-[#595858] text-white px-4 py-3">
          <div className="text-[16px] md:text-[18px] font-semibold">Signup &amp; Save</div>
          <button
            type="button"
            onClick={handleClose}
            className="text-white/90 hover:text-white text-[22px] leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-4 md:p-5 bg-[#F3F3F3] overflow-y-auto">
          <div className="bg-white rounded-[4px] p-4">
            <div className="flex items-center justify-between text-[#4C4C4C] text-[14px] font-semibold mb-3">
              Newsletter signup
            </div>

            {submitted ? (
              <div className="rounded-[4px] border border-green-600 bg-green-50 p-4 text-[#4C4C4C]">
                <div className="font-semibold">You’re subscribed!</div>
                <div className="text-sm mt-1">Thank you. You’ll now receive our weekly offers.</div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-4 w-full bg-pml-primary hover:bg-pink-800 text-white font-semibold py-3 rounded-[8px] transition-all duration-200 text-[16px]"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError ? (
                  <div className="rounded-[4px] border border-red-600 bg-red-50 p-3 text-[13px] text-red-700">
                    {submitError}
                  </div>
                ) : null}

                <div>
                  <input
                    type="text"
                    placeholder="Full name"
                    className={`w-full bg-white px-3 py-3 text-[14px] outline-none border ${getBorderClass(
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
                    <div className="mt-2 inline-block bg-red-600 text-white text-[12px] px-3 py-2 rounded-[2px]">
                      {errors.fullName}
                    </div>
                  )}
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email address"
                    className={`w-full bg-white px-3 py-3 text-[14px] outline-none border ${getBorderClass(
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
                    <div className="mt-2 inline-block bg-red-600 text-white text-[12px] px-3 py-2 rounded-[2px]">
                      {errors.email}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-pml-primary hover:bg-pink-800 text-white font-semibold py-3 rounded-[8px] transition-all duration-200 text-[16px] disabled:opacity-60"
                  disabled={!canSubmit || submitting}
                >
                  {submitting ? "Submitting…" : "Submit"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
