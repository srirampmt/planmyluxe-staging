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
  top_level_name: string;
  country_name: string;
  region_name: string;
  resort_name: string;
  from_airports: string;
  // Comma-separated NEGATIVE ids (e.g. "-1,-9,-12"), each naming a
  // regional "Any X" departure group (see lib/mappings/airports.ts's
  // AIRPORT_NAMES, which already covers this exact id space — it's the
  // same table app/hotels/[slug]'s calendar uses for departure ids).
  // Optional: absent on rows from a backend that hasn't added it yet.
  from_airports_group_ids?: string;
  is_active: boolean;
  favourites: boolean;
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
