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

type SupplierPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  company: string;
  message?: string;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function hasExactly11Digits(value: string): boolean {
  return value.replace(/\D/g, "").length === 11;
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { error: "Expected Content-Type: application/json" },
      { status: 415 }
    );
  }

  const rawBody = await req.text();
  let raw: Record<string, unknown> | null = null;
  try {
    raw = rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : null;
  } catch {
    raw = null;
  }
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload: SupplierPayload = {
    first_name: asString((raw as any).first_name).trim(),
    last_name: asString((raw as any).last_name).trim(),
    email: asString((raw as any).email).trim(),
    phone_number: asString((raw as any).phone_number).trim(),
    company: asString((raw as any).company).trim(),
    message: asString((raw as any).message).trim(),
  };

  if (
    !payload.first_name ||
    !payload.last_name ||
    !payload.email ||
    !payload.phone_number ||
    !payload.company
  ) {
    return NextResponse.json(
      {
        error: "Missing required fields",
        required: [
          "first_name",
          "last_name",
          "email",
          "phone_number",
          "company",
        ],
      },
      { status: 400 }
    );
  }

  if (!hasExactly11Digits(payload.phone_number)) {
    return NextResponse.json(
      { error: "Phone number must be exactly 11 digits." },
      { status: 400 },
    );
  }

  if (isAntiSpamEnabled()) {
    const route = "/api/suppliers";
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
      identity: payload.email.toLowerCase(),
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

  return proxyToBackend("/client/api/suppliers/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }, req);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
    },
  });
}
