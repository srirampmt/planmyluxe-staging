import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, Gem, Home, Gift, Headphones, ShieldCheck } from "lucide-react";
import MultiCenterSearchBar from "@/components/search/MultiCenterSearchBar";
import MultiCentreMobileSearch from "@/components/search/MultiCentreMobileSearch";
import MultiCentreBannerArt from "@/components/search/MultiCentreBannerArt";
import { cleanMonthParam, fetchMultiCentrePackages } from "@/lib/multiCentreServerData";
import MultiCentreResultsClient from "./components/MultiCentreResultsClient";
import MultiCentreResultsSkeleton from "./components/MultiCentreResultsSkeleton";

type SearchParams = Record<string, string | string[] | undefined>;

function first(params: SearchParams, ...keys: string[]): string {
  for (const key of keys) {
    const value = params[key];
    const str = Array.isArray(value) ? value[0] : value;
    if (str) return str;
  }
  return "";
}

type ResultsProps = {
  d: string;
  air: string;
  mon: string;
  sort: string;
  page: number;
  destinationTitle: string;
};

async function MultiCentreResults({ d, air, mon, sort, page, destinationTitle }: ResultsProps) {
  const { packages, total, totalPages } = await fetchMultiCentrePackages({ d, air, mon, sort, page });
  return (
    <MultiCentreResultsClient
      packages={packages}
      total={total}
      totalPages={totalPages}
      currentPage={page}
      sort={sort}
      d={d}
      air={air}
      mon={mon}
      destinationTitle={destinationTitle}
    />
  );
}

export default async function MultiCentrePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const d = first(params, "d", "destination");
  const air = first(params, "air", "airport");
  const mon = cleanMonthParam(first(params, "mon", "month", "date"));
  const sort = first(params, "sort") || "recommended";
  const parsedPage = parseInt(first(params, "page") || "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const destinationTitle = d
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" | ") || "All Destinations";

  const resultsKey = new URLSearchParams({ d, air, mon, sort, page: String(page) }).toString();

  return (
    <div className="min-h-screen bg-[#fafafa] font-['Montserrat']">
      <section className="sticky z-40 border-b border-gray-100 bg-white lg:hidden" style={{ top: "var(--main-nav-height)" }} >
        <div className="mx-auto w-full max-w-[1440px] px-4">
          <MultiCentreMobileSearch d={d} air={air} mon={mon} />
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
                <li className="truncate font-bold text-[#1a1a1a]" aria-current="page">
                  Multi Centre Search
                </li>
              </ol>
            </nav>
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
                  className="flex items-center gap-1 font-bold text-white hover:text-pml-primary"
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
              {d
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
                d={d}
                air={air}
                mon={mon}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. RESULTS CONTAINER */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-[16px] pt-6 pb-16 sm:px-[24px] sm:pt-7 md:px-[32px] lg:px-[40px]">
        <div className="mx-auto w-full max-w-[1280px]">
        <Suspense key={resultsKey} fallback={<MultiCentreResultsSkeleton />}>
          <MultiCentreResults
            d={d}
            air={air}
            mon={mon}
            sort={sort}
            page={page}
            destinationTitle={destinationTitle}
          />
        </Suspense>

        <div className="mt-4 border-t border-[#e8e2dc] pt-12 pb-4">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#eadfe6] text-[#CB2187]">
                <Gem className="h-5 w-5 stroke-[1.6]" />
              </div>
              <div>
                <h4 className="text-[13px] font-semibold tracking-tight text-[#1a1a1a]">Best price guarantee</h4>
                <p className="mt-1 text-[12px] leading-relaxed text-[#6b6570]">Unbeatable prices, every time.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#eadfe6] text-[#CB2187]">
                <Gift className="h-5 w-5 stroke-[1.6]" />
              </div>
              <div>
                <h4 className="text-[13px] font-semibold tracking-tight text-[#1a1a1a]">Exclusive offers</h4>
                <p className="mt-1 text-[12px] leading-relaxed text-[#6b6570]">Access to member-only deals.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#eadfe6] text-[#CB2187]">
                <Headphones className="h-5 w-5 stroke-[1.6]" />
              </div>
              <div>
                <h4 className="text-[13px] font-semibold tracking-tight text-[#1a1a1a]">24/7 support</h4>
                <p className="mt-1 text-[12px] leading-relaxed text-[#6b6570]">We&apos;re here whenever you need us.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#eadfe6] text-[#CB2187]">
                <ShieldCheck className="h-5 w-5 stroke-[1.6]" />
              </div>
              <div>
                <h4 className="text-[13px] font-semibold tracking-tight text-[#1a1a1a]">Secure booking</h4>
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
