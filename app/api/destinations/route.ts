import { fetchBackend, BackendConfigError } from "@/lib/backendFetch";
import { NextResponse } from "next/server";
import {
  isSelectableDestinationRow,
  getDestinationLabel,
  getDestinationBreadcrumb,
  type DestinationRow,
} from "@/lib/mappings/destinations";

export const dynamic = "force-dynamic";

async function fetchAllDestinations(): Promise<DestinationRow[]> {
  const res = await fetchBackend("/client/api/destinations/", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Backend returned non-OK status: ${res.status}`);
  }
  const data = await res.json();
  const destinations = Array.isArray(data)
    ? data
    : Array.isArray(data?.destinations)
      ? data.destinations
      : [];
  return destinations as DestinationRow[];
}

// GET /api/destinations            -> full active list (CMS search groups)
// GET /api/destinations?id=842     -> one row by destination_id (option pk)
// GET /api/destinations?q=bordeaux -> up to 50 matching selectable rows
// No Next unstable_cache: Django process cache rebuilds on CMS write.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const q = searchParams.get("q");

  try {
    const all = await fetchAllDestinations();

    if (id) {
      const numericId = Number(id);
      const match = Number.isFinite(numericId)
        ? all.find((r) => r.destination_id === numericId)
        : undefined;
      return NextResponse.json(match ?? null);
    }

    if (q && q.trim()) {
      const query = q.trim().toLowerCase();
      const matches = all
        .filter(isSelectableDestinationRow)
        .filter((r) => {
          const label = getDestinationLabel(r).toLowerCase();
          const breadcrumb = getDestinationBreadcrumb(r).toLowerCase();
          const group = (r.group_name || "").toLowerCase();
          return label.includes(query) || breadcrumb.includes(query) || group.includes(query);
        })
        .slice(0, 50);
      return NextResponse.json(matches);
    }

    return NextResponse.json(all.filter((r) => r.is_active));
  } catch (error) {
    if (error instanceof BackendConfigError) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    console.error("Error in /api/destinations:", error);
    return NextResponse.json(id ? null : [], { status: 200 });
  }
}
