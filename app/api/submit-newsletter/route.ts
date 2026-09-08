import { NextResponse } from "next/server";

import {
  checkRateLimit,
  consumeDedupeKey,
  consumeIdempotencyKey,
  getClientIp,
  getIdempotencyKey,
  getRequestFingerprint,
  getUserAgent,
  hashPayload,
  isAntiSpamEnabled,
} from "@/lib/antiSpam";
import { proxyToBackend } from "@/lib/backendProxy";

export async function POST(req: Request) {
  const rawBody = await req.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : null;
  } catch {
    data = null;
  }

  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  if (isAntiSpamEnabled()) {
    const route = "/api/submit-newsletter";
    const ip = getClientIp(req.headers);
    const idempotencyKey = getIdempotencyKey(req.headers);

    if (!idempotencyKey) {
      return NextResponse.json({ error: "Missing idempotency key" }, { status: 400 });
    }

    const ipRate = checkRateLimit(`rt:ip:${route}:${ip}`, {
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
    const identity = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
    const fingerprint = await getRequestFingerprint({
      route,
      ip,
      userAgent,
      identity,
    });

    const fpRate = checkRateLimit(`rt:fp:${route}:${fingerprint}`, {
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (!fpRate.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(fpRate.retryAfterSec),
            "X-RateLimit-Remaining": String(fpRate.remaining),
          },
        },
      );
    }

    const payloadHash = await hashPayload(rawBody);
    const idemScope = `rt:idem:${route}:${ip}:${idempotencyKey}`;
    const dedupeScope = `rt:dup:${route}:${ip}:${payloadHash}`;

    if (!consumeIdempotencyKey(idemScope, 60 * 60 * 1000) || !consumeDedupeKey(dedupeScope)) {
      return NextResponse.json(
        { error: "Duplicate request detected. Please try again in a moment." },
        { status: 409 },
      );
    }
  }

  return proxyToBackend("/client/api/submit-newsletter/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }, req);
}
