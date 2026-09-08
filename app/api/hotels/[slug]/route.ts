import { proxyToBackend } from "@/lib/backendProxy";
import { BackendConfigError, fetchBackend } from "@/lib/backendFetch";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const encoded = encodeURIComponent(slug);
  return proxyToBackend(`/client/api/hotels/${encoded}/`, {
    // Cache page/content response for 20 minutes.
    next: { revalidate: 1000 },
    cache: "no-store",
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // Send search update request to Django backend
    const response = await fetchBackend("/client/api/update-hotel-search/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        slug,
      }),
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

    console.error("Error updating hotel search:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update search" },
      { status: 500 }
    );
  }
}
