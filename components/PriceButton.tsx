"use client";

import React, { useEffect, useState } from "react";
import { renderDealPriceButton } from "./cardprice";
import { CircleChevronRight } from "lucide-react";
import { useVisibleElement } from "@/lib/useVisibleElement";

type PriceButtonProps = {
  starting_price?: string | null;
  api_url?: string | null;
  durationMin?: string | number;
  slug?: string;
  local_tax?: number | null;
  nights?: string | number | null;
  href: string;
};

function getDurationMinFromApiUrl(apiUrl?: string | null): number | null {
  const raw = String(apiUrl ?? "");
  const match = raw.match(/(?:^|&)durationMin=(\d+)/);
  if (!match) return null;
  const value = parseInt(match[1] ?? "", 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function normalizeNumberish(input: unknown): number | null {
  const raw = String(input ?? "").trim();
  if (!raw) return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

export function PriceButton({ starting_price, api_url, durationMin, slug, local_tax, nights, href }: PriceButtonProps) {
  const [priceText, setPriceText] = useState<React.ReactNode>("");
  const [loading, setLoading] = useState(false);
  const { ref, isVisible } = useVisibleElement<HTMLAnchorElement>();

  useEffect(() => {
    if (!isVisible) return;

    let cancelled = false;
    async function fetchPrice() {
      setLoading(true);
      try {
        const trimmedSlug = typeof slug === "string" ? slug.trim() : "";

        // Multi-centre pricing logic (same endpoint + fallback as OfferCards.tsx)
        if (trimmedSlug) {
          let resolvedPrice: number | null = null;
          try {
            const res = await fetch("/api/multi-centre/pricing/default-summary", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slugs: [trimmedSlug] }),
            });
            if (res.ok) {
              const data = (await res.json().catch(() => null)) as { prices?: Record<string, number | null> } | null;
              const computed = data?.prices?.[trimmedSlug];
              if (typeof computed === "number" && Number.isFinite(computed)) {
                resolvedPrice = computed;
              }
            }
          } catch {
            // Fall back to starting_price + local_tax
          }

          if (resolvedPrice === null) {
            const base = normalizeNumberish(starting_price) ?? 0;
            const tax = typeof local_tax === "number" && Number.isFinite(local_tax) ? local_tax : 0;
            const fallback = Math.round(base + tax);
            resolvedPrice = fallback > 0 ? fallback : null;
          }

          const resolvedNights =
            getDurationMinFromApiUrl(api_url) ??
            (normalizeNumberish(nights) ?? normalizeNumberish(durationMin)) ??
            7;

          if (!cancelled) {
            if (resolvedPrice) {
              setPriceText(
                <>
                  <span className="font-bold">{resolvedNights}</span> nights from{" "}
                  <span className="font-bold">&nbsp;£{resolvedPrice.toLocaleString("en-GB", { maximumFractionDigits: 0 })}&nbsp;</span> per person
                  <CircleChevronRight className="ml-[4px] w-[20px] md:w-[20px]" />
                </>
              );
            } else {
              setPriceText("");
            }
          }
          return;
        }

        // Default pricing logic (existing behavior)
        const result = await renderDealPriceButton({ starting_price, api_url });
        if (!cancelled) setPriceText(result);
      } catch (e) {
        if (!cancelled) setPriceText("");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPrice();
    return () => {
      cancelled = true;
    };
  }, [starting_price, api_url, durationMin, slug, local_tax, nights, isVisible]);

  return (
    <a ref={ref} href={href} className="mt-auto self-end bg-pml-primary text-white text-[12px] font-normal px-[16px] md:px-[32px] py-[4px] md:py-[8px] rounded-[8px] flex items-center hover:bg-[#a01a6e] transition leading-[18px] tracking-[0.02em]">
      {loading ? (
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent align-middle"
          aria-label="Loading"
        />
      ) : priceText ? (
        priceText
      ) : (
        <span className="flex items-center font-bold">Find Out More <CircleChevronRight className="ml-[4px] w-[20px] md:w-[20px]" /></span>
      )}
    </a>
  );
}