// Standalone executable check for lib/mappings/destinations.ts — the
// encode/decode/level helpers that gate what destination criteria reach
// the backend. No test framework in this repo (Node can't import .ts
// directly either — same constraint frontend_logic_check.mjs works around),
// so this runs verbatim copies of the real functions under plain Node
// assertions, guarded at the bottom against drift from the committed source.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// ---- copied verbatim from lib/mappings/destinations.ts ----
const LEVELS = ['resort', 'region', 'country', 'top_level', 'city'];

function getDestinationLevel(sel) {
  for (const level of LEVELS) {
    if (sel[level]) return level;
  }
  return null;
}

function isSelectableDestinationRow(row) {
  return Boolean(row.is_active) && getDestinationLevel(row) !== null;
}

function getDestinationLabel(row) {
  return row.display_name || row.name || '';
}

function getDestinationBreadcrumb(row) {
  const parts = [row.top_level_name, row.country_name, row.region_name, row.resort_name].filter(Boolean);
  const breadcrumb = parts.join('/');
  return breadcrumb === getDestinationLabel(row) ? '' : breadcrumb;
}

function makeDestinationSelection(row) {
  const level = getDestinationLevel(row) ?? 'city';
  return {
    destination_id: row.destination_id,
    [level]: true,
  };
}

function isDestinationSelection(v) {
  if (!v || typeof v !== 'object') return false;
  const obj = v;
  if (typeof obj.destination_id !== 'number' || !Number.isFinite(obj.destination_id) || obj.destination_id < 0) {
    return false;
  }
  const flagsPresent = LEVELS.filter((level) => obj[level] === true);
  return flagsPresent.length === 1;
}

function encodeDestinationParam(sel) {
  const level = getDestinationLevel(sel);
  return level ? `${sel.destination_id}:${level}` : '';
}

function decodeDestinationParam(raw) {
  if (!raw) return null;
  const [idPart, levelPart] = raw.split(':');
  const id = Number(idPart);
  if (!Number.isFinite(id) || id < 0) return null;
  if (!LEVELS.includes(levelPart)) return null;
  return { destination_id: id, [levelPart]: true };
}

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`  ok - ${name}`);
}

const RESORT_ROW = {
  destination_id: 842,
  resort: true,
  name: "Bordeaux",
  top_level_name: "Europe",
  country_name: "France",
  region_name: "Gironde",
  resort_name: "Bordeaux",
  from_airports: "BHX,MAN,DUB,LTN,GLA,LGW,BFS,BRS,ORK",
  is_active: true,
  favourites: false,
};

const TOP_LEVEL_ROW = {
  destination_id: 0,
  top_level: true,
  name: "Europe",
  top_level_name: "Europe",
  country_name: "",
  region_name: "",
  resort_name: "",
  from_airports: "",
  is_active: true,
  favourites: false,
};

const CITY_ROW = {
  destination_id: 9001,
  name: "Some City",
  top_level_name: "Europe",
  country_name: "France",
  region_name: "Gironde",
  resort_name: "Bordeaux",
  from_airports: "",
  is_active: true,
  favourites: false,
};

console.log("getDestinationLevel:");
test("resort flag wins", () => assert.equal(getDestinationLevel(RESORT_ROW), "resort"));
test("top_level flag detected", () => assert.equal(getDestinationLevel(TOP_LEVEL_ROW), "top_level"));
test("no flags -> null (city-level)", () => assert.equal(getDestinationLevel(CITY_ROW), null));

console.log("isSelectableDestinationRow:");
test("active row with a level flag is selectable", () => assert.equal(isSelectableDestinationRow(RESORT_ROW), true));
test("city row (no level flag) is not selectable", () => assert.equal(isSelectableDestinationRow(CITY_ROW), false));
test("inactive row is not selectable", () => assert.equal(isSelectableDestinationRow({ ...RESORT_ROW, is_active: false }), false));

console.log("getDestinationLabel:");
test("display_name preferred over name", () => assert.equal(getDestinationLabel({ ...RESORT_ROW, display_name: "Bordeaux Beach" }), "Bordeaux Beach"));
test("falls back to name", () => assert.equal(getDestinationLabel(RESORT_ROW), "Bordeaux"));

console.log("getDestinationBreadcrumb:");
test("resort breadcrumb joins all four *_name fields", () => assert.equal(getDestinationBreadcrumb(RESORT_ROW), "Europe/France/Gironde/Bordeaux"));
test("top_level breadcrumb collapses to the label -> suppressed", () => assert.equal(getDestinationBreadcrumb(TOP_LEVEL_ROW), ""));

console.log("makeDestinationSelection / isDestinationSelection:");
test("selection carries id + exactly one flag", () => {
  const sel = makeDestinationSelection(RESORT_ROW);
  assert.deepEqual(sel, { destination_id: 842, resort: true });
  assert.equal(isDestinationSelection(sel), true);
});
test("a flagless row (city) defaults to the 'city' level, not an empty selection", () => {
  const sel = makeDestinationSelection(CITY_ROW);
  assert.deepEqual(sel, { destination_id: 9001, city: true });
  assert.equal(isDestinationSelection(sel), true);
  assert.equal(encodeDestinationParam(sel), "9001:city");
  assert.deepEqual(decodeDestinationParam(encodeDestinationParam(sel)), sel);
});
test("rejects zero flags", () => assert.equal(isDestinationSelection({ destination_id: 1 }), false));
test("rejects more than one flag", () => assert.equal(isDestinationSelection({ destination_id: 1, resort: true, region: true }), false));
test("rejects non-numeric id", () => assert.equal(isDestinationSelection({ destination_id: "842", resort: true }), false));
test("rejects negative id", () => assert.equal(isDestinationSelection({ destination_id: -1, resort: true }), false));
test("rejects null/non-object", () => {
  assert.equal(isDestinationSelection(null), false);
  assert.equal(isDestinationSelection("842:resort"), false);
});

console.log("encodeDestinationParam / decodeDestinationParam round-trip:");
test("resort selection round-trips", () => {
  const sel = { destination_id: 842, resort: true };
  assert.equal(encodeDestinationParam(sel), "842:resort");
  assert.deepEqual(decodeDestinationParam(encodeDestinationParam(sel)), sel);
});
test("top_level selection round-trips", () => {
  const sel = { destination_id: 0, top_level: true };
  assert.equal(encodeDestinationParam(sel), "0:top_level");
  assert.deepEqual(decodeDestinationParam(encodeDestinationParam(sel)), sel);
});
test("decode rejects malformed input", () => {
  assert.equal(decodeDestinationParam(null), null);
  assert.equal(decodeDestinationParam(""), null);
  assert.equal(decodeDestinationParam("bordeaux"), null); // legacy slug link — must NOT resolve
  assert.equal(decodeDestinationParam("842"), null); // missing level
  assert.equal(decodeDestinationParam("842:planet"), null); // invalid level
  assert.equal(decodeDestinationParam("abc:resort"), null); // non-numeric id
});

// ---- copied verbatim from app/api/destinations/route.ts's `?q=` branch ----
function filterDestinationsByQuery(all, q) {
  const query = q.trim().toLowerCase();
  return all
    .filter(isSelectableDestinationRow)
    .filter((r) => {
      const label = getDestinationLabel(r).toLowerCase();
      const breadcrumb = getDestinationBreadcrumb(r).toLowerCase();
      return label.includes(query) || breadcrumb.includes(query);
    })
    .slice(0, 50);
}

console.log("GET /api/destinations?q= filter predicate:");
test("no match returns empty array", () => {
  assert.deepEqual(filterDestinationsByQuery([RESORT_ROW], "nonexistent-place"), []);
});
test("exact label match", () => {
  assert.deepEqual(filterDestinationsByQuery([RESORT_ROW], "Bordeaux"), [RESORT_ROW]);
});
test("case-insensitive match", () => {
  assert.deepEqual(filterDestinationsByQuery([RESORT_ROW], "bordEAUX"), [RESORT_ROW]);
});
test("matches against the breadcrumb too, not just the label", () => {
  assert.deepEqual(filterDestinationsByQuery([RESORT_ROW], "gironde"), [RESORT_ROW]);
});
test("city-level rows (no selectable flag) are excluded even on a matching name", () => {
  assert.deepEqual(filterDestinationsByQuery([CITY_ROW], "some city"), []);
});
test("inactive rows are excluded even on a matching name", () => {
  assert.deepEqual(filterDestinationsByQuery([{ ...RESORT_ROW, is_active: false }], "bordeaux"), []);
});
test("results are capped at 50", () => {
  const many = Array.from({ length: 75 }, (_, i) => ({ ...RESORT_ROW, destination_id: i, name: `Bordeaux ${i}` }));
  assert.equal(filterDestinationsByQuery(many, "bordeaux").length, 50);
});

console.log(`\n${passed} checks passed.\n`);

console.log("Source-drift guard (confirms the copies above still match the committed module):");
const src = readFileSync(new URL("../lib/mappings/destinations.ts", import.meta.url), "utf8");
assert.ok(src.includes("export type DestinationLevel = 'resort' | 'region' | 'country' | 'top_level' | 'city';"),
  "DestinationLevel union drifted — this script's fixtures assume exactly these five levels");
assert.ok(src.includes('const flagsPresent = LEVELS.filter((level) => obj[level] === true);') &&
  src.includes('return flagsPresent.length === 1;'),
  "isDestinationSelection's exactly-one-flag rule drifted");
assert.ok(src.includes("const level = getDestinationLevel(row) ?? 'city';"),
  "makeDestinationSelection's city-default fallback drifted");
assert.ok(src.includes("return breadcrumb === getDestinationLabel(row) ? '' : breadcrumb;"),
  "getDestinationBreadcrumb's top_level-suppression rule drifted");
console.log("  ok - lib/mappings/destinations.ts still matches this script's assumptions");

const routeSrc = readFileSync(new URL("../app/api/destinations/route.ts", import.meta.url), "utf8");
assert.ok(routeSrc.includes(".filter(isSelectableDestinationRow)") &&
  routeSrc.includes("return label.includes(query) || breadcrumb.includes(query);") &&
  routeSrc.includes(".slice(0, 50);"),
  "the ?q= filter predicate in app/api/destinations/route.ts drifted from this script's copy");
console.log("  ok - app/api/destinations/route.ts's ?q= predicate still matches this script's assumptions");
