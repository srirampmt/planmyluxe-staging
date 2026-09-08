import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

import { fetchBackend } from "@/lib/backendFetch";

const PROMO_MODAL_REVALIDATE_SECONDS = 60 * 60;

type PromoModalContent = {
  badgeText?: string;
  headlineLines?: string[];
  ctaText?: string;
  dismissText?: string;
  imageUrl?: string;
  imageAlt?: string;
};

type PromoModalConfig = {
  enabled?: boolean;
  delayMs?: number;
  slugs?: string[];
  redirectUrl?: string;
  content?: PromoModalContent;
};

type PromoModalRoutePayload = {
  items: PromoModalConfig[];
};

function normalizeSlug(rawSlug: string | null): string {
  const slug = rawSlug?.trim() ?? "";
  if (!slug || slug === "/") {
    return "/";
  }

  return slug.startsWith("/") ? slug : `/${slug}`;
}

function isPromoModalConfig(value: unknown): value is PromoModalConfig {
  return Boolean(
    value &&
      typeof value === "object" &&
      "content" in value &&
      typeof (value as { content?: unknown }).content === "object",
  );
}

function normalizePromoModalPayload(value: unknown): PromoModalRoutePayload {
  if (Array.isArray(value)) {
    return {
      items: value.filter(isPromoModalConfig),
    };
  }

  if (value && typeof value === "object" && Array.isArray((value as { items?: unknown }).items)) {
    return {
      items: (value as { items: unknown[] }).items.filter(isPromoModalConfig),
    };
  }

  return {
    items: isPromoModalConfig(value) ? [value] : [],
  };
}

function getCachedPromoModalPayload(slug: string) {
  return unstable_cache(
    async (): Promise<PromoModalRoutePayload> => {
      const path = `/client/api/popup/?slug=${encodeURIComponent(slug)}`;
      try {
        const res = await fetchBackend(path, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          return { items: [] };
        }

        const payload = (await res.json().catch(() => null)) as unknown;
        return normalizePromoModalPayload(payload);
      } catch {
        return { items: [] };
      }
    },
    ["promo-modal", slug],
    { revalidate: PROMO_MODAL_REVALIDATE_SECONDS },
  )();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = normalizeSlug(searchParams.get("slug"));

  try {
    const payload = await getCachedPromoModalPayload(slug);
    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
