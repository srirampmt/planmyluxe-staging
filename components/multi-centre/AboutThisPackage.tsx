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
      <h2 className="mb-4 text-[18px] font-semibold text-pml-primary md:mb-6 md:text-[24px]">
        About This Package
      </h2>
      
      <div className="grid grid-cols-2 gap-3 md:gap-4 min-[1025px]:grid-cols-4">
        {/* Duration */}
        <div className="flex items-start gap-3 rounded-[8px] border border-[#EDEDED] bg-[#FBE8F4] p-3 md:p-4">
          <Clock
            className="mt-0.5 h-8 w-8 shrink-0 text-pml-primary md:h-9 md:w-9"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <div className="text-[10px] font-medium uppercase tracking-wider text-[#9F9F9F] md:text-[11px]">
              DURATION
            </div>
            <div className="mt-1 break-words text-[10px] font-semibold leading-[140%] text-[#1a1a1a] md:text-[12px]">
              {duration}
            </div>
          </div>
        </div>

        {/* Destination */}
        <div className="flex items-center gap-1 rounded-[8px] border border-[#EDEDED] bg-[#FBE8F4] p-2 md:p-2">
          <MapPin
            className="mt-0.5 h-8 w-8 shrink-0 text-pml-primary md:h-9 md:w-9"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div className="min-w-0 ">
            {/* <div className="text-[10px] font-medium uppercase tracking-wider text-[#9F9F9F] md:text-[11px]">
              DESTINATION
            </div> */}
            <div className="mt-1 break-words text-[10px] font-semibold leading-[140%] text-[#1a1a1a] md:text-[12px] truncate-2">
              {Array.isArray(destination) ? destination.join(" - ") : destination}
            </div>
          </div>
        </div>

        {/* Accommodation */}
        <div className="flex items-start gap-3 rounded-[8px] border border-[#EDEDED] bg-[#FBE8F4] p-3 md:p-4">
          <Building2
            className="mt-0.5 h-8 w-8 shrink-0 text-pml-primary md:h-9 md:w-9"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <div className="text-[10px] font-medium uppercase tracking-wider text-[#9F9F9F] md:text-[11px]">
              ACCOMMODATION
            </div>
            <div className="mt-1 break-words text-[10px] font-semibold leading-[140%] text-[#1a1a1a] md:text-[12px]">
              {accommodation}
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="flex items-start gap-3 rounded-[8px] border border-[#EDEDED] bg-[#FBE8F4] p-3 md:p-4">
          <Utensils
            className="mt-0.5 h-8 w-8 shrink-0 text-pml-primary md:h-9 md:w-9"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <div className="text-[10px] font-medium uppercase tracking-wider text-[#9F9F9F] md:text-[11px]">
              BOARD
            </div>
            <div className="mt-1 break-words text-[10px] font-semibold leading-[140%] text-[#1a1a1a] md:text-[12px]">
              {board}
            </div>
          </div>
        </div>        
      </div>
    </section>
  );
}


