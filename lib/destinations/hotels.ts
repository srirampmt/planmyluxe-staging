import "server-only";

import { cache } from "react";

import { fetchBackend } from "@/lib/backendFetch";
import type { DestinationHotelsResponse } from "@/types/destinationHotels";

export type DestinationHotelsFetchResult =
  | { status: "ok"; data: DestinationHotelsResponse }
  | { status: "not_found"; data: null }
  | { status: "error"; data: null };

export const getDestinationHotels = cache(
  async (
    country: string,
    region = "",
    resort = "",
  ): Promise<DestinationHotelsFetchResult> => {
    const segments = [country, region, resort]
      .filter(Boolean)
      .map(encodeURIComponent);
    if (segments.length === 0) return { status: "not_found", data: null };

    try {
      const response = await fetchBackend(
        `/client/api/destination-hotels/${segments.join("/")}/`,
        { cache: "no-store" },
      );
      if (response.status === 404) {
        return { status: "not_found", data: null };
      }
      if (!response.ok) {
        return { status: "error", data: null };
      }

      const data = (await response.json()) as DestinationHotelsResponse;
      if (!data?.success || !data.destination) {
        return { status: "error", data: null };
      }
      return { status: "ok", data };
    } catch {
      return { status: "error", data: null };
    }
  },
);
