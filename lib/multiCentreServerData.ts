import "server-only";

import { BackendConfigError, fetchBackend } from "@/lib/backendFetch";
import type { McDefaultPricingResponse, McPageResponse } from "@/types/multi-centre";

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : value == null ? fallback : String(value);
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asFiniteNumber(value: unknown): number | undefined {
  const num = typeof value === "number" ? value : Number(String(value));
  return Number.isFinite(num) ? num : undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function normalizeHotelImages(hotel: any): string[] {
  const rawImages =
    hotel?.images ?? hotel?.image ?? hotel?.hotel_images ?? hotel?.pictures ?? hotel?.galleryImages ?? [];

  if (Array.isArray(rawImages)) {
    return rawImages.map((img) => asString(img)).filter(Boolean);
  }

  const single = asString(rawImages);
  return single ? [single] : [];
}

function normalizePictures(pictures: unknown): string[] {
  if (Array.isArray(pictures)) {
    return pictures.map((p) => asString(p).trim()).filter(Boolean);
  }

  const pictureStr = asString(pictures);
  if (!pictureStr) return [];

  return pictureStr
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

export type MultiCentreContentResult =
  | { ok: true; data: Omit<McPageResponse, "pricing"> }
  | { ok: false; status: number; error: string; details?: unknown };

// Shared by app/api/multi-centre/[slug]/content/route.ts (client-fetch fallback path)
// and the server-seeded path in app/multi-centre/[slug]/page.tsx, so both stay
// byte-identical in shape.
export async function fetchMultiCentreContent(slug: string): Promise<MultiCentreContentResult> {
  try {
    const res = await fetchBackend(`/client/api/multi-center/${encodeURIComponent(slug)}/`, {
      method: "GET",
      cache: "no-store",
    });

    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      return { ok: false, status: res.status, error: "Backend request failed", details: json ?? text };
    }

    const payload = json?.multi_center_data ?? json;
    if (!payload || typeof payload !== "object") {
      return { ok: false, status: 502, error: "Invalid backend response shape for content" };
    }

    const pageRaw = (payload as any).page ?? {};
    const sectionsRaw = (payload as any).sections ?? {};
    const hotelsRaw = asArray<any>(pageRaw.hotels);

    const data = {
      slug: asString((payload as any).slug, slug),
      fallbackDepartureDate: asString(
        (payload as any).fallbackDepartureDate ?? (payload as any).fallback_departure_date,
        "",
      ),
      page: {
        ...pageRaw,
        location: asString(pageRaw.location),
        destinations: asArray<string>(pageRaw.destinations).map((d) => asString(d)),
        offer_header: asString(pageRaw.offer_header),
        info_paragraph: asString(pageRaw.info_paragraph, ""),
        pictures: normalizePictures(pageRaw.pictures),
        hotels: hotelsRaw.map((hotel) => ({
          ...hotel,
          location: asString(hotel?.location),
          description: asString(hotel?.description),
          images: normalizeHotelImages(hotel),
        })),
        Banner_Image_chips: asString(pageRaw.Banner_Image_chips ?? pageRaw.banner_image_chips, ""),
      },
      sections: {
        ...sectionsRaw,
        highlights: asString(sectionsRaw.highlights, ""),
        whats_included: sectionsRaw.whats_included ?? "",
        itinerary: asArray(sectionsRaw.itinerary),
        fine_print: sectionsRaw.fine_print ?? "",
        discover_the_deal: asString(sectionsRaw.discover_the_deal, ""),
        similar_deals: asArray(sectionsRaw.similar_deals),
        galleryImages: asArray(sectionsRaw.galleryImages),
      },
    } as Omit<McPageResponse, "pricing">;

    return { ok: true, data };
  } catch (error) {
    if (error instanceof BackendConfigError) {
      return { ok: false, status: 500, error: "Server configuration error" };
    }
    return {
      ok: false,
      status: 502,
      error: "Failed to connect to backend server",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export type MultiCentreDefaultPricingResult =
  | { ok: true; data: McDefaultPricingResponse }
  | { ok: false; status: number; error: string; details?: unknown };

// Shared by app/api/multi-centre/[slug]/pricing/default/route.ts and the
// server-seeded path in app/multi-centre/[slug]/page.tsx.
export async function fetchMultiCentreDefaultPricing(slug: string): Promise<MultiCentreDefaultPricingResult> {
  try {
    const res = await fetchBackend(`/client/api/multi-center-default-price/${encodeURIComponent(slug)}/`, {
      method: "GET",
      cache: "no-store",
    });

    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: "Backend request failed",
        details: json ?? text,
      };
    }

    const payload = json?.default_price_data ?? json;
    if (!payload || typeof payload !== "object") {
      return { ok: false, status: 502, error: "Invalid backend response shape for default pricing" };
    }

    const isStatic = (payload as any).static === true || (payload as any).pricing_source_mode === "static";

    if (isStatic) {
      const staticRaw = asRecord((payload as any).static_pricing_data);

      const staticPricingData = {
        totalDuration: asString(staticRaw.totalDuration, ""),
        fromPrice: asString(staticRaw.fromPrice, ""),
        seasons: asArray(staticRaw.seasons).map((s) => {
          const r = asRecord(s);
          return { name: asString(r.name, ""), dates: asString(r.dates, ""), price: asString(r.price, "") };
        }),
        departureDates: asArray(staticRaw.departureDates).map((d) => {
          const r = asRecord(d);
          return { price: asString(r.price, ""), dates: asArray(r.dates).map((x) => asString(x, "")) };
        }),
        localTaxes: asArray(staticRaw.localTaxes).map((t) => asString(t, "")),
      };

      return {
        ok: true,
        data: {
          slug: asString((payload as any).slug, slug),
          pricingSourceMode: "static",
          static: true,
          staticPricingData,
          defaultDeal: (payload as any).default_deal ?? null,
        } as McDefaultPricingResponse,
      };
    }

    const priceDataByAirport = asRecord((payload as any).priceDataByAirport);
    const listOfAirportsRaw = asArray((payload as any).listOfAirports);
    const listOfAirports = listOfAirportsRaw
      .map((id) => asFiniteNumber(id))
      .filter((id): id is number => typeof id === "number");

    return {
      ok: true,
      data: {
        slug: asString((payload as any).slug, slug),
        pricingSourceMode: (payload as any).pricing_source_mode === "builder" ? "builder" : "manual",
        static: false,
        defaultAirportId: (payload as any).defaultAirportId ?? null,
        landingMonth: asString((payload as any).landingMonth, ""),
        listOfAirports,
        localTax: asFiniteNumber((payload as any).localTax),
        priceDataByAirport,
      } as McDefaultPricingResponse,
    };
  } catch (error) {
    if (error instanceof BackendConfigError) {
      return { ok: false, status: 500, error: "Server configuration error" };
    }
    return {
      ok: false,
      status: 502,
      error: "Failed to connect to backend server",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Convenience wrappers for the server-seeded page path — mirrors
// lib/hotelServerData.ts's getHotelContent/getHotelLive (null on failure).
export async function getMultiCentreContent(slug: string): Promise<Omit<McPageResponse, "pricing"> | null> {
  const result = await fetchMultiCentreContent(slug);
  return result.ok ? result.data : null;
}

export async function getMultiCentreDefaultPricing(slug: string): Promise<McDefaultPricingResponse | null> {
  const result = await fetchMultiCentreDefaultPricing(slug);
  return result.ok ? result.data : null;
}
