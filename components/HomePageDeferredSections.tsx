"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import type { HomePage } from "@/types/homepage";
import { useVisibleElement } from "@/lib/useVisibleElement";

const Partners = dynamic(() => import("@/components/parners"), {
  loading: () => (
    <SectionPlaceholder
      backgroundClassName="bg-white"
      heightClassName="h-[180px] md:h-[220px]"
    />
  ),
});

const Perfectholiday = dynamic(() => import("@/components/Perfectholiday"), {
  loading: () => (
    <SectionPlaceholder
      backgroundClassName="bg-white"
      heightClassName="h-[420px] md:h-[620px]"
    />
  ),
});

const Broucher = dynamic(() => import("@/components/Broucher"), {
  loading: () => (
    <SectionPlaceholder
      backgroundClassName="bg-[#FFF7FC]"
      heightClassName="h-[420px] md:h-[460px]"
      pulseClassName="bg-white/70"
    />
  ),
});

const WhybookwithPml = dynamic(() => import("@/components/WhybookwithPml"), {
  loading: () => (
    <SectionPlaceholder
      backgroundClassName="bg-white"
      heightClassName="h-[260px] md:h-[320px]"
    />
  ),
});

const Signup = dynamic(() => import("@/components/Signup"), {
  loading: () => (
    <SectionPlaceholder
      backgroundClassName="bg-pml-primary/5"
      heightClassName="h-[320px] md:h-[380px]"
      pulseClassName="bg-white/80"
    />
  ),
});

const Trustsection = dynamic(() => import("@/components/Trustsection"), {
  loading: () => (
    <SectionPlaceholder
      backgroundClassName="bg-[#E8E8E8]/70"
      heightClassName="h-[280px] md:h-[295px]"
    />
  ),
});

type SectionPlaceholderProps = {
  backgroundClassName: string;
  heightClassName: string;
  pulseClassName?: string;
};

function SectionPlaceholder({
  backgroundClassName,
  heightClassName,
  pulseClassName = "bg-black/5",
}: SectionPlaceholderProps) {
  return (
    <div
      className={`w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] ${backgroundClassName}`}
      aria-hidden="true"
    >
      <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] py-8 md:py-12">
        <div
          className={`w-full max-w-[1280px] mx-auto animate-pulse rounded-[24px] ${heightClassName} ${pulseClassName}`}
        />
      </div>
    </div>
  );
}

function DeferredSection({
  children,
  placeholder,
}: {
  children: ReactNode;
  placeholder: ReactNode;
}) {
  const { ref, isVisible } = useVisibleElement<HTMLDivElement>({
    rootMargin: "400px 0px",
  });

  return <div ref={ref}>{isVisible ? children : placeholder}</div>;
}

type HomePageDeferredSectionsProps = {
  page: HomePage;
};

export default function HomePageDeferredSections({
  page,
}: HomePageDeferredSectionsProps) {
  return (
    <>
      <DeferredSection
        placeholder={
          <SectionPlaceholder
            backgroundClassName="bg-white"
            heightClassName="h-[180px] md:h-[220px]"
          />
        }
      >
        <Partners />
      </DeferredSection>

      <DeferredSection
        placeholder={
          <SectionPlaceholder
            backgroundClassName="bg-white"
            heightClassName="h-[420px] md:h-[620px]"
          />
        }
      >
        <Perfectholiday
          perfect_holiday_title={page.perfect_holiday_title}
          perfect_holiday_subtitle={page.perfect_holiday_subtitle}
          perfect_holiday_types={page.perfect_holiday_types}
        />
      </DeferredSection>

      <DeferredSection
        placeholder={
          <SectionPlaceholder
            backgroundClassName="bg-[#FFF7FC]"
            heightClassName="h-[420px] md:h-[460px]"
            pulseClassName="bg-white/70"
          />
        }
      >
        <Broucher />
      </DeferredSection>

      <DeferredSection
        placeholder={
          <SectionPlaceholder
            backgroundClassName="bg-white"
            heightClassName="h-[260px] md:h-[320px]"
          />
        }
      >
        <WhybookwithPml />
      </DeferredSection>

      <DeferredSection
        placeholder={
          <SectionPlaceholder
            backgroundClassName="bg-pml-primary/5"
            heightClassName="h-[320px] md:h-[380px]"
            pulseClassName="bg-white/80"
          />
        }
      >
        <Signup />
      </DeferredSection>

      <DeferredSection
        placeholder={
          <SectionPlaceholder
            backgroundClassName="bg-[#E8E8E8]/70"
            heightClassName="h-[280px] md:h-[295px]"
          />
        }
      >
        <Trustsection />
      </DeferredSection>
    </>
  );
}