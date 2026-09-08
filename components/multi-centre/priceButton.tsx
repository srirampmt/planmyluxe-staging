import React from "react";
import { CircleChevronRight } from "lucide-react";

type PriceButtonProps = {
  starting_price?: string | null;
  nights?: string | number | null;
  href: string;
};

function normalizeNumberish(input: unknown): number | null {
  const raw = String(input ?? "").trim();
  if (!raw) return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

export function PriceButton({ starting_price, nights, href }: PriceButtonProps) {
  const resolvedPrice = normalizeNumberish(starting_price);
  const resolvedNights = normalizeNumberish(nights) ?? 7;
  const priceText = resolvedPrice
    ? (
        <>
          <span className="font-bold">{resolvedNights}</span>&nbsp;nights from{" "}
          <span className="font-bold">&nbsp;£{resolvedPrice.toLocaleString("en-GB", { maximumFractionDigits: 0 })}&nbsp;</span> per person
          <CircleChevronRight className="ml-[4px] w-[20px] md:w-[20px]" />
        </>
      )
    : null;

  return (
    <a href={href} className="mt-auto self-end bg-pml-primary text-white text-[12px] font-normal px-[16px] md:px-[32px] py-[4px] md:py-[8px] rounded-[8px] flex items-center hover:bg-[#a01a6e] transition leading-[18px] tracking-[0.02em]">
      {priceText ? (
        priceText
      ) : (
        <span className="flex items-center font-bold">Find Out More <CircleChevronRight className="ml-[4px] w-[20px] md:w-[20px]" /></span>
      )}
    </a>
  );
}