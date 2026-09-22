"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { McDefaultPricingResponse, McPageResponse, McPricingData, PriceData, StaticPricingData } from "@/types/multi-centre";
import { parseDayPriceEntry, parseLandingMonthParam, resolveSelectedDeal } from "@/lib/multi-centre-selected-price";
import { resolveAirportIataToId } from "@/lib/mappings/airports";

async function fetchContent(slug: string): Promise<Omit<McPageResponse, 'pricing'>> {
  const res = await fetch(`/api/multi-centre/${encodeURIComponent(slug)}/content`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Content fetch failed: ${res.status}`);
  }
  return (await res.json()) as Omit<McPageResponse, 'pricing'>;
}

async function fetchDefaultPricing(slug: string): Promise<McDefaultPricingResponse> {
  const res = await fetch(`/api/multi-centre/${encodeURIComponent(slug)}/pricing/default`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Default pricing fetch failed: ${res.status}`);
  }
  return (await res.json()) as McDefaultPricingResponse;
}

async function fetchPricing(slug: string, airportId: string): Promise<{ priceDataByAirport: Record<string, McPricingData>; landingMonth?: string; localTax?: number }> {
  const res = await fetch(`/api/multi-centre/${encodeURIComponent(slug)}/pricing`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ airportId }),
  });
  if (!res.ok) {
    throw new Error(`Pricing fetch failed: ${res.status}`);
  }
  const data = await res.json();
  const localTaxRaw = data.localTax;
  const localTax = typeof localTaxRaw === "number" ? localTaxRaw : Number(localTaxRaw);
  return {
    priceDataByAirport: data.priceDataByAirport || {},
    landingMonth: data.landingMonth,
    localTax: Number.isFinite(localTax) ? localTax : undefined,
  };
}

export type MultiCentreDataSeed = {
  initialContent: Omit<McPageResponse, "pricing"> | null;
  initialPricing: McDefaultPricingResponse | null;
  urlMonth?: string;
  urlAirport?: string;
};

type DerivedMcState = {
  mcData: McPageResponse;
  isStatic: boolean;
  staticPricingData: StaticPricingData | null;
  selectedAirportId: string;
  priceDataByAirport: Record<string, McPricingData>;
  localTaxByAirport: Record<string, number>;
  landingMonthByAirport: Record<string, string>;
};

function resolveUrlAirportId(urlAirport: string | undefined, listOfAirports: number[]): string {
  if (!urlAirport) return "";
  const available = new Set(listOfAirports.map(String));
  const tokens = urlAirport.split(",").map((token) => token.trim()).filter(Boolean);
  for (const token of tokens) {
    const mappedId = resolveAirportIataToId(token);
    if (available.has(mappedId)) return mappedId;
    if (available.has(token)) return token;
  }
  return "";
}

// Pure: derives all post-fetch state from a (content, defaultPricing) pair without
// touching any setters. Shared by the seeded (server-provided) path and the
// unseeded (client-fetch) path so the branching logic exists in exactly one place.
function deriveMcState(
  contentData: Omit<McPageResponse, "pricing">,
  pricingResponse: McDefaultPricingResponse,
  urlAirport?: string,
): DerivedMcState {
  if (pricingResponse.static) {
    return {
      mcData: { ...contentData, pricing: { listOfAirports: [], priceDataByAirport: {}, localTax: 0 } },
      isStatic: true,
      staticPricingData: pricingResponse.staticPricingData,
      selectedAirportId: "",
      priceDataByAirport: {},
      localTaxByAirport: {},
      landingMonthByAirport: {},
    };
  }

  const availableAirports = Object.keys(pricingResponse.priceDataByAirport);
  const defaultAirport = availableAirports.length > 0 ? availableAirports[0] : "";
  const urlAirportId = resolveUrlAirportId(urlAirport, pricingResponse.listOfAirports || []);
  const selectedAirportId = urlAirportId || defaultAirport;

  const priceDataByAirport: Record<string, McPricingData> = {};
  const localTaxByAirport: Record<string, number> = {};
  const landingMonthByAirport: Record<string, string> = {};

  if (defaultAirport) {
    priceDataByAirport[defaultAirport] = pricingResponse.priceDataByAirport[defaultAirport] || {};
    localTaxByAirport[defaultAirport] = pricingResponse.localTax ?? 0;
    if (pricingResponse.landingMonth) {
      landingMonthByAirport[defaultAirport] = pricingResponse.landingMonth;
    }
  }

  return {
    mcData: { ...contentData, pricing: pricingResponse },
    isStatic: false,
    staticPricingData: null,
    selectedAirportId,
    priceDataByAirport,
    localTaxByAirport,
    landingMonthByAirport,
  };
}

export function useMultiCentreData(slug: string | undefined, seed?: MultiCentreDataSeed) {
  const urlLandingMonth = parseLandingMonthParam(seed?.urlMonth);
  const urlAirport = seed?.urlAirport ?? "";

  // Computed once (first render only) — the server-provided seed, if any, is authoritative
  // and never re-derived on re-render.
  const seededState = useMemo(() => {
    if (!seed?.initialContent || !seed?.initialPricing) return null;
    return deriveMcState(seed.initialContent, seed.initialPricing, urlAirport);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally computed once for the initial seed only
  }, []);

  const [mcData, setMcData] = useState<McPageResponse | null>(() => (seed ? seededState?.mcData ?? null : null));
  const [contentLoading, setContentLoading] = useState(() => !seed);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAirportId, setSelectedAirportId] = useState<string>(() =>
    seed ? seededState?.selectedAirportId ?? "" : ""
  );
  const [priceDataByAirport, setPriceDataByAirport] = useState<Record<string, McPricingData>>(() =>
    seed ? seededState?.priceDataByAirport ?? {} : {}
  );
  const [localTaxByAirport, setLocalTaxByAirport] = useState<Record<string, number>>(() =>
    seed ? seededState?.localTaxByAirport ?? {} : {}
  );
  const [landingMonthByAirport, setLandingMonthByAirport] = useState<Record<string, string>>(() =>
    seed ? seededState?.landingMonthByAirport ?? {} : {}
  );
  const [isStatic, setIsStatic] = useState(() => (seed ? seededState?.isStatic ?? false : false));
  const [staticPricingData, setStaticPricingData] = useState<StaticPricingData | null>(() =>
    seed ? seededState?.staticPricingData ?? null : null
  );

  // Fetch content and default pricing on mount — the default-pricing response
  // itself carries pricing_source_mode, so the static/manual branch is only
  // known after this fetch resolves (not knowable synchronously from the slug).
  useEffect(() => {
    if (!slug) return;

    // Server-seeded initial data (success or failure) is authoritative — nothing to fetch.
    if (seed) return;

    setContentLoading(true);
    setError(null);

    Promise.all([fetchContent(slug), fetchDefaultPricing(slug)])
      .then(([contentData, pricingResponse]) => {
        const derived = deriveMcState(contentData, pricingResponse, urlAirport);
        setIsStatic(derived.isStatic);
        setStaticPricingData(derived.staticPricingData);
        setMcData(derived.mcData);
        setSelectedAirportId(derived.selectedAirportId);
        setPriceDataByAirport(derived.priceDataByAirport);
        setLocalTaxByAirport(derived.localTaxByAirport);
        setLandingMonthByAirport(derived.landingMonthByAirport);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load content"))
      .finally(() => setContentLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed is stable for this mount (see key={slug} on the parent)
  }, [slug]);

  // Lazy fetch pricing for airport
  const fetchPricingForAirport = useCallback(async (airportId: string) => {
    if (!slug || isStatic || priceDataByAirport[airportId]) return;
    setPricingLoading(true);
    try {
      const pricing = await fetchPricing(slug, airportId);
      setPriceDataByAirport((prev) => ({ ...prev, [airportId]: pricing.priceDataByAirport[airportId] || {} }));
      setLocalTaxByAirport((prev) => ({ ...prev, [airportId]: pricing.localTax ?? prev[airportId] ?? 0 }));
      if (pricing.landingMonth) {
        setLandingMonthByAirport((prev) => ({ ...prev, [airportId]: pricing.landingMonth as string }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch pricing");
    } finally {
      setPricingLoading(false);
    }
  }, [slug, isStatic, priceDataByAirport]);

  useEffect(() => {
    if (!selectedAirportId) return;
    fetchPricingForAirport(selectedAirportId);
  }, [selectedAirportId, fetchPricingForAirport]);

  // Derive priceData for calendar
  const priceData: PriceData = useMemo(() => {
    if (!mcData || !selectedAirportId) return [];
    const airportData = priceDataByAirport[selectedAirportId] || {};
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const result: PriceData = [];
    for (const monthKey of Object.keys(airportData).sort()) {
      const year = parseInt(monthKey.slice(0, 4), 10);
      const month = parseInt(monthKey.slice(4, 6), 10) - 1;
      if (year < currentYear || (year === currentYear && month < currentMonth)) continue;
        for (const [dayStr, price] of Object.entries(airportData[monthKey])) {
          const day = parseInt(dayStr, 10);
          const parsed = parseDayPriceEntry(price);
          if (!parsed) continue;
          const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const localTax = localTaxByAirport[selectedAirportId] ?? mcData?.pricing?.localTax ?? 0;
          const totalPrice = parsed.price + localTax;
          result.push({ date, price: parsed.price, hasCustomPrice: false, localTax, totalPrice, referenceId: parsed.referenceId });
        }
    }
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [mcData, selectedAirportId, priceDataByAirport, localTaxByAirport]);

  const handleAirportChange = useCallback((airportId: string) => {
    setSelectedAirportId(airportId);
  }, []);

  const currentLandingDealDate = (() => {
    const airportData =
      priceDataByAirport[selectedAirportId] ||
      mcData?.pricing?.priceDataByAirport?.[selectedAirportId] ||
      {};
    const taxForAirport =
      localTaxByAirport[selectedAirportId] ?? mcData?.pricing?.localTax ?? 0;
    const backendLandingMonth =
      landingMonthByAirport[selectedAirportId] ||
      mcData?.pricing?.landingMonth;
    const resolvedLandingMonth = urlLandingMonth || backendLandingMonth;

    const selected = resolveSelectedDeal({
      landingMonth: resolvedLandingMonth,
      localTax: taxForAirport,
      priceDataByAirport: {
        [selectedAirportId || "default"]: airportData,
      },
    });

    return selected?.date ?? "";
  })();

  return {
    mcData,
    contentLoading,
    pricingLoading,
    error,
    selectedAirportId,
    priceData,
    currentLandingDealDate,
    handleAirportChange,
    isStatic,
    staticPricingData,
  };
}
