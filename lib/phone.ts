export const DEFAULT_CALL_PHONE_DISPLAY = "020 3740 0744";

export function normalizePhoneDisplay(phoneDisplay: string): string {
  return phoneDisplay.trim().replace(/^\+\s*/, "");
}

export function toTelHref(phoneDisplay: string): string {
  return normalizePhoneDisplay(phoneDisplay).replace(/\D+/g, "");
}

export const DEFAULT_CALL_PHONE_TEL = toTelHref(DEFAULT_CALL_PHONE_DISPLAY);