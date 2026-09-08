"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { useActiveRouteWhatsAppContextLine } from "@/components/multi-centre/RouteWhatsAppContext";
import { useUtmPhone } from "@/components/utm/UtmPhoneProvider";
import { buildEnquirySource } from "@/lib/source-builder";
import { openTawkChat } from "@/lib/tawk";
import { attachCurrentPageToWhatsAppHref, getWhatsAppUrl } from "@/lib/utils";

export default function McCtaButtons() {
  const pathname = usePathname();
  const { phoneDisplay, phoneTel } = useUtmPhone();
  const whatsappSource = buildEnquirySource({ section: "multi-centre", pathname });
  const whatsappContextLine = useActiveRouteWhatsAppContextLine(pathname);

  const handleOpenChat = () => {
    openTawkChat();
  };

  return (
    <>
      <div className="w-full rounded-[16px] border border-[#EDEDED] bg-white p-4">
        <div className="flex flex-row items-start gap-3">
          <Image
            src="/assets/images/contact.png"
            width={80}
            height={80}
            alt="Contact support"
            className="w-[80px] h-[80px] object-cover flex-none rounded-lg"
            loading="lazy"
          />

          <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
            <div className="text-[#595858] font-semibold text-[14px] leading-[140%]">
              Our team are available 24 hours, 7 days
            </div>
            <div className="text-[#595858] font-normal text-[12px] leading-[140%]">
              Hurry this deal has limited availability - call our helpful team now
            </div>
            <div className="hidden md:flex flex-row items-center gap-2 text-[#595858]">
              <a
                href={`tel:${phoneTel}`}
                data-testid="mc-cta-call"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 text-[12px] font-semibold leading-[140%] bg-pml-primary text-white border border-pml-primary transition-colors duration-200 hover:bg-pml-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pml-primary focus-visible:ring-offset-2"
                aria-label={`Call ${phoneDisplay}`}
              >
                <Phone className="h-3.5 w-3.5" />
                <span>{phoneDisplay}</span>
              </a>

              <button
                type="button"
                onClick={handleOpenChat}
                data-testid="mc-cta-chat"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 text-[12px] font-semibold leading-[140%] bg-white text-pml-primary border border-pml-primary transition-colors duration-200 hover:bg-pml-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pml-primary focus-visible:ring-offset-2"
                aria-label="Open chat"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 23 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.25 21C5.13975 21 5.02875 20.9753 4.9245 20.9257C4.66575 20.8005 4.5 20.5387 4.5 20.25V16.5H2.25C1.0095 16.5 0 15.4905 0 14.25V2.25C0 1.0095 1.0095 0 2.25 0H20.25C21.4905 0 22.5 1.0095 22.5 2.25V14.25C22.5 15.4905 21.4905 16.5 20.25 16.5H11.1383L5.71875 20.8358C5.583 20.9445 5.41725 21 5.25 21ZM2.25 1.5C1.836 1.5 1.5 1.83675 1.5 2.25V14.25C1.5 14.6632 1.836 15 2.25 15H5.25C5.66475 15 6 15.3352 6 15.75V18.69L10.4062 15.1642C10.5398 15.0577 10.704 15 10.875 15H20.25C20.664 15 21 14.6632 21 14.25V2.25C21 1.83675 20.664 1.5 20.25 1.5H2.25Z"
                    fill="#CB2187"
                  />
                  <path
                    d="M17.25 7.5H5.25C4.83525 7.5 4.5 7.164 4.5 6.75C4.5 6.336 4.83525 6 5.25 6H17.25C17.6648 6 18 6.336 18 6.75C18 7.164 17.6648 7.5 17.25 7.5Z"
                    fill="#CB2187"
                  />
                  <path
                    d="M11.25 10.5H5.25C4.83525 10.5 4.5 10.164 4.5 9.75C4.5 9.336 4.83525 9 5.25 9H11.25C11.6648 9 12 9.336 12 9.75C12 10.164 11.6648 10.5 11.25 10.5Z"
                    fill="#CB2187"
                  />
                </svg>
                chat online
              </button>

              <a
                href={getWhatsAppUrl({
                  source: whatsappSource,
                  contextLine: whatsappContextLine,
                })}
                onClick={(event) =>
                  attachCurrentPageToWhatsAppHref(event, {
                    source: whatsappSource,
                    contextLine: whatsappContextLine,
                  })
                }
                target="_blank"
                rel="noopener noreferrer"
                data-testid="mc-cta-whatsapp"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 text-[12px] font-semibold leading-[140%] bg-pml-whatsapp text-white border border-pml-whatsapp transition-colors duration-200 hover:bg-pml-whatsapp/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pml-whatsapp focus-visible:ring-offset-2"
                aria-label="Send a WhatsApp message"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5 fill-current"
                  aria-hidden="true"
                >
                  <path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c7.905 4.27 17.661-1.4 17.665-10.449 0-3.176-1.24-6.165-3.495-8.402ZM22.002 11.866c-.006 7.633-8.385 12.4-15.012 8.504l-.36-.214-3.75.975 1.005-3.645-.239-.375C-.478 10.546 4.26 1.966 12.072 1.966c2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99Z" />
                  <path d="M17.507 14.307c-2.199-1.096-2.429-1.242-2.713-.816-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.293-.506.32-.578.878-1.634.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.576-.05-.997-.042-1.368.344-1.614 1.774-1.207 3.604.174 5.55 2.714 3.552 4.16 4.206 6.804 5.114.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345Z" />
                </svg>
                whatsapp
              </a>
            </div>
          </div>
        </div>
        <div className="block md:hidden flex flex-col sm:flex-row sm:flex-nowrap items-stretch sm:items-center gap-2 mt-4 text-[#595858]">
          <a
            href={`tel:${phoneTel}`}
            data-testid="mc-cta-call"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 text-[12px] font-semibold leading-[140%] bg-pml-primary text-white border border-pml-primary transition-colors duration-200 hover:bg-pml-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pml-primary focus-visible:ring-offset-2"
            aria-label={`Call ${phoneDisplay}`}
          >
            <Phone className="h-3.5 w-3.5" />
            <span>{phoneDisplay}</span>
          </a>

          <button
            type="button"
            onClick={handleOpenChat}
            data-testid="mc-cta-chat"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 text-[12px] font-semibold leading-[140%] bg-white text-pml-primary border border-pml-primary transition-colors duration-200 hover:bg-pml-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pml-primary focus-visible:ring-offset-2"
            aria-label="Open chat"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 23 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.25 21C5.13975 21 5.02875 20.9753 4.9245 20.9257C4.66575 20.8005 4.5 20.5387 4.5 20.25V16.5H2.25C1.0095 16.5 0 15.4905 0 14.25V2.25C0 1.0095 1.0095 0 2.25 0H20.25C21.4905 0 22.5 1.0095 22.5 2.25V14.25C22.5 15.4905 21.4905 16.5 20.25 16.5H11.1383L5.71875 20.8358C5.583 20.9445 5.41725 21 5.25 21ZM2.25 1.5C1.836 1.5 1.5 1.83675 1.5 2.25V14.25C1.5 14.6632 1.836 15 2.25 15H5.25C5.66475 15 6 15.3352 6 15.75V18.69L10.4062 15.1642C10.5398 15.0577 10.704 15 10.875 15H20.25C20.664 15 21 14.6632 21 14.25V2.25C21 1.83675 20.664 1.5 20.25 1.5H2.25Z"
                fill="#CB2187"
              />
              <path
                d="M17.25 7.5H5.25C4.83525 7.5 4.5 7.164 4.5 6.75C4.5 6.336 4.83525 6 5.25 6H17.25C17.6648 6 18 6.336 18 6.75C18 7.164 17.6648 7.5 17.25 7.5Z"
                fill="#CB2187"
              />
              <path
                d="M11.25 10.5H5.25C4.83525 10.5 4.5 10.164 4.5 9.75C4.5 9.336 4.83525 9 5.25 9H11.25C11.6648 9 12 9.336 12 9.75C12 10.164 11.6648 10.5 11.25 10.5Z"
                fill="#CB2187"
              />
            </svg>
            chat online
          </button>

          <a
            href={getWhatsAppUrl({
              source: whatsappSource,
              contextLine: whatsappContextLine,
            })}
            onClick={(event) =>
              attachCurrentPageToWhatsAppHref(event, {
                source: whatsappSource,
                contextLine: whatsappContextLine,
              })
            }
            target="_blank"
            rel="noopener noreferrer"
            data-testid="mc-cta-whatsapp"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 text-[12px] font-semibold leading-[140%] bg-pml-whatsapp text-white border border-pml-whatsapp transition-colors duration-200 hover:bg-pml-whatsapp/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pml-whatsapp focus-visible:ring-offset-2"
            aria-label="Send a WhatsApp message"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 fill-current"
              aria-hidden="true"
            >
              <path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c7.905 4.27 17.661-1.4 17.665-10.449 0-3.176-1.24-6.165-3.495-8.402ZM22.002 11.866c-.006 7.633-8.385 12.4-15.012 8.504l-.36-.214-3.75.975 1.005-3.645-.239-.375C-.478 10.546 4.26 1.966 12.072 1.966c2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99Z" />
              <path d="M17.507 14.307c-2.199-1.096-2.429-1.242-2.713-.816-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.293-.506.32-.578.878-1.634.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.576-.05-.997-.042-1.368.344-1.614 1.774-1.207 3.604.174 5.55 2.714 3.552 4.16 4.206 6.804 5.114.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345Z" />
            </svg>
            whatsapp
          </a>
        </div>
      </div>
    </>
  );
}