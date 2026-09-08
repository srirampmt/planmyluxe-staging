import { useState, useEffect, useRef, useMemo } from "react";
import { HotelPageResponse, HotelDeal } from "@/types/hotel";
import { getBoardBasisText, formatNights } from "@/lib/hotel-utils";
import { getAirportName, parseAvailableBoardBasis } from "@/lib/mappings";

type SearchFilters = {
  departure: string;
  boardBasis: string;
  duration: string;
};

type NormalizedCustomSearchData = {
  departure_airports: Array<{ id: string; text: string }>;
  duration: string[];
};

const normalizeCustomSearchDataFromContent = (
  content: HotelPageResponse | null
): NormalizedCustomSearchData | null => {
  const raw = (content as any)?.custom_search_data;
  if (!raw) return null;

  const departureIds: string[] = Array.isArray(raw.departure_airports)
    ? raw.departure_airports.map((v: any) => String(v))
    : [];

  const duration: string[] = Array.isArray(raw.duration)
    ? raw.duration.map((v: any) => String(v))
    : [];

  if (departureIds.length === 0 && duration.length === 0) {
    return null;
  }

  return {
    departure_airports: departureIds
      .filter(Boolean)
      .map((id) => ({ id, text: getAirportName(id) })),
    duration: duration.filter(Boolean),
  };
};

const getEffectiveCustomSearchData = (
  deal: HotelDeal | null,
  content: HotelPageResponse | null,
  isAutoDeal: boolean
): NormalizedCustomSearchData | null => {
  if (isAutoDeal) {
    const fromDeal = (deal as any)?.customPricing?.custom_search_data as
      | NormalizedCustomSearchData
      | null
      | undefined;
    if (fromDeal?.departure_airports || fromDeal?.duration) {
      return fromDeal;
    }
  }

  return normalizeCustomSearchDataFromContent(content);
};

// Resolves the airport option id matching a deal's actual departure (flight code or
// hotel.fromAirport), trying id match first, then several text-based fallbacks.
// Shared by the synchronous memo and the initialization effect below so both stay consistent.
const resolveDealDepartureId = (
  selectedDeal: HotelDeal | null,
  dealDepartureLabel: string,
  customData: NormalizedCustomSearchData,
  airportOptions: Array<{ id: string; label: string }>
): string => {
  const normalize = (value: unknown) =>
    String(value ?? "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const dealDepartureCode = String(
    selectedDeal?.flight?.departureAirportCode ?? selectedDeal?.hotel?.fromAirport ?? ""
  ).trim();
  const dealDepartureCodeUpper = dealDepartureCode.toUpperCase();
  const normalizedLabel = String(dealDepartureLabel || "").trim();

  const byCustomId = customData.departure_airports?.find(
    (a: any) => String(a?.id) === dealDepartureCode
  );
  const byCustomTextIncludesCode = dealDepartureCodeUpper
    ? customData.departure_airports?.find((a: any) => {
      const text = normalize(a?.text);
      const code = dealDepartureCodeUpper.toLowerCase();
      return text.includes(`(${code})`) || text.includes(code);
    })
    : undefined;
  const byCustomTextEqualsLabel = normalizedLabel
    ? customData.departure_airports?.find(
      (a: any) => normalize(a?.text) === normalize(normalizedLabel)
    )
    : undefined;

  const byOptionId = airportOptions.find((a) => String(a.id) === dealDepartureCode);
  const byOptionLabel = normalizedLabel
    ? airportOptions.find((a) => normalize(a.label) === normalize(normalizedLabel))
    : undefined;

  return String(
    byCustomId?.id ||
    byCustomTextIncludesCode?.id ||
    byCustomTextEqualsLabel?.id ||
    byOptionId?.id ||
    byOptionLabel?.id ||
    customData.departure_airports?.[0]?.id ||
    ""
  );
};

export function useHotelFilters(
  hotelData: HotelPageResponse | null,
  selectedDeal: HotelDeal | null,
  defaultSearchIds?: {
    departure: string;
    boardBasis: string;
    duration: string;
  } | null | undefined,
  isAutoDeal: boolean = true
) {
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    departure: "",
    boardBasis: "",
    duration: "",
  });

  const [currentFiltersDisplay, setCurrentFiltersDisplay] = useState<SearchFilters>({
    departure: "",
    boardBasis: "",
    duration: "",
  });

  const currentFiltersRef = useRef(currentFilters);
  const currentFiltersDisplayRef = useRef(currentFiltersDisplay);
  const hasInitializedFiltersRef = useRef(false);

  useEffect(() => {
    currentFiltersRef.current = currentFilters;
  }, [currentFilters]);

  useEffect(() => {
    currentFiltersDisplayRef.current = currentFiltersDisplay;
  }, [currentFiltersDisplay]);

  // Board basis options now come solely from the deal's own `availableBoardBasis`
  // (custom_search_data no longer sends board_basis_multiple) — shared by
  // filterOptionsWithIds below and the init-filters effect further down.
  const dealBoardBasis = useMemo(
    () => parseAvailableBoardBasis(selectedDeal?.hotel?.availableBoardBasis),
    [selectedDeal]
  );

  const filterOptionsWithIds = useMemo(() => {
    const customData = getEffectiveCustomSearchData(selectedDeal, hotelData, isAutoDeal);

    const airports = customData && Array.isArray(customData.departure_airports)
      ? customData.departure_airports
        .filter((a: any) => a?.id)
        .map((a: any) => ({
          id: String(a.id),
          label: String(a?.text || "").trim() || getAirportName(String(a.id)),
        }))
      : [];

    const boardBases = dealBoardBasis.map((b) => ({ id: b.id, label: b.text }));

    const durations = customData && Array.isArray(customData.duration)
      ? customData.duration
        .filter((d: any) => d !== null && d !== undefined && String(d).length)
        .map((d: any) => ({ id: String(d), label: formatNights(d) }))
      : [];

    return { airports, boardBases, durations };
  }, [selectedDeal, hotelData, isAutoDeal, dealBoardBasis]);

  const dealDisplayFilters = useMemo(() => {
    if (!selectedDeal) {
      return { departure: "", boardBasis: "", duration: "" };
    }

    const departureLabel = selectedDeal.flight?.departureAirportCode ?? selectedDeal.hotel?.fromAirport ?? "";
    const boardBasisCode = selectedDeal.hotel?.boardBasis;
    const boardBasisLabel = boardBasisCode ? getBoardBasisText(boardBasisCode) : "";
    const durationRaw = selectedDeal.hotel?.duration ?? Number(selectedDeal.hotel?.nights);
    const durationLabel = durationRaw ? formatNights(durationRaw) : "";

    return {
      departure: departureLabel,
      boardBasis: boardBasisLabel,
      duration: durationLabel,
    };
  }, [selectedDeal]);

  // Synchronous (render-time) resolution of the deal's departure airport id, available
  // in the same render as filterOptionsWithIds.airports — unlike currentFilters.departure,
  // which is only set by the effect below one render cycle later. Used as the auto:false
  // seed so HolidayCalendar's one-shot airport init doesn't lock in a premature value.
  const resolvedDealAirportId = useMemo(() => {
    if (!selectedDeal) return "";
    const customData = getEffectiveCustomSearchData(selectedDeal, hotelData, isAutoDeal);
    if (!customData) return "";
    return resolveDealDepartureId(
      selectedDeal,
      dealDisplayFilters.departure,
      customData,
      filterOptionsWithIds.airports
    );
  }, [selectedDeal, hotelData, isAutoDeal, dealDisplayFilters.departure, filterOptionsWithIds.airports]);

  // Initialize filters from deal data
  useEffect(() => {
    if (!hotelData || hasInitializedFiltersRef.current) return;
    if (defaultSearchIds === undefined) return;

    const customData = getEffectiveCustomSearchData(selectedDeal, hotelData, isAutoDeal);
    if (!customData) {
      // Board basis is independent of custom_search_data (airports/duration) — still seed
      // it from the deal's own availableBoardBasis even when there's no airport/duration data.
      const boardBasisId =
        dealBoardBasis.find((b) => b.code === selectedDeal?.hotel?.boardBasis)?.id ||
        dealBoardBasis[0]?.id ||
        "";
      setCurrentFilters({ departure: "", boardBasis: String(boardBasisId || ""), duration: "" });
      setCurrentFiltersDisplay(dealDisplayFilters);
      hasInitializedFiltersRef.current = true;
      return;
    }

    const pickValidId = (
      preferred: string | undefined,
      options: Array<{ id: string }>
    ) => {
      const value = String(preferred || "");
      if (value && options.some((o) => o.id === value)) return value;
      return options[0]?.id || "";
    };

    const hasApiDefaults = Boolean(
      isAutoDeal &&
      defaultSearchIds &&
      (defaultSearchIds.departure || defaultSearchIds.boardBasis || defaultSearchIds.duration)
    );

    if (hasApiDefaults) {
      const departureId = pickValidId(defaultSearchIds?.departure, filterOptionsWithIds.airports);
      const boardBasisId = pickValidId(defaultSearchIds?.boardBasis, filterOptionsWithIds.boardBases);
      const durationId = pickValidId(defaultSearchIds?.duration, filterOptionsWithIds.durations);

      const nextFilters = {
        departure: departureId,
        boardBasis: boardBasisId,
        duration: durationId,
      };

      const nextFilterDisplay = {
        departure:
          filterOptionsWithIds.airports.find((a: any) => String(a.id) === departureId)?.label || "",
        boardBasis:
          filterOptionsWithIds.boardBases.find((b: any) => String(b.id) === boardBasisId)?.label || "",
        duration:
          filterOptionsWithIds.durations.find((d: any) => String(d.id) === durationId)?.label || "",
      };

      setCurrentFilters(nextFilters);
      setCurrentFiltersDisplay(nextFilterDisplay);
      currentFiltersRef.current = nextFilters;
      currentFiltersDisplayRef.current = nextFilterDisplay;
      hasInitializedFiltersRef.current = true;
      return;
    }

    const departureId = resolveDealDepartureId(
      selectedDeal,
      dealDisplayFilters.departure,
      customData,
      filterOptionsWithIds.airports
    );

    const dealBoardCode = selectedDeal?.hotel?.boardBasis;
    const matchedBoardBasis = dealBoardBasis.find((basis) => basis.code === dealBoardCode);
    const boardBasisId = matchedBoardBasis?.id || dealBoardBasis[0]?.id || "";

    const dealDuration = selectedDeal?.hotel?.duration ?? Number(selectedDeal?.hotel?.nights);
    const matchedDuration = customData.duration?.find(
      (d: string) => String(d) === String(dealDuration)
    );
    const durationId = matchedDuration || customData.duration?.[0] || "";

    setCurrentFilters({
      departure: String(departureId || ""),
      boardBasis: String(boardBasisId || ""),
      duration: durationId,
    });

    const fallbackDepartureText =
      customData.departure_airports?.find((a: any) => String(a?.id) === String(departureId))
        ?.text || customData.departure_airports?.[0]?.text;
    const fallbackBoardCode = dealBoardBasis[0]?.code;
    const fallbackDuration = customData.duration?.[0];

    setCurrentFiltersDisplay({
      departure:
        dealDisplayFilters.departure ||
        (fallbackDepartureText ? String(fallbackDepartureText) : ""),
      boardBasis:
        dealDisplayFilters.boardBasis ||
        (fallbackBoardCode ? getBoardBasisText(fallbackBoardCode) : ""),
      duration:
        dealDisplayFilters.duration || (fallbackDuration ? formatNights(fallbackDuration) : ""),
    });
    hasInitializedFiltersRef.current = true;
  }, [
    selectedDeal,
    dealDisplayFilters,
    dealBoardBasis,
    filterOptionsWithIds.airports,
    filterOptionsWithIds.boardBases,
    filterOptionsWithIds.durations,
    hotelData,
    defaultSearchIds,
    isAutoDeal,
  ]);

  return {
    currentFilters,
    setCurrentFilters,
    currentFiltersDisplay,
    setCurrentFiltersDisplay,
    currentFiltersRef,
    currentFiltersDisplayRef,
    filterOptionsWithIds,
    dealDisplayFilters,
    resolvedDealAirportId,
  };
}
