import MultiCentreResultsSkeleton from "./components/MultiCentreResultsSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-['Montserrat']">
      <section
        className="sticky z-40 border-b border-gray-100 bg-white lg:hidden"
        style={{ top: "var(--main-nav-height)" }}
      >
        <div className="mx-auto w-full max-w-[1440px] animate-pulse space-y-2.5 px-4 py-3">
          <div className="h-12 w-full rounded-full bg-gray-200" />
          <div className="h-3 w-40 rounded bg-gray-200" />
        </div>
      </section>

      <div className="relative z-30 hidden min-h-[300px] w-full flex-col bg-[#0a1128] lg:flex lg:min-h-[420px]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-[40px] pt-7">
          <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col animate-pulse">
            <div className="h-3 w-44 rounded bg-white/20" />
            <div className="flex flex-1 items-center justify-center py-6">
              <div className="h-10 w-[520px] max-w-full rounded bg-white/20" />
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[1440px] shrink-0 px-[40px] pb-7">
          <div className="mx-auto w-full max-w-[1280px]">
            <div className="rounded-[18px] border border-white bg-white p-3 shadow-[0_16px_40px_rgba(0,0,0,0.15)]">
              <div className="flex animate-pulse items-center gap-3 p-2">
                <div className="h-[52px] flex-1 rounded-xl bg-gray-100" />
                <div className="h-[52px] flex-1 rounded-xl bg-gray-100" />
                <div className="h-[52px] flex-1 rounded-xl bg-gray-100" />
                <div className="h-[52px] w-[180px] rounded-full bg-pink-100" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-[16px] pt-6 pb-16 sm:px-[24px] sm:pt-7 md:px-[32px] lg:px-[40px]">
        <div className="mx-auto w-full max-w-[1280px]">
          <MultiCentreResultsSkeleton />
        </div>
      </div>
    </div>
  );
}
