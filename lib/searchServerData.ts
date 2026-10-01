import "server-only";
import { fetchBackend } from "@/lib/backendFetch";
import { getClientIp } from "@/lib/antiSpam";
import type { DestinationRow } from "@/lib/mappings/destinations";

export async function getDestinationRows(): Promise<DestinationRow[]> {
  try {
    const res = await fetchBackend("/client/api/destinations/", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : Array.isArray(data?.destinations) ? data.destinations : [];
  } catch {
    return [];
  }
}

// Only the fields the search results UI reads (HotelCard, HotelResultsList,
// isHotelOnOffer). Everything else Django puts on a card — supplier ids,
// the pre-add-on price, internal status/tags — stays on the server.
const CARD_FIELDS = [
  "slug",
  "hotelId",
  "quoteReference",
  "hotelName",
  "location",
  "rating",
  "boardBasis",
  "tax",
  "card_image",
  "top_facilities",
  "google_rating",
  "google_review_count",
  "departureAirportCode",
  "arrivalAirportCode",
  "checkInDate",
  "duration",
  "offer_on_card",
  "saveuptotext",
  "offer_header",
] as const;

export function toSearchCard(raw: Record<string, any>) {
  const card: Record<string, unknown> = {};
  for (const key of CARD_FIELDS) {
    if (raw[key] !== undefined && raw[key] !== null && raw[key] !== "") card[key] = raw[key];
  }
  const rawPrice = Number(raw.rawPrice) > 0 ? Number(raw.rawPrice) : Number(raw.starting_price) || 0;
  card.rawPrice = rawPrice;
  return card;
}

export function toClientSearchPayload(data: Record<string, any>) {
  return {
    search_id: data.search_id,
    results: Array.isArray(data.results) ? data.results.map(toSearchCard) : [],
    next_cursor: data.next_cursor ?? null,
    total_count: data.total_count ?? 0,
    base_total_count: data.base_total_count ?? 0,
    facets: data.facets ?? null,
    expires_at: data.expires_at,
    destination_unavailable: Boolean(data.destination_unavailable),
    base_criteria: data.base_criteria,
  };
}

export type ClientSearchPayload = ReturnType<typeof toClientSearchPayload>;

// Request context Django uses for rate limiting and geo — the same values
// whether the call comes from the /api/hotelsearch proxy or a server render.
export function buildBackendContextHeaders(headers: Headers): Record<string, string> {
  const clientIp = getClientIp(headers);
  const visitorLocation = JSON.stringify({
    country: headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry") || "",
    region: headers.get("x-vercel-ip-country-region") || headers.get("cf-region") || "",
    city: headers.get("x-vercel-ip-city") || headers.get("cf-ipcity") || "",
    latitude: headers.get("x-vercel-ip-latitude") || headers.get("cf-latitude") || "",
    longitude: headers.get("x-vercel-ip-longitude") || headers.get("cf-longitude") || "",
    timezone: headers.get("x-vercel-ip-timezone") || "",
  });

  return {
    "Cookie": headers.get("cookie") || "",
    "X-Visitor-ID": headers.get("x-visitor-id") || "",
    "X-Session-ID": headers.get("x-session-id") || "",
    "X-Client-Signature": headers.get("x-client-signature") || "",
    "X-Visitor-Country": headers.get("x-vercel-ip-country") || "",
    "X-Visitor-Location": visitorLocation,
    ...(clientIp && clientIp !== "unknown" ? { "X-Real-IP": clientIp } : {}),
  };
}

export async function fetchSearchPage(
  searchId: string,
  { cursor, criteria }: { cursor?: string | null; criteria?: string | null },
  headers: Headers,
): Promise<{ status: number; payload: ClientSearchPayload | null }> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (criteria) params.set("criteria", criteria);
  const qs = params.toString();

  const response = await fetchBackend(
    `/client/api/v1/searches/${encodeURIComponent(searchId)}${qs ? `?${qs}` : ""}`,
    { method: "GET", headers: buildBackendContextHeaders(headers), cache: "no-store" },
  );
  if (!response.ok) return { status: response.status, payload: null };

  const data = await response.json();
  return { status: 200, payload: { ...toClientSearchPayload(data), search_id: searchId } };
}
