import { Skeleton } from "@/components/ui/skeleton";

function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-white font-['Montserrat']">
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-[20px] md:py-[50px] lg:py-[50px]">
        <div className="w-full max-w-[1280px] mx-auto">{children}</div>
      </div>
    </section>
  );
}

function CarouselRow({ cardClassName }: { cardClassName: string }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className={cardClassName}>
          <Skeleton className="h-full w-full rounded-[16px]" />
        </div>
      ))}
    </div>
  );
}

export default function HomePageSkeleton() {
  return (
    <>
      {/* Banner */}
      <section className="w-full font-['Montserrat']">
        <div className="relative w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] h-[300px] sm:h-[400px] md:h-[480px] lg:h-[480px]">
          <Skeleton className="h-full w-full rounded-none bg-gray-200" />
          <div className="absolute inset-0 flex items-center">
            <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
              <div className="w-full max-w-[1280px] mx-auto">
                <div className="flex flex-col max-w-[623px] w-[623px]">
                  <Skeleton className="h-[38px] sm:h-[50px] md:h-[76px] w-[70%] bg-gray-300" />
                  <div className="h-3 md:h-4" />
                  <Skeleton className="h-[20px] sm:h-[22px] md:h-[40px] w-[85%] bg-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] relative bg-[#EDEDED] font-['Montserrat']">
        <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-[28px] md:py-[28px] lg:py-[28px]">
          <div className="w-full max-w-[1280px] mx-auto">
            <Skeleton className="h-[20px] md:h-[24px] w-[260px] bg-gray-300" />
            <div className="h-[16px] md:h-[24px]" />
            <div className="hidden lg:grid lg:grid-cols-5 gap-[14px] mb-[20px]">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <Skeleton className="h-[34px] w-[34px] rounded-full bg-gray-300" />
                  <div className="h-[12px]" />
                  <Skeleton className="h-[10px] w-full max-w-[160px] bg-gray-300" />
                  <div className="h-[8px]" />
                  <Skeleton className="h-[10px] w-[120px] bg-gray-300" />
                </div>
              ))}
            </div>
            <div className="lg:hidden mb-[14px] md:mb-[20px]">
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex-[0_0_auto] w-[140px] sm:w-[180px] md:w-[200px]"
                  >
                    <div className="flex flex-col items-center text-center">
                      <Skeleton className="h-[34px] w-[34px] rounded-full bg-gray-300" />
                      <div className="h-[12px]" />
                      <Skeleton className="h-[10px] w-full bg-gray-300" />
                      <div className="h-[8px]" />
                      <Skeleton className="h-[10px] w-[75%] bg-gray-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-row items-center justify-end gap-[16px] sm:gap-[16px] md:gap-[32px] lg:gap-[32px]">
              <Skeleton className="h-[14px] w-[140px] bg-gray-300" />
              <Skeleton className="h-[36px] w-[120px] rounded-[8px] bg-gray-300" />
            </div>
          </div>
        </div>
      </section>

      {/* Handpicked escapes */}
      <SectionShell>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-[10px] md:mb-[20px] lg:mb-[25px]">
          <div className="max-w-[624px] mb-[12px] lg:mb-0">
            <Skeleton className="h-[30px] sm:h-[30px] md:h-[60px] w-[80%] bg-gray-200" />
            <div className="h-[12px] sm:h-[16px] md:h-[20px]" />
            <Skeleton className="h-[14px] md:h-[16px] w-full bg-gray-200" />
            <div className="h-[10px]" />
            <Skeleton className="h-[14px] md:h-[16px] w-[90%] bg-gray-200" />
          </div>
          <Skeleton className="h-[14px] w-[200px] bg-gray-200" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="flex-[0_0_auto] w-[280px] sm:w-[320px] md:w-[360px] lg:w-[405px]"
            >
              <Skeleton className="h-[144px] sm:h-[164px] md:h-[185px] lg:h-[208px] rounded-[16px] sm:rounded-[18px] md:rounded-[20px] bg-gray-200" />
            </div>
          ))}
        </div>
      </SectionShell>

      {/* Weekly escapes */}
      <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-[#FFF7FC] font-['Montserrat']">
        <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-[20px] md:py-[50px] lg:py-[50px]">
          <div className="w-full max-w-[1280px] mx-auto">
            <Skeleton className="h-[28px] md:h-[56px] w-[420px] max-w-[90%] bg-gray-200" />
            <div className="h-3" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
              <div className="w-full max-w-xl">
                <Skeleton className="h-[14px] md:h-[16px] w-full bg-gray-200" />
                <div className="h-2" />
                <Skeleton className="h-[14px] md:h-[16px] w-[85%] bg-gray-200" />
              </div>
              <Skeleton className="h-[14px] w-[200px] bg-gray-200" />
            </div>

            <div className="bg-white rounded-[8px] overflow-hidden border border-[#ececec] my-5 md:my-6">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-[260px] md:h-[320px] overflow-hidden">
                  <Skeleton className="absolute inset-0 h-full w-full rounded-none bg-gray-200" />
                  <Skeleton className="absolute top-0 left-0 h-[26px] w-[220px] rounded-br-[167px] bg-gray-300" />
                  <Skeleton className="absolute top-0 right-[-25px] h-[65px] w-[130px] rounded-md bg-gray-300" />
                </div>
                <div className="p-[8px] md:p-[16px] flex flex-col gap-3">
                  <Skeleton className="h-[16px] w-[120px] bg-gray-200" />
                  <Skeleton className="h-[14px] w-[160px] bg-gray-200" />
                  <Skeleton className="h-[12px] w-[240px] bg-gray-200" />
                  <Skeleton className="h-[12px] w-[220px] bg-gray-200" />
                  <div className="mt-auto flex items-center justify-between">
                    <Skeleton className="h-[36px] w-[140px] rounded-[8px] bg-gray-200" />
                    <Skeleton className="h-[24px] w-[80px] bg-gray-200" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <CarouselRow cardClassName="flex-[0_0_auto] w-[270px] sm:w-[300px] md:w-[360px] h-[436px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Deal collections (cards carousel) */}
      <SectionShell>
        <div className="flex items-end justify-between gap-4 mb-[16px]">
          <Skeleton className="h-[28px] md:h-[40px] w-[240px] bg-gray-200" />
          <Skeleton className="h-[14px] w-[140px] bg-gray-200" />
        </div>
        <div className="flex gap-2 overflow-hidden mb-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton
              key={idx}
              className="h-[34px] w-[92px] rounded-full bg-gray-200"
            />
          ))}
        </div>
        <CarouselRow cardClassName="flex-[0_0_auto] w-[270px] sm:w-[300px] md:w-[360px] h-[436px]" />
      </SectionShell>

      {/* Destination carousel */}
      <SectionShell>
        <Skeleton className="h-[28px] md:h-[40px] w-[280px] bg-gray-200" />
        <div className="h-3" />
        <Skeleton className="h-[14px] md:h-[16px] w-[520px] max-w-[90%] bg-gray-200" />
        <div className="h-4" />
        <div className="flex gap-2 overflow-hidden mb-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton
              key={idx}
              className="h-[34px] w-[92px] rounded-full bg-gray-200"
            />
          ))}
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="flex-[0_0_auto] w-[270px] sm:w-[320px] md:w-[360px]"
            >
              <Skeleton className="h-[260px] rounded-[16px] bg-gray-200" />
              <div className="h-3" />
              <Skeleton className="h-[14px] w-[70%] bg-gray-200" />
            </div>
          ))}
        </div>
      </SectionShell>

      {/* Partners */}
      <SectionShell>
        <div className="flex items-end justify-between gap-4 mb-[16px]">
          <Skeleton className="h-[28px] md:h-[40px] w-[220px] bg-gray-200" />
          <Skeleton className="h-[14px] w-[140px] bg-gray-200" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton
              key={idx}
              className="h-[72px] w-[160px] rounded-[12px] bg-gray-200"
            />
          ))}
        </div>
      </SectionShell>

      {/* Perfect holiday */}
      <SectionShell>
        <Skeleton className="h-[28px] md:h-[40px] w-[320px] bg-gray-200" />
        <div className="h-3" />
        <Skeleton className="h-[14px] md:h-[16px] w-[520px] max-w-[90%] bg-gray-200" />
        <div className="h-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton
              key={idx}
              className="h-[160px] md:h-[220px] rounded-[16px] bg-gray-200"
            />
          ))}
        </div>
      </SectionShell>

      {/* Brochure */}
      <SectionShell>
        <Skeleton className="h-[200px] md:h-[260px] rounded-[16px] bg-gray-200" />
      </SectionShell>

      {/* Why book with PML */}
      <SectionShell>
        <Skeleton className="h-[28px] md:h-[40px] w-[340px] bg-gray-200" />
        <div className="h-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded-[16px] border border-[#ececec] p-4">
              <Skeleton className="h-[32px] w-[32px] rounded-full bg-gray-200" />
              <div className="h-3" />
              <Skeleton className="h-[14px] w-[70%] bg-gray-200" />
              <div className="h-2" />
              <Skeleton className="h-[12px] w-full bg-gray-200" />
              <div className="h-2" />
              <Skeleton className="h-[12px] w-[90%] bg-gray-200" />
            </div>
          ))}
        </div>
      </SectionShell>

      {/* Signup */}
      <SectionShell>
        <Skeleton className="h-[28px] md:h-[40px] w-[280px] bg-gray-200" />
        <div className="h-3" />
        <Skeleton className="h-[14px] md:h-[16px] w-[520px] max-w-[90%] bg-gray-200" />
        <div className="h-6" />
        <div className="flex flex-col sm:flex-row gap-3 max-w-[640px]">
          <Skeleton className="h-[44px] flex-1 rounded-[10px] bg-gray-200" />
          <Skeleton className="h-[44px] w-[140px] rounded-[10px] bg-gray-200" />
        </div>
      </SectionShell>

      {/* Trust section */}
      <SectionShell>
        <div className="flex items-center justify-between gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <Skeleton className="h-[34px] w-[34px] rounded-full bg-gray-200" />
              <div>
                <Skeleton className="h-[12px] w-[120px] bg-gray-200" />
                <div className="h-2" />
                <Skeleton className="h-[10px] w-[90px] bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    </>
  );
}
