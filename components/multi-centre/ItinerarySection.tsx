"use client";

import React, { useState } from "react";
import {
  Star,
  Plane,
  Train,
  Bus,
  Ship,
  Car,
  Plus,
  Minus,
  Hotel,
  Utensils,
  Award,
  Clock,
  PlusCircle,
} from "lucide-react";

import { formatMultiCentreDuration } from "@/lib/mappings/duration";

export type ItineraryItem = {
  day: number;
  title: string;
  transport: string | null;
  subtitle: string;
  description: string;
  hotel: string;
  rating: number;
  board: string;
  duration: string;
  extras: string;
};

interface Props {
  itinerary: ItineraryItem[];
  title?: string;
  subtitle?: string;
}

const transportIcons = {
  flight: Plane,
  train: Train,
  bus: Bus,
  ship: Ship,
  cruise: Ship,
  car: Car,
};

const TransportIcon = ({ type, className }: { type: string | null; className?: string }) => {
  const Icon = type
    ? transportIcons[type.toLowerCase() as keyof typeof transportIcons]
    : null;
  return Icon ? <Icon className={className || "h-3.5 w-3.5 shrink-0 text-pink-600"} /> : null;
};

const Stars = ({ rating }: { rating: number }) => {
  const count = Math.max(0, Math.min(5, Math.floor(rating)));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < count
              ? "fill-pink-600 text-pink-600"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
};

/* Unified Badge Pill Component */
const BadgePill = ({
  icon,
  value,
  children,
  variant = "default",
}: {
  icon: React.ReactNode;
  value?: string;
  children?: React.ReactNode;
  variant?: "default" | "included";
}) => {
  if (!value && !children) return null;

  const isIncluded = variant === "included";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm shrink-0 ${
        isIncluded
          ? "border-emerald-200 bg-[#e6f8f1] text-emerald-900"
          : "border-slate-200/80 bg-white text-black"
      }`}
    >
      {/* Icon Node wrapper */}
      <span
        className={`flex items-center justify-center shrink-0 ${
          isIncluded ? "text-emerald-600" : "text-pink-600"
        }`}
      >
        {icon}
      </span>

      {/* Fallback to value string if children are not passed */}
      {children || (
        <span className="font-semibold text-black">{value}</span>
      )}
    </span>
  );
};

export default function ItineraryTimeline({
  itinerary,
  title = "Day-by-Day Itinerary",
  subtitle = "",
}: Props) {
  const totalDays = itinerary.length;
  const totalNights = Math.max(0, totalDays - 1);

  // Set of expanded days (mobile view only)
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  const toggleDescription = (day: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="pl-3 text-[18px] font-extrabold tracking-tight text-black sm:text-xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-black/70 sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>
        {totalDays > 0 && (
          <div className="inline-flex shrink-0 items-center self-start rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-bold text-pink-700 sm:self-auto sm:px-4 sm:py-1.5">
            {totalDays} {totalDays === 1 ? "Day" : "Days"} / {totalNights}{" "}
            {totalNights === 1 ? "Night" : "Nights"}
          </div>
        )}
      </div>

      {/* Timeline List */}
      <div className="space-y-0">
        {itinerary.map((item, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === itinerary.length - 1;
          const ratingCount = Math.max(0, Math.floor(item.rating || 0));
          const isExpanded = expandedDays.has(item.day);

          const meta = {
            hotel: item.hotel?.trim(),
            board: item.board?.trim(),
            duration: item.duration?.trim(),
            rating: ratingCount > 0 ? ratingCount : null,
            extras: item.extras?.trim(),
          };

          const linePositionClass =
            isFirst && isLast
              ? "hidden"
              : isFirst
                ? "top-1/2 bottom-0"
                : isLast
                  ? "top-0 h-1/2"
                  : "top-0 bottom-0";

          return (
            <div key={idx} className="relative flex gap-4 sm:gap-5">
              <div className="relative flex w-10 shrink-0 flex-col items-center sm:w-12">
                <div
                  className={`absolute left-1/2 w-px -translate-x-1/2 bg-[repeating-linear-gradient(to_bottom,#D1D5DB_0_6px,transparent_4px_12px)] bg-[length:1px_12px] bg-repeat-y ${linePositionClass}`}
                />
                <div className="my-auto z-10 flex h-10 w-10 items-center justify-center rounded-full bg-pink-600 text-sm font-black text-white shadow-md ring-4 ring-pink-100 sm:h-12 sm:w-12 sm:text-base">
                  {item.day}
                </div>
              </div>

              <div className="min-w-0 flex-1 pt-0.5 py-3 sm:pb-4">
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-shadow hover:shadow-md">
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-pink-600" />

                  <div className="p-4 sm:p-5 space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                        <h3 className="text-base font-bold text-black sm:text-lg">
                          {item.title}
                        </h3>

                        {item.subtitle?.trim() && (
                          <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-semibold  text-pink-600">
                            {item.transport && (
                              <TransportIcon
                                type={item.transport}
                                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                              />
                            )}
                            <span className="truncate max-w-[140px] sm:max-w-[200px]">
                              {item.subtitle}
                            </span>
                          </div>
                        )}

                        {meta.hotel && (
                          <BadgePill
                            icon={
                              <Hotel className="h-3.5 w-3.5 text-slate-500" />
                            }
                            value={meta.hotel}
                          />
                        )}
                        {meta.board && (
                          <BadgePill
                            icon={
                              <Utensils className="h-3.5 w-3.5 text-slate-500" />
                            }
                            value={meta.board}
                          />
                        )}
                        {meta.rating && (
                          <BadgePill
                            icon={
                              <Award className="h-3.5 w-3.5 text-slate-500" />
                            }
                          >
                            <Stars rating={meta.rating} />
                          </BadgePill>
                        )}
                        {meta.duration && (
                          <BadgePill
                            icon={
                              <Clock className="h-3.5 w-3.5 text-slate-500" />
                            }
                            value={formatMultiCentreDuration(meta.duration)}
                          />
                        )}
                        {meta.extras && (
                          <BadgePill
                            icon={
                              <PlusCircle className="h-3.5 w-3.5 text-pink-600" />
                            }
                            value={meta.extras}
                            variant="included"
                          />
                        )}
                      </div>

                      {item.description && (
                        <button
                          type="button"
                          onClick={() => toggleDescription(item.day)}
                          aria-label={
                            isExpanded
                              ? "Collapse description"
                              : "Expand description"
                          }
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-black transition-colors hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600 active:scale-95 sm:hidden"
                        >
                          {isExpanded ? (
                            <Minus className="h-4 w-4 text-pink-600" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {item.description && (
                      <div
                        className={`pt-1 transition-all duration-200 ${
                          !isExpanded ? "hidden sm:block" : "block"
                        }`}
                      >
                        <p className="text-xs sm:text-sm leading-relaxed text-black">
                          {item.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type { Props as ItineraryTimelineProps };
