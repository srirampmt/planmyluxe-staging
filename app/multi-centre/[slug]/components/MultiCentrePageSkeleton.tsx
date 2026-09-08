import { Skeleton } from "@/components/ui/skeleton";

export default function MultiCentrePageSkeleton() {
  return (
    <main className="mx-auto w-full bg-white px-4 md:px-10 font-['Montserrat']">
      <section className="mx-auto w-full max-w-[1280px] py-[14px] md:pt-[24px]">
        <div className="mb-0 flex flex-col gap-4 md:mb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[843px] flex-1">
            <Skeleton className="mb-2 h-[20px] w-[220px]" />
            <Skeleton className="mb-2 h-[28px] w-[90%] md:h-[34px]" />
            <Skeleton className="h-[18px] w-[75%]" />
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-[16px] w-[120px]" />
              <Skeleton className="h-[36px] w-[150px]" />
              <Skeleton className="h-[14px] w-[180px]" />
            </div>
            <Skeleton className="h-[46px] w-[140px] rounded-[10px]" />
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-2 md:grid-cols-[2fr_1fr] md:gap-4">
          <Skeleton className="h-[200px] w-full rounded-[8px] sm:h-[300px] md:h-[360px] lg:h-[450px]" />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-1 md:grid-rows-2 md:gap-4">
            <Skeleton className="h-[120px] w-full rounded-[8px] sm:h-[150px] md:h-[175px] lg:h-[216px]" />
            <Skeleton className="h-[120px] w-full rounded-[8px] sm:h-[150px] md:h-[175px] lg:h-[216px]" />
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1280px] justify-center pb-0 md:justify-end md:pb-4">
        <Skeleton className="h-[28px] w-[180px]" />
      </div>

      <div className="mx-auto max-w-[1280px] pb-[16px]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
          <div className="w-full min-w-0 space-y-6">
            <Skeleton className="h-[110px] w-full rounded-[8px]" />
            <Skeleton className="h-[100px] w-full rounded-[8px]" />

            <div className="md:hidden space-y-4">
              <Skeleton className="h-[330px] w-full rounded-[8px]" />
              <Skeleton className="h-[88px] w-full rounded-[8px]" />
            </div>

            <div className="sticky self-start border-b bg-white" style={{ top: "calc(var(--main-nav-height, 0px) - 1px)" }}>
              <div className="flex gap-6 py-2 overflow-x-auto">
                <Skeleton className="h-[28px] w-[90px]" />
                <Skeleton className="h-[28px] w-[120px]" />
                <Skeleton className="h-[28px] w-[80px]" />
                <Skeleton className="h-[28px] w-[110px]" />
              </div>
            </div>

            <Skeleton className="h-[520px] w-full rounded-[8px]" />
          </div>

          <div className="hidden w-full min-w-0 md:block">
            <div className="flex flex-col items-start gap-4">
              <Skeleton className="h-[340px] w-full rounded-[8px]" />
              <Skeleton className="h-[86px] w-full rounded-[8px]" />
              <Skeleton className="h-[300px] w-full rounded-[8px]" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] pb-[32px] md:pb-[48px]">
        <Skeleton className="h-[180px] w-full rounded-[8px]" />
      </div>

      <div className="mx-auto max-w-[1280px] pb-[24px]">
        <div className="flex gap-4 overflow-hidden">
          <Skeleton className="h-[220px] min-w-[260px] flex-1 rounded-[8px]" />
          <Skeleton className="h-[220px] min-w-[260px] flex-1 rounded-[8px]" />
          <Skeleton className="hidden h-[220px] min-w-[260px] flex-1 rounded-[8px] md:block" />
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] pb-[32px] md:pb-[48px]">
        <Skeleton className="h-[200px] w-full rounded-[8px] md:h-[400px]" />
      </div>

      <div className="mx-auto max-w-[1280px] pb-[32px] md:pb-[48px]">
        <Skeleton className="h-[180px] w-full rounded-[8px]" />
      </div>

      <div className="h-[80px] md:hidden" />
    </main>
  );
}
