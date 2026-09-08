import { NextResponse } from "next/server";
import { fetchMultiCentreContent } from "@/lib/multiCentreServerData";

// Hardcoded reference backup:
// app/api/multi-centre/_hardcoded-backups/content.route.hardcoded.txt

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const result = await fetchMultiCentreContent(slug);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, status: result.status, details: result.details },
      { status: result.status },
    );
  }

  return NextResponse.json(result.data, { status: 200 });
}
