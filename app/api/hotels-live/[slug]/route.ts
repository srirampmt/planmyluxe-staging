import { BackendConfigError, fetchBackend } from "@/lib/backendFetch";
import { proxyToBackend } from "@/lib/backendProxy";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET( request: NextRequest, { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  // Live endpoint: always fetch fresh api_data
  const encoded = encodeURIComponent(slug);
  const hotelSupplierId = request.nextUrl.searchParams.get("hotelSupplierId");
  const backendPath = hotelSupplierId
    ? `/client/api/hotels-live/${encoded}/?hotelSupplierId=${hotelSupplierId}`
    : `/client/api/hotels-live/${encoded}/`;
  return proxyToBackend(backendPath);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const body = await request.json();

    const backendPayload =
      body?.auto === false
        ? { slug, departure: body.departure, auto: false }
        : { ...body, slug };

    const response = await fetchBackend("/client/api/update-hotel-search/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify(backendPayload),
    });

    const backendText = await response.text();
    let backendJson: any = null;
    if (backendText) {
      try {
        backendJson = JSON.parse(backendText);
      } catch {
        backendJson = null;
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Search update failed",
          backendStatus: response.status,
          backendBody: backendJson ?? backendText,
        },
        { status: response.status }
      );
    }

    if (!backendJson) {
      return NextResponse.json(
        {
          success: false,
          error: "Backend returned non-JSON response",
          backendStatus: response.status,
          backendBody: backendText,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      data: backendJson,
    });
  } catch (error) {
    if (error instanceof BackendConfigError) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update search" },
      { status: 500 }
    );
  }
}


