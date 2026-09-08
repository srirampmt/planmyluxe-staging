import type { Metadata } from "next";
import { unstable_cache } from "next/cache";

import { fetchBackend } from "@/lib/backendFetch";
import { getSiteUrl } from "@/lib/site-url";

const SEO_METADATA_REVALIDATE_SECONDS = 60 * 60;

export type SeoMetadataKey =
  | "hotel"
  | "destination"
  | "holidaystyle"
  | "offertype"
  | "multi_center"
  | "holiday_styles_homepage"
  | "destinations_homepage"
  | "homepage"
  | "all_offers"
  | "top_trending_destinations";

type BackendSeoMetadata = {
  Meta_Title?: string | null;
  Meta_Description?: string | null;
  OG_Image?: string | null;
  Canonical_URL?: string | null;
  Twitter_Image?: string | null;
  Head_Scripts?: string | null;
  slug?: string | null;
};

type BackendSeoResponse = {
  success?: boolean;
  metadata?: BackendSeoMetadata | null;
  model?: string;
};

export type SeoMetadataPayload = {
  Meta_Title: string;
  Meta_Description: string;
  OG_Image: string;
  Canonical_URL: string;
  Twitter_Image: string;
  Head_Scripts: string;
  slug: string;
  model: string;
};

type BuildMetadataOptions = {
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackPath?: string;
  robots?: Metadata["robots"];
  twitterCard?: "summary" | "summary_large_image" | "player" | "app";
};

const SLUG_REQUIRED_KEYS = new Set<SeoMetadataKey>([
  "hotel",
  "destination",
  "holidaystyle",
  "offertype",
  "multi_center",
]);

function normalizeSeoValue(value?: string | null): string {
  return String(value ?? "").trim();
}

export function toAbsoluteUrl(input: string, siteUrl: string): string {
  try {
    return new URL(input, siteUrl).toString();
  } catch {
    return input;
  }
}

async function fetchSeoMetadata(
  key: SeoMetadataKey,
  normalizedSlug: string,
): Promise<SeoMetadataPayload | null> {
  const searchParams = new URLSearchParams({ key });
  if (normalizedSlug) {
    searchParams.set("slug", normalizedSlug);
  }

  try {
    const res = await fetchBackend(`/client/api/metadata/?${searchParams.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const payload = (await res.json()) as BackendSeoResponse;
    if (!payload?.success || !payload.metadata) return null;

    return {
      Meta_Title: normalizeSeoValue(payload.metadata.Meta_Title),
      Meta_Description: normalizeSeoValue(payload.metadata.Meta_Description),
      OG_Image: normalizeSeoValue(payload.metadata.OG_Image),
      Canonical_URL: normalizeSeoValue(payload.metadata.Canonical_URL),
      Twitter_Image: normalizeSeoValue(payload.metadata.Twitter_Image),
      Head_Scripts: normalizeSeoValue(payload.metadata.Head_Scripts),
      slug: normalizeSeoValue(payload.metadata.slug),
      model: normalizeSeoValue(payload.model),
    };
  } catch {
    return null;
  }
}

export async function getSeoMetadata(
  key: SeoMetadataKey,
  slug?: string | null,
): Promise<SeoMetadataPayload | null> {
  const normalizedSlug = normalizeSeoValue(slug);
  if (SLUG_REQUIRED_KEYS.has(key) && !normalizedSlug) return null;

  return unstable_cache(
    () => fetchSeoMetadata(key, normalizedSlug),
    ["seo-metadata", key, normalizedSlug || "__root__"],
    { revalidate: SEO_METADATA_REVALIDATE_SECONDS },
  )();
}

export function buildMetadataFromSeo(
  seo: SeoMetadataPayload | null,
  {
    fallbackTitle,
    fallbackDescription,
    fallbackPath,
    robots,
    twitterCard,
  }: BuildMetadataOptions = {},
): Metadata {
  const siteUrl = getSiteUrl();
  const canonicalUrl = seo?.Canonical_URL
    ? toAbsoluteUrl(seo.Canonical_URL, siteUrl)
    : fallbackPath
      ? toAbsoluteUrl(fallbackPath, siteUrl)
      : undefined;

  const title = seo?.Meta_Title || fallbackTitle;
  const description = seo?.Meta_Description || fallbackDescription;
  const ogImage = seo?.OG_Image ? toAbsoluteUrl(seo.OG_Image, siteUrl) : "";
  const twitterImage = seo?.Twitter_Image
    ? toAbsoluteUrl(seo.Twitter_Image, siteUrl)
    : ogImage;

  const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    robots,
  };

  if (title) {
    metadata.title = title;
  }

  if (description) {
    metadata.description = description;
  }

  if (canonicalUrl) {
    metadata.alternates = { canonical: canonicalUrl };
  }

  if (title || description || canonicalUrl || ogImage) {
    metadata.openGraph = {
      type: "website",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    };
  }

  if (twitterCard || title || description || twitterImage) {
    metadata.twitter = {
      ...(twitterCard ? { card: twitterCard } : {}),
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(twitterImage ? { images: [twitterImage] } : {}),
    };
  }

  return metadata;
}