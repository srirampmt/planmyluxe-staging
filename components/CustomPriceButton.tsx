"use client";

import React, { useEffect, useState } from "react";
import { extractDurationMinFromUrl } from "./cardprice";
import { useVisibleElement } from "@/lib/useVisibleElement";

export type CustomPriceButtonProps = {
  starting_price?: string | null;
  api_url?: string | null;
  href: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  className?: string;
  icon?: React.ReactNode;
  loadingText?: string;
};

export function CustomPriceButton({
  starting_price,
  api_url,
  href,
  variant = "primary",
  className = "",
  icon,
  loadingText = "Loading...",
}: CustomPriceButtonProps) {
  const [price, setPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nights, setNights] = useState<string | null>(null);
  const { ref, isVisible } = useVisibleElement<HTMLAnchorElement>();

  useEffect(() => {
    if (!isVisible) return;

    let cancelled = false;
    async function fetchPrice() {
      setLoading(true);
      try {
        let priceValue: string | null = null;
        let nightsValue: string | null = null;
        const isNoStartingPrice =
          starting_price === undefined ||
          starting_price === null ||
          String(starting_price).trim() === "" ||
          Number(starting_price) === 0 ||
          Number.isNaN(Number(starting_price));

        if (!isNoStartingPrice) {
          priceValue = Number.isFinite(Number(starting_price))
            ? Number(starting_price).toLocaleString("en-GB", { maximumFractionDigits: 0 })
            : null;
        } else if (api_url) {
          // Fetch from API
          const url = api_url.trim();
          const res = await fetch(`/api/cardprice?url=${encodeURIComponent(url)}`, {
            method: "GET",
            cache: "no-store",
          });
          if (res.ok) {
            const json = await res.json().catch(() => null);
            const rawPrice = json?.price;
            if (typeof rawPrice === "number" && rawPrice > 0) {
              priceValue = rawPrice.toLocaleString("en-GB", { maximumFractionDigits: 0 });
            } else if (typeof rawPrice === "string" && !isNaN(Number(rawPrice))) {
              priceValue = Number(rawPrice).toLocaleString("en-GB", { maximumFractionDigits: 0 });
            }
          }
        }
        if (api_url) {
          const nightsNum = extractDurationMinFromUrl(api_url);
          nightsValue = nightsNum ? String(nightsNum) : null;
        }
        if (!cancelled) {
          setPrice(priceValue);
          setNights(nightsValue);
        }
      } catch (e) {
        if (!cancelled) {
          setPrice(null);
          setNights(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPrice();
    return () => {
      cancelled = true;
    };
  }, [starting_price, api_url, isVisible]);

  let variantClass = "";
  switch (variant) {
    case "primary":
      variantClass = "bg-pml-primary text-white hover:bg-[#a01a6e]";
      break;
    case "secondary":
      variantClass = "bg-gray-200 text-pml-primary hover:bg-gray-300";
      break;
    case "outline":
      variantClass = "border border-pml-primary text-pml-primary bg-white hover:bg-pml-primary hover:text-white";
      break;
    case "ghost":
      variantClass = "bg-transparent text-pml-primary hover:underline";
      break;
    default:
      variantClass = "bg-pml-primary text-white hover:bg-[#a01a6e]";
  }

  return (
    <a
      ref={ref}
      href={href}
      className={`text-[#4c4c4c] border-none rounded-md text-[12px] md:text-[14px] font-normal text-right cursor-pointer transition-all duration-300 ease-in-out no-underline block w-full mx-auto pt-[5px] hover:text-[#a01a6e] leading-[22px] tracking-[0.01em] font-regular flex items-center justify-end ${className}`}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-pml-primary border-t-transparent align-middle" aria-label="Loading" />
      ) : price ? (
        <>
          {nights ? `${nights} nights from` : "- nights from"}
          <span className="text-base font-bold text-[#CB2187] px-[4px]">
            £{price}
          </span>
          per person
          <svg
            className="inline ml-1 text-pml-primary"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#CB2187"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="10 8 14 12 10 16" />
          </svg>
        </>
      ) : (
        <span className="flex items-center font-bold text-pml-primary">Find Out More Deals</span>
      )}
    </a>
  );
}
