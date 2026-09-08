import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getCookieValue } from "@/lib/utm-client";
import { sanitizeEnquirySource } from "@/lib/source-builder";

const WHATSAPP_PHONE = "442037400744"; // Replace with actual phone number

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type WhatsAppUrlOptions = {
  source?: string;
  contextLine?: string;
};

function resolveWhatsAppOptions(options?: string | WhatsAppUrlOptions): WhatsAppUrlOptions {
  if (typeof options === "string") {
    return { source: options };
  }

  return options ?? {};
}

export function formatWhatsAppDateLine(
  dateValue?: string | null
): string | undefined {
  const normalizedDate = String(dateValue ?? "").trim();

  if (!normalizedDate) {
    return undefined;
  }

  const [yearValue, monthValue, dayValue] = normalizedDate.split("-").map(Number);

  if (
    !Number.isFinite(yearValue) ||
    !Number.isFinite(monthValue) ||
    !Number.isFinite(dayValue) ||
    monthValue < 1 ||
    monthValue > 12 ||
    dayValue < 1 ||
    dayValue > 31
  ) {
    return `${normalizedDate}`;
  }

  const dayString = String(dayValue).padStart(2, "0");
  const monthString = String(monthValue).padStart(2, "0");

  return `${dayString}${monthString}${yearValue}`;
}

export function getWhatsAppUrl(options?: string | WhatsAppUrlOptions): string {
  const { source, contextLine } = resolveWhatsAppOptions(options);
  const whatsappSource = sanitizeEnquirySource(source, "");
  const whatsappContextLine = String(contextLine ?? "").trim();

  // Get all UTM parameters from cookies
  const utm_source = getCookieValue("utm_source");
  const utm_medium = getCookieValue("utm_medium");
  const utm_campaign = getCookieValue("utm_campaign");
  const utm_id = getCookieValue("utm_id");
  const utmValues = utm_id || [utm_source, utm_medium, utm_campaign]
    .filter(Boolean)
    .join(",");

  const messageLines = ["Hi PlanMyLuxe, I want to know more details about"];

  if (whatsappSource) {
    messageLines.push(`${whatsappSource}`);
  }

  if (utmValues) {
    messageLines.push(`- ${utmValues}`);
  }

  if (whatsappContextLine) {
    messageLines.push(`- ${whatsappContextLine}`);
  }

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(messageLines.join("\n"))}`;
}

export function attachCurrentPageToWhatsAppHref(event: {
  currentTarget: { href: string };
}, options?: string | WhatsAppUrlOptions): void {
  if (typeof window === "undefined") return;
  event.currentTarget.href = getWhatsAppUrl(options);
}

