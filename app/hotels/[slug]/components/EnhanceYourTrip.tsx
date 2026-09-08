"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  BedDouble,
  UtensilsCrossed,
  Car,
  Luggage,
  Plus,
  Check,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";
import type { HotelAddon } from "@/types/hotel";

const ICON_MAP: Record<string, LucideIcon> = {
  BedDouble,
  UtensilsCrossed,
  Car,
  Luggage,
};

interface Upgrade {
  id: string;
  icon: LucideIcon;
  image: string;
  title: string;
  description: string;
  detailedDescription: string;
  includes: string[];
  price: string;
  unit: string;
}

function mapAddon(addon: HotelAddon): Upgrade {
  return {
    id: String(addon.id),
    icon: ICON_MAP[addon.icon] ?? Luggage,
    image: addon.image,
    title: addon.title,
    description: addon.description,
    detailedDescription: addon.detailedDescription,
    includes: addon.includes,
    price: addon.price,
    unit: addon.unit,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

type TimeLeft = { days: number; hrs: number; mins: number; secs: number };

function CountdownBadge({
  timeLeft,
  showLabel,
}: {
  timeLeft: TimeLeft;
  showLabel: boolean;
}) {
  const segments = [
    { value: timeLeft.days, label: "DAYS" },
    { value: timeLeft.hrs, label: "HRS" },
    { value: timeLeft.mins, label: "MINS" },
    { value: timeLeft.secs, label: "SECS" },
  ];

  if (showLabel) {
    return (
      <div className="flex shrink-0 items-center gap-3 rounded-2xl border-2 border-pml-primary bg-white px-4 py-[10px]">
        <div className="shrink-0">
          <p className="text-[13px] font-extrabold leading-[1.2] text-pml-primary">Flash Sale</p>
          <p className="mt-[2px] text-[10px] leading-[1.4] text-[#595858]">
            Hurry! Offers end soon.
          </p>
        </div>
        <div className="h-8 w-px shrink-0 bg-pml-primary/20" />
        <div className="flex items-center gap-[6px]">
          {segments.map((seg, i) => (
            <div key={seg.label} className="flex items-center gap-[6px]">
              <div className="flex flex-col items-center">
                <span className="relative flex h-[30px] w-[40px] items-center justify-center overflow-hidden rounded-[8px] border border-pml-primary bg-white text-[16px] font-extrabold leading-none text-pml-primary shadow-md">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={pad(seg.value)}
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {pad(seg.value)}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="mt-[5px] text-[8px] font-bold tracking-wide text-[#595858]">
                  {seg.label}
                </span>
              </div>
              {i < segments.length - 1 && (
                <span className="mb-4 text-[14px] font-bold leading-none text-[#9F9F9F]">:</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-[4px] rounded-2xl border-2 border-pml-primary bg-white px-5 py-[8px]">
      {segments.map((seg, i) => (
        <div key={seg.label} className="flex items-center gap-[4px]">
          <div className="flex flex-col items-center">
            <span className="relative flex h-[34px] w-[34px] items-center justify-center overflow-hidden rounded-[8px] border border-pml-primary bg-white text-[16px] font-extrabold leading-none text-pml-primary shadow-md">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={pad(seg.value)}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {pad(seg.value)}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="mt-[4px] text-[7px] font-bold tracking-[0.05em] text-pml-primary">
              {seg.label}
            </span>
          </div>
          {i < segments.length - 1 && (
            <span className="mb-4 text-[12px] font-bold leading-none text-[#9F9F9F]">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

function UpgradeDetailOverlay({
  upgrade,
  isSelected,
  onClose,
  onToggle,
}: {
  upgrade: Upgrade | null;
  isSelected: boolean;
  onClose: () => void;
  onToggle: (id: string) => void;
}) {
  useEffect(() => {
    if (!upgrade) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [upgrade, onClose]);

  if (!upgrade) return null;
  const Icon = upgrade.icon;

  const addButtonClass = isSelected
    ? "w-full rounded-[10px] py-3 text-[14px] font-bold transition-colors bg-[#F5F5F5] text-[#595858] hover:bg-red-50 hover:text-red-500"
    : "w-full rounded-[10px] py-3 text-[14px] font-bold transition-colors bg-pml-primary text-white hover:bg-pink-700";

  return (
    <div className="fixed inset-0 z-[9999] font-['Montserrat']">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Desktop: centered modal */}
      <div className="hidden md:flex h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-[480px] max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="flex items-center gap-3 px-6 py-5 border-b border-black/10">
            <div
              className={`flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[10px] ${
                isSelected ? "bg-pml-primary/10" : "bg-[#F5F5F5]"
              }`}
            >
              <Icon className="h-6 w-6 text-pml-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[18px] font-bold text-[#242F40]">{upgrade.title}</h3>
              <p className="text-[12px] text-[#595858] mt-[2px]">
                {upgrade.price !== "Free" && <>From{" "}</>}
                <span className="font-bold text-pml-primary">{upgrade.price}</span>
                <span className="text-[#9F9F9F]">{upgrade.unit}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full border border-black/10 text-[#595858] hover:bg-[#F5F5F5] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5">
            <p className="text-[13px] leading-[1.6] text-[#595858]">
              {upgrade.detailedDescription}
            </p>
            {upgrade.includes.length > 0 && (
              <div>
                <p className="text-[13px] font-bold text-[#242F40] mb-3">What's included</p>
                <ul className="space-y-[10px]">
                  {upgrade.includes.map((item) => (
                    <li key={item} className="flex items-start gap-[10px]">
                      <Check className="mt-[1px] h-4 w-4 shrink-0 text-pml-primary" />
                      <span className="text-[13px] leading-[1.4] text-[#595858]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* <div className="border-t border-black/10 px-6 py-4">
            <button
              type="button"
              onClick={() => {
                onToggle(upgrade.id);
                onClose();
              }}
              className={addButtonClass}
            >
              {isSelected ? "Remove from Trip" : "Add to Trip"}
            </button>
          </div> */}
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      <div className="md:hidden absolute inset-x-0 bottom-0 rounded-t-[20px] bg-white max-h-[88svh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-[4px] w-[36px] rounded-full bg-black/10" />
        </div>

        <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-4 border-b border-black/10">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[10px] ${
                isSelected ? "bg-pml-primary/10" : "bg-[#F5F5F5]"
              }`}
            >
              <Icon className="h-5 w-5 text-pml-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[17px] font-bold text-[#242F40] leading-tight">
                {upgrade.title}
              </h3>
              <p className="text-[11px] text-[#595858] mt-[1px]">
                {upgrade.price !== "Free" && <>From{" "}</>}
                <span className="font-bold text-pml-primary">{upgrade.price}</span>
                <span className="text-[#9F9F9F]">{upgrade.unit}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full border border-black/10 text-[#595858]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4">
          <p className="text-[13px] leading-[1.6] text-[#595858]">
            {upgrade.detailedDescription}
          </p>
          {upgrade.includes.length > 0 && (
            <div>
              <p className="text-[13px] font-bold text-[#242F40] mb-3">What's included</p>
              <ul className="space-y-[10px]">
                {upgrade.includes.map((item) => (
                  <li key={item} className="flex items-start gap-[10px]">
                    <Check className="mt-[1px] h-4 w-4 shrink-0 text-pml-primary" />
                    <span className="text-[13px] leading-[1.4] text-[#595858]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* <div className="border-t border-black/10 px-5 py-4">
          <button
            type="button"
            onClick={() => {
              onToggle(upgrade.id);
              onClose();
            }}
            className={addButtonClass}
          >
            {isSelected ? "Remove from Trip" : "Add to Trip"}
          </button>
        </div> */}
      </div>
    </div>
  );
}

function parseDeadline(expireDate?: string): number {
  if (expireDate) {
    const trimmed = expireDate.trim();
    // Date-only strings (e.g. "2026-06-25") parse to UTC midnight at the
    // *start* of that day, which is already in the past once that day begins.
    // Treat them as expiring at the end of that calendar day (local) instead.
    const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      const endOfDay = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999);
      if (!isNaN(endOfDay.getTime())) return endOfDay.getTime();
    } else {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) return d.getTime();
    }
  }
  return Date.now() + (2 * 24 + 14) * 60 * 60 * 1000;
}

export default function EnhanceYourTrip({
  addons = [],
  offerExpireDate,
}: {
  addons?: HotelAddon[];
  offerExpireDate?: string;
}) {
  const upgrades = addons.map(mapAddon);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);

  const activeUpgrade = upgrades.find((u) => u.id === detailId) ?? null;

  const deadline = useRef<number>(parseDeadline(offerExpireDate));
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hrs: 0, mins: 0, secs: 0 });

  useEffect(() => {
    deadline.current = parseDeadline(offerExpireDate);
  }, [offerExpireDate]);

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, deadline.current - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hrs: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const toggleUpgrade = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (upgrades.length === 0) return null;

  return (
    <section className="mt-4 w-full rounded-2xl border border-gray-200 bg-white font-['Montserrat']">
      <div className="px-4 py-5 md:px-6 md:py-6">

        {/* Mobile header */}
        <div className="mb-4 flex items-center justify-between gap-2 md:hidden">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#595858]">
              Flash Sale
            </p>
            <h2 className="mt-1 text-[12px] md:text-[20px] font-extrabold leading-[1.2] text-pml-primary">
              Offer Ends In...
            </h2>
          </div>
          <CountdownBadge timeLeft={timeLeft} showLabel={false} />
        </div>

        {/* Desktop header */}
        <div className="mb-5 hidden md:flex md:items-center md:justify-between md:gap-4">
          <div className="shrink-0">
            <h2 className="text-[28px] font-extrabold leading-[1.2] tracking-tight text-[#242F40]">
              Enhance Your Trip
            </h2>
            <p className="mt-1 text-[14px] text-[#595858]">
              Customise with our premium upgrades and add-ons.
            </p>
          </div>
          <CountdownBadge timeLeft={timeLeft} showLabel={true} />
        </div>

        {/* Mobile: "Available Upgrades" row */}
        <div className="mb-3 flex items-center justify-between md:hidden">
          <span className="text-[15px] font-semibold text-[#595858]">Available Upgrades</span>
        </div>

        {/* Mobile: highlighted price box card list */}
        <div className="flex flex-col gap-3 md:hidden">
          {upgrades.map((upgrade) => {
            const Icon = upgrade.icon;
            return (
              <div
                key={upgrade.id}
                className="bg-white rounded-2xl border-[2px] border-pml-primary p-4 flex items-start gap-4 transition-all duration-200 group relative mt-3 shadow-md"
              >
                {/* Highlighted price pill — half above/half below the top border */}
                <div className="absolute top-0 right-4 -translate-y-1/2 inline-flex items-center gap-1 bg-white border-[2px] border-pml-primary text-pml-primary shadow-md rounded-full px-3 py-0.5 z-10">
                  {upgrade.price !== "Free" && (
                    <span className="text-[10px] font-bold uppercase">From</span>
                  )}
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-base font-extrabold ">{upgrade.price}</span>
                    <span className="text-[10px] font-medium ">{upgrade.unit}</span>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl flex-shrink-0 transition-colors bg-pml-primary/10 group-hover:bg-pml-primary/20 text-pml-primary`}
                >
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>

                <div className="flex-1 w-full">
                  <h3 className="font-bold text-lg text-[#242F40] mt-1">{upgrade.title}</h3>
                  <p className="text-slate-500 text-sm mt-1 line-clamp-1">{upgrade.description}</p>

                  <div className="flex flex-wrap items-center justify-between mt-4 gap-3 w-full pb-1">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDetailId(upgrade.id); }}
                      className="inline-flex items-center gap-1 rounded-full bg-pml-primary/10 px-3 py-1.5 text-pml-primary text-xs font-bold transition-colors hover:bg-pml-primary/20 shrink-0"
                    >
                      Read more <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: image-row card list */}
        <div className="hidden md:flex md:flex-col md:gap-3">
          {upgrades.map((upgrade) => {
            const selected = selectedIds.has(upgrade.id);
            return (
              <div
                key={upgrade.id}
                className={`flex overflow-hidden rounded-2xl border-2 bg-pml-primary/[0.04] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${
                  selected ? "border-pml-primary shadow-pml-primary/20" : "border-pml-primary/15"
                }`}
              >
                <div className="relative w-[170px] shrink-0 md:w-[210px]">
                  <Image
                    src={upgrade.image}
                    alt={upgrade.title}
                    fill
                    sizes="210px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1 p-4">
                  <h3 className="text-[15px] font-bold text-[#242F40]">{upgrade.title}</h3>
                  <p className="mt-1 text-[12px] leading-[1.5] text-[#595858] line-clamp-2">
                    {upgrade.description}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setDetailId(upgrade.id); }}
                    className="mt-2 inline-flex items-center gap-1 rounded-full bg-pml-primary/10 px-3 py-1 text-[12px] font-bold text-pml-primary transition-colors hover:bg-pml-primary/20"
                  >
                    Read more <span aria-hidden="true">→</span>
                  </button>
                </div>

                <div className="flex w-[120px] shrink-0 flex-col items-center justify-center gap-3 border-l border-pml-primary/15 bg-white/60 p-4">
                  <div className="flex flex-col items-center text-center">
                    {upgrade.price !== "Free" && <span className="text-[11px] text-[#9F9F9F]">FROM</span>}
                    <span className="text-[20px] font-extrabold leading-tight text-pml-primary">
                      {upgrade.price}
                    </span>
                    <span className="text-[11px] text-[#9F9F9F]">{upgrade.unit}</span>
                  </div>
                  {/* <button
                    type="button"
                    onClick={() => toggleUpgrade(upgrade.id)}
                    className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full transition-colors ${
                      selected
                        ? "bg-pml-primary text-white"
                        : "border border-[#9F9F9F] bg-white text-[#595858]"
                    }`}
                  >
                    {selected ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </button> */}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-pml-primary/5 px-3 py-2.5">
          <Info className="mt-[1px] h-4 w-4 shrink-0 text-pml-primary/60" />
          <p className="text-[11px] leading-[1.5] text-[#595858]">
            <span className="md:hidden">
              Discuss upgrades with travel experts after enquiry submission. Prices are
              estimates &amp; subject to availability.
            </span>
            <span className="hidden md:inline">
              You can discuss these upgrades with our travel experts after submitting your
              enquiry. All upgrade prices are estimates and subject to availability.
            </span>
          </p>
        </div>

      </div>

      <UpgradeDetailOverlay
        upgrade={activeUpgrade}
        isSelected={activeUpgrade ? selectedIds.has(activeUpgrade.id) : false}
        onClose={() => setDetailId(null)}
        onToggle={toggleUpgrade}
      />
    </section>
  );
}
