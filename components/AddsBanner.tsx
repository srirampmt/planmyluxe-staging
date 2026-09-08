"use client";
import React from "react";
 
type Props = {
  title?: string | null;
  subtitle?: string | null;
  addlink?: string | null;
  image?: string | null;
};

type CtaProps = {
  addlink?: string | null;
  ctaLabel: string;
  className: string;
};
 
function isValidHref(value?: string | null) {
  if (!value) return false;
  return /^(https?:\/\/|\/|mailto:|tel:)/i.test(value.trim());
};

function FlameIcon({ className }: { className: string }) {
  return (
    <svg className={className} width="100%" height="100%" viewBox="0 0 99 116" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M56.693 2.34378C47.4033 6.02854 41.3801 12.5738 38.3928 21.9578C37.2468 25.5578 37.0331 29.2444 37.1708 32.9797C37.3182 36.9769 36.7833 40.8466 35.0855 44.5193C33.3652 48.2405 30.0888 51.3475 26.182 52.6962C28.212 49.3316 29.2783 45.8217 28.7413 42.1532C28.2425 38.7454 27.2664 35.3925 26.2958 32.0753C25.842 30.5241 24.5834 30.1039 23.2546 30.9443C9.04619 39.9307 -0.52195 52.0183 0.0220642 69.5821C0.535667 86.1638 7.70859 99.5097 22.1357 108.414C26.3618 111.023 30.9934 112.707 35.8541 113.728C36.3306 113.828 36.9373 113.878 37.3408 113.671C43.3211 110.613 48.9977 107.122 53.2399 101.754C59.4655 93.8776 60.3273 85.1124 57.4365 75.7513C55.8506 70.6158 52.6755 64.271 50.2509 61.4661C45.011 66.1205 41.9188 71.8943 40.9881 78.8328C40.0866 85.5532 41.1643 92.0204 43.4817 98.3304C43.6402 98.7618 43.9544 99.3063 43.8164 99.642C43.4984 100.415 43.1048 101.389 42.4517 101.737C41.5084 102.239 40.4238 101.782 40.0372 100.692C35.7529 88.6178 34.6761 76.6002 41.7691 65.1738C43.6868 62.0845 46.6369 59.6175 49.2206 56.9696C50.2157 55.9497 51.5138 56.0414 52.3986 57.2404C59.2132 66.4756 64.0426 76.4858 62.9708 88.3147C62.1872 96.9636 58.0744 104.081 51.3622 109.602C49.0994 111.463 46.6254 113.067 43.803 115.111C46.3484 115.111 48.4617 115.177 50.5697 115.099C60.3419 114.738 69.6561 112.651 78.1174 107.53C88.5042 101.243 94.6861 91.9386 97.1161 80.1872C100.373 64.4372 96.5711 50.3813 86.2618 38.092C81.3234 32.2051 76.0331 26.6849 69.774 22.1212C65.6216 19.0936 64.2375 14.0334 66.0018 9.19611C66.7099 7.2546 67.9111 5.49808 68.745 3.59479C69.0873 2.81352 69.4482 1.60023 69.087 1.06455C68.6552 0.424109 67.3814 -0.120538 66.608 0.0232485C63.3182 0.634838 60.0786 1.51645 56.693 2.34378Z" fill="white" />
    </svg>
  );
};

function BannerCta({ addlink, ctaLabel, className }: CtaProps) {
  if (addlink) {
    return (
      <a className={className} href={addlink}>
        {ctaLabel}
      </a>
    );
  }
  return (
    <button className={className} type="button" disabled>
      {ctaLabel}
    </button>
  );
}

export default function TrendingDealCard({ 
  title, 
  subtitle, 
  addlink, 
  image, 
}: Props) {
  // Only render if core content is available
  if (!title || !image || !addlink) {
    return null;
  }

  const hasUrl = isValidHref(addlink);
  const ctaLabel = "FIND YOUR PERFECT DEAL";
 
  // Render the banner
  return (
    <div className="relative mx-auto w-full max-w-[1280px] overflow-hidden rounded-[14px] bg-[#37a7a2] md:bg-transparent shadow-[0_16px_40px_rgba(18,59,67,0.12)] md:min-h-[198px] rounded-[8px] lg:min-h-[218px]">
      <img
        src={image}
        alt={title || "Deal Banner"}
        className="absolute inset-0 hidden h-full w-full object-cover object-[center_30%] md:block"
      />
      {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_40%)] md:hidden" /> */}
 
      <div className="relative z-[1] md:hidden">
        <div className="flex items-center gap-3 px-4 py-4 text-white">
          <div className="h-[50px] w-[50px] flex-none text-white" aria-hidden="true">
            <FlameIcon className="h-full w-full" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[10px] font-normal uppercase tracking-[2px] text-white/85">{subtitle}</p>
            <h2 className="mt-1 text-[16px] font-medium leading-[1.05] text-white">{title}</h2>
            <BannerCta
              addlink={addlink}
              ctaLabel={ctaLabel}
              className={`mt-3 inline-flex w-fit items-center rounded-[6px] bg-pml-primary px-[18px] py-[10px] text-[13px] font-medium uppercase leading-none tracking-[0.8px] text-white transition duration-150 ease-in-out ${addlink ? "no-underline hover:-translate-y-px hover:brightness-[1.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2" : "cursor-not-allowed opacity-60"}`}
            />
          </div>
        </div>
      </div>
 
      <div className="relative z-[1] hidden min-h-[198px] items-center gap-4 px-6 py-6 text-white md:flex lg:min-h-[218px] lg:gap-6 lg:px-[68px] lg:py-[28px]">
        <div className="h-[74px] w-[74px] flex-none text-white lg:h-[96px] lg:w-[96px]" aria-hidden="true">
          <FlameIcon className="h-full w-full" />
        </div>
        <div className="max-w-[560px] lg:max-w-[600px]">
          <p className="m-0 text-[12px] font-semibold uppercase tracking-[2.6px] text-white/82 lg:text-[13px] lg:tracking-[2.8px]">{subtitle}</p>
          <h2 className="mt-1 text-[24px] font-bold leading-[1.05] text-white lg:text-[28px] xl:text-[32px]">{title}</h2>
          <BannerCta
            addlink={addlink}
            ctaLabel={ctaLabel}
            className={`mt-4 inline-flex w-fit items-center rounded-[10px] bg-pml-primary px-[20px] py-[12px] text-[14px] font-semibold text-white transition duration-150 ease-in-out lg:px-[26px] lg:py-[13px] lg:text-[16px] ${addlink ? "no-underline hover:-translate-y-px hover:brightness-[1.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2" : "cursor-not-allowed opacity-60"}`}
          />
        </div>
      </div>
    </div>
  );
}