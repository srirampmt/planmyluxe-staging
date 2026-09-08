import { cookies } from "next/headers";
import { BackendConfigError, fetchBackend } from "@/lib/backendFetch";
import { DEFAULT_CALL_PHONE_DISPLAY } from "@/lib/phone";

export const DEFAULT_PHONE_DISPLAY = DEFAULT_CALL_PHONE_DISPLAY;

export type UtmPhoneParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utmid?: string;
};

export async function getUtmPhoneParamsFromCookies(): Promise<UtmPhoneParams> {
  const store = await cookies();
  return {
    utm_source: store.get("utm_source")?.value || undefined,
    utm_medium: store.get("utm_medium")?.value || undefined,
    utm_campaign: store.get("utm_campaign")?.value || undefined,
    // Preferred key is `utm_id` (backend/client standard); `utmid` is legacy.
    utmid: store.get("utm_id")?.value || store.get("utmid")?.value || undefined,
  };
}

/**
 * Fetches the mapped phone number for a UTM combination.
 *
 * - Cached per UTM combination (URL) for 1 hour.
 * - Returns null when UTMs are missing or backend returns no match.
 * - Saves utm_id to cookies if received from backend.
 */
export async function fetchPhoneByUtm(params: UtmPhoneParams): Promise<string | null> {
  const { utm_source, utm_medium, utm_campaign, utmid } = params;
  if (!utm_source && !utm_medium && !utm_campaign && !utmid) return null;

  // Configurable endpoint so backend can expose any path.
  const endpointPath = "/client/api/utm-phone/";

  const qs = new URLSearchParams();
  if (utm_source) qs.set("utm_source", utm_source);
  if (utm_medium) qs.set("utm_medium", utm_medium);
  if (utm_campaign) qs.set("utm_campaign", utm_campaign);
  if (utmid) {
    // Send both keys for backend compatibility.
    qs.set("utm_id", utmid);
  }

  const path = `${endpointPath}?${qs.toString()}`;

  try {
    const res = await fetchBackend(path, {
      next: { revalidate: 60 * 60 },
      timeoutMs: 15000,
    });

    if (!res.ok) return null;

    const data = (await res.json()) as any;

  // Prefer backend field name matching your Django model.
  const phone =
    (typeof data?.phone_number === "string" && data.phone_number) ||
    (typeof data?.data?.phone_number === "string" && data.data.phone_number) ||
    (typeof data?.phone === "string" && data.phone) ||
    null;

    // Save utm_id to cookies if received from backend
    const backendUtmId =
      (typeof data?.utm_id === "string" && data.utm_id) ||
      (typeof data?.data?.utm_id === "string" && data.data.utm_id) ||
      null;

    if (backendUtmId) {
      const store = await cookies();
      store.set("utm_id", backendUtmId, {
        httpOnly: false,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    const trimmed = phone?.trim();
    return trimmed ? trimmed : null;
  } catch (error) {
    if (error instanceof BackendConfigError) {
      return null;
    }

    console.warn("fetchPhoneByUtm: backend fetch failed", {
      path,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
