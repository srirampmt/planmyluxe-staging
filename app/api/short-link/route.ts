import { NextResponse } from "next/server";

import { BackendConfigError, fetchBackend } from "@/lib/backendFetch";

export const dynamic = "force-dynamic";

type ShortLinkResolvePayload = {
  keyword?: string;
  target_url?: string;
  error?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const link = (searchParams.get("link") || "").trim();

  if (!link) {
    return NextResponse.json({ error: "Missing link parameter." }, { status: 400 });
  }

  try {
    const res = await fetchBackend(
      `/client/api/short-link/?link=${encodeURIComponent(link)}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );

    const payload = (await res.json().catch(() => null)) as ShortLinkResolvePayload | null;

    if (!res.ok) {
      return NextResponse.json(
        { error: payload?.error || "Short link not found." },
        { status: res.status },
      );
    }

    const targetUrl = typeof payload?.target_url === "string" ? payload.target_url.trim() : "";
    if (!targetUrl) {
      return NextResponse.json({ error: "Short link not found." }, { status: 404 });
    }

    return NextResponse.json({
      keyword: payload?.keyword || link,
      target_url: targetUrl,
    });
  } catch (error) {
    if (error instanceof BackendConfigError) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    console.error("Error in /api/short-link:", error);
    return NextResponse.json({ error: "Unable to resolve short link." }, { status: 502 });
  }
}
