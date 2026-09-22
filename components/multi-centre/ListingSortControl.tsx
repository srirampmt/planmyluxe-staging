"use client";

import { useEffect, useRef, useState } from "react";
import { AlignRight, ArrowDown, Check, ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
] as const;

export function ListingSortControl({
  value,
  onChange,
  variant = "pill",
}: {
  value: string;
  onChange: (value: string) => void;
  variant?: "pill" | "icon";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected =
    SORT_OPTIONS.find((option) => option.value === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        aria-label={variant === "icon" ? "Sort results" : undefined}
        className={
          variant === "icon"
            ? `flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border bg-white text-[#4C4C4C] ${
                open ? "border-[#CB2187]" : "border-[#EDEDED]"
              }`
            : `flex h-11 items-center gap-3 rounded-full border bg-white px-4 text-left shadow-[0_6px_18px_rgba(26,27,75,0.05)] ${
                open ? "border-[#CB2187]" : "border-[#ece8e4]"
              }`
        }
      >
        {variant === "icon" ? (
          <>
            <ArrowDown size={15} />
            <AlignRight size={15} className="-ml-1" />
          </>
        ) : (
          <>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a8490]">
              Sort
            </span>
            <span className="h-3 w-px bg-[#ece8e4]" />
            <span className="text-[13px] font-semibold text-[#1a1b4b]">{selected.label}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-[#8a8490] transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </>
        )}
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label="Sort holidays"
          className="absolute right-0 z-30 mt-2 min-w-full overflow-hidden rounded-[16px] border border-[#ece8e4] bg-white py-1.5 shadow-[0_20px_50px_rgba(30,12,26,0.14)]"
        >
          {SORT_OPTIONS.map((option) => {
            const isActive = option.value === selected.value;
            return (
              <li key={option.value} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-6 px-4 py-2.5 text-left text-[13px] ${
                    isActive
                      ? "bg-[#f8eef5] font-semibold text-[#CB2187]"
                      : "font-medium text-[#1a1b4b] hover:bg-[#faf8f6]"
                  }`}
                >
                  {option.label}
                  {isActive ? <Check className="h-3.5 w-3.5" strokeWidth={2.2} /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
