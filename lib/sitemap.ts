import { fetchBackend } from "@/lib/backendFetch";
import { getSiteUrl } from "@/lib/site-url";

type SiteDataPayload = {
  destinations?: unknown;
  holiday_styles?: unknown;
  offer_types?: unknown;
  hotel_details?: unknown;

  urls?: unknown;
  url_list?: unknown;
  paths?: unknown;
  routes?: unknown;
  pages?: unknown;
  results?: unknown;
  data?: unknown;
};

type SitemapIndexEntry = {
  loc: string;
  lastmod: string;
};

type SitemapUrlEntry = {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
};

export const SITEMAP_BUCKETS = [
  { id: "static", path: "/sitemaps/static.xml" },
  { id: "destinations", path: "/sitemaps/destinations.xml" },
  { id: "holiday-styles", path: "/sitemaps/holiday-styles.xml" },
  { id: "hotels", path: "/sitemaps/hotels.xml" },
  { id: "offers", path: "/sitemaps/offers.xml" },
  { id: "misc", path: "/sitemaps/misc.xml" },
] as const;

export type SitemapBucketId = (typeof SITEMAP_BUCKETS)[number]["id"];

const XML_STYLESHEET_HREF = "/sitemap.xsl";

const STATIC_PATHS = [
  "/",
  "/about-us",
  "/contact-us",
  "/faqs",
  "/groupbookings",
  "/payment-options",
  "/privacy-policy",
  "/suppliers",
  "/terms-conditions",
  "/destinations",
  "/holiday-styles",
  "/all-offers",
  "/top-trending-deals",
  "/trending-multi-centres",
] as const;

const STATIC_PATH_SET = new Set<string>(STATIC_PATHS);

function isProbablyWebUrlOrPath(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^(mailto:|tel:|javascript:)/i.test(trimmed)) return false;
  if (/(\.(png|jpe?g|gif|webp|svg|pdf|ico|css|js|map))(\?.*)?$/i.test(trimmed)) {
    return false;
  }
  return trimmed.startsWith("/") || /^https?:\/\//i.test(trimmed);
}

function toAbsoluteUrl(value: string, siteUrl: string): string {
  try {
    return new URL(value, siteUrl).toString();
  } catch {
    return value;
  }
}

function toNormalizedPathname(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed || "/";
}

function getRelativePathname(relativePath: string): string {
  const pathname = relativePath.split(/[?#]/, 1)[0] ?? "/";
  return toNormalizedPathname(pathname || "/");
}

function normalizeRelativePath(value: string, siteUrl: string): string | null {
  const trimmed = value.trim();
  if (!isProbablyWebUrlOrPath(trimmed)) return null;

  try {
    const base = new URL(siteUrl);
    const url = trimmed.startsWith("/") ? new URL(trimmed, base) : new URL(trimmed);
    if (url.origin !== base.origin) return null;

    const pathname = toNormalizedPathname(url.pathname || "/");
    return `${pathname}${url.search}`;
  } catch {
    return null;
  }
}

function isExcludedHotelTsPath(relativePath: string): boolean {
  if (!relativePath.startsWith("/hotels/")) return false;

  const slug = getRelativePathname(relativePath).slice("/hotels/".length);
  return slug.toLowerCase().endsWith("-ts");
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function getGenericUrlList(payload: unknown): string[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return asStringArray(payload);

  if (typeof payload !== "object") return [];
  const obj = payload as Record<string, unknown>;
  const candidates = ["urls", "url_list", "paths", "routes", "pages", "results", "data"];

  for (const key of candidates) {
    const value = obj[key];
    if (!Array.isArray(value)) continue;

    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const url = typeof record.url === "string" ? record.url : undefined;
          const path = typeof record.path === "string" ? record.path : undefined;
          return (url ?? path ?? "").trim();
        }

        return "";
      })
      .filter(Boolean)
      .filter(isProbablyWebUrlOrPath);
  }

  return [];
}

function collectGenericRelativePaths(payload: unknown, siteUrl: string): string[] {
  return getGenericUrlList(payload)
    .map((value) => normalizeRelativePath(value, siteUrl))
    .filter((value): value is string => Boolean(value))
    .filter((value) => !isExcludedHotelTsPath(value));
}

function classifyRelativePath(relativePath: string): SitemapBucketId {
  const pathname = getRelativePathname(relativePath);

  if (STATIC_PATH_SET.has(pathname)) return "static";
  if (pathname.startsWith("/destinations/")) return "destinations";
  if (pathname.startsWith("/holiday-styles/")) return "holiday-styles";
  if (pathname.startsWith("/hotels/")) return "hotels";
  if (pathname.startsWith("/offers/")) return "offers";
  return "misc";
}

function dedupeRelativePaths(paths: string[]): string[] {
  return Array.from(new Set(paths));
}

function getStructuredBucketPaths(bucketId: SitemapBucketId, payload: unknown): string[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];

  const data = payload as SiteDataPayload;

  switch (bucketId) {
    case "static":
      return [...STATIC_PATHS];
    case "destinations":
      return asStringArray(data.destinations).map((slug) => `/destinations/${encodeURIComponent(slug)}`);
    case "holiday-styles":
      return asStringArray(data.holiday_styles).map((slug) => `/holiday-styles/${encodeURIComponent(slug)}`);
    case "offers":
      return asStringArray(data.offer_types).map((slug) => `/offers/${encodeURIComponent(slug)}`);
    case "hotels":
      return asStringArray(data.hotel_details)
        .map((slug) => `/hotels/${encodeURIComponent(slug)}`)
        .filter((path) => !isExcludedHotelTsPath(path));
    case "misc":
      return [];
  }
}

function buildBucketRelativePaths(bucketId: SitemapBucketId, payload: unknown, siteUrl: string): string[] {
  const structuredPaths = getStructuredBucketPaths(bucketId, payload);
  const genericPaths = collectGenericRelativePaths(payload, siteUrl).filter(
    (path) => classifyRelativePath(path) === bucketId
  );

  return dedupeRelativePaths([...structuredPaths, ...genericPaths]);
}

async function fetchSiteData(): Promise<unknown | null> {
  try {
    const res = await fetchBackend("/client/api/site-data/", {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function createUrlEntries(relativePaths: string[], siteUrl: string, nowIso: string): SitemapUrlEntry[] {
  const entries = relativePaths
    .map((path) => {
      const normalizedPath = getRelativePathname(path);
      const isHome = normalizedPath === "/";

      return {
        loc: toAbsoluteUrl(path, siteUrl),
        lastmod: nowIso,
        changefreq: isHome ? "daily" : "weekly",
        priority: isHome ? "0.8" : "0.7",
      } satisfies SitemapUrlEntry;
    })
    .filter((entry) => isProbablyWebUrlOrPath(entry.loc));

  const deduped = new Map<string, SitemapUrlEntry>();
  for (const entry of entries) {
    deduped.set(entry.loc, entry);
  }

  return Array.from(deduped.values());
}

function buildSitemapIndexXml(entries: SitemapIndexEntry[]): string {
  const sitemapIndex = entries
    .map(
      (entry) =>
        "<sitemap>" +
        `<loc>${escapeXml(entry.loc)}</loc>` +
        `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` +
        "</sitemap>"
    )
    .join("");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<?xml-stylesheet type="text/xsl" href="${XML_STYLESHEET_HREF}"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapIndex}</sitemapindex>`
  );
}

function buildUrlSetXml(entries: SitemapUrlEntry[]): string {
  const urlSet = entries
    .map(
      (entry) =>
        "<url>" +
        `<loc>${escapeXml(entry.loc)}</loc>` +
        `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` +
        `<changefreq>${escapeXml(entry.changefreq)}</changefreq>` +
        `<priority>${escapeXml(entry.priority)}</priority>` +
        "</url>"
    )
    .join("");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<?xml-stylesheet type="text/xsl" href="${XML_STYLESHEET_HREF}"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlSet}</urlset>`
  );
}

function createXmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function createSitemapIndexResponse(): Promise<Response> {
  const siteUrl = getSiteUrl();
  const nowIso = new Date().toISOString();

  const entries = SITEMAP_BUCKETS.map((bucket) => ({
    loc: toAbsoluteUrl(bucket.path, siteUrl),
    lastmod: nowIso,
  }));

  return createXmlResponse(buildSitemapIndexXml(entries));
}

export async function createSitemapBucketResponse(bucketId: SitemapBucketId): Promise<Response> {
  const siteUrl = getSiteUrl();
  const payload = await fetchSiteData();
  const relativePaths = buildBucketRelativePaths(bucketId, payload, siteUrl);
  const nowIso = new Date().toISOString();

  return createXmlResponse(buildUrlSetXml(createUrlEntries(relativePaths, siteUrl, nowIso)));
}