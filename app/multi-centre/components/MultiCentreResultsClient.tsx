"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ListingPackageCard } from "@/components/multi-centre/ListingPackageCard";
import { ListingSortControl } from "@/components/multi-centre/ListingSortControl";
import type { McPackageCard } from "@/types/multi-centre";

type Props = {
  packages: McPackageCard[];
  total: number;
  totalPages: number;
  currentPage: number;
  sort: string;
  d: string;
  air: string;
  mon: string;
  destinationTitle: string;
};

export default function MultiCentreResultsClient({
  packages,
  total,
  totalPages,
  currentPage,
  sort,
  d,
  air,
  mon,
  destinationTitle,
}: Props) {
  const router = useRouter();

  const buildSearchUrl = (overrides: { sort?: string; page?: number } = {}) => {
    const params = new URLSearchParams();
    if (d) params.set("d", d);
    if (air) params.set("air", air);
    if (mon) params.set("mon", mon);
    const nextSort = overrides.sort ?? sort;
    if (nextSort && nextSort !== "recommended") params.set("sort", nextSort);
    const nextPage = overrides.page ?? currentPage;
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/multi-centre?${qs}` : "/multi-centre";
  };

  const handleSortChange = (newSort: string) => {
    router.push(buildSearchUrl({ sort: newSort, page: 1 }), { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    router.push(buildSearchUrl({ page: newPage }), { scroll: false });
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  const paginationItems = useMemo(() => {
    const items: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (currentPage > 3) items.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) items.push(i);
      if (currentPage < totalPages - 2) items.push("...");
      items.push(totalPages);
    }
    return items;
  }, [currentPage, totalPages]);

  const cardQuery = mon ? `?${new URLSearchParams({ mon }).toString()}` : "";

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 border-b border-[#e8e2dc] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-3 lg:block">
          <p className="mb-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#CB2187] lg:mb-2">
            Multi-centre collection
          </p>
          <div className="flex items-center gap-3">
            <h2 className="text-right text-[16px] font-semibold leading-tight tracking-[-0.02em] text-[#1a1a1a] lg:text-left lg:text-[32px] xl:text-[36px]">
              {total} {total === 1 ? "holiday" : "holidays"}
              {destinationTitle !== "All Destinations" ? (
                <>
                  {" "}
                  in <span className="font-semibold text-[#CB2187]">{destinationTitle}</span>
                </>
              ) : (
                <span className="hidden font-normal text-[#6b6570] lg:inline"> across all destinations</span>
              )}
            </h2>
            <div className="lg:hidden">
              <ListingSortControl variant="icon" value={sort} onChange={handleSortChange} />
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <ListingSortControl value={sort} onChange={handleSortChange} />
        </div>
      </div>

      {packages.length === 0 ? (
        <div className="mx-auto my-16 max-w-xl border border-[#e8e2dc] bg-white px-8 py-14 text-center sm:px-12">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#CB2187]">
            No matches
          </p>
          <h3 className="text-[22px] font-semibold tracking-tight text-[#1a1a1a]">
            No holidays in this collection
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#6b6570]">
            We couldn&apos;t find packages for &ldquo;{destinationTitle}&rdquo; with your selected airport and dates.
          </p>
          <Link
            href="/multi-centre"
            className="mt-8 inline-flex items-center gap-2 border border-[#1a1a1a] px-6 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#1a1a1a] transition-colors hover:border-[#CB2187] hover:text-[#CB2187]"
          >
            View all multi-centre holidays
          </Link>
        </div>
      ) : (
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {packages.map((pkg) => (
            <ListingPackageCard
              key={pkg.id || pkg.slug}
              pkg={pkg}
              href={`/multi-centre/${pkg.slug}${cardQuery}`}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mb-16 flex select-none items-center justify-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              currentPage <= 1
                ? "cursor-not-allowed border-[#ece8e4] text-[#d0cbc4] bg-transparent"
                : "cursor-pointer border-[#ece8e4] bg-white text-[#1a1a1a] hover:border-[#CB2187] hover:text-[#CB2187]"
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4 stroke-[1.8]" />
          </button>

          {paginationItems.map((item, idx) => {
            if (item === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-10 w-8 items-center justify-center text-sm text-[#8a8490]"
                >
                  ...
                </span>
              );
            }
            const pageNum = Number(item);
            const isActive = pageNum === currentPage;
            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => handlePageChange(pageNum)}
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-[#CB2187] text-white"
                    : "border border-[#ece8e4] bg-white text-[#1a1a1a] hover:border-[#CB2187] hover:text-[#CB2187]"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              currentPage >= totalPages
                ? "cursor-not-allowed border-[#ece8e4] text-[#d0cbc4] bg-transparent"
                : "cursor-pointer border-[#ece8e4] bg-white text-[#1a1a1a] hover:border-[#CB2187] hover:text-[#CB2187]"
            }`}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4 stroke-[1.8]" />
          </button>
        </div>
      )}
    </>
  );
}
