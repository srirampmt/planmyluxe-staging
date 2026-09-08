import Link from "next/link";

export default function contactandtrending() {
  return (
    <>
      <Link
        href="https://planmyluxe.co.uk/trending-multi-centres"
        className="bg-pml-primary relative w-full overflow-hidden rounded-[16px] p-[24px] sm:p-[28px] md:p-[32px] lg:p-[36px] h-[200px] md:h-[220px] flex flex-col justify-center items-center text-center"
      >
        <img
          src="https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/homepage/top-trending.png"
          alt="Big Pink Banner"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="relative z-10 mt-8">
          <span className="text-white text-[10px] sm:text-[11px] md:text-[12px] font-semibold tracking-[1.5px] leading-[1%] uppercase mb-[4px] sm:mb-[6px] md:mb-[8px] block">
            NOW ON
          </span>
          <h3 className="text-white text-[18px] sm:text-[22px] md:text-[24px] lg:text-[24px] font-bold leading-[1.2] mb-[6px] sm:mb-[7px] md:mb-[8px] lg:mb-[10px]">
            Trending Multi-Centres
          </h3>
          <span className="inline-block bg-[#f5d742] text-[#1a1a1a] text-[8px] sm:text-[10px] md:text-[14px] font-bold px-[14px] sm:px-[16px] md:px-[18px] lg:px-[20px] py-[6px] sm:py-[6px] md:py-[6px] lg:py-[6px] rounded-full">
            Click Here
          </span>
        </div>
      </Link>
    </>
  );
}


