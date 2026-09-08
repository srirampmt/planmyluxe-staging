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

function hasExactly11Digits(value: string): boolean {
  return value.replace(/\D/g, "").length === 11;
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  let body: any = undefined;
  let payloadIdentity = "";
  let payloadHashBase = "";

  if (contentType.includes("application/json")) {
    body = await req.text(); // pass raw JSON string
    payloadHashBase = body;

    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = body ? (JSON.parse(body) as Record<string, unknown>) : null;
    } catch {
      parsed = null;
    }
    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const honeypot =
      typeof (parsed as Record<string, unknown>)["accept-terms-conditions"] === "string"
        ? String((parsed as Record<string, unknown>)["accept-terms-conditions"]).trim()
        : "";
    if (honeypot) {
      return NextResponse.json({ error: "Request validation failed" }, { status: 400 });
    }

    if (typeof (parsed as Record<string, unknown>).email === "string") {
      payloadIdentity = String((parsed as Record<string, unknown>).email).trim().toLowerCase();
    }

    const phoneValue =
      typeof (parsed as Record<string, unknown>).phone === "string"
        ? String((parsed as Record<string, unknown>).phone)
        : typeof (parsed as Record<string, unknown>).contactNumber === "string"
          ? String((parsed as Record<string, unknown>).contactNumber)
          : "";
    if (!hasExactly11Digits(phoneValue)) {
      return NextResponse.json(
        { error: "Phone number must be exactly 11 digits." },
        { status: 400 },
      );
    }
  } else {
    const formData = await req.formData();
    body = formData;

    const honeypot = (formData.get("accept-terms-conditions") || "").toString().trim();
    if (honeypot) {
      return NextResponse.json({ error: "Request validation failed" }, { status: 400 });
    }

    const email = (formData.get("email") || "").toString().trim().toLowerCase();
    payloadIdentity = email;

    const phoneValue =
      (formData.get("phone") || formData.get("contactNumber") || "").toString();
    if (!hasExactly11Digits(phoneValue)) {
      return NextResponse.json(
        { error: "Phone number must be exactly 11 digits." },
        { status: 400 },
      );
    }

    const entries: Array<[string, string]> = [];
    formData.forEach((value, key) => {
      entries.push([key, typeof value === "string" ? value : value.name]);
    });
    entries.sort(([a], [b]) => a.localeCompare(b));
    payloadHashBase = JSON.stringify(entries);
  }

  if (isAntiSpamEnabled()) {
    const route = "/api/submit-enquiry";
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

    const fingerprint = await getRequestFingerprint({
      route,
      ip,
      userAgent: getUserAgent(req.headers),
      identity: payloadIdentity,
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

    const payloadHash = await hashPayload(payloadHashBase);
    const idemScope = `rt:idem:${route}:${ip}:${idempotencyKey}`;
    const dedupeScope = `rt:dup:${route}:${ip}:${payloadHash}`;
    if (!consumeIdempotencyKey(idemScope, 60 * 60 * 1000) || !consumeDedupeKey(dedupeScope)) {
      return NextResponse.json(
        { error: "Duplicate request detected. Please try again in a moment." },
        { status: 409 },
      );
    }
  }

  return proxyToBackend("/client/api/submit-enquiry/", {
    method: "POST",
    headers: contentType.includes("application/json") ? { "Content-Type": "application/json" } : undefined,
    body,
  }, req);
}
