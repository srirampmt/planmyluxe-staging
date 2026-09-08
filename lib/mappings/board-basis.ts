/**
 * Board Basis Code to Display Name Mappings
 * Complete list from API provider documentation
 */

/**
 * Provider Board Basis ID -> Code mapping.
 * Used when the API returns numeric IDs instead of codes.
 */

export const BOARD_BASIS_ID_TO_CODE: Record<string, string> = {
  "-1": "ANY",
  "2": "SC",
  "3": "HB",
  "4": "FB",
  "5": "AI",
  "6": "CC",
  "8": "BB",
  "9": "RO",
  "12": "CLB",
};

export const BOARD_BASIS_NAMES: Record<string, string> = {
  // Standard Board Basis
  "ANY": "Any",
  "RO": "Room Only",
  "BB": "Bed & Breakfast",
  "HB": "Half Board",
  "FB": "Full Board",
  "AI": "All Inclusive",
  "SC": "Self Catering",
  "CC": "Catered Chalet",
  "CLB": "Club Hotel",
  
  // Extended Variations
  "ROOM_ONLY": "Room Only",
  "BED_BREAKFAST": "Bed & Breakfast",
  "HALF_BOARD": "Half Board",
  "FULL_BOARD": "Full Board",
  "ALL_INCLUSIVE": "All Inclusive",
  "SELF_CATERING": "Self Catering",
};

/**
 ** Provider "Description" labels for board basis codes.
 * These are short category labels (not the inclusions text below).
 */
export const BOARD_BASIS_PROVIDER_DESCRIPTIONS: Record<string, string> = {
  "ANY": "All board basis",
  "SC": "Self Catering",
  "HB": "Half Board",
  "FB": "Full Board",
  "AI": "All Inclusive",
  "CC": "Catered Chalet",
  "BB": "Bed And Breakfast",
  "RO": "Room Only",
  "CLB": "Club Hotel",
};

/*** Full descriptions for board basis types */

export const BOARD_BASIS_DESCRIPTIONS: Record<string, string> = {
  "RO": "Accommodation only - no meals included",
  "BB": "Includes accommodation and breakfast",
  "HB": "Includes accommodation, breakfast, and dinner",
  "FB": "Includes accommodation, breakfast, lunch, and dinner",
  "AI": "All meals, snacks, and selected drinks included",
  "SC": "Self-catering accommodation with kitchen facilities",
  "ROOM_ONLY": "Accommodation only - no meals included",
  "BED_BREAKFAST": "Includes accommodation and breakfast",
  "HALF_BOARD": "Includes accommodation, breakfast, and dinner",
  "FULL_BOARD": "Includes accommodation, breakfast, lunch, and dinner",
  "ALL_INCLUSIVE": "All meals, snacks, and selected drinks included",
  "SELF_CATERING": "Self-catering accommodation with kitchen facilities",
};

function resolveBoardBasisCode(codeOrId: string | number): string {
  const raw = String(codeOrId ?? "").trim();
  if (!raw) return "";

  // If we received a provider ID (e.g. 5), convert to code (e.g. AI)
  const fromId = BOARD_BASIS_ID_TO_CODE[raw];
  if (fromId) return fromId;

  // Otherwise treat as code
  return raw.toUpperCase();
}

/**
 * Resolve a provider board basis ID or code to a canonical code.
 * @returns Canonical code like "AI" (or empty string if unknown)
 */
export function getBoardBasisCode(codeOrId: string | number): string {
  const resolved = resolveBoardBasisCode(codeOrId);
  return resolved;
}

/**
 * Reverse-lookup provider ID from a board basis code.
 * @returns Provider ID string (e.g. "5") or empty string if unknown
 */
export function getBoardBasisIdFromCode(code: string | number): string {
  const normalized = String(code ?? "").trim().toUpperCase();
  if (!normalized) return "";

  for (const [id, basisCode] of Object.entries(BOARD_BASIS_ID_TO_CODE)) {
    if (basisCode === normalized) return id;
  }
  return "";
}

/**
 * Get board basis display name from code
 * @param codeOrId Board basis code (e.g., "AI", "HB", "RO") or provider ID (e.g., 5)
 * @returns Full board basis name or code if not found
 */
export function getBoardBasisName(codeOrId: string | number): string {
  const resolved = resolveBoardBasisCode(codeOrId);
  return BOARD_BASIS_NAMES[resolved] || String(codeOrId);
}

/**
 * Get board basis description
 * @param codeOrId Board basis code or provider ID
 * @returns Provider description (short label) when available; otherwise falls back to inclusions text
 */
export function getBoardBasisDescription(codeOrId: string | number): string {
  const resolved = resolveBoardBasisCode(codeOrId);
  if (!resolved) return "";
  return (
    BOARD_BASIS_PROVIDER_DESCRIPTIONS[resolved] ||
    BOARD_BASIS_DESCRIPTIONS[resolved] ||
    ""
  );
}

/**
 * Get board basis name with description
 * @param codeOrId Board basis code or provider ID
 * @returns "All Inclusive - All meals, snacks, and selected drinks included"
 */
export function getBoardBasisWithDescription(codeOrId: string | number): string {
  const name = getBoardBasisName(codeOrId);
  const description = getBoardBasisDescription(codeOrId);
  if (!description || name === String(codeOrId)) return name;
  return `${name} - ${description}`;
}

/**
 * Check if board basis code exists in mappings
 */
export function isValidBoardBasisCode(codeOrId: string | number): boolean {
  const resolved = resolveBoardBasisCode(codeOrId);
  return Boolean(resolved) && resolved in BOARD_BASIS_NAMES;
}

/**
 * Parse a deal's comma-separated `availableBoardBasis` string (e.g. "SC,HB,FB,BB,RO")
 * into the same { id, code, text } shape used by `custom_search_data.board_basis_multiple`,
 * so both sources are interchangeable downstream (filter options + search request payloads).
 * `id` is resolved to the provider numeric ID since that's what the search API expects.
 */
export function parseAvailableBoardBasis(
  raw?: string
): Array<{ id: string; code: string; text: string }> {
  if (!raw) return [];

  const seen = new Set<string>();
  const result: Array<{ id: string; code: string; text: string }> = [];

  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const code = resolveBoardBasisCode(trimmed);
    if (!code || seen.has(code)) continue;
    seen.add(code);

    result.push({
      id: getBoardBasisIdFromCode(code) || code,
      code,
      text: getBoardBasisName(code),
    });
  }

  return result;
}

/**
 * Get all available board basis options for display
 * @returns Array of {code, name, description} objects
 */
export function getAllBoardBasisOptions() {
  return Object.entries(BOARD_BASIS_NAMES)
    .filter(([code]) => !code.includes("_")) // Exclude extended variants
    .map(([code, name]) => ({
      code,
      name,
      description:
        BOARD_BASIS_PROVIDER_DESCRIPTIONS[code] || BOARD_BASIS_DESCRIPTIONS[code] || "",
    }));
}
