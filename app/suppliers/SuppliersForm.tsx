"use client";

import { useMemo, useState } from "react";
import { createIdempotencyKey } from "@/lib/clientIdempotency";

type SupplierPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  company: string;
  message: string;
};

export default function SuppliersForm() {
  const [form, setForm] = useState<SupplierPayload>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    company: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<
    | { type: "idle" }
    | { type: "success"; message: string }
    | { type: "error"; message: string }
  >({ type: "idle" });

  const headingPink = "text-[#cb2187]";

  const inputClass =
    "w-full min-h-[50px] rounded-lg border border-[#c1c1c1] bg-white px-4 py-3 text-[16px] text-[#333] outline-none transition focus:border-[#cb2187] placeholder:text-[#666]";

  const hasExactly11Digits = (value: string) => value.replace(/\D/g, "").length === 11;

  const canSubmit = useMemo(() => {
    return (
      form.first_name.trim() &&
      form.last_name.trim() &&
      form.email.trim() &&
      form.phone_number.trim() &&
      hasExactly11Digits(form.phone_number) &&
      form.company.trim()
    );
  }, [form]);

  const onChange = (key: keyof SupplierPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (status.type !== "idle") setStatus({ type: "idle" });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setStatus({ type: "idle" });

    if (!hasExactly11Digits(form.phone_number)) {
      setStatus({ type: "error", message: "Phone number must be exactly 11 digits." });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/suppliers/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": createIdempotencyKey("suppliers"),
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.detail ||
          "Something went wrong. Please try again.";
        setStatus({ type: "error", message: String(msg) });
        return;
      }

      setStatus({
        type: "success",
        message:
          data?.message || "Thanks — we’ve received your details and will be in touch.",
      });

      setForm({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        company: "",
        message: "",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Network error. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex justify-center">
      <div className="w-full max-w-[800px] rounded-2xl border border-[#c1c1c1] bg-white p-6 md:p-8">
        {status.type === "success" && (
          <div className="mb-5 rounded-lg border border-[#c3e6cb] bg-[#d4edda] px-4 py-3 text-[#155724]">
            {status.message}
          </div>
        )}

        {status.type === "error" && (
          <div className="mb-5 rounded-lg border border-[#f5c6cb] bg-[#f8d7da] px-4 py-3 text-[#721c24]">
            {status.message}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="pb-2">
            <p className={`text-[20px] md:text-[24px] font-semibold ${headingPink}`}>
              Apply to become a supplier
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className={`text-[16px] ${headingPink}`}>First Name</p>
            <input
              className={inputClass}
              maxLength={256}
              name="first_name"
              placeholder="First Name"
              type="text"
              value={form.first_name}
              onChange={(e) => onChange("first_name", e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className={`text-[16px] ${headingPink}`}>Last Name</p>
            <input
              className={inputClass}
              maxLength={256}
              name="last_name"
              placeholder="Last Name"
              type="text"
              value={form.last_name}
              onChange={(e) => onChange("last_name", e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className={`text-[16px] ${headingPink}`}>Email Address</p>
            <input
              className={inputClass}
              maxLength={256}
              name="email"
              placeholder="Email address"
              type="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className={`text-[16px] ${headingPink}`}>Phone Number</p>
            <input
              className={inputClass}
              maxLength={256}
              name="phone_number"
              placeholder="Phone number"
              type="tel"
              value={form.phone_number}
              onChange={(e) => onChange("phone_number", e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className={`text-[16px] ${headingPink}`}>Your Company</p>
            <input
              className={inputClass}
              maxLength={256}
              name="company"
              placeholder="Your Company"
              type="text"
              value={form.company}
              onChange={(e) => onChange("company", e.target.value)}
              required
            />
          </div>

          <div className="pt-2">
            <p className={`text-[20px] md:text-[24px] font-semibold ${headingPink}`}>
              Why do you want to work with PlanMyLuxe?
            </p>
          </div>

          <textarea
            name="message"
            maxLength={5000}
            placeholder="Why do you want to work with PlanMyLuxe?"
            className={`${inputClass} min-h-[110px]`}
            value={form.message}
            onChange={(e) => onChange("message", e.target.value)}
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="inline-flex items-center justify-center rounded-lg bg-[#cb2187] px-8 py-4 font-semibold text-white transition hover:bg-[#a91970] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send Details"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
