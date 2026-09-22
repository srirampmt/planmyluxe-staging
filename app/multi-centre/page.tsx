"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {Sun, Plane,Bed,Calendar,Camera,MapPin,Heart,ChevronLeft,ChevronRight,Gem, Home, Gift, Headphones, ShieldCheck, Search } from "lucide-react";
import MultiCenterSearchBar from "@/components/search/MultiCenterSearchBar";
import MultiCentreMobileSearch from "@/components/search/MultiCentreMobileSearch";
import MultiCentreBannerArt from "@/components/search/MultiCentreBannerArt";
import { ListingPackageCard, ListingPackageCardSkeleton } from "@/components/multi-centre/ListingPackageCard";
import { ListingSortControl } from "@/components/multi-centre/ListingSortControl";
import type { McPackageCard } from "@/types/multi-centre";

type SearchApiResponse = {
  success: boolean;
  total: number;
  page: number;
  total_pages: number;
  limit: number;
  d: string;
  air: string;
  mon: string;
  packages: McPackageCard[];
};

function MultiCentreListing() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query params
  const destinationParam = searchParams.get("d") || searchParams.get("destination") || "";
  const airportParam = searchParams.get("air") || searchParams.get("airport") || "";
  const monthParam = searchParams.get("mon") || searchParams.get("month") || searchParams.get("date") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const sortParam = searchParams.get("sort") || "recommended";

  // Component state
  const [packages, setPackages] = useState<McPackageCard[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>(sortParam);
  const [currentPage, setCurrentPage] = useState<number>(pageParam || 1);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const limit = 6;

  // Sync state when URL params change
  useEffect(() => {
    setCurrentPage(pageParam || 1);
    setSortBy(sortParam);
  }, [pageParam, sortParam]);

  // Fetch packages from backend
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const query = new URLSearchParams();
    if (destinationParam) query.set("d", destinationParam);
    if (airportParam) query.set("air", airportParam);
    if (monthParam) {
      const cleanMon = monthParam.replace(/[^0-9]/g, "").slice(0, 6);
      query.set("mon", cleanMon || monthParam);
    }
    query.set("sort", sortBy);
    query.set("page", String(currentPage));
    query.set("limit", String(limit));

    fetch(`/api/multicentre-packages?${query.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch packages`);
        }
        return res.json();
      })
      .then((data: SearchApiResponse) => {
        if (isMounted && data.success) {
          setPackages(data.packages || []);
          setTotalCount(data.total || 0);
          setTotalPages(data.total_pages || 1);
        }
      })
      .catch((err) => {
        console.error("Error fetching multi-centre packages:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [destinationParam, airportParam, monthParam, sortBy, currentPage]);

  const buildSearchUrl = (overrides: { sort?: string; page?: number } = {}) => {
    const params = new URLSearchParams();
    if (destinationParam) params.set("d", destinationParam);
    if (airportParam) params.set("air", airportParam);
    if (monthParam) {
      const cleanMon = monthParam.replace(/[^0-9]/g, "").slice(0, 6);
      params.set("mon", cleanMon || monthParam);
    }
    const currentSort = overrides.sort !== undefined ? overrides.sort : sortBy;
    if (currentSort && currentSort !== "recommended") {
      params.set("sort", currentSort);
    }
    const currentPageNum = overrides.page !== undefined ? overrides.page : currentPage;
    if (currentPageNum && currentPageNum > 1) {
      params.set("page", String(currentPageNum));
    }
    const qs = params.toString();
    return qs ? `/multi-centre?${qs}` : "/multi-centre";
  };

  // Handle Sort Change
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1);
    router.push(buildSearchUrl({ sort: newSort, page: 1 }));
  };

  // Handle Page Change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    router.push(buildSearchUrl({ page: newPage }));
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  // Toggle Wishlist Heart
  const toggleWishlist = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  // Generate pagination numbers
  const paginationItems = useMemo(() => {
    const items: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (currentPage > 3) items.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(i);
      }

      if (currentPage < totalPages - 2) items.push("...");
      items.push(totalPages);
    }
    return items;
  }, [currentPage, totalPages]);

  const destinationTitle = destinationParam
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" | ") || "All Destinations";

  return (
    <div className="min-h-screen bg-[#fafafa] font-['Montserrat']">
      <section className="sticky z-40 border-b border-gray-100 bg-white lg:hidden" style={{ top: "var(--main-nav-height)" }} >
        <div className="mx-auto w-full max-w-[1440px] px-4">
          <MultiCentreMobileSearch d={destinationParam} air={airportParam} mon={monthParam} />
          <div className="flex items-center gap-3 pb-2.5">
            <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
              <ol className="flex min-w-0 items-center gap-1 text-[12px] text-[#4C4C4C]">
                <li className="shrink-0">
                  <Link href="/" className="flex items-center gap-1 font-bold text-pml-primary">
                    <Home className="h-[14px] w-[14px] shrink-0" />
                    Home
                  </Link>
                </li>
                <li aria-hidden="true" className="flex shrink-0 items-center">
                  <ChevronRight className="h-[14px] w-[14px]" />
                </li>
                <li className="truncate font-bold text-[#1a1b4b]" aria-current="page">
                  Multi Centre Search
                </li>
              </ol>
            </nav>
            <ListingSortControl variant="icon" value={sortBy} onChange={handleSortChange} />
          </div>
        </div>
      </section>

      {/* 1. HERO BANNER WITH EMBEDDED SEARCH BAR */}
      <div className="relative z-30 hidden min-h-[300px] w-full flex-col bg-[#0a1128] lg:flex lg:min-h-[420px]">
        <MultiCentreBannerArt />

        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-[16px] pt-5 sm:px-[24px] sm:pt-6 md:px-[32px] lg:px-[40px] lg:pt-7">
          <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col">
          <nav aria-label="Breadcrumb" className="shrink-0">
            <ol className="flex flex-wrap items-center gap-1 text-[12px] md:text-[13px] text-white/80">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-1 font-bold text-pml-primary hover:underline"
                >
                  <Home className="h-[14px] w-[14px] shrink-0" />
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="flex items-center">
                <ChevronRight className="h-[14px] w-[14px]" />
              </li>
              <li className="font-bold text-white" aria-current="page">
                Multi Centre Search
              </li>
            </ol>
          </nav>

          <div className="flex flex-1 items-center justify-center py-4 sm:py-6">
            <h1 className="max-w-4xl text-center text-2xl font-extrabold leading-[1.15] tracking-tight text-white drop-shadow-md sm:text-3xl lg:text-[38px]">
              {destinationParam
                ? `Discover More in ${destinationTitle}`
                : "Discover All Multi-Centre Holidays"}
            </h1>
          </div>
          </div>
        </div>

        <div className="relative z-40 mx-auto w-full max-w-[1440px] shrink-0 px-[16px] pb-5 sm:px-[24px] sm:pb-6 md:px-[32px] lg:px-[40px] lg:pb-7">
          <div className="mx-auto w-full max-w-[1280px]">
            <div className="rounded-[18px] border border-white bg-white p-2 shadow-[0_16px_40px_rgba(0,0,0,0.15)] sm:p-3">
              <MultiCenterSearchBar
                d={destinationParam}
                air={airportParam}
                mon={monthParam}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. RESULTS CONTAINER */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-[16px] pt-6 pb-16 sm:px-[24px] sm:pt-7 md:px-[32px] lg:px-[40px]">
        <div className="mx-auto w-full max-w-[1280px]">
        <div className="mb-10 flex flex-col gap-6 border-b border-[#e8e2dc] pb-7 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center justify-between gap-3 lg:block">
            <p className="mb-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#CB2187] lg:mb-2">
              Multi-centre collection
            </p>
            <h2 className="text-right text-[16px] font-semibold leading-tight tracking-[-0.02em] text-[#1a1b4b] lg:text-left lg:text-[32px] xl:text-[36px]">
              {totalCount} {totalCount === 1 ? "holiday" : "holidays"}
              {destinationTitle !== "All Destinations" ? (
                <>
                  {" "}
                  in <span className="font-semibold text-[#CB2187]">{destinationTitle}</span>
                </>
              ) : (
                <span className="hidden font-normal text-[#6b6570] lg:inline"> across all destinations</span>
              )}
            </h2>
          </div>

          <div className="hidden lg:block">
            <ListingSortControl value={sortBy} onChange={handleSortChange} />
          </div>
        </div>

        {isLoading ? (
          <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <ListingPackageCardSkeleton key={idx} />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="mx-auto my-16 max-w-xl border border-[#e8e2dc] bg-white px-8 py-14 text-center sm:px-12">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#CB2187]">
              No matches
            </p>
            <h3 className="text-[22px] font-semibold tracking-tight text-[#1a1b4b]">
              No holidays in this collection
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#6b6570]">
              We couldn&apos;t find packages for &ldquo;{destinationTitle}&rdquo; with your selected airport and dates.
            </p>
            <Link
              href="/multi-centre"
              className="mt-8 inline-flex items-center gap-2 border border-[#1a1b4b] px-6 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#1a1b4b] transition-colors hover:border-[#CB2187] hover:text-[#CB2187]"
            >
              View all multi-centre holidays
            </Link>
          </div>
        ) : (
          <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {packages.map((pkg) => {
              const params = new URLSearchParams();
              if (monthParam) {
                const cleanMon = monthParam.replace(/[^0-9]/g, "").slice(0, 6);
                params.set("mon", cleanMon || monthParam);
              }
              const qs = params.toString();
              const href = qs ? `/multi-centre/${pkg.slug}?${qs}` : `/multi-centre/${pkg.slug}`;

              return <ListingPackageCard key={pkg.id || pkg.slug} pkg={pkg} href={href} />;
            })}
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <div className="mb-16 flex select-none items-center justify-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                currentPage <= 1
                  ? "cursor-not-allowed border-[#ece8e4] text-[#d0cbc4] bg-transparent"
                  : "cursor-pointer border-[#ece8e4] bg-white text-[#1a1b4b] hover:border-[#CB2187] hover:text-[#CB2187]"
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
                      : "border border-[#ece8e4] bg-white text-[#1a1b4b] hover:border-[#CB2187] hover:text-[#CB2187]"
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
                  : "cursor-pointer border-[#ece8e4] bg-white text-[#1a1b4b] hover:border-[#CB2187] hover:text-[#CB2187]"
              }`}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4 stroke-[1.8]" />
            </button>
          </div>
        )}

        <div className="mt-4 border-t border-[#e8e2dc] pt-12 pb-4">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#eadfe6] text-[#CB2187]">
                <Gem className="h-5 w-5 stroke-[1.6]" />
              </div>
              <div>
                <h4 className="text-[13px] font-semibold tracking-tight text-[#1a1b4b]">Best price guarantee</h4>
                <p className="mt-1 text-[12px] leading-relaxed text-[#6b6570]">Unbeatable prices, every time.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#eadfe6] text-[#CB2187]">
                <Gift className="h-5 w-5 stroke-[1.6]" />
              </div>
              <div>
                <h4 className="text-[13px] font-semibold tracking-tight text-[#1a1b4b]">Exclusive offers</h4>
                <p className="mt-1 text-[12px] leading-relaxed text-[#6b6570]">Access to member-only deals.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#eadfe6] text-[#CB2187]">
                <Headphones className="h-5 w-5 stroke-[1.6]" />
              </div>
              <div>
                <h4 className="text-[13px] font-semibold tracking-tight text-[#1a1b4b]">24/7 support</h4>
                <p className="mt-1 text-[12px] leading-relaxed text-[#6b6570]">We&apos;re here whenever you need us.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#eadfe6] text-[#CB2187]">
                <ShieldCheck className="h-5 w-5 stroke-[1.6]" />
              </div>
              <div>
                <h4 className="text-[13px] font-semibold tracking-tight text-[#1a1b4b]">Secure booking</h4>
                <p className="mt-1 text-[12px] leading-relaxed text-[#6b6570]">Book with confidence.</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default function MultiCentrePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CB2187]" />
        </div>
      }
    >
      <MultiCentreListing />
    </Suspense>
  );
}
