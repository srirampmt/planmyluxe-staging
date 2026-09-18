/**
 * Top Facilities id -> name/icon mapping
 * Mirrors pmlapp.models.TOP_FACILITY_CHOICES (PlanmyLuxe-Backend) -- ids are
 * GIATA fact ids, hand-maintained in parallel on each side (same convention
 * as board-basis.ts). Add new ids here AND there to extend the standard set.
 */
import { Beer, Dumbbell, Flame, Martini, Waves, Wifi, type LucideIcon } from "lucide-react";

export type TopFacility = {
  name: string;
  icon: LucideIcon;
};

export const TOP_FACILITIES: Record<string, TopFacility> = {
  "81": { name: "Bar(s)", icon: Martini },
  "82": { name: "Pub(s)", icon: Beer },
  "146": { name: "Swimming Pool", icon: Waves },
  "154": { name: "Sauna", icon: Flame },
  "173": { name: "Gym", icon: Dumbbell },
  "115": { name: "Internet Access", icon: Wifi },
};

/**
 * Parse a semicolon-separated top_facilities id string (as returned by the
 * search API) into the resolved facility entries, dropping any id not in
 * the known catalog (e.g. a value emitted before a newer id was added here).
 */
export function parseTopFacilities(raw?: string | null): Array<TopFacility & { id: string }> {
  if (!raw) return [];
  return raw
    .split(";")
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => {
      const facility = TOP_FACILITIES[id];
      return facility ? { id, ...facility } : null;
    })
    .filter((f): f is TopFacility & { id: string } => f !== null);
}
