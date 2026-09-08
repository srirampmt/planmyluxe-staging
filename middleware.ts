import { NextResponse, type NextRequest } from "next/server";

import {
  checkRateLimit,
  getClientIp,
  getIdempotencyKey,
  getRequestFingerprint,
  getUserAgent,
  isAntiSpamEnabled,
} from "./lib/antiSpam";
import { getCachedMiddlewareRedirect } from "./lib/middlewareRedirects";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const PROTECTED_API_PATHS = new Set([
  "/api/submit-newsletter",
  "/api/submit-enquiry",
  "/api/group-booking",
  "/api/suppliers",
]);

function mergeMissingSearchParams(targetUrl: URL, sourceParams: URLSearchParams) {
  for (const [key, value] of sourceParams) {
    if (!targetUrl.searchParams.has(key)) {
      targetUrl.searchParams.append(key, value);
    }
  }
}

function buildDynamicRedirectUrl(req: NextRequest, destination: string): URL | null {
  let redirectUrl: URL;

  try {
    redirectUrl = new URL(destination, req.nextUrl.origin);
  } catch {
    return null;
  }

  mergeMissingSearchParams(redirectUrl, req.nextUrl.searchParams);

  if (
    redirectUrl.origin === req.nextUrl.origin &&
    redirectUrl.pathname === req.nextUrl.pathname &&
    redirectUrl.search === req.nextUrl.search
  ) {
    return null;
  }

  return redirectUrl;
}

function normalizeOrganic(value: string): string {
  const v = value.trim().toLowerCase();
  if (!v) return "";
  if (["1", "true", "yes", "y", "organic"].includes(v)) return "1";
  if (["0", "false", "no", "n"].includes(v)) return "0";
  // If they send something else, store as-is.
  return value;
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";
  const protocol = req.headers.get("x-forwarded-proto") || url.protocol;

  let shouldRedirect = false;

  // 1. Force HTTPS (http → https)
  if (protocol === "http" && process.env.NODE_ENV === "production") {
    url.protocol = "https:";
    shouldRedirect = true;
  }

  // 2. Force non-www (www → non-www)
  if (host.startsWith("www.")) {
    url.hostname = host.replace("www.", "");
    shouldRedirect = true;
  }

  // If any redirect condition is met, return 301
  if (shouldRedirect) {
    return NextResponse.redirect(url, 301);
  }

  if (isAntiSpamEnabled() && PROTECTED_API_PATHS.has(req.nextUrl.pathname)) {
    const ip = getClientIp(req.headers);
    const ipScope = `mw:ip:${req.nextUrl.pathname}:${ip}`;
    const ipRate = checkRateLimit(ipScope, {
      limit: 3,
      windowMs: 10 * 60 * 1000,
    });

    if (!ipRate.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(ipRate.retryAfterSec),
            "X-RateLimit-Remaining": String(ipRate.remaining),
          },
        },
      );
    }

    const userAgent = getUserAgent(req.headers);
    const idempotencyKey = getIdempotencyKey(req.headers);
    const fingerprint = await getRequestFingerprint({
      route: req.nextUrl.pathname,
      ip,
      userAgent,
      identity: idempotencyKey,
    });
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-client-ip", ip);
    requestHeaders.set("x-request-fingerprint", fingerprint);
    if (idempotencyKey) {
      requestHeaders.set("x-idempotency-key", idempotencyKey);
    }
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const pathname = req.nextUrl.pathname;
  const basePath = pathname.replace(/\/thankyou\/?$/, "") || "/";

  if (basePath !== pathname) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = basePath;
    return NextResponse.redirect(redirectUrl);
  }

  const dynamicRedirect = await getCachedMiddlewareRedirect(basePath);
  if (dynamicRedirect) {
    const redirectUrl = buildDynamicRedirectUrl(req, dynamicRedirect.destination);
    if (redirectUrl) {
      return NextResponse.redirect(redirectUrl, 301);
    }
  }

  const sp = req.nextUrl.searchParams;

  // Read both exact and common variant casings.
  const utmDetails = sp.get("Utm_details") ?? sp.get("utm_details") ?? "";
  const utmSource = sp.get("utm_source") ?? "";
  const utmMedium = sp.get("utm_medium") ?? "";
  const utmCampaign = sp.get("utm_campaign") ?? "";
  // Prefer `utm_id` (backend/client standard), but accept legacy `utmid`.
  const utmId = sp.get("utm_id") ?? sp.get("utmid") ?? "";
  const utmIsOrganicRaw = sp.get("utm_is_organic") ?? "";
  const utmIsOrganic = utmIsOrganicRaw ? normalizeOrganic(utmIsOrganicRaw) : "";

  const shouldSet = Boolean(
    utmDetails || utmSource || utmMedium || utmCampaign || utmId || utmIsOrganicRaw
  );

  if (!shouldSet) return NextResponse.next();

  const res = NextResponse.next();

  const cookieOptions = {
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    httpOnly: false, // must be readable client-side for EnquiryModal
  };

  if (utmDetails) res.cookies.set("utm_details", utmDetails, cookieOptions);
  if (utmSource) res.cookies.set("utm_source", utmSource, cookieOptions);
  if (utmMedium) res.cookies.set("utm_medium", utmMedium, cookieOptions);
  if (utmCampaign) res.cookies.set("utm_campaign", utmCampaign, cookieOptions);
  if (utmId) res.cookies.set("utm_id", utmId, cookieOptions);
  if (utmIsOrganicRaw) res.cookies.set("utm_is_organic", utmIsOrganic, cookieOptions);

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sitemaps(?:/.*)?|sitemap.xsl).*)",
  ],
};
