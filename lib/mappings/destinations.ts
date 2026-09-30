/**
 * Flat destinations list shape (from /client/api/destinations/) and the
 * encode/decode helpers shared between the search bar, filter state, and
 * the search POST payload. See the destination-dropdown redesign plan.
 */

// 'city' is never set by the /client/api/destinations/ response today (a
// city-level DestinationHierarchy row carries none of the resort/region/
// country/top_level flags there) — it only ever appears on a
// DestinationSelection, synthesized by makeDestinationSelection below as
// the fallback when a row has no other flag. It exists so a favourited
// city (see the search bar's "Popular Destinations" section, the one place
// a city-level row is surfaced at all) can still be selected and submitted
// like any other level, not just displayed.
export type DestinationLevel = 'resort' | 'region' | 'country' | 'top_level' | 'city';

const LEVELS: DestinationLevel[] = ['resort', 'region', 'country', 'top_level', 'city'];

export type DestinationRow = {
  destination_id: number;
  resort?: true;
  region?: true;
  country?: true;
  top_level?: true;
  city?: true;
  display_name?: string;
  name?: string;
  group_name?: string;
  group_sort_order?: number;
  sort_order?: number;
  top_level_name: string;
  country_name: string;
  region_name: string;
  resort_name: string;
  city_name?: string;
  from_airports: string;
  // Comma-separated NEGATIVE ids (e.g. "-1,-9,-12"), each naming a
  // regional "Any X" departure group (see lib/mappings/airports.ts's
  // AIRPORT_NAMES, which already covers this exact id space — it's the
  // same table app/hotels/[slug]'s calendar uses for departure ids).
  // Optional: absent on rows from a backend that hasn't added it yet.
  from_airports_group_ids?: string;
  is_active: boolean;
  favourites?: boolean;
};

export type DestinationSelection = {
  destination_id: number;
  resort?: true;
  region?: true;
  country?: true;
  top_level?: true;
  city?: true;
};

export function getDestinationLevel(
  sel: Pick<DestinationSelection, 'resort' | 'region' | 'country' | 'top_level' | 'city'>
): DestinationLevel | null {
  for (const level of LEVELS) {
    if (sel[level]) return level;
  }
  return null;
}

export function isSelectableDestinationRow(row: DestinationRow): boolean {
  return Boolean(row.is_active) && getDestinationLevel(row) !== null;
}

export function getDestinationLabel(row: DestinationRow): string {
  return row.display_name || row.name || '';
}

export function getDestinationBreadcrumb(row: DestinationRow): string {
  const parts = [row.top_level_name, row.country_name, row.region_name, row.resort_name].filter(Boolean);
  const breadcrumb = parts.join('/');
  // A top_level row's breadcrumb collapses to just its own name (all other
  // *_name fields are empty) — identical to the label, so suppress it
  // rather than render a duplicated subtitle line.
  return breadcrumb === getDestinationLabel(row) ? '' : breadcrumb;
}

export function makeDestinationSelection(row: DestinationRow): DestinationSelection {
  // A row with none of resort/region/country/top_level set is, by
  // construction, a city-level row (the only kind the API ever sends
  // without a flag) — default to 'city' rather than producing a selection
  // with no level at all, which isDestinationSelection would reject.
  const level = getDestinationLevel(row) ?? 'city';
  return {
    destination_id: row.destination_id,
    [level]: true,
  } as DestinationSelection;
}

function normalizePlaceName(value: string | undefined): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

// Broadest first: when several options match a place name equally well,
// the widest one shows the most deals.
const BROAD_TO_NARROW: DestinationLevel[] = ['top_level', 'country', 'region', 'resort', 'city'];

const OWN_LEVEL_NAME: Record<DestinationLevel, keyof DestinationRow> = {
  top_level: 'top_level_name',
  country: 'country_name',
  region: 'region_name',
  resort: 'resort_name',
  city: 'city_name',
};

// Picks the destination option a free-text place name (e.g. "Croatia",
// "Crete", "Bali") refers to. Prefers an option that IS that place (its
// own-level name or label matches), then one that sits under it (the name
// matches an ancestor field). Ties go to the broader level, then API order.
export function findDestinationForName(rows: DestinationRow[], name: string): DestinationRow | null {
  const query = normalizePlaceName(name);
  if (!query) return null;

  const candidates = rows.filter(isSelectableDestinationRow);
  const levelIndex = (row: DestinationRow) => BROAD_TO_NARROW.indexOf(getDestinationLevel(row) ?? 'city');
  const pickBroadest = (matches: DestinationRow[]) =>
    matches.length ? matches.slice().sort((a, b) => levelIndex(a) - levelIndex(b))[0] : null;

  const isThePlace = (row: DestinationRow) => {
    const level = getDestinationLevel(row) ?? 'city';
    const label = normalizePlaceName(getDestinationLabel(row));
    return (
      normalizePlaceName(row[OWN_LEVEL_NAME[level]] as string | undefined) === query ||
      label === query ||
      label.replace(/^all\s+/, '') === query
    );
  };
  const isUnderThePlace = (row: DestinationRow) =>
    [row.country_name, row.region_name, row.resort_name, row.city_name].some(
      (part) => normalizePlaceName(part) === query
    );

  return pickBroadest(candidates.filter(isThePlace)) ?? pickBroadest(candidates.filter(isUnderThePlace));
}

export function isDestinationSelection(v: unknown): v is DestinationSelection {
  if (!v || typeof v !== 'object') return false;
  const obj = v as Record<string, unknown>;
  if (typeof obj.destination_id !== 'number' || !Number.isFinite(obj.destination_id)) {
    return false;
  }
  const flagsPresent = LEVELS.filter((level) => obj[level] === true);
  return flagsPresent.length === 1;
}

export function encodeDestinationParam(sel: DestinationSelection): string {
  const level = getDestinationLevel(sel);
  return level ? `${sel.destination_id}:${level}` : '';
}

export function decodeDestinationParam(raw: string | null | undefined): DestinationSelection | null {
  if (!raw) return null;
  const [idPart, levelPart] = raw.split(':');
  const id = Number(idPart);
  if (!Number.isFinite(id)) return null;
  if (!LEVELS.includes(levelPart as DestinationLevel)) return null;
  return { destination_id: id, [levelPart as DestinationLevel]: true } as DestinationSelection;
}
