"use client";

import { Clock, MapPin, Building2, Utensils } from "lucide-react";

type Props = {
  duration: string;
  destination: string | string[];
  accommodation: string;
  board: string;
};

export default function AboutThisPackage({
  duration,
  destination,
  accommodation,
  board,
}: Props) {
  return (
    <section className="w-full" data-testid="about-this-package">
      <div className="grid grid-cols-2 gap-3 min-[1025px]:grid-cols-4 md:gap-4">
        {/* Duration */}
        <div className="flex items-center gap-3 rounded-[16px] border border-slate-100 bg-white p-3 shadow-none md:p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#CB2187]/10 text-[#CB2187] md:h-12 md:w-12">
            <Clock
              className="h-5 w-5 md:h-6 md:w-6"
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-medium uppercase tracking-wider text-[#9F9F9F] md:text-[11px]">
              DURATION
            </div>
            <div className="mt-0.5 break-words text-[10px] font-semibold leading-[140%] text-[#1a1b4b] md:text-[12px]">
              {duration}
            </div>
          </div>
        </div>

        {/* Destination */}
        <div className="flex items-center gap-3 rounded-[16px] border border-slate-100 bg-white p-3 shadow-none md:p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#CB2187]/10 text-[#CB2187] md:h-12 md:w-12">
            <MapPin
              className="h-5 w-5 md:h-6 md:w-6"
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-medium uppercase tracking-wider text-[#9F9F9F] md:text-[11px]">
              DESTINATION
            </div>
            <div className="mt-0.5 break-words text-[10px] font-semibold leading-[140%] text-[#1a1b4b] md:text-[12px]">
              {Array.isArray(destination)
                ? destination.join(" - ")
                : destination}
            </div>
          </div>
        </div>

        {/* Accommodation */}
        <div className="flex items-center gap-3 rounded-[16px] border border-slate-100 bg-white p-3 shadow-none md:p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#CB2187]/10 text-[#CB2187] md:h-12 md:w-12">
            <Building2
              className="h-5 w-5 md:h-6 md:w-6"
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-medium uppercase tracking-wider text-[#9F9F9F] md:text-[11px] overflow-hidden">
              ACCOMMODATION
            </div>
            <div className="mt-0.5 break-words text-[10px] font-semibold leading-[140%] text-[#1a1b4b] md:text-[12px]">
              {accommodation}
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="flex items-center gap-3 rounded-[16px] border border-slate-100 bg-white p-3 shadow-none md:p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#CB2187]/10 text-[#CB2187] md:h-12 md:w-12">
            <Utensils
              className="h-5 w-5 md:h-6 md:w-6"
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-medium uppercase tracking-wider text-[#9F9F9F] md:text-[11px]">
              BOARD
            </div>
            <div className="mt-0.5 break-words text-[10px] font-semibold leading-[140%] text-[#1a1b4b] md:text-[12px]">
              {board}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
