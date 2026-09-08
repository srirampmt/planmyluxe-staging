import { NextResponse } from "next/server";
import { BackendConfigError, fetchBackend } from "@/lib/backendFetch";

// Hardcoded reference backup:
// app/api/multi-centre/_hardcoded-backups/pricing.route.hardcoded.txt

export const runtime = "nodejs";

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : value == null ? fallback : String(value);
}

function asFiniteNumber(value: unknown): number | undefined {
  const num = typeof value === "number" ? value : Number(String(value));
  return Number.isFinite(num) ? num : undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let body: { airportId?: unknown } = {};
  try {
    body = (await request.json()) as { airportId?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const airportId = asString(body.airportId).trim();
  if (!airportId) {
    return NextResponse.json({ error: "airportId required" }, { status: 400 });
  }

  try {
    const res = await fetchBackend(
      `/client/api/multi-center-calendar-updated/${encodeURIComponent(slug)}/`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ airportId }),
      cache: "no-store",
      },
    );

    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "Backend request failed", status: res.status, details: json ?? text },
        { status: res.status },
      );
    }

    const payload = json?.default_price_data ?? json;
    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { error: "Invalid backend response shape for pricing" },
        { status: 502 },
      );
    }

    const fullPriceData = asRecord((payload as any).priceDataByAirport);
    if (!Object.prototype.hasOwnProperty.call(fullPriceData, airportId)) {
      return NextResponse.json({ error: "Airport not available" }, { status: 404 });
    }

    const airportPriceData = fullPriceData[airportId];

    return NextResponse.json(
      {
        priceDataByAirport: {
          [airportId]: airportPriceData,
        },
        landingMonth: asString((payload as any).landingMonth, ""),
        localTax: asFiniteNumber((payload as any).localTax),
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof BackendConfigError) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    return NextResponse.json(
      {
        error: "Failed to connect to backend server",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }
}
