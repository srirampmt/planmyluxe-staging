import { fetchBackend, BackendConfigError } from "@/lib/backendFetch";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
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
  if (destinations.length === 0) {
    // Don't let a genuinely empty/malformed response get cached for the
    // full revalidate window below — an empty result here almost always
    // means a transient backend failure, not "there really are zero
    // destinations." Throwing means unstable_cache never populates its
    // entry from this call, so the next request retries fresh instead of
    // being stuck empty for the whole window.
    throw new Error("Backend returned an empty destinations list");
  }
  return destinations;
}

// Favourites and "the rest" (the full list backing search/resolve-by-id)
// are cached as two separate, independently-revalidatable entries, not one
// shared fetch filtered three ways per request. Favourites are
// admin-curated and worth propagating faster; the bulk list changes
// rarely. When both windows are fresh, only one real Django call happens
// (favourites reuses the all-list's cached result below).
const getAllDestinations = unstable_cache(
  fetchAllDestinations,
  ["destinations-all"],
  { revalidate: 1800, tags: ["destinations-all"] } // 30 min
);

const getFavouriteDestinations = unstable_cache(
  async () => {
    const all = await getAllDestinations();
    return all.filter((r) => r.is_active && r.favourites);
  },
  ["destinations-favourites"],
  { revalidate: 300, tags: ["destinations-favourites"] } // 5 min
);

// GET /api/destinations            -> favourites only
// GET /api/destinations?id=842     -> one row, unfiltered (any row must
//                                     resolve, not just favourites)
// GET /api/destinations?q=bordeaux -> up to 50 matching selectable rows
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const q = searchParams.get("q");

  try {
    if (id) {
      const numericId = Number(id);
      const all = await getAllDestinations();
      const match = Number.isFinite(numericId)
        ? all.find((r) => r.destination_id === numericId)
        : undefined;
      return NextResponse.json(match ?? null);
    }

    if (q && q.trim()) {
      const query = q.trim().toLowerCase();
      const all = await getAllDestinations();
      const matches = all
        .filter(isSelectableDestinationRow)
        .filter((r) => {
          const label = getDestinationLabel(r).toLowerCase();
          const breadcrumb = getDestinationBreadcrumb(r).toLowerCase();
          return label.includes(query) || breadcrumb.includes(query);
        })
        .slice(0, 50);
      return NextResponse.json(matches);
    }

    const favourites = await getFavouriteDestinations();
    return NextResponse.json(favourites);
  } catch (error) {
    if (error instanceof BackendConfigError) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    console.error("Error in /api/destinations:", error);
    // Fail soft (200 + empty/null) so the dropdown doesn't crash — nothing
    // here gets cached, so the next request retries fresh.
    return NextResponse.json(id ? null : [], { status: 200 });
  }
}
