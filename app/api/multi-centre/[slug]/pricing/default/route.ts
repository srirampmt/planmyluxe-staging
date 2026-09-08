import { NextResponse } from "next/server";
import { fetchMultiCentreDefaultPricing } from "@/lib/multiCentreServerData";

// Hardcoded reference backup:
// app/api/multi-centre/_hardcoded-backups/pricing.default.route.hardcoded.txt

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const result = await fetchMultiCentreDefaultPricing(slug);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, status: result.status, details: result.details },
      { status: result.status },
    );
  }

  return NextResponse.json(result.data, { status: 200 });
}
