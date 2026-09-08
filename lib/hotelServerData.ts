import "server-only";
import { cache } from "react";
import { headers } from "next/headers";

import { fetchBackend } from "@/lib/backendFetch";
import { FORWARDED_REQUEST_HEADERS } from "@/lib/backendProxy";
import { HotelPageResponse } from "@/types/hotel";

function resolveClientIp(incomingHeaders: Headers): string {
  const forwardedFor = incomingHeaders.get("x-forwarded-for") || "";
  const firstForwardedFor = forwardedFor
    .split(",")
    .map((value) => value.trim())
    .find((value) => value.length > 0);

  return (
    firstForwardedFor ||
    incomingHeaders.get("x-real-ip") ||
    incomingHeaders.get("cf-connecting-ip") ||
    incomingHeaders.get("x-client-ip") ||
    ""
  );
}

export async function buildForwardedBackendHeaders(): Promise<Headers> {
  const incomingHeaders = await headers();
  const forwarded = new Headers();

  for (const [sourceName, targetName] of FORWARDED_REQUEST_HEADERS) {
    const value = incomingHeaders.get(sourceName);
    if (value) {
      forwarded.set(targetName, value);
    }
  }

  const clientIp = resolveClientIp(incomingHeaders);
  if (clientIp) {
    if (!forwarded.has("X-Forwarded-For")) forwarded.set("X-Forwarded-For", clientIp);
    if (!forwarded.has("X-Real-IP")) forwarded.set("X-Real-IP", clientIp);
  }

  return forwarded;
}

// Wrapped in React's per-request cache() so the layout's and page's independent
// calls collapse into one backend round trip instead of two.
export const getHotelContent = cache(async (slug: string): Promise<HotelPageResponse | null> => {
  try {
    const encoded = encodeURIComponent(slug);
    const forwardedHeaders = await buildForwardedBackendHeaders();
    // Route handler specifies both `next.revalidate` and `cache: "no-store"` together;
    // no-store wins either way (Next warns if both are passed), so pass no-store only.
    const res = await fetchBackend(`/client/api/hotels/${encoded}/`, {
      headers: forwardedHeaders,
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()) as HotelPageResponse;
  } catch {
    return null;
  }
});

export async function getHotelLive(slug: string): Promise<any | null> {
  try {
    const encoded = encodeURIComponent(slug);
    const forwardedHeaders = await buildForwardedBackendHeaders();
    const res = await fetchBackend(`/client/api/hotels-live/${encoded}/`, {
      headers: forwardedHeaders,
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getHotelInitialData(slug: string) {
  const [content, live] = await Promise.all([getHotelContent(slug), getHotelLive(slug)]);
  return { content, live };
}

export async function getHotelLsSearchResult(
  slug: string,
  params: { departure?: string; duration?: string; boardBasis?: string; checkinDate?: string }
): Promise<any | null> {
  try {
    const forwardedHeaders = await buildForwardedBackendHeaders();
    forwardedHeaders.set("Content-Type", "application/json");
    const res = await fetchBackend(`/client/api/ls-updated-hotel-search/`, {
      method: "POST",
      headers: forwardedHeaders,
      cache: "no-store",
      body: JSON.stringify({
        slug,
        departure: params.departure,
        duration: params.duration,
        boardBasis: params.boardBasis,
        checkinDate: params.checkinDate,
      }),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getHotelSearchInitialData(
  slug: string,
  params: { departure?: string; duration?: string; boardBasis?: string; checkinDate?: string }
) {
  const [content, live] = await Promise.all([
    getHotelContent(slug),
    getHotelLsSearchResult(slug, params),
  ]);
  return { content, live };
}
