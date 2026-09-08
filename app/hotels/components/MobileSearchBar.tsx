"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import { SEARCH_PREFILL_KEY } from "@/hooks/useSearchFilters";
import SearchBar from "@/components/search/searchbar";
import {
  encodeDestinationParam,
  decodeDestinationParam,
  getDestinationLabel,
  type DestinationRow,
} from "@/lib/mappings/destinations";

// Resolves a human-readable label for an encoded "<id>:<level>" destination
// param — prefers the label written alongside it at actual submit time
// (searchPrefill.destinationLabel, where the full row was available),
// falls back to resolving the id against the server-side cached
// /api/destinations route, and falls back to a generic placeholder if
// neither resolves (rare cold-tab case).
async function resolveDestinationLabel(encodedDest: string): Promise<string> {
  if (!encodedDest) return "";
  try {
    const rawPrefill = sessionStorage.getItem(SEARCH_PREFILL_KEY);
    if (rawPrefill) {
      const parsed = JSON.parse(rawPrefill);
      if (parsed.dest === encodedDest && parsed.destinationLabel) {
        return parsed.destinationLabel;
      }
    }
  } catch { }

  const sel = decodeDestinationParam(encodedDest);
  if (!sel) return "";
  try {
    const res = await fetch(`/api/destinations?id=${sel.destination_id}`);
    const match: DestinationRow | null = await res.json();
    if (match) return getDestinationLabel(match);
  } catch { }

  return "Selected destination";
}

const formatDateForDisplay = (dateStr: string): string => {
    if (!dateStr) return "";
    const trimmed = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const date = new Date(trimmed + "T00:00:00");
        if (!isNaN(date.getTime())) {
            const options: Intl.DateTimeFormatOptions = {
                day: "numeric",
                month: "short",
                year: "numeric",
            };
            return date.toLocaleDateString("en-GB", options).replace(/,/g, "");
        }
    }
    return dateStr;
};

const getAirportsLabel = (airports: string[]): string => {
    if (!airports || airports.length === 0) return "Any departure";
    if (airports.length <= 2) return airports.join(", ");
    return `${airports.slice(0, 2).join(", ")} +${airports.length - 2}`;
};

export default function MobileSearchSection({
    filters,
    onApply = null,
    isSearching = false,
}: {
    filters: any;
    onApply?: ((f: any) => void) | null;
    isSearching?: boolean;
}) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    // Search parameter states
    const [dest, setDest] = useState<string>(filters?.destinations?.[0] ? encodeDestinationParam(filters.destinations[0]) : "");
    const [destLabel, setDestLabel] = useState<string>("");
    const [dealType, setDealType] = useState<string>(filters?.holiday_types?.[0] || "");
    const [departureAirports, setDepartureAirports] = useState<string[]>(filters?.departure_airports || []);
    const [travelDate, setTravelDate] = useState<string>(filters?.date || "");
    const [nights, setNights] = useState<string>(filters?.nights || "7");

    // Sync from filters
    useEffect(() => {
        const encoded = filters?.destinations?.[0] ? encodeDestinationParam(filters.destinations[0]) : "";
        setDest(encoded);
        setDealType(filters?.holiday_types?.[0] || "");
        setDepartureAirports(filters?.departure_airports || []);
        setTravelDate(filters?.date || "");
        setNights(filters?.nights || "7");

        let cancelled = false;
        resolveDestinationLabel(encoded).then(label => {
            if (!cancelled) setDestLabel(label);
        });
        return () => { cancelled = true; };
    }, [filters?.destinations, filters?.holiday_types, filters?.departure_airports, filters?.date, filters?.nights]);

    useEffect(() => {
        if (isEditing) {
            document.body.style.overflow = "hidden";
            window.dispatchEvent(new Event("hideNavbar"));
        } else {
            document.body.style.overflow = "";
            window.dispatchEvent(new Event("showNavbar"));
        }
        return () => {
            document.body.style.overflow = "";
            window.dispatchEvent(new Event("showNavbar"));
        };
    }, [isEditing]);

    const selectedDestLabel = destLabel;
    const selectedDealLabel = dealType || "";

    const handleSearch = (filters?: any) => {
        const newFilters = filters ?? {
            q: "",
            destinations: dest ? [decodeDestinationParam(dest)].filter(Boolean) : [],
            holiday_types: dealType ? [dealType] : [],
            rating: [],
            price_min: null,
            price_max: null,
            sort: "best",
            date: travelDate || null,
            nights: nights || null,
            departure_airports: departureAirports,
        };
        try {
            sessionStorage.setItem(SEARCH_PREFILL_KEY, JSON.stringify(newFilters));
        } catch { }
        setIsEditing(false);
        if (typeof onApply === "function") {
            onApply(newFilters);
        } else {
            const params = new URLSearchParams();
            if (newFilters.destinations?.[0]) params.set("did", encodeDestinationParam(newFilters.destinations[0]));
            if (newFilters.holiday_types?.length) params.set("type", newFilters.holiday_types.join(','));
            params.set("sort", newFilters.sort || "best");
            router.push("/hotels?" + params.toString());
        }
    };

    return (
        <div className="lg:hidden w-full">
            <div className="w-full flex items-center justify-between py-2">
                {/* Back button */}
                <button
                    onClick={() => router.push("/")}
                    className="flex items-center justify-center h-11 w-11 rounded-full bg-white text-[#CB2187] border border-gray-100/80 shadow-sm hover:shadow-md active:scale-95 transition-all shrink-0"
                >
                    <ArrowLeft size={16} />
                </button>

                {/* Summary */}
                <div className="flex-1 mx-2 flex flex-col items-center justify-center bg-white rounded-full shadow-sm border border-pink-100/60 h-12 px-3 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate leading-5">
                        {selectedDestLabel || "Where to?"}
                    </p>
                    <p className="text-xs text-gray-500 truncate leading-4 w-full text-center">
                        {formatDateForDisplay(travelDate)}
                        {nights && ` · ${nights} nights`}
                        {` · ${getAirportsLabel(departureAirports)}`}
                        {selectedDealLabel && ` · ${selectedDealLabel}`}
                    </p>
                </div>

                {/* Edit button */}
                <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center justify-center h-11 w-11 rounded-full border border-[#CB2187]/30 bg-white text-[#CB2187] shadow-sm hover:bg-pink-50 active:scale-95 transition-all shrink-0"
                >
                    <Edit size={16} />
                </button>
            </div>

            {isEditing && (
                <>
                    <style dangerouslySetInnerHTML={{ __html: `
                        header.fixed {
                            display: none !important;
                        }
                    ` }} />
                    <SearchBar
                        initialQuery={filters?.q || ''}
                        initialDealType={filters?.holiday_types?.[0] || dealType}
                        initialTravelDate={filters?.date || travelDate}
                        initialDateMax={filters?.date_max || ''}
                        initialNights={filters?.nights || nights}
                        initialDeparturePoints={(filters?.departure_airports || departureAirports).join(',')}
                        onApply={handleSearch}
                        initialDest={dest}
                        compact={false}
                        isMobileEdit={true}
                        onCloseMobileEdit={() => setIsEditing(false)}
                        isSearchLoading={isSearching}
                    />
                </>
            )}
        </div>
    );
}