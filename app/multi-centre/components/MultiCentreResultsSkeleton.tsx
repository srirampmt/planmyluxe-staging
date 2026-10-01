import { ListingPackageCardSkeleton } from "@/components/multi-centre/ListingPackageCard";

export default function MultiCentreResultsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading holidays">
      <div className="mb-6 flex flex-col gap-4 border-b border-[#e8e2dc] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-3 lg:block animate-pulse">
          <div className="h-3 w-40 rounded bg-gray-200 lg:mb-3" />
          <div className="h-5 w-48 rounded bg-gray-200 lg:h-9 lg:w-80" />
        </div>
        <div className="hidden h-10 w-44 animate-pulse rounded-full bg-gray-200 lg:block" />
      </div>
      <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {Array.from({ length: 6 }, (_, idx) => (
          <ListingPackageCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}
