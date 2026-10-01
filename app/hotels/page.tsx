import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SearchPageClient, { type ServerSearch } from "./SearchPageClient";
import { fetchSearchPage, getDestinationRows } from "@/lib/searchServerData";
import { encodeDestinationParam, findDestinationForName, makeDestinationSelection } from "@/lib/mappings/destinations";
import { buildHydrationCriteria, DEFAULT_FILTERS, defaultCheckInRange, hasUrlParams, seedFromUrl } from "@/lib/searchFilters";

export const dynamic = "force-dynamic";

type PageSearchParams = Record<string, string | string[] | undefined>;

async function loadServerSearch(searchId: string, params: PageSearchParams): Promise<NonNullable<ServerSearch>> {
  const urlParams = toUrlParams(params);
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

function toUrlParams(params: PageSearchParams): URLSearchParams {
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first != null) urlParams.set(key, first);
  }
  return urlParams;
}

// A bare ?q=<place> link (destination pages, area cards) carries a name but
// no destination id — resolve it so the page lands on a real search. Any
// destination search without a check-in date gets the default month window.
async function resolveSearchUrl(params: PageSearchParams): Promise<string | null> {
  const urlParams = toUrlParams(params);
  if (urlParams.has("searchId")) return null;
  let changed = false;

  const q = urlParams.get("q")?.trim();
  if (q && !urlParams.has("did")) {
    const match = findDestinationForName(await getDestinationRows(), q);
    if (match) {
      urlParams.set("did", encodeDestinationParam(makeDestinationSelection(match)));
      if (!urlParams.has("n") && !urlParams.has("nights")) urlParams.set("n", "7");
      urlParams.set("search", "true");
      changed = true;
    }
  }

  if (urlParams.has("did") && !urlParams.get("dt") && !urlParams.get("date")) {
    const { date, date_max } = defaultCheckInRange();
    urlParams.set("dt", date);
    urlParams.set("dtmax", date_max);
    urlParams.delete("date_max");
    changed = true;
  }

  return changed ? `/hotels?${urlParams.toString()}` : null;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<PageSearchParams> }) {
  const params = await searchParams;

  const resolvedUrl = await resolveSearchUrl(params);
  if (resolvedUrl) redirect(resolvedUrl);

  const searchId = typeof params.searchId === "string" ? params.searchId : undefined;

  if (!searchId) return <SearchPageClient />;

  return (
    <Suspense key={searchId} fallback={<SearchPageClient searchId={searchId} serverSearch={null} />}>
      <HydratedSearchPage searchId={searchId} params={params} />
    </Suspense>
  );
}
