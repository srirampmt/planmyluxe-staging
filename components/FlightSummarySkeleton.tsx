import React from "react";

/**
 * FlightSummarySkeleton - visually mimics the FlightSummary component for loading state.
 */
export default function FlightSummarySkeleton() {
  return (
    <div className="w-full rounded-[12px] border border-gray-200 bg-white p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-5 w-1/2 mb-4 bg-gray-200 rounded" />
      {/* Subline skeletons */}
      <div className="h-4 w-3/4 mb-2 bg-gray-100 rounded" />
      <div className="h-4 w-2/3 mb-2 bg-gray-100 rounded" />
      <div className="h-4 w-1/2 bg-gray-100 rounded" />
      {/* Button skeleton */}
      <div className="mt-6 h-10 w-32 bg-gray-200 rounded" />
    </div>
  );
}
