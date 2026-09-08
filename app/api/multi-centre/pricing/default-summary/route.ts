import { NextResponse } from "next/server";
import { BackendConfigError, fetchBackend } from "@/lib/backendFetch";
import { computeSelectedCardPrice } from "@/lib/multi-centre-selected-price";

export const runtime = "nodejs";

type Body = {
  slugs?: unknown;
};

async function fetchDefaultPriceData(slug: string) {
  const res = await fetchBackend(`/api/multi-center-default-price/${encodeURIComponent(slug)}/`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) return null;

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  const payload = json?.default_price_data ?? json;
  if (!payload || typeof payload !== "object") return null;
  return payload;
}

export async function POST(request: Request) {
  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slugsRaw = (body as any)?.slugs;
  if (!Array.isArray(slugsRaw)) {
    return NextResponse.json({ error: "Body must include slugs: string[]" }, { status: 400 });
  }

  const slugs = slugsRaw
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter((s) => s.length > 0);

  const uniqueSlugs = Array.from(new Set(slugs));

  const prices: Record<string, number | null> = {};
  let results: ReadonlyArray<readonly [string, number | null]>;
  try {
    results = await Promise.all(
      uniqueSlugs.map(async (slug) => {
        try {
          const item = await fetchDefaultPriceData(slug);
          return [slug, item ? computeSelectedCardPrice(item as any) : null] as const;
        } catch (error) {
          if (error instanceof BackendConfigError) {
            throw error;
          }

          return [slug, null] as const;
        }
      }),
    );
  } catch (error) {
    if (error instanceof BackendConfigError) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    return NextResponse.json({ error: "Failed to fetch default prices" }, { status: 500 });
  }

  for (const [slug, price] of results) {
    prices[slug] = price;
  }

  return NextResponse.json({ prices }, { status: 200 });
}
