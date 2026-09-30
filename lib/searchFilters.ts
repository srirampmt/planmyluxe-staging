import { resolveAirportIdToIata } from "@/lib/mappings/airports";
import { decodeDestinationParam, type DestinationSelection } from "@/lib/mappings/destinations";

export type SearchFilters = {
  q: string;
  destinations: DestinationSelection[];
  holiday_types: string[];
  rating: string[];
  price_min: number | null;
  price_max: number | null;
  sort: string;
  date: string | null;
  date_max: string | null;
  nights: string | null;
  departure_airports: string[];
  outbound_flight_time: string[];
  inbound_flight_time: string[];
  board_basis: string[];
  regions: string[];
  resorts: string[];
  special_offers_only: boolean;
};

export const DEFAULT_FILTERS: SearchFilters = {
  q: "",
  destinations: [],
  holiday_types: [],
  rating: [],
  price_min: null,
  price_max: null,
  sort: "best",
  date: null,
  date_max: null,
  nights: null,
  departure_airports: [],
  outbound_flight_time: [],
  inbound_flight_time: [],
  board_basis: [],
  regions: [],
  resorts: [],
  special_offers_only: false,
};

type ParamReader = { get(key: string): string | null; has(key: string): boolean };

export function seedFromUrl(searchParams: ParamReader): SearchFilters {
  const destination = decodeDestinationParam(searchParams.get("did"));
  const type = searchParams.get("type") || "";
  const sort = searchParams.get("s") || searchParams.get("sort") || "best";
  const q = searchParams.get("q") || "";
  const date = searchParams.get("dt") || searchParams.get("date") || "";
  const dateMax = searchParams.get("dtmax") || searchParams.get("date_max") || "";
  const nights = searchParams.get("n") || searchParams.get("nights") || "";
  const departurePoints = searchParams.get("dp") || searchParams.get("dep") || searchParams.get("departure") || searchParams.get("departurePoints") || "";
  const outbound = searchParams.get("outbound") || "";
  const inbound = searchParams.get("inbound") || "";
  const board_basis = searchParams.get("board_basis") || "";
  const regions = searchParams.get("regions") || "";
  const resorts = searchParams.get("resorts") || "";
  const rating = searchParams.get("rating") || "";

  const parsedAirports = departurePoints
    ? departurePoints.split(",").map(resolveAirportIdToIata).filter(Boolean) as string[]
    : [];

  return {
    ...DEFAULT_FILTERS,
    q,
    destinations: destination ? [destination] : [],
    holiday_types: type ? type.split(",") : [],
    sort,
    date: date || null,
    date_max: dateMax || null,
    nights: nights || null,
    departure_airports: parsedAirports,
    outbound_flight_time: outbound ? outbound.split(",") : [],
    inbound_flight_time: inbound ? inbound.split(",") : [],
    board_basis: board_basis ? board_basis.split(",") : [],
    regions: regions ? regions.split(",") : [],
    resorts: resorts ? resorts.split(",") : [],
    rating: rating ? rating.split(",") : [],
  };
}

// Every URL param seedFromUrl() knows how to read — checked by both
// useSearchFilters' initial useState() and its URL sync effect. Previously
// these were two separately hand-maintained lists that had already drifted
// ("board_basis"/"resorts" were in the effect's list but not the initial
// one — Phase 4 review finding): a bookmarked/shared link containing only
// `?resorts=...` or `?board_basis=...` with no `did` alongside it seeded
// from sessionStorage on first render, then got silently corrected to the
// URL's values a tick later — a flash of wrong filters plus a redundant
// extra state update on mount. One shared list can't drift.
//
// "did" (destination id + level, e.g. "842:resort") replaced the old "d"/
// "dest" slug params as part of the destination-dropdown redesign — an old
// bookmarked `?d=<slug>`/`?dest=<slug>` link simply won't seed a
// destination anymore (falls through to the existing "select a
// destination" validation state), by design.
const URL_PARAM_KEYS = [
  "did", "type", "q",
  "dp", "dep", "departure", "departurePoints",
  "dt", "date",
  "dtmax", "date_max",
  "n", "nights",
  "outbound", "inbound",
  "board_basis", "regions", "resorts",
  "rating",
] as const;

export function hasUrlParams(searchParams: ParamReader): boolean {
  return URL_PARAM_KEYS.some((key) => searchParams.has(key));
}

// The `criteria` query param for GET /searches/{id} — mirrors the POST body
// shape useSearch.ts sends, so the first page of a ?searchId= link comes
// back already filtered/sorted.
export function buildHydrationCriteria(filters: SearchFilters): string {
  return JSON.stringify({
    destinations: filters.destinations,
    holiday_types: filters.holiday_types,
    date: filters.date,
    nights: filters.nights,
    departure_airports: filters.departure_airports,
    board_basis: filters.board_basis && filters.board_basis.length > 0 ? filters.board_basis : "ANY",
    ratings: filters.rating,
    regions: filters.regions,
    resorts: filters.resorts,
    price_min: filters.price_min,
    price_max: filters.price_max,
    outbound_flight_time: filters.outbound_flight_time,
    inbound_flight_time: filters.inbound_flight_time,
    sort: filters.sort,
  });
}
