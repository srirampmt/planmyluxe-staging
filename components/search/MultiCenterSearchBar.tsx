"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plane, Calendar, Search, ChevronDown, Check, X } from "lucide-react";

export type DestinationItem = {
  id: string;
  name: string;
  type: "continent" | "country" | "combination";
  parent?: string | null;
  airports?: string[];
};

export type MultiCentreChild = {
  id: string;
  name: string;
  type: "country" | "combination";
  parent: string;
  airports?: string[];
};

export type MultiCentreTreeRoot = {
  id: string;
  name: string;
  type: "continent";
  airports?: string[];
  children: MultiCentreChild[];
};

export type AirportItem = {
  code: string;
  name: string;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type MultiCenterSearchBarProps = {
  initialTree?: MultiCentreTreeRoot[];
  initialDestination?: string;
  initialAirport?: string;
  initialDate?: string;
  initialMonth?: string;
  d?: string;
  air?: string;
  mon?: string;
  onSearch?: () => void;
};

function parseInitialDate(dateStr?: string, monthStr?: string): Date {
  if (dateStr) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  if (monthStr) {
    const cleanMon = monthStr.trim();
    if (/^\d{6}$/.test(cleanMon)) {
      const y = parseInt(cleanMon.slice(0, 4), 10);
      const m = parseInt(cleanMon.slice(4, 6), 10) - 1;
      if (!isNaN(y) && !isNaN(m) && m >= 0 && m <= 11) {
        return new Date(y, m, 1);
      }
    }
    const parts = cleanMon.split("-");
    if (parts.length === 2) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      if (!isNaN(y) && !isNaN(m) && m >= 0 && m <= 11) return new Date(y, m, 1);
    }
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default function MultiCenterSearchBar({
  initialTree,
  initialDestination,
  initialAirport,
  initialDate,
  initialMonth,
  d,
  air,
  mon,
  onSearch,
}: MultiCenterSearchBarProps = {}) {
  const router = useRouter();

  // State
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [airports, setAirports] = useState<AirportItem[]>([]);
  const [destinationAirportsMap, setDestinationAirportsMap] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const MAX_DESTINATIONS = 4;

  const parseDestinationList = (raw: string) =>
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, MAX_DESTINATIONS);

  const initDest = initialDestination || d || "";
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(() => {
    if (!initDest) return [];
    return parseDestinationList(initDest);
  });
  const [destinationSearch, setDestinationSearch] = useState("");

  const [selectedAirports, setSelectedAirports] = useState<AirportItem[]>([]);
  const [airportSearch, setAirportSearch] = useState("");

  const [departureDate, setDepartureDate] = useState<Date>(() =>
    parseInitialDate(initialDate, initialMonth || mon)
  );

  const [openDropdown, setOpenDropdown] = useState<"destination" | "airport" | "date" | null>(null);

  const containerRef = useRef<HTMLFormElement>(null);

  // Synchronize URL parameters with local state
  useEffect(() => {
    const raw = initialDestination !== undefined ? initialDestination : d;
    if (raw !== undefined) {
      const parsed = raw ? parseDestinationList(raw) : [];
      setSelectedDestinations(parsed);
    }
  }, [initialDestination, d]);

  useEffect(() => {
    const rawAirport = initialAirport !== undefined ? initialAirport : air;
    if (rawAirport !== undefined && airports.length > 0) {
      const codes = rawAirport ? rawAirport.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean) : [];
      const matched = airports.filter((a) => codes.includes(a.code.toUpperCase()));
      setSelectedAirports(matched);
    }
  }, [initialAirport, air, airports]);

  useEffect(() => {
    if (initialDate || initialMonth || mon) {
      setDepartureDate(parseInitialDate(initialDate, initialMonth || mon));
    }
  }, [initialDate, initialMonth, mon]);

  // Dynamic years and months for month selector: Current month + 6 upcoming months only (total 7 months)
  const yearSections = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const sectionsMap: Record<number, number[]> = {};
    for (let i = 0; i <= 6; i++) {
      const d = new Date(currentYear, currentMonth + i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      if (!sectionsMap[y]) {
        sectionsMap[y] = [];
      }
      sectionsMap[y].push(m);
    }

    return Object.keys(sectionsMap).map((yearKey) => {
      const year = parseInt(yearKey, 10);
      return {
        year,
        months: sectionsMap[year],
      };
    });
  }, []);

  // Fetch live destinations and distinct airports on mount
  useEffect(() => {
    let isMounted = true;
    async function loadDestinationsAndAirports() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/multicentre-destinations");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (Array.isArray(data?.destinations)) {
              setDestinations(data.destinations);
            }
            if (Array.isArray(data?.airports)) {
              setAirports(data.airports);
              const rawAirport = initialAirport || air;
              if (rawAirport) {
                const codes = rawAirport.split(",").map((s: string) => s.trim().toUpperCase()).filter(Boolean);
                const matched = data.airports.filter((a: AirportItem) => codes.includes(a.code.toUpperCase()));
                if (matched.length > 0) {
                  setSelectedAirports(matched);
                }
              }
            }
            if (data?.destination_airports) {
              setDestinationAirportsMap(data.destination_airports);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching multi-centre destinations and airports:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadDestinationsAndAirports();
    return () => {
      isMounted = false;
    };
  }, [initialAirport, air]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format month display: e.g. "October 2026"
  const formattedDateString = useMemo(() => {
    return `${MONTH_NAMES[departureDate.getMonth()]} ${departureDate.getFullYear()}`;
  }, [departureDate]);

  // Allowed airports based on selected destinations
  const availableAirports = useMemo<AirportItem[]>(() => {
    if (selectedDestinations.length === 0) return airports;

    const allAllowedCodes = new Set<string>();
    let hasAnyRestriction = false;

    for (const destName of selectedDestinations) {
      const destKeyLower = destName.toLowerCase().trim();
      let allowedCodes = destinationAirportsMap[destName];

      if (!allowedCodes) {
        const matchKey = Object.keys(destinationAirportsMap).find(
          (key) => key.toLowerCase() === destKeyLower
        );
        if (matchKey) allowedCodes = destinationAirportsMap[matchKey];
      }

      if (!allowedCodes) {
        const match = destinations.find((d) => d.name.toLowerCase() === destKeyLower);
        if (match?.airports) allowedCodes = match.airports;
      }

      if (allowedCodes && allowedCodes.length > 0) {
        hasAnyRestriction = true;
        allowedCodes.forEach((code) => allAllowedCodes.add(code));
      }
    }

    if (!hasAnyRestriction || allAllowedCodes.size === 0) return airports;

    return airports.filter((a) => allAllowedCodes.has(a.code));
  }, [airports, selectedDestinations, destinationAirportsMap, destinations]);

  // Auto-adjust selectedAirports if current selection is not served by destinations
  useEffect(() => {
    if (selectedAirports.length > 0 && availableAirports.length > 0) {
      const allowedCodes = new Set(availableAirports.map((a) => a.code));
      const validSelected = selectedAirports.filter((a) => allowedCodes.has(a.code));
      if (validSelected.length !== selectedAirports.length) {
        setSelectedAirports(validSelected);
      }
    }
  }, [availableAirports, selectedAirports]);

  // Filter airports dropdown by search text
  const filteredAirports = useMemo(() => {
    const query = airportSearch.trim().toLowerCase();
    if (!query) return availableAirports;
    return availableAirports.filter(
      (a) => a.name.toLowerCase().includes(query) || a.code.toLowerCase().includes(query)
    );
  }, [airportSearch, availableAirports]);

  // Filter destinations by selected departure airports and search query
  const filteredDestinations = useMemo(() => {
    const q = destinationSearch.trim().toLowerCase();
    const selectedAirportCodes = selectedAirports.map((a) => a.code);

    return destinations.filter((dest) => {
      if (selectedAirportCodes.length > 0 && dest.airports && dest.airports.length > 0) {
        const hasIntersection = dest.airports.some((code) => selectedAirportCodes.includes(code));
        if (!hasIntersection) return false;
      }
      if (!q) return true;
      return (
        dest.name.toLowerCase().includes(q) ||
        (dest.parent && dest.parent.toLowerCase().includes(q))
      );
    });
  }, [destinations, destinationSearch, selectedAirports]);

  // Toggle dropdown helper
  const toggleDropdown = useCallback((name: "destination" | "airport" | "date") => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  }, []);

  // Action handlers - Destinations
  const handleToggleDestination = (name: string) => {
    setSelectedDestinations((prev) => {
      const exists = prev.some((d) => d.toLowerCase() === name.toLowerCase());
      if (exists) {
        return prev.filter((d) => d.toLowerCase() !== name.toLowerCase());
      }
      if (prev.length >= MAX_DESTINATIONS) return prev;
      return [...prev, name];
    });
  };

  const handleClearDestinations = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedDestinations([]);
    setDestinationSearch("");
  };

  // Action handlers - Airports
  const handleToggleAirport = (airport: AirportItem) => {
    setSelectedAirports((prev) => {
      const exists = prev.some((a) => a.code === airport.code);
      if (exists) {
        return prev.filter((a) => a.code !== airport.code);
      } else {
        return [...prev, airport];
      }
    });
  };

  const handleClearAirports = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedAirports([]);
    setAirportSearch("");
  };

  const handleSelectMonth = (year: number, monthIdx: number) => {
    setDepartureDate(new Date(year, monthIdx, 1));
    setOpenDropdown(null);
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    const destinationValue = selectedDestinations.join(",");
    if (destinationValue) {
      params.set("d", destinationValue);
    }
    if (selectedAirports.length > 0) {
      const airportValue = selectedAirports.map((a) => a.code).join(",");
      params.set("air", airportValue);
    }
    if (departureDate) {
      const monStr = `${departureDate.getFullYear()}${String(departureDate.getMonth() + 1).padStart(2, "0")}`;
      params.set("mon", monStr);
    }
    router.push(`/multi-centre?${params.toString()}`);
    onSearch?.();
  };

  const destinationDisplayString = useMemo(() => {
    if (selectedDestinations.length === 0) return "Any destination";
    if (selectedDestinations.length === 1) return selectedDestinations[0];
    if (selectedDestinations.length === 2) {
      return `${selectedDestinations[0]} | ${selectedDestinations[1]}`;
    }
    return `${selectedDestinations[0]} | ${selectedDestinations[1]} (+${selectedDestinations.length - 2} more)`;
  }, [selectedDestinations]);

  const destinationFieldLabel = useMemo(() => {
    if (selectedDestinations.length > 1) {
      return `DESTINATIONS (${selectedDestinations.length})`;
    }
    return "DESTINATION";
  }, [selectedDestinations.length]);

  const airportDisplayString = useMemo(() => {
    if (selectedAirports.length === 0) return "All Airports";
    if (selectedAirports.length === 1) return `${selectedAirports[0].name} (${selectedAirports[0].code})`;
    if (selectedAirports.length === 2) {
      return `${selectedAirports[0].code}, ${selectedAirports[1].code}`;
    }
    return `${selectedAirports[0].code}, ${selectedAirports[1].code} (+${selectedAirports.length - 2} more)`;
  }, [selectedAirports]);

  const airportFieldLabel = useMemo(() => {
    if (selectedAirports.length > 1) {
      return `DEPARTURE AIRPORTS (${selectedAirports.length})`;
    }
    return "DEPARTURE AIRPORTS";
  }, [selectedAirports.length]);

  return (
    <form 
      ref={containerRef}
      onSubmit={handleSearch}
      data-testid="search-bar-multicentre"
      className="w-full max-w-full font-['Montserrat']"
    >
      <div className="flex w-full flex-col items-stretch justify-between relative z-10 gap-2 p-1 md:gap-2 sm:p-2 lg:flex-row lg:items-center">
        <div className="flex w-full min-w-0 flex-1 flex-col items-stretch gap-2 sm:grid sm:grid-cols-3 lg:flex lg:flex-row lg:items-center lg:gap-2">
          {/* FIELD 1: Destination */}
          <div className="relative min-w-0 w-full flex-1" data-testid="search-dest">
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleDropdown("destination")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleDropdown("destination");
                }
              }}
              className={`w-full flex items-center min-h-[52px] px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer group text-left border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-sm select-none outline-none ${
                openDropdown === "destination"
                  ? "border-[#CB2187] ring-2 ring-[#CB2187]/20"
                  : "border-gray-200/90 hover:border-gray-300"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full transition-all flex-shrink-0 flex items-center justify-center mr-2.5 ${
                  openDropdown === "destination"
                    ? "bg-[#CB2187] text-white"
                    : "bg-gray-50 text-slate-500 group-hover:bg-[#CB2187]/10 group-hover:text-[#CB2187]"
                }`}
              >
                <MapPin size={16} />
              </div>

              <div className="flex-1 min-w-0">
                <label className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wider block mb-0.5 cursor-pointer font-montserrat whitespace-nowrap truncate text-gray-400">
                  {destinationFieldLabel}
                </label>
                <div
                  className="w-full bg-transparent border-none p-0 text-xs md:text-[13.5px] truncate font-bold text-gray-800"
                  title={selectedDestinations.length > 0 ? selectedDestinations.join(" | ") : "Any destination"}
                >
                  {destinationDisplayString}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {selectedDestinations.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearDestinations}
                    className="p-1 text-gray-400 hover:text-[#CB2187] rounded-full transition-colors cursor-pointer border-none bg-transparent"
                    title="Clear destinations"
                  >
                    <X size={14} />
                  </button>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-gray-300 flex-shrink-0 transition-transform duration-200 ml-1 group-hover:text-gray-400 ${
                    openDropdown === "destination" ? "rotate-180 text-[#CB2187]" : ""
                  }`}
                />
              </div>
            </div>

            {/* Destination Dropdown Menu */}
            {openDropdown === "destination" && (
              <div className="absolute top-[calc(100%+12px)] left-0 lg:w-[360px] w-full bg-white rounded-[16px] shadow-[0_20px_50px_rgba(30,12,26,0.18)] border border-gray-100 p-3 z-50 max-h-[380px] flex flex-col">
                {/* Search Input */}
                <div className="relative mb-2.5 flex-shrink-0">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={destinationSearch}
                    onChange={(e) => setDestinationSearch(e.target.value)}
                    placeholder="Search destination (e.g. Spain, Morocco)..."
                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#CB2187] focus:ring-2 focus:ring-[#CB2187]/20 text-gray-800"
                    autoFocus
                  />
                  {destinationSearch && (
                    <button
                      type="button"
                      onClick={() => setDestinationSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Destinations Scrollable List */}
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin min-h-[160px]">
                  <button
                    type="button"
                    onClick={() => {
                      handleClearDestinations();
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-[13px] transition-all flex items-center justify-between cursor-pointer ${
                      selectedDestinations.length === 0
                        ? "bg-pink-50/90 font-semibold text-[#CB2187] border border-pink-200/60"
                        : "hover:bg-gray-50 text-gray-700 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className={`w-4 h-4 rounded-[4px] flex items-center justify-center transition-all flex-shrink-0 ${
                          selectedDestinations.length === 0
                            ? "bg-[#CB2187] text-white shadow-xs"
                            : "border border-gray-300 bg-white"
                        }`}
                      >
                        {selectedDestinations.length === 0 && <Check size={11} className="stroke-[3]" />}
                      </div>
                      <span className="truncate">Any destination</span>
                    </div>
                  </button>
                  {isLoading && destinations.length === 0 ? (
                    <div className="flex items-center justify-center py-6 text-xs text-gray-400 gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-[#CB2187] border-t-transparent rounded-full animate-spin" />
                      <span>Loading destinations...</span>
                    </div>
                  ) : filteredDestinations.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                      No matching destinations found
                      {selectedAirports.length > 0 ? ` departing from selected airports` : ""}
                    </p>
                  ) : (
                    filteredDestinations.map((dest) => {
                      const isSelected = selectedDestinations.some(
                        (d) => d.toLowerCase() === dest.name.toLowerCase()
                      );
                      const atLimit =
                        !isSelected && selectedDestinations.length >= MAX_DESTINATIONS;
                      return (
                        <button
                          key={dest.id}
                          type="button"
                          disabled={atLimit}
                          onClick={() => handleToggleDestination(dest.name)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-[13px] transition-all flex items-center justify-between group ${
                            isSelected
                              ? "cursor-pointer bg-pink-50/90 font-semibold text-[#CB2187] border border-pink-200/60"
                              : atLimit
                                ? "cursor-not-allowed border border-transparent text-gray-400"
                                : "cursor-pointer hover:bg-gray-50 text-gray-700 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div
                              className={`w-4 h-4 rounded-[4px] flex items-center justify-center transition-all flex-shrink-0 ${
                                isSelected
                                  ? "bg-[#CB2187] text-white shadow-xs"
                                  : "border border-gray-300 bg-white group-hover:border-[#CB2187]/60"
                              }`}
                            >
                              {isSelected && <Check size={11} className="stroke-[3]" />}
                            </div>
                            <span className="truncate">{dest.name}</span>
                            {dest.type === "combination" && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-normal border border-amber-200/60 flex-shrink-0">
                                Multi-City
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {dest.parent && (
                              <span className="text-[11px] text-gray-400">{dest.parent}</span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Dropdown Footer Action */}
                <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between gap-2 flex-shrink-0">
                  <span className="text-[11px] text-gray-500 font-medium">
                    {selectedDestinations.length === 0
                      ? "All destinations"
                      : selectedDestinations.length >= MAX_DESTINATIONS
                        ? `${MAX_DESTINATIONS} of ${MAX_DESTINATIONS} selected`
                        : `${selectedDestinations.length} of ${MAX_DESTINATIONS} selected`}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {selectedDestinations.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearDestinations}
                        className="text-[11px] font-semibold text-gray-500 hover:text-[#CB2187] px-2.5 py-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border-none bg-transparent"
                      >
                        Clear all
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(null)}
                      className="bg-[#CB2187] hover:bg-[#a81870] text-white text-xs font-semibold px-4 py-1.5 rounded-xl transition-all cursor-pointer border-none shadow-sm"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FIELD 2: Departure Airport */}
          <div className="relative min-w-0 w-full flex-1" data-testid="search-airport">
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleDropdown("airport")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleDropdown("airport");
                }
              }}
              className={`w-full flex items-center min-h-[52px] px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer group text-left border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-sm select-none outline-none ${
                openDropdown === "airport"
                  ? "border-[#CB2187] ring-2 ring-[#CB2187]/20"
                  : "border-gray-200/90 hover:border-gray-300"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full transition-all flex-shrink-0 flex items-center justify-center mr-2.5 ${
                  openDropdown === "airport"
                    ? "bg-[#CB2187] text-white"
                    : "bg-gray-50 text-slate-500 group-hover:bg-[#CB2187]/10 group-hover:text-[#CB2187]"
                }`}
              >
                <Plane size={16} />
              </div>

              <div className="flex-1 min-w-0">
                <label className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wider block mb-0.5 cursor-pointer font-montserrat whitespace-nowrap truncate text-gray-400">
                  {airportFieldLabel}
                </label>
                <div
                  className={`w-full bg-transparent border-none p-0 text-xs md:text-[13.5px] truncate font-semibold ${
                    selectedAirports.length > 0 ? "text-gray-800" : "text-gray-400 font-normal"
                  }`}
                  title={selectedAirports.length > 0 ? selectedAirports.map(a => `${a.name} (${a.code})`).join(", ") : undefined}
                >
                  {airportDisplayString}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {selectedAirports.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAirports}
                    className="p-1 text-gray-400 hover:text-[#CB2187] rounded-full transition-colors cursor-pointer border-none bg-transparent"
                    title="Clear airports"
                  >
                    <X size={14} />
                  </button>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-gray-300 flex-shrink-0 transition-transform duration-200 ml-1 group-hover:text-gray-400 ${
                    openDropdown === "airport" ? "rotate-180 text-[#CB2187]" : ""
                  }`}
                />
              </div>
            </div>

            {/* Airport Dropdown Menu */}
            {openDropdown === "airport" && (
              <div className="absolute top-[calc(100%+12px)] left-0 lg:w-[360px] w-full bg-white rounded-[16px] shadow-[0_20px_50px_rgba(30,12,26,0.18)] border border-gray-100 p-3 z-50 max-h-[380px] flex flex-col">
                {/* Search Input */}
                <div className="relative mb-2.5 flex-shrink-0">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={airportSearch}
                    onChange={(e) => setAirportSearch(e.target.value)}
                    placeholder="Search airport or code..."
                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#CB2187] focus:ring-2 focus:ring-[#CB2187]/20 text-gray-800"
                    autoFocus
                  />
                  {airportSearch && (
                    <button
                      type="button"
                      onClick={() => setAirportSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Airports Scrollable List */}
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin min-h-[160px]">
                  {filteredAirports.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                      No matching airports found
                    </p>
                  ) : (
                    filteredAirports.map((airport) => {
                      const isSelected = selectedAirports.some((a) => a.code === airport.code);
                      return (
                        <button
                          key={airport.code}
                          type="button"
                          onClick={() => handleToggleAirport(airport)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-[13px] transition-all flex items-center justify-between cursor-pointer group ${
                            isSelected
                              ? "bg-pink-50/90 font-semibold text-[#CB2187] border border-pink-200/60"
                              : "hover:bg-gray-50 text-gray-700 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div
                              className={`w-4 h-4 rounded-[4px] flex items-center justify-center transition-all flex-shrink-0 ${
                                isSelected
                                  ? "bg-[#CB2187] text-white shadow-xs"
                                  : "border border-gray-300 bg-white group-hover:border-[#CB2187]/60"
                              }`}
                            >
                              {isSelected && <Check size={11} className="stroke-[3]" />}
                            </div>
                            <span className="truncate">{airport.name}</span>
                          </div>
                          <span className="text-[11px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
                            {airport.code}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Dropdown Footer Action */}
                <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between gap-2 flex-shrink-0">
                  <span className="text-[11px] text-gray-500 font-medium">
                    {selectedAirports.length === 0
                      ? "All airports"
                      : `${selectedAirports.length} selected`}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {selectedAirports.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAirports}
                        className="text-[11px] font-semibold text-gray-500 hover:text-[#CB2187] px-2.5 py-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border-none bg-transparent"
                      >
                        Clear all
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(null)}
                      className="bg-[#CB2187] hover:bg-[#a81870] text-white text-xs font-semibold px-4 py-1.5 rounded-xl transition-all cursor-pointer border-none shadow-sm"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FIELD 3: Departure Month */}
          <div className="relative min-w-0 w-full flex-1" data-testid="search-date">
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleDropdown("date")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleDropdown("date");
                }
              }}
              className={`w-full flex items-center min-h-[52px] px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer group text-left border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-sm select-none outline-none ${
                openDropdown === "date"
                  ? "border-[#CB2187] ring-2 ring-[#CB2187]/20"
                  : "border-gray-200/90 hover:border-gray-300"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full transition-all flex-shrink-0 flex items-center justify-center mr-2.5 ${
                  openDropdown === "date"
                    ? "bg-[#CB2187] text-white"
                    : "bg-gray-50 text-slate-500 group-hover:bg-[#CB2187]/10 group-hover:text-[#CB2187]"
                }`}
              >
                <Calendar size={16} />
              </div>

              <div className="flex-1 min-w-0">
                <label className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wider block mb-0.5 cursor-pointer font-montserrat whitespace-nowrap truncate text-gray-400">
                  DEPARTURE MONTH
                </label>
                <div className="w-full bg-transparent border-none p-0 text-xs md:text-[13.5px] truncate text-gray-800 font-semibold">
                  {formattedDateString}
                </div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-300 flex-shrink-0 transition-transform duration-200 ml-1 group-hover:text-gray-400 ${
                  openDropdown === "date" ? "rotate-180 text-[#CB2187]" : ""
                }`}
              />
            </div>

            {/* Month Selector Dropdown */}
            {openDropdown === "date" && (
              <div className="absolute top-[calc(100%+12px)] left-0 sm:left-auto sm:right-0 z-50 bg-white rounded-[16px] shadow-[0_20px_50px_rgba(30,12,26,0.18)] border border-gray-100 p-4 sm:p-5 w-[330px] sm:w-[380px] max-w-[calc(100vw-32px)]">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#CB2187]" />
                    <span className="text-sm font-bold text-[#1a1b4b]">Select Departure Month</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(null)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer border-none bg-transparent"
                    aria-label="Close month selector"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {yearSections.map((section) => (
                    <div key={section.year}>
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-xs font-bold text-[#1a1b4b] tracking-wider uppercase">
                          {section.year}
                        </span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {section.months.map((monthIdx) => {
                          const monthName = MONTH_NAMES[monthIdx];
                          const isSelected =
                            departureDate.getFullYear() === section.year &&
                            departureDate.getMonth() === monthIdx;

                          return (
                            <button
                              key={`${section.year}-${monthIdx}`}
                              type="button"
                              onClick={() => handleSelectMonth(section.year, monthIdx)}
                              className={`px-3 py-2.5 rounded-[12px] text-xs font-semibold text-center transition-all border border-solid cursor-pointer ${
                                isSelected
                                  ? "bg-[#CB2187] border-[#CB2187] text-white shadow-sm shadow-black/10"
                                  : "bg-white border-gray-200 text-gray-700 hover:bg-[#CB2187]/10 hover:border-[#CB2187]/30"
                              }`}
                            >
                              {monthName.slice(0, 3)} {section.year}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FIELD 4: Search Button */}
        <div className="flex w-full flex-shrink-0 self-stretch p-1 lg:w-auto">
          <button
            data-testid="search-submit"
            type="submit"
            className="relative flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full bg-[#CB2187] px-7 py-3 font-semibold tracking-wide text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:bg-[#a81870] hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)] active:scale-95 cursor-pointer border-none group lg:min-w-[180px] lg:px-9"
          >
            <Search size={18} className="relative z-10" />
            <span className="relative z-10 text-[14px] md:text-[15px] font-bold">Search Holidays</span>
          </button>
        </div>
      </div>
    </form>
  );
}
