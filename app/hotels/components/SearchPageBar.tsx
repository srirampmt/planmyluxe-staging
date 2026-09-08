"use client";

import React from 'react';
import SearchBar from '@/components/search/searchbar';

interface SearchPageBarProps {
  initialQuery?: string;
  initialDest?: string;
  initialDealType?: string;
  initialTravelDate?: string;
  initialDateMax?: string;
  initialNights?: string;
  initialDeparturePoints?: string;
  onApply?: (filters: Record<string, unknown>) => void;
  isSearching?: boolean;
}

export default function SearchPageBar({
  initialQuery = '',
  initialDest = '',
  initialDealType = '',
  initialTravelDate = '',
  initialDateMax = '',
  initialNights = '7',
  initialDeparturePoints = '',
  onApply,
  isSearching = false,
}: SearchPageBarProps) {
  return (
    <div className="bg-white/95 border border-gray-200/80 backdrop-blur-2xl rounded-[12px] p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.05)] transform transition-all duration-500 hover:shadow-[0_15px_40px_rgba(203,33,135,0.1)] relative overflow-visible">
      <SearchBar
        initialQuery={initialQuery}
        initialDest={initialDest}
        initialDealType={initialDealType}
        initialTravelDate={initialTravelDate}
        initialDateMax={initialDateMax}
        initialNights={initialNights}
        initialDeparturePoints={initialDeparturePoints}
        onApply={onApply}
        isSearchLoading={isSearching}
      />
    </div>
  );
}