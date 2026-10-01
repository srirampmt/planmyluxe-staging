import "server-only";

import { cache } from "react";

import { fetchBackend } from "@/lib/backendFetch";
import type {
  DestinationGuidePageType,
  DestinationGuideResponse,
} from "@/types/destinationGuide";

export type DestinationGuideFetchResult =
  | { status: "ok"; data: DestinationGuideResponse }
  | { status: "not_found"; data: null }
  | { status: "error"; data: null };

export const getDestinationGuide = cache(
  async (
    pageType: DestinationGuidePageType,
    country: string,
    region = "",
    resort = "",
  ): Promise<DestinationGuideFetchResult> => {
    const segments = [country, region, resort]
      .filter(Boolean)
      .map(encodeURIComponent);
    if (segments.length === 0) return { status: "not_found", data: null };

    try {
      const response = await fetchBackend(
        `/client/api/destination-guide/${pageType}/${segments.join("/")}/`,
        { cache: "no-store" },
      );
      if (response.status === 404) {
        return { status: "not_found", data: null };
      }
      if (!response.ok) {
        return { status: "error", data: null };
      }

      const data = (await response.json()) as DestinationGuideResponse;
      if (!data?.success || !data.destination || !data.content) {
        return { status: "error", data: null };
      }
      return { status: "ok", data };
    } catch {
      return { status: "error", data: null };
    }
  },
);
