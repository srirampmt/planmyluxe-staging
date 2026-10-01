import { NextResponse } from "next/server";
import { fetchBackend } from "@/lib/backendFetch";

export const revalidate = 10800;

export type LiveOffer = {
  hotel_name: string;
  slug: string;
  tag: string;
  expires_on: string;
};

export async function GET() {
  try {
    const res = await fetchBackend("/client/api/live-offers/", {
      next: { revalidate: 10800 },
    });
    if (!res.ok) return NextResponse.json([]);
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? (data as LiveOffer[]) : []);
  } catch (error) {
    console.error("Error in /api/live-offers:", error);
    return NextResponse.json([]);
  }
}
