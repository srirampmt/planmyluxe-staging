const shimmer =
  "absolute inset-0 -translate-x-full animate-[pml-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent";

function Block({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <div className={shimmer} />
    </div>
  );
}

export default function HotelPageLoading() {
  return (
    <div className="min-h-screen bg-white">
      <style>{`@keyframes pml-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>

      {/* --- Banner --- */}
      <section className="relative font-['Montserrat']">
        <div className="mx-auto w-full max-w-[1440px] py-[16px] md:py-[20px]">
          <div className="mx-auto w-full max-w-[1280px] px-4 md:px-10">
            {/* Header row: breadcrumb/rating/title on the left, price/CTA on the right */}
            <div className="mb-3 flex flex-col gap-3 md:mb-[18px] md:gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-[860px] flex-1 space-y-2">
                <Block className="h-4 w-40 rounded-lg" />
                <Block className="h-4 w-56 rounded-lg" />
                <Block className="h-8 w-72 rounded-lg md:h-9 md:w-96" />
              </div>
              <div className="hidden flex-shrink-0 items-center gap-[18px] md:flex">
                <div className="flex flex-col items-end gap-2">
                  <Block className="h-4 w-16 rounded-lg" />
                  <Block className="h-9 w-24 rounded-lg" />
                </div>
                <Block className="h-[50px] w-[150px] rounded-xl" />
              </div>
            </div>

            {/* Image grid: large image + two stacked images */}
            <div className="grid grid-cols-1 items-start gap-2 md:grid-cols-[2fr_1fr] md:gap-3 xl:grid-cols-[964px_300px] xl:gap-[18px]">
              <Block className="h-[220px] w-full rounded-2xl sm:h-[320px] md:h-[380px] xl:h-[458px]" />
              <div className="grid grid-cols-2 gap-2 md:grid-cols-1 md:grid-rows-2 md:gap-3 xl:gap-[18px]">
                <Block className="h-[130px] w-full rounded-2xl sm:h-[170px] md:h-[184px] xl:h-[220px]" />
                <Block className="h-[130px] w-full rounded-2xl sm:h-[170px] md:h-[184px] xl:h-[220px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto px-4 md:px-10">
        {/* Badge/share row */}
        <div className="mx-auto flex max-w-[1280px] items-center gap-2 pt-[8px] pb-[10px] md:pt-[16px] md:pb-[16px]">
          <Block className="h-6 w-20 rounded-full" />
          <Block className="h-6 w-16 rounded-full" />
          <Block className="h-6 w-24 rounded-full" />
        </div>

        <div className="mx-auto max-w-[1280px] pb-[16px]">
          <div className="grid grid-cols-1 gap-1 lg:grid-cols-[1fr_minmax(320px,421px)] lg:gap-6">
            {/* Left column */}
            <div className="w-full space-y-3">
              {/* Calendar card — mobile only (mirrors real layout: block md:hidden) */}
              <div className="block space-y-3 md:hidden">
                <CalendarCardSkeleton />
              </div>

              {/* Details tabs */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
                <div className="mb-4 flex gap-4 border-b border-gray-100 pb-3">
                  <Block className="h-5 w-20 rounded-lg" />
                  <Block className="h-5 w-24 rounded-lg" />
                  <Block className="h-5 w-16 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Block className="h-3 w-full rounded" />
                  <Block className="h-3 w-full rounded" />
                  <Block className="h-3 w-5/6 rounded" />
                  <Block className="h-3 w-3/4 rounded" />
                </div>
              </div>

              {/* Trending banner */}
              <Block className="h-[100px] w-full rounded-2xl" />

              {/* Contact card */}
              <div className="rounded-2xl border border-gray-200 bg-white px-3 py-[12px] md:px-[12px] md:py-[14px]">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <Block className="h-4 w-52 rounded-lg" />
                  <div className="flex flex-col gap-2 md:flex-row md:gap-3">
                    <Block className="h-[44px] w-full rounded-xl md:h-[48px] md:w-[153px]" />
                    <Block className="h-[44px] w-full rounded-xl md:h-[48px] md:w-[163px]" />
                    <Block className="h-[44px] w-full rounded-xl md:h-[48px] md:w-[163px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right column — sticky calendar sidebar (desktop only) */}
            <div className="hidden w-full min-w-0 md:block">
              <CalendarCardSkeleton />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function CalendarCardSkeleton() {
  return (
    <div>
      {/* Contact buttons row */}
      <div className="mb-6 grid grid-cols-3 gap-[6px] md:mb-3">
        <Block className="h-[48px] w-full rounded-xl" />
        <Block className="h-[48px] w-full rounded-xl" />
        <Block className="h-[48px] w-full rounded-xl" />
      </div>

      <div className="w-full rounded-2xl border border-gray-200 bg-white p-3">
        {/* Filter pills */}
        <div className="mb-3 grid grid-cols-3 gap-[6px]">
          <Block className="h-12 w-full rounded-xl" />
          <Block className="h-12 w-full rounded-xl" />
          <Block className="h-12 w-full rounded-xl" />
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 21 }).map((_, i) => (
            <Block key={i} className="h-[54px] w-full rounded-xl" />
          ))}
        </div>

        {/* Trust & social proof */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
          <div className="px-4 py-4">
            <Block className="mb-3 h-4 w-40 rounded-lg" />
            <div className="flex items-center gap-2">
              <Block className="h-[84px] flex-1 rounded-xl" />
              <Block className="h-[84px] flex-1 rounded-xl" />
            </div>
          </div>
          <div className="border-t border-gray-100 p-4">
            <Block className="h-8 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
