"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Flame } from "lucide-react";
import type { LiveOffer } from "@/app/api/live-offers/route";

const ROW_HEIGHT = 30;
const INTERVAL_MS = 3000;

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function EndsLabel({ expiresOn }: { expiresOn: string }) {
  const days = Math.round(
    (new Date(`${expiresOn}T00:00:00`).getTime() -
      new Date(`${todayISO()}T00:00:00`).getTime()) /
      86_400_000,
  );
  if (days > 7) return null;
  return (
    <span className="hidden shrink-0 whitespace-nowrap text-[10px] font-medium text-gray-500 sm:inline">
      {days <= 0
        ? "Ends today"
        : days === 1
          ? "Ends tomorrow"
          : `Ends in ${days} days`}
    </span>
  );
}

export default function LiveOffersTicker() {
  const [offers, setOffers] = useState<LiveOffer[]>([]);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/live-offers")
      .then((res) => res.json())
      .then((data: LiveOffer[]) => {
        if (cancelled || !Array.isArray(data)) return;
        const today = todayISO();
        setOffers(data.filter((o) => o.slug && o.tag && o.expires_on >= today));
      })
      .catch(() => {});
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (offers.length < 2 || paused || reducedMotion) return;
    const id = setInterval(() => {
      setAnimate(true);
      setIndex((i) => i + 1);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [offers.length, paused, reducedMotion]);

  // After sliding onto the cloned first row, jump back to the real first row without animating.
  const handleTransitionEnd = () => {
    if (index >= offers.length) {
      setAnimate(false);
      setIndex(0);
    }
  };

  if (offers.length === 0) return null;

  const rows = offers.length > 1 ? [...offers, offers[0]] : offers;

  return (
    <div
      className="flex w-full min-w-0 shrink-0 items-center gap-2.5 md:w-auto md:flex-1"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 py-1 pl-1.5 pr-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_2px_6px_rgba(5,150,105,0.25)]">
        <Flame className="h-3 w-3" strokeWidth={2.5} />
        Hot Deals
      </span>
      <div
        className="relative min-w-0 flex-1 overflow-hidden"
        style={{ height: ROW_HEIGHT }}
        aria-label="Live hotel offers"
      >
        <ul
          className={
            animate ? "transition-transform duration-500 ease-in-out" : ""
          }
          style={{ transform: `translateY(-${index * ROW_HEIGHT}px)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {rows.map((offer, i) => (
            <li
              key={`${offer.slug}-${i}`}
              style={{ height: ROW_HEIGHT }}
              aria-hidden={i !== index % offers.length}
            >
              <Link
                href={`/hotels/${offer.slug}`}
                tabIndex={i === index % offers.length ? 0 : -1}
                className="group flex h-full min-w-0 items-center gap-2 no-underline"
              >
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="truncate text-[12px] font-semibold text-[#2d2d2d]">
                  {offer.hotel_name}
                </span>
                <span className="shrink-0 whitespace-nowrap rounded-full bg-[#CB2187]/10 px-2 py-0.5 text-[11px] font-semibold text-[#CB2187]">
                  {offer.tag}
                </span>
                <EndsLabel expiresOn={offer.expires_on} />
                <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-[#CB2187] opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
