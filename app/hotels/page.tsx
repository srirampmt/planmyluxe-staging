import { Suspense } from "react";
import { headers } from "next/headers";
import SearchPageClient, { type ServerSearch } from "./SearchPageClient";
import { fetchSearchPage } from "@/lib/searchServerData";
import { buildHydrationCriteria, DEFAULT_FILTERS, hasUrlParams, seedFromUrl } from "@/lib/searchFilters";

export const dynamic = "force-dynamic";

type PageSearchParams = Record<string, string | string[] | undefined>;

async function loadServerSearch(searchId: string, params: PageSearchParams): Promise<NonNullable<ServerSearch>> {
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first != null) urlParams.set(key, first);
  }
  // Same seeding useSearchFilters does on the client, minus the
  // sessionStorage fallback the server can't see — a mismatch there is
  // caught by useSearch's hydrated_for_filters check.
  const filters = hasUrlParams(urlParams) ? seedFromUrl(urlParams) : DEFAULT_FILTERS;

  try {
    const { status, payload } = await fetchSearchPage(
      searchId,
      { criteria: buildHydrationCriteria(filters) },
      await headers(),
    );
    return { status, payload, filters };
  } catch (err) {
    console.error("Server-side search hydration failed:", err);
    return { status: 500, payload: null, filters };
  }
}

async function HydratedSearchPage({ searchId, params }: { searchId: string; params: PageSearchParams }) {
  const serverSearch = await loadServerSearch(searchId, params);
  return <SearchPageClient searchId={searchId} serverSearch={serverSearch} />;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<PageSearchParams> }) {
  const params = await searchParams;
  const searchId = typeof params.searchId === "string" ? params.searchId : undefined;

  if (!searchId) return <SearchPageClient />;

  return (
    <Suspense key={searchId} fallback={<SearchPageClient searchId={searchId} serverSearch={null} />}>
      <HydratedSearchPage searchId={searchId} params={params} />
    </Suspense>
  );
}
