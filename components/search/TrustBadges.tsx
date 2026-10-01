import Image from "next/image";
import LiveOffersTicker from "./LiveOffersTicker";

const chipClass =
  "group inline-flex shrink-0 items-center gap-0.5 rounded-full border border-gray-200/90 bg-white py-0.5 pl-0.5 pr-1 shadow-[0_1px_2px_rgba(0,0,0,0.03)] no-underline transition-all duration-200 hover:border-[#CB2187]/40 hover:shadow-sm min-[420px]:gap-1.5 min-[420px]:py-1 min-[420px]:pl-1 min-[420px]:pr-2.5 min-[480px]:gap-2 min-[480px]:pr-3";

function TrustpilotStar() {
  return (
    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#00B67A] min-[360px]:h-4 min-[360px]:w-4 min-[420px]:h-[18px] min-[420px]:w-[18px] min-[480px]:h-5 min-[480px]:w-5">
      <svg viewBox="0 0 24 24" className="h-2 w-2 min-[360px]:h-2.5 min-[360px]:w-2.5 min-[480px]:h-3 min-[480px]:w-3" aria-hidden="true">
        <path
          fill="#fff"
          d="M12 2.5l2.94 6.26 6.86.78-5.1 4.68 1.4 6.78L12 17.6l-6.1 3.4 1.4-6.78-5.1-4.68 6.86-.78z"
        />
      </svg>
    </span>
  );
}

function Label({ title }: { title: string }) {
  return (
    <span className="whitespace-nowrap text-[9px] font-semibold leading-none text-[#4c4c4c] group-hover:text-[#CB2187] min-[360px]:text-[10px] min-[420px]:text-[11px]">
      {title}
    </span>
  );
}

export default function TrustBadges() {
  return (
    <div className="mx-1 mt-2 flex flex-col gap-2 border-t border-gray-100 pt-2 font-['Montserrat'] sm:mx-2 md:flex-row md:items-center md:justify-between md:gap-4">
      <LiveOffersTicker />
      <div className="-mx-1 flex w-[calc(100%+8px)] min-w-0 flex-nowrap items-center justify-center gap-0.5 overflow-x-auto [scrollbar-width:none] min-[360px]:gap-1 min-[420px]:gap-1.5 min-[480px]:gap-2 sm:mx-0 sm:w-full md:ml-auto md:w-auto md:shrink-0 md:justify-end md:overflow-visible [&::-webkit-scrollbar]:hidden">
        <a
          href="https://www.trustpilot.com/review/planmytour.co.uk"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Read our reviews on Trustpilot"
          className={chipClass}
        >
          <TrustpilotStar />
          <Label title="Trustpilot" />
        </a>

        <a
          href="https://www.caa.co.uk/atol-protection/check-an-atol/search-atol-holders/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Check ATOL protection T7655"
          className={chipClass}
        >
          <Image
            src="https://planmylux.s3.eu-west-2.amazonaws.com/ATOL-3.webp"
            alt="ATOL protected"
            width={20}
            height={20}
            className="h-3.5 w-3.5 shrink-0 object-contain min-[360px]:h-4 min-[360px]:w-4 min-[420px]:h-[18px] min-[420px]:w-[18px] min-[480px]:h-5 min-[480px]:w-5"
          />
          <Label title="ATOL Protected" />
        </a>

        <a
          href="https://thetravelnetworkgroup.co.uk/verify-a-member/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Verify Travel Trust Association member Q6399"
          className={chipClass}
        >
          <Image
            src="https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/homepage/TTA.webp"
            alt="Travel Trust Association"
            width={38}
            height={20}
            className="h-3.5 w-auto shrink-0 object-contain min-[360px]:h-4 min-[420px]:h-[18px] min-[480px]:h-5"
          />
          <Label title="TTA Member" />
        </a>
      </div>
    </div>
  );
}
