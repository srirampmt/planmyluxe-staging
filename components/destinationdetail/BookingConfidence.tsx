"use client";

import Image from "next/image";
import { Headphones, Phone, ShieldCheck } from "lucide-react";
import { ChatIcon, WhatsAppIcon } from "@/app/hotels/[slug]/components/icons";
import TrustpilotWidget from "@/components/TrustpilotWidget";
import { useUtmPhone } from "@/components/utm/UtmPhoneProvider";
import { openTawkChat } from "@/lib/tawk";
import {
  attachCurrentPageToWhatsAppHref,
  getWhatsAppUrl,
} from "@/lib/utils";

const CONTACT_BUTTON =
  "inline-flex h-10 items-center justify-center gap-1 whitespace-nowrap rounded-[8px] px-1 text-[11.5px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:gap-1.5 sm:px-4 sm:text-[13px]";

export default function BookingConfidence({
  destinationName,
  source = `${destinationName} destination page`,
}: {
  destinationName: string;
  source?: string;
}) {
  const { phoneDisplay, phoneTel } = useUtmPhone();

  return (
    <section className="w-full bg-[#F9FAFB] font-['Montserrat'] py-6 md:py-8">
      <div className="mx-auto w-full max-w-[1440px] px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
        <div className="mx-auto grid w-full max-w-[1280px] gap-5 rounded-[8px] border border-gray-200/80 bg-white p-5 sm:p-6 lg:grid-cols-12 lg:p-8">
          <div className="flex h-full flex-col lg:col-span-7">
            <div>
              <div className="flex items-center gap-2 text-[#CB2187]">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                  Trusted &amp; protected
                </span>
              </div>
              <h2 className="mt-3 text-[24px] font-semibold leading-tight text-[#1a1a1a] md:text-[32px]">
                Book {destinationName} with confidence
              </h2>
              <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#5C6370] md:text-[15px]">
                Flight-inclusive packages are ATOL protected, with additional
                financial protection through our Travel Trust Association
                membership.
              </p>
            </div>
            <div className="mt-4 grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              <a
                href="https://thetravelnetworkgroup.co.uk/verify-a-member/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Verify Travel Trust Association member Q6399"
                className="flex min-h-[72px] items-center justify-center gap-2 rounded-[8px] border border-gray-200 px-2 py-3 transition-colors hover:border-[#CB2187] sm:gap-3 sm:px-3"
              >
                <Image
                  src="https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/homepage/TTA.webp"
                  alt="Travel Trust Association"
                  width={120}
                  height={64}
                  className="h-8 w-auto object-contain sm:h-10"
                />
                <span className="text-[11px] leading-4 text-[#4B5563]">
                  Member
                  <strong className="block text-[13px] text-[#1a1a1a]">
                    Q6399
                  </strong>
                </span>
              </a>
              <a
                href="https://www.caa.co.uk/atol-protection/check-an-atol/search-atol-holders/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Check ATOL protection T7655"
                className="flex min-h-[72px] items-center justify-center gap-2 rounded-[8px] border border-gray-200 px-2 py-3 transition-colors hover:border-[#CB2187] sm:gap-3 sm:px-3"
              >
                <Image
                  src="https://planmylux.s3.eu-west-2.amazonaws.com/ATOL-3.webp"
                  alt="ATOL protected"
                  width={64}
                  height={64}
                  className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                />
                <span className="text-[11px] leading-4 text-[#4B5563]">
                  ATOL
                  <strong className="block text-[13px] text-[#1a1a1a]">
                    T7655
                  </strong>
                </span>
              </a>
              <div className="col-span-2 flex min-h-[72px] items-center justify-center overflow-hidden rounded-[8px] border border-gray-200 px-2 py-2 transition-colors hover:border-[#CB2187] sm:col-span-1">
                <TrustpilotWidget embedded />
              </div>
            </div>
          </div>

          <div className="flex h-full flex-col justify-center rounded-[8px] bg-[#F9FAFB] p-4 sm:p-5 lg:col-span-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#FBE3F1] text-[#CB2187]">
              <Headphones className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-[18px] font-semibold text-[#1a1a1a]">
              Prefer help from a travel expert?
            </h3>
            <p className="mt-1 text-[13px] leading-5 text-[#667085]">
              Talk through dates, resorts and package options with our team.
            </p>
            <div className="mt-4 grid grid-cols-[1fr_auto_1fr] gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
              <a
                href={`tel:${phoneTel}`}
                aria-label={`Call ${phoneDisplay}`}
                className={`${CONTACT_BUTTON} bg-[#CB2187] text-white hover:bg-[#A81970] focus-visible:ring-[#CB2187]`}
              >
                <Phone className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                Call us
              </a>
              <a
                href={getWhatsAppUrl({ source })}
                onClick={(event) =>
                  attachCurrentPageToWhatsAppHref(event, { source })
                }
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Send a WhatsApp message"
                className={`${CONTACT_BUTTON} bg-[#25D366] px-2 text-white hover:bg-[#1DA851] focus-visible:ring-[#25D366]`}
              >
                <WhatsAppIcon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                WhatsApp
              </a>
              <button
                type="button"
                onClick={openTawkChat}
                aria-label="Open chat"
                className={`${CONTACT_BUTTON} border border-[#CB2187] bg-white text-[#CB2187] hover:bg-[#FBE3F1] focus-visible:ring-[#CB2187]`}
              >
                <ChatIcon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                <span className="sm:hidden">Chat</span>
                <span className="hidden sm:inline">Chat online</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
