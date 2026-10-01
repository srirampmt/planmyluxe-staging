import Image from "next/image";
import LiveOffersTicker from "./LiveOffersTicker";

const chipClass =
  "group inline-flex items-center gap-2 rounded-full border border-gray-200/90 bg-white py-1 pl-1 pr-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] no-underline transition-all duration-200 hover:border-[#CB2187]/40 hover:shadow-sm";

function TrustpilotStar() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00B67A]">
      <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden="true">
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
    <span className="whitespace-nowrap text-[11px] font-semibold text-[#4c4c4c] group-hover:text-[#CB2187]">
      {title}
    </span>
  );
}

export default function TrustBadges() {
  return (
    <div className="mx-1 mt-2 flex flex-col gap-2 border-t border-gray-100 pt-2 font-['Montserrat'] sm:mx-2 md:flex-row md:items-center md:justify-between md:gap-4">
      <LiveOffersTicker />
      <div className="flex flex-wrap items-center justify-center gap-2 md:ml-auto md:shrink-0 md:justify-end">
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
            className="h-5 w-5 shrink-0 object-contain"
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
            className="h-5 w-auto shrink-0 object-contain"
          />
          <Label title="TTA Member" />
        </a>
      </div>
    </div>
  );
}
