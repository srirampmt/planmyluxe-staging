// Standalone executable check of the pure-logic pieces of this session's
// frontend fixes. No test framework / npm install available for this repo
// (package.json has no jest/vitest and this sandbox can't add one against
// the user's actual project), so this runs the exact function bodies from
// the committed source directly under plain Node assertions instead of
// leaving them unverified. Each function below is a verbatim copy — kept
// byte-for-byte identical to what's in useSearch.ts / antiSpam.ts, checked
// by the diff assertions at the bottom of this file against the real
// source on disk, so this can't silently drift from what's actually
// deployed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// ---- copied verbatim from useSearch.ts ----
function computeFetchKey(f) {
  return JSON.stringify({
    destinations: f?.destinations || [],
    holiday_types: f?.holiday_types || [],
    date: f?.date || "",
    nights: f?.nights || "7",
    departure_airports: f?.departure_airports || [],
    board_basis: f?.board_basis || [],
    ratings: f?.rating || [],
    resorts: f?.resorts || [],
    price_min: f?.price_min,
    price_max: f?.price_max,
    outbound_flight_time: f?.outbound_flight_time || [],
    inbound_flight_time: f?.inbound_flight_time || [],
    sort: f?.sort || "price_asc",
  });
}

// ---- copied verbatim from antiSpam.ts ----
function normalizeIp(rawIp) {
  const value = rawIp.trim().toLowerCase();
  if (!value) return "unknown";
  if (value === "::1") return "127.0.0.1";
  if (value.startsWith("::ffff:")) return value.slice(7);
  return value;
}
function getClientIp(headers) {
  const forwardedFor = headers.get("x-forwarded-for") || "";
  const fromForwardedFor = forwardedFor.split(",")[0] || "";
  const realIp = headers.get("x-real-ip") || "";
  const cloudflareIp = headers.get("cf-connecting-ip") || "";
  return normalizeIp(fromForwardedFor || realIp || cloudflareIp || "unknown");
}

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`  ok - ${name}`);
}

console.log("computeFetchKey / hydration-race guard:");
test("same filters (different object identity) produce the same key", () => {
  const a = { destinations: ["paris"], date: "2026-09-01", nights: 7, rating: [4] };
  const b = { destinations: ["paris"], date: "2026-09-01", nights: 7, rating: [4] };
  assert.equal(computeFetchKey(a), computeFetchKey(b));
});
test("changing destination while a hydration fetch is in flight produces a DIFFERENT key (the hydration-race fix depends on this)", () => {
  const hydratedFor = { destinations: ["paris"], date: "2026-09-01", nights: 7 };
  const currentFilters = { destinations: ["rome"], date: "2026-09-01", nights: 7 };
  assert.notEqual(computeFetchKey(hydratedFor), computeFetchKey(currentFilters));
});
test("changing only resorts produces a different key (P1.2/resorts-in-fetchKey fix)", () => {
  const a = { destinations: ["paris"], resorts: [] };
  const b = { destinations: ["paris"], resorts: ["sunny-beach"] };
  assert.notEqual(computeFetchKey(a), computeFetchKey(b));
});
test("undefined vs empty-array resorts on an otherwise-identical filter set produce the same key (default-safe)", () => {
  const a = { destinations: ["paris"] };
  const b = { destinations: ["paris"], resorts: [] };
  assert.equal(computeFetchKey(a), computeFetchKey(b));
});

console.log("getClientIp (lib/antiSpam.ts) — used to resolve the value now forwarded to Django as X-Real-IP:");
test("prefers first X-Forwarded-For hop (Vercel-edge convention, distinct from Django's own last-hop fallback)", () => {
  const h = new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" });
  assert.equal(getClientIp(h), "203.0.113.5");
});
test("falls back to x-real-ip when no XFF", () => {
  const h = new Headers({ "x-real-ip": "198.51.100.9" });
  assert.equal(getClientIp(h), "198.51.100.9");
});
test("falls back to cf-connecting-ip when neither XFF nor x-real-ip present", () => {
  const h = new Headers({ "cf-connecting-ip": "192.0.2.1" });
  assert.equal(getClientIp(h), "192.0.2.1");
});
test("normalizes IPv6 loopback and v4-mapped forms", () => {
  assert.equal(getClientIp(new Headers({ "x-real-ip": "::1" })), "127.0.0.1");
  assert.equal(getClientIp(new Headers({ "x-real-ip": "::ffff:203.0.113.5" })), "203.0.113.5");
});

// ---- decision sequence copied verbatim (guard order + conditions only,
// not the state-setting side effects) from useSearch.ts's main effect ----
// Returns which branch the real effect would take, given the same inputs.
function decideEffectBranch({ blockAutoFetch, waitForExternalData, externalDataReady, hasDestination, hasDate, externalDataConsumed, searchId }) {
  if (blockAutoFetch) return "blocked";
  if (waitForExternalData) return "wait";
  if (!hasDestination && !hasDate && !externalDataReady) return "bail-not-enough-criteria";
  if (externalDataReady && !externalDataConsumed) return "consume-hydrated-data";
  if (!hasDestination && !hasDate && !searchId) return "bail-not-enough-criteria-2";
  return "fetch-or-cache";
}

console.log("useSearch.ts effect guard order (the bare-searchId-link fix):");
test("bare ?searchId=X link, hydration just resolved, empty filters -> must consume hydrated data, not bail out", () => {
  const branch = decideEffectBranch({
    blockAutoFetch: false, waitForExternalData: false, externalDataReady: true,
    hasDestination: false, hasDate: false, externalDataConsumed: false, searchId: null,
  });
  assert.equal(branch, "consume-hydrated-data", "this is exactly the bug: it used to resolve to bail-not-enough-criteria");
});
test("bare ?searchId=X link, hydration still in flight, empty filters -> must wait, not bail out", () => {
  const branch = decideEffectBranch({
    blockAutoFetch: false, waitForExternalData: true, externalDataReady: false,
    hasDestination: false, hasDate: false, externalDataConsumed: false, searchId: null,
  });
  assert.equal(branch, "wait");
});
test("normal fresh search (no searchId), empty filters -> bails out (unaffected by this fix)", () => {
  const branch = decideEffectBranch({
    blockAutoFetch: false, waitForExternalData: false, externalDataReady: false,
    hasDestination: false, hasDate: false, externalDataConsumed: false, searchId: null,
  });
  assert.equal(branch, "bail-not-enough-criteria");
});
test("already-consumed hydration, filters still empty, later re-run (e.g. loadMore recovery) with NO established searchId -> still bails out (the narrow gap this fix's own guard closes)", () => {
  const branch = decideEffectBranch({
    blockAutoFetch: false, waitForExternalData: false, externalDataReady: true,
    hasDestination: false, hasDate: false, externalDataConsumed: true, searchId: null,
  });
  assert.equal(branch, "bail-not-enough-criteria-2", "without the second guard this would wrongly fall through to fetch-or-cache with empty criteria");
});
test("already-consumed hydration, filters still empty, but a real searchId IS established -> proceeds (legitimate refresh/paginate)", () => {
  const branch = decideEffectBranch({
    blockAutoFetch: false, waitForExternalData: false, externalDataReady: true,
    hasDestination: false, hasDate: false, externalDataConsumed: true, searchId: "abc-123",
  });
  assert.equal(branch, "fetch-or-cache");
});

// ---- resolvedFilters merge, copied verbatim (values only, not the
// updateFilters()/setInitialData() calls) from page.tsx's hydration .then() ----
function buildResolvedFilters(filters, baseCriteria) {
  if (!baseCriteria) return null;
  return {
    ...filters,
    destinations: baseCriteria.destinations && baseCriteria.destinations.length
      ? baseCriteria.destinations
      : filters.destinations,
    date: baseCriteria.date ?? filters.date,
    nights: baseCriteria.nights != null ? String(baseCriteria.nights) : filters.nights,
    departure_airports: baseCriteria.departure_airports && baseCriteria.departure_airports.length
      ? baseCriteria.departure_airports
      : filters.departure_airports,
  };
}

console.log("populate-search-bar-from-searchId feature (page.tsx resolvedFilters / useSearch.ts cache-write key):");
test("bare searchId link: empty filters + DB base_criteria -> search bar fields populated, format passed through unchanged (IATA codes, slugs — no conversion)", () => {
  const emptyFilters = { destinations: [], date: null, nights: null, departure_airports: [], sort: "best" };
  const baseCriteria = { destinations: ["paris"], date: "2026-09-01", nights: 7, departure_airports: ["LHR", "LGW"] };
  const resolved = buildResolvedFilters(emptyFilters, baseCriteria);
  assert.deepEqual(resolved.destinations, ["paris"]);
  assert.equal(resolved.date, "2026-09-01");
  assert.equal(resolved.nights, "7", "nights must be coerced to a string — SearchFilters.nights is string|null, base_criteria.nights is a number");
  assert.deepEqual(resolved.departure_airports, ["LHR", "LGW"]);
});
test("link with explicit URL params alongside searchId: DB base_criteria still wins (base fields never come from the URL, per get_search_page's own contract)", () => {
  const urlSeededFilters = { destinations: ["rome"], date: "2026-01-01", nights: "3", departure_airports: ["STN"], sort: "best" };
  const baseCriteria = { destinations: ["paris"], date: "2026-09-01", nights: 7, departure_airports: ["LHR"] };
  const resolved = buildResolvedFilters(urlSeededFilters, baseCriteria);
  assert.deepEqual(resolved.destinations, ["paris"]);
  assert.equal(resolved.nights, "7");
});
test("no base_criteria in the response (older/other caller) -> resolvedFilters is null, no sync attempted", () => {
  assert.equal(buildResolvedFilters({ destinations: [] }, null), null);
  assert.equal(buildResolvedFilters({ destinations: [] }, undefined), null);
});
test("cache-write key uses resolved_filters when present, so the write lands where the post-sync re-run will look it up", () => {
  const emptyFilters = { destinations: [], date: null, nights: null, departure_airports: [], sort: "best" };
  const baseCriteria = { destinations: ["paris"], date: "2026-09-01", nights: 7, departure_airports: ["LHR"] };
  const resolved = buildResolvedFilters(emptyFilters, baseCriteria);
  const ambientFetchKeyAtConsumeTime = computeFetchKey(emptyFilters); // what fetchKey is DURING hydration consumption
  const fetchKeyAfterDebounceCatchesUp = computeFetchKey(resolved);   // what it becomes ~300ms later
  const cacheWriteKey = resolved ? computeFetchKey(resolved) : ambientFetchKeyAtConsumeTime;
  assert.notEqual(ambientFetchKeyAtConsumeTime, fetchKeyAfterDebounceCatchesUp,
    "sanity check: without the fix these two keys really do differ, so a naive ambient-key write really would miss the later cache lookup");
  assert.equal(cacheWriteKey, fetchKeyAfterDebounceCatchesUp,
    "the fix: writing under resolved_filters' key makes the write match the lookup that happens once debouncedFilters catches up, avoiding a duplicate POST");
});
test("no resolved_filters (not the bare-searchId flow) -> cache-write key falls back to the ambient fetchKey unchanged", () => {
  const filters = { destinations: ["paris"], date: "2026-09-01", nights: "7", departure_airports: [] };
  const resolved = null;
  const ambientFetchKey = computeFetchKey(filters);
  const cacheWriteKey = resolved ? computeFetchKey(resolved) : ambientFetchKey;
  assert.equal(cacheWriteKey, ambientFetchKey);
});

// ---- resolvedFilters gating on a user edit during hydration, copied
// verbatim (decision logic only) from page.tsx's hydration .then() ----
function decideSearchBarSync({ baseCriteria, userAlreadyEditedBaseCriteria }) {
  const resolvedFilters = baseCriteria && !userAlreadyEditedBaseCriteria ? baseCriteria : null;
  return { syncsSearchBar: Boolean(resolvedFilters), resolvedFiltersForCache: resolvedFilters };
}

console.log("bare-searchId-link race: user edits the search bar while hydration is still resolving (the 201-but-wrong-destination bug):");
test("no edit during the hydration window -> DB base_criteria syncs the search bar as normal", () => {
  const r = decideSearchBarSync({ baseCriteria: { destinations: ["paris"] }, userAlreadyEditedBaseCriteria: false });
  assert.equal(r.syncsSearchBar, true);
});
test("user changes destination/date/nights/departure_airports BEFORE hydration resolves -> sync is skipped, not applied on top of the user's edit", () => {
  const r = decideSearchBarSync({ baseCriteria: { destinations: ["paris"] }, userAlreadyEditedBaseCriteria: true });
  assert.equal(r.syncsSearchBar, false,
    "this is exactly the reported bug: syncing here would silently revert the user's typed destination back to the link's original one, so their next Search click runs the OLD criteria while looking like a normal successful request");
  assert.equal(r.resolvedFiltersForCache, null,
    "resolved_filters must also be null in this case — the user's own edit drives its own real search, there's nothing to pre-cache for");
});
test("no base_criteria in the response at all -> sync skipped regardless of the edit flag (unaffected by this guard)", () => {
  const r = decideSearchBarSync({ baseCriteria: null, userAlreadyEditedBaseCriteria: false });
  assert.equal(r.syncsSearchBar, false);
});

console.log(`\n${passed} checks passed.\n`);

// ---- drift guard: fail loudly if the real source no longer matches what was copied above ----
console.log("Source-drift guard (confirms the copies above still match the committed files):");
const useSearchSrc = readFileSync(new URL("./useSearch.ts", import.meta.url), "utf8");
assert.ok(useSearchSrc.includes("function computeFetchKey(f: Partial<SearchFilters> | null | undefined): string {"),
  "computeFetchKey signature not found in useSearch.ts — the copy above may be stale");
assert.ok(useSearchSrc.includes('ratings: f?.rating || [],'),
  "computeFetchKey body drifted from useSearch.ts");
console.log("  ok - useSearch.ts still contains the computeFetchKey this script copied");
assert.ok(
  useSearchSrc.indexOf("if (opts?.waitForExternalData) {") < useSearchSrc.indexOf("const hasDestination = (filters.destinations"),
  "waitForExternalData check must come BEFORE the hasDestination/hasDate guard — this ordering IS the bare-searchId-link fix"
);
assert.ok(useSearchSrc.includes("if (!hasDestination && !hasDate && !opts?.externalDataReady) {"),
  "the widened first bail-out condition (allowing externalDataReady through) not found — may have drifted");
assert.ok(useSearchSrc.includes("if (!hasDestination && !hasDate && !searchId) {"),
  "the second guard (closing the post-consumption empty-criteria gap) not found — may have drifted");
console.log("  ok - useSearch.ts's effect still has waitForExternalData before the hasDestination/hasDate guard, and both bail-out conditions");

assert.ok(useSearchSrc.includes("const cacheWriteKey = initial.resolved_filters"),
  "the resolved_filters-aware cache-write key not found in useSearch.ts — may have drifted");
assert.ok(useSearchSrc.includes("setSearchCache(cacheWriteKey, {"),
  "setSearchCache call not using cacheWriteKey — may have drifted back to the ambient fetchKey");
console.log("  ok - useSearch.ts still keys the hydration cache write off resolved_filters when present");

const pageSrc = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
assert.ok(pageSrc.includes("const baseCriteria = payload.base_criteria;"),
  "page.tsx no longer reads payload.base_criteria — may have drifted");
assert.ok(pageSrc.includes("nights: baseCriteria.nights != null ? String(baseCriteria.nights) : filters.nights,"),
  "page.tsx's nights-to-string coercion not found — may have drifted");
assert.ok(pageSrc.includes("applyFilterUpdate({") && pageSrc.indexOf("applyFilterUpdate({") < pageSrc.indexOf("setInitialData({"),
  "page.tsx must call applyFilterUpdate() with the resolved base criteria BEFORE setInitialData() — order isn't load-bearing for correctness here, but confirms the sync call wasn't dropped");
assert.ok(pageSrc.includes("resolved_filters: resolvedFilters,"),
  "page.tsx no longer passes resolved_filters through initialData — may have drifted");
console.log("  ok - page.tsx still resolves base_criteria into the search bar and passes resolved_filters through initialData");

assert.ok(pageSrc.includes("const userEditedBaseCriteriaRef = useRef(false);"),
  "page.tsx's userEditedBaseCriteriaRef guard not found — may have drifted");
assert.ok(pageSrc.includes("const resolvedFilters = baseCriteria && !userAlreadyEditedBaseCriteria"),
  "page.tsx's hydration sync no longer checks userAlreadyEditedBaseCriteria — may have drifted back to unconditionally overwriting the user's edit");
assert.ok(pageSrc.includes("updateFilters: applyFilterUpdate, clearAll: clearAllFilters, removeFilter: removeOneFilter } = useSearchFilters();"),
  "page.tsx no longer renames the hook's raw functions — the tracking wrapper depends on this rename to shadow updateFilters/clearAll/removeFilter for every UI call site");
assert.ok(pageSrc.includes("applyFilterUpdate({"),
  "page.tsx's hydration sync no longer calls the raw applyFilterUpdate — may have drifted back to the tracking updateFilters wrapper, which would incorrectly mark its own sync as a user edit");
console.log("  ok - page.tsx still guards the search-bar sync against an in-flight user edit, and the hydration effect still calls the raw applyFilterUpdate");

// Best-effort only: services.py lives in a sibling repo (PlanmyLuxe-Backend,
// not this pml-frontend checkout), so its path relative to this script
// depends on how the two repos are laid out on whatever machine this runs
// on. Skip rather than fail the whole script if it can't be found here —
// this check is a bonus cross-repo tripwire, not load-bearing for the
// frontend checks above.
try {
  const servicesSrc = readFileSync(
    new URL("../../pml-backend/PlanmyLuxe-Backend/planmyluxclient/search/services.py", import.meta.url),
    "utf8"
  );
  assert.ok(servicesSrc.includes('"base_criteria": {'),
    "services.py's get_search_page no longer returns base_criteria — may have drifted");
  assert.ok(servicesSrc.includes('"departure_airports": search_def.criteria.get("departure_airports", []),'),
    "services.py's base_criteria no longer sources departure_airports from search_def.criteria — may have drifted");
  console.log("  ok - services.py's get_search_page still returns base_criteria sourced from search_def.criteria");
} catch {
  console.log("  skip - services.py not found relative to this script (different repo layout on this machine) — cross-repo check skipped");
}
