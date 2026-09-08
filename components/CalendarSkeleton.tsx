import React from "react";

/**
 * CalendarSkeleton - visually mimics the shape of the HolidayCalendar component for loading state.
 */
export default function CalendarSkeleton() {
  return (
    <div className="w-full max-w-4xl bg-white rounded-lg py-4 md:py-6 font-['Montserrat'] relative animate-pulse">
      {/* Title */}
      <div className="h-7 w-56 mb-6 bg-gray-200 rounded" />

      {/* Filters (3 dropdowns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <div className="h-10 w-full bg-gray-100 rounded" />
        <div className="h-10 w-full bg-gray-100 rounded" />
        <div className="h-10 w-full bg-gray-100 rounded" />
      </div>

      {/* Month nav & year select */}
      <div className="flex justify-center items-center mb-4 gap-4">
        <div className="h-8 w-8 bg-gray-100 rounded-full" />
        <div className="h-8 w-40 bg-gray-100 rounded" />
        <div className="h-8 w-8 bg-gray-100 rounded-full" />
      </div>

      {/* Weekdays header */}
      <div className="grid grid-cols-7 text-center text-[14px] font-normal text-[#595858] leading-[140%] mb-1 gap-1">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-5 w-full bg-gray-100 rounded" />
        ))}
      </div>

      {/* Calendar grid (6 rows x 7 cols = 42) */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
        {[...Array(42)].map((_, i) => (
          <div key={i} className="h-[60px] sm:h-[72px] w-full bg-gray-100 rounded-[8px]" />
        ))}
      </div>

      {/* Legend (footer) */}
      <div className="flex flex-col items-center justify-center gap-2 text-[12px] leading-[140%] sm:flex-row md:ml-auto md:h-[60px] md:w-full md:max-w-[843px] md:flex-col md:items-end md:justify-center md:gap-[10px] md:p-[10px] mb-2">
        <div className="flex flex-row items-center justify-center gap-2 sm:justify-end md:h-[40px] md:w-full md:max-w-[823px] md:items-center md:justify-end md:gap-[18px]">
          <div className="hidden md:block flex flex-col items-start gap-[10px] rounded-[8px] border border-[#008000] bg-[#A6EDA6] p-[10px] md:h-[40px] md:w-[92px]">
            <div className="h-4 w-16 bg-gray-100 rounded" />
          </div>
          <div className="flex flex-col items-start gap-[10px] rounded-[4px] border border-[#9F9F9F] bg-[#EDEDED] p-[10px] md:h-[40px] md:w-[427px]">
            <div className="h-4 w-40 bg-gray-100 rounded" />
          </div>
        </div>
      </div>

      {/* Trip summary */}
      <div className="mt-6 flex flex-row items-center justify-center whitespace-nowrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="h-4 w-16 bg-gray-100 rounded" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
        <div className="flex items-center ml-2">
          <div className="h-4 w-16 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}
