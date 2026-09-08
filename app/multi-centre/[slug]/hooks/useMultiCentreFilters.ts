"use client";

import { useMemo } from "react";
import { McPageResponse } from "@/types/multi-centre";
import { getAirportNameWithCode } from "@/lib/mappings/airports";

export function useMultiCentreFilters(mcData: McPageResponse | null, selectedAirportId: string, onAirportChange: (id: string) => void) {
  const availableAirports = useMemo(() => {
    if (!mcData?.pricing.listOfAirports) return [];
    return mcData.pricing.listOfAirports.map(code => ({
      id: String(code),
      label: getAirportNameWithCode(String(code))
    }));
  }, [mcData]);

  const currentFilters = useMemo(() => ({
    selectedAirportId,
  }), [selectedAirportId]);

  return {
    availableAirports,
    currentFilters,
    onAirportChange,
  };
}