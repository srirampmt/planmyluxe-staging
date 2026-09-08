"use client";

import React from 'react';
import SearchBarComponent from '@/components/search/searchbar';

interface SearchBarProps {
  initialQuery?: string;
  initialDest?: string;
  initialDealType?: string;
  compact?: boolean;
}

export default function SearchBar({
  initialQuery = '',
  initialDest = '',
  initialDealType = '',
  compact = false,
}: SearchBarProps) {
  return (
    <div className="bg-white/95 backdrop-blur-2xl rounded-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] border border-gray-100 p-2 relative overflow-visible">
      <SearchBarComponent
        initialQuery={initialQuery}
        initialDest={initialDest}
        initialDealType={initialDealType}
        compact={compact}
      />
    </div>
  );
}