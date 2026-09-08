import { fetchBackend } from "@/lib/backendFetch";
import { NextRequest, NextResponse } from "next/server";
import { getIdempotencyKey, getClientIp, checkRateLimit } from "@/lib/antiSpam";
import { isDestinationSelection, type DestinationSelection } from "@/lib/mappings/destinations";
import { resolveAirportIataToId } from "@/lib/mappings/airports";

export const dynamic = "force-dynamic";

const MONTH_MAP: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12"
};

function parseDateString(dateStr: string): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const getInferredYear = (monthStr: string, dayStr: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    const monthIndex = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    if (isNaN(monthIndex) || isNaN(day)) return currentYear;
    let year = currentYear;
    if (new Date(year, monthIndex, day) < today) {
      year += 1;
    }
    return year;
  };

  const dashMatch = trimmed.match(/^(\d+)-(\d+)-([a-zA-Z]+)(?:-(\d{4}))?$/i);
  if (dashMatch) {
    const dayStr = dashMatch[1].padStart(2, "0");
    const monthShort = dashMatch[3].toLowerCase().slice(0, 3);
    const monthStr = MONTH_MAP[monthShort];
    if (monthStr) {
      let yearStr = dashMatch[4];
      if (!yearStr) {
        yearStr = String(getInferredYear(monthStr, dayStr));
      }
      return `${yearStr}-${monthStr}-${dayStr}`;
    }
  }
  const firstPart = trimmed.split("—")[0].trim().split("-")[0].trim();
  const tokens = firstPart.split(/\s+/);
  if (tokens.length >= 2) {
    const dayStr = tokens[0].padStart(2, "0");
    const monthShort = tokens[1].toLowerCase().slice(0, 3);
    const monthStr = MONTH_MAP[monthShort];
    if (monthStr) {
      let yearStr = tokens[2];
      if (!yearStr) {
        yearStr = String(getInferredYear(monthStr, dayStr));
      }
      return `${yearStr}-${monthStr}-${dayStr}`;
    }
  }
  return "";
}

// GET /api/hotelsearch?searchId=...&cursor=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchId = searchParams.get("searchId");
    const cursor = searchParams.get("cursor");
    // Current filter/sort state, forwarded as-is (still URL-encoded JSON) so
    // Django can serve the matching filtered view on a bare ?searchId= link
    // instead of a flash of unfiltered results — see page.tsx's hydration
    // effect, which is the only caller that sends this without a cursor.
    const criteria = searchParams.get("criteria");

    if (!searchId) {
      return NextResponse.json({ success: false, error: "searchId query parameter is required." }, { status: 400 });
    }

    // Forward cookies from browser request to Django backend
    const clientCookies = request.headers.get("cookie") || "";

    // Construct Django backend paging endpoint
    let djangoUrl = `/client/api/v1/searches/${searchId}`;
    const forwardParams = new URLSearchParams();
    if (cursor) forwardParams.set("cursor", cursor);
    if (criteria) forwardParams.set("criteria", criteria);
    const forwardQs = forwardParams.toString();
    if (forwardQs) {
      djangoUrl += `?${forwardQs}`;
    }

    const visitorId = request.headers.get("x-visitor-id") || "";
    const sessionId = request.headers.get("x-session-id") || "";
    const clientSignature = request.headers.get("x-client-signature") || "";
    const visitorCountry = request.headers.get("x-vercel-ip-country") || "";
    const visitorLocation = JSON.stringify({
      country: request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "",
      region: request.headers.get("x-vercel-ip-country-region") || request.headers.get("cf-region") || "",
      city: request.headers.get("x-vercel-ip-city") || request.headers.get("cf-ipcity") || "",
      latitude: request.headers.get("x-vercel-ip-latitude") || request.headers.get("cf-latitude") || "",
      longitude: request.headers.get("x-vercel-ip-longitude") || request.headers.get("cf-longitude") || "",
      timezone: request.headers.get("x-vercel-ip-timezone") || "",
    });

    const response = await fetchBackend(djangoUrl, {
      method: "GET",
      headers: {
        "Cookie": clientCookies,
        "X-Visitor-ID": visitorId,
        "X-Session-ID": sessionId,
        "X-Client-Signature": clientSignature,
        "X-Visitor-Country": visitorCountry,
        "X-Visitor-Location": visitorLocation,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to retrieve search page results", backendStatus: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, ...data }, { status: 200 });

  } catch (err: any) {
    console.error("Internal error in cursor GET route handler:", err);
    return NextResponse.json({ success: false, error: "Internal error", details: err.message }, { status: 500 });
  }
}

// POST /api/hotelsearch (Create Search Session)
export async function POST(request: NextRequest) {
  try {
    // Edge-level defense in depth — bound by IP, per Node instance. This is
    // NOT the authoritative rate limit (that's enforced in Django, which
    // holds regardless of how many frontend instances exist), but it stops
    // an obvious client-side request loop before it even reaches the
    // backend / supplier. See PML-Search-Flow-Review.md C5.
    const clientIp = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`hotelsearch:create:${clientIp}`, {
      limit: 30,
      windowMs: 5 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many searches. Please slow down and try again shortly." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSec) } }
      );
    }

    const idempotencyKey = getIdempotencyKey(request.headers);

    const body = await request.json();

    // Map inputs to match backend search criteria structure. Each entry is
    // {destination_id, <resort|region|country|top_level>: true} — drop
    // anything malformed instead of coercing it (String(obj) would silently
    // become "[object Object]").
    const destinations: DestinationSelection[] = (Array.isArray(body.destinations) ? body.destinations : [])
      .filter(isDestinationSelection);

    const holiday_types: string[] = (Array.isArray(body.holiday_types) ? body.holiday_types : [])
      .map((s: unknown) => String(s).trim())
      .filter(Boolean);

    const resorts: string[] = (Array.isArray(body.resorts) ? body.resorts : [])
      .map((s: unknown) => String(s).trim())
      .filter(Boolean);

    const facilities: string[] = (Array.isArray(body.facilities) ? body.facilities : [])
      .map((s: unknown) => String(s).trim())
      .filter(Boolean);

    const ratings: number[] = (Array.isArray(body.ratings) ? body.ratings : [])
      .map((s: unknown) => parseInt(String(s), 10))
      .filter((n: number) => !isNaN(n));

    const travelDate = parseDateString(body.date) || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    // No fallback here, unlike `date` above -- an absent date_max must stay
    // absent (exact-date search), not get a fabricated value.
    const travelDateMax = body.date_max ? parseDateString(body.date_max) : "";

    // Django expects numeric provider ids, not IATA codes — every real
    // caller already sends IATA codes (resolveAirportIataToId is
    // idempotent on already-resolved input), so resolve directly and drop
    // anything that didn't come back as a genuine numeric id.
    const airportsList = (body.departure_airports || [])
      .map((code: string) => resolveAirportIataToId(code))
      .filter((id: string) => /^\d+$/.test(id));
    if (airportsList.length === 0) {
      airportsList.push(...["LCY", "LGW", "LHR", "LTN", "STN"].map(resolveAirportIataToId));
    }

    const nights = body.nights ? (parseInt(String(body.nights), 10) || 7) : 7;
    const board_basis = body.board_basis || "ANY";
    const sort = body.sort || "price_asc";
    const price_min = typeof body.price_min === "number" ? body.price_min : null;
    const price_max = typeof body.price_max === "number" ? body.price_max : null;
    const outbound_flight_time = Array.isArray(body.outbound_flight_time) ? body.outbound_flight_time : [];
    const inbound_flight_time = Array.isArray(body.inbound_flight_time) ? body.inbound_flight_time : [];

    const payload = {
      destinations,
      holiday_types,
      date: travelDate,
      date_max: travelDateMax || null,
      nights,
      departure_airports: airportsList,
      board_basis,
      ratings,
      resorts,
      facilities,
      sort,
      price_min,
      price_max,
      outbound_flight_time,
      inbound_flight_time,
      rooms: body.rooms || [{ adults: 2, children: 0, childrenAges: [] }],
    };

    // Forward browser cookies & headers
    const clientCookies = request.headers.get("cookie") || "";
    const clientCsrfToken = request.headers.get("x-csrftoken") || "";

    const visitorId = request.headers.get("x-visitor-id") || "";
    const sessionId = request.headers.get("x-session-id") || "";
    const clientSignature = request.headers.get("x-client-signature") || "";
    const visitorCountry = request.headers.get("x-vercel-ip-country") || "";
    const visitorLocation = JSON.stringify({
      country: request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "",
      region: request.headers.get("x-vercel-ip-country-region") || request.headers.get("cf-region") || "",
      city: request.headers.get("x-vercel-ip-city") || request.headers.get("cf-ipcity") || "",
      latitude: request.headers.get("x-vercel-ip-latitude") || request.headers.get("cf-latitude") || "",
      longitude: request.headers.get("x-vercel-ip-longitude") || request.headers.get("cf-longitude") || "",
      timezone: request.headers.get("x-vercel-ip-timezone") || "",
    });

    const response = await fetchBackend("/client/api/v1/searches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": clientCookies,
        "X-CSRFToken": clientCsrfToken,
        "X-Visitor-ID": visitorId,
        "X-Session-ID": sessionId,
        "X-Client-Signature": clientSignature,
        "X-Visitor-Country": visitorCountry,
        "X-Visitor-Location": visitorLocation,
        // Django's own search-create rate limit (views.py:enforce_rate_limit)
        // keys on get_client_ip(request) — but the ONLY caller Django ever
        // accepts on /client/api/* is this Next.js server itself
        // (NextServerOnlyMiddleware requires X-NEXT-SERVER-KEY), and this
        // handler previously forwarded no IP header at all. That left Django
        // rate-limiting its one trusted caller's own egress connection
        // instead of each individual visitor — every real visitor shared the
        // same bucket. `clientIp` above (from antiSpam.ts's getClientIp,
        // already used for this same route's own Vercel-edge rate limit) is
        // resolved from the ACTUAL incoming browser request, so forward it
        // as X-Real-IP — the same header name/pattern lib/backendProxy.ts
        // already uses for other backend-proxied routes — and trust it in
        // Django specifically because it only ever arrives alongside the
        // already-authenticated X-NEXT-SERVER-KEY (search redesign
        // follow-up: P2.2 revisited after the Phase 4 review).
        ...(clientIp && clientIp !== "unknown" ? { "X-Real-IP": clientIp } : {}),
        // Forwarded to Django so its Redis-backed idempotency cache
        // (idempotency:{key}, ~90s TTL) can actually short-circuit a
        // retried/duplicate POST with the same key. Previously read via
        // getIdempotencyKey() above but never forwarded here, so the
        // backend mechanism was unreachable. Conditional so an empty
        // string is never sent as a literal header value.
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Django searches v2 backend error response:", errorText);
      return NextResponse.json(
        { success: false, error: "Search creation failed", backendStatus: response.status, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Set cookies received from Django backend (like device_token) back to browser response
    const responseCookies = response.headers.getSetCookie();
    const nextResponse = NextResponse.json({ success: true, ...data }, { status: 201 });
    for (const cookieStr of responseCookies) {
      nextResponse.headers.append("set-cookie", cookieStr);
    }

    return nextResponse;

  } catch (err: any) {
    console.error("Internal error in searches v2 route handler:", err);
    return NextResponse.json({ success: false, error: "Internal error", details: err.message }, { status: 500 });
  }
}
