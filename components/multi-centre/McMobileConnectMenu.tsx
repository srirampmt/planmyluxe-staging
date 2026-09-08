"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUtmPhone } from "@/components/utm/UtmPhoneProvider";
import { useActiveRouteWhatsAppContextLine } from "@/components/multi-centre/RouteWhatsAppContext";
import { buildRouteAwareEnquirySource } from "@/lib/source-builder";
import { openTawkChat } from "@/lib/tawk";
import { attachCurrentPageToWhatsAppHref, getWhatsAppUrl } from "@/lib/utils";

type Props = {
  slug?: string;
  anchor?: "left" | "right";
  globalMode?: boolean;
};


export default function McMobileConnectMenu({ slug, anchor = "right", globalMode = false }: Props) {
  const pathname = usePathname();
  const { phoneDisplay, phoneTel } = useUtmPhone();
  const whatsappSource = buildRouteAwareEnquirySource({
    entityName: slug,
    pathname,
  });
  const whatsappContextLine = useActiveRouteWhatsAppContextLine(pathname);
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);
  const contactMenuRef = useRef<HTMLDivElement | null>(null);

  const closeContactMenu = useCallback(() => {
    setIsContactMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!isContactMenuOpen) return;

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (!contactMenuRef.current?.contains(target)) {
        closeContactMenu();
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeContactMenu();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick, { passive: true });
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isContactMenuOpen, closeContactMenu]);

  const handleToggleContactMenu = useCallback(() => {
    setIsContactMenuOpen((prev) => !prev);
  }, []);

  const handleOpenChatOnline = useCallback(() => {
    closeContactMenu();
    openTawkChat();
  }, [closeContactMenu]);

  const actionButtonClass = "flex w-full items-center justify-end gap-2 rounded-[10px] px-2 py-1 text-pml-primary";
  const isLeftAnchor = anchor === "left";
  const rootPositionClass = globalMode
    ? isLeftAnchor
      ? "fixed bottom-4 left-3 z-[60] flex items-end"
      : "fixed bottom-4 right-3 z-[60] flex items-end"
    : isLeftAnchor
      ? "fixed bottom-4 left-3 z-[60] flex items-end"
      : "absolute right-3 -top-14 z-[60] flex items-end";
  const menuPositionClass = isLeftAnchor
    ? "absolute bottom-10 -left-2 mb-2 w-[220px] p-2"
    : "absolute bottom-10 -right-2 mb-2 w-[220px] p-2";

  const actionIconClass = "inline-flex h-[34px] w-[34px] items-center justify-center rounded-full bg-pml-primary text-white";
  const secondaryActionLabelClass = "text-[16px] font-semibold leading-none";
  const triggerButtonClass = globalMode
    ? "inline-flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded-full bg-pml-primary text-white shadow-lg transition-colors duration-200 hover:bg-pml-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pml-primary focus-visible:ring-offset-2 md:h-[52px] md:w-auto md:min-w-[190px] md:justify-start md:gap-2 md:rounded-[12px] md:px-4 md:shadow-[0_8px_20px_rgba(203,33,135,0.35)]"
    : "inline-flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded-full bg-pml-primary text-white shadow-lg transition-colors duration-200 hover:bg-pml-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pml-primary focus-visible:ring-offset-2";

  return (
    <>
      {isContactMenuOpen ? (
        <button type="button" aria-label="Close connect menu background" onClick={closeContactMenu} className="fixed inset-0 z-[55] bg-[#FBE8F4]/75" />
      ) : null}

      <div ref={contactMenuRef} className={rootPositionClass}>
        <div
          className={`${menuPositionClass} transition-all duration-200 ${isContactMenuOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
            }`}
        >
          <div className="space-y-2">


            <a
              href={getWhatsAppUrl({
                source: whatsappSource,
                contextLine: whatsappContextLine,
              })}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => {
                attachCurrentPageToWhatsAppHref(event, {
                  source: whatsappSource,
                  contextLine: whatsappContextLine,
                });
                closeContactMenu();
              }}
              className={actionButtonClass}
              aria-label="Send a WhatsApp message"
            >
              <span className={secondaryActionLabelClass}>WhatsApp Us</span>
              <span className={actionIconClass}>
                <svg viewBox="0 0 24 24" className="h-[17px] w-[17px] fill-current" aria-hidden="true">
                  <path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c7.905 4.27 17.661-1.4 17.665-10.449 0-3.176-1.24-6.165-3.495-8.402ZM22.002 11.866c-.006 7.633-8.385 12.4-15.012 8.504l-.36-.214-3.75.975 1.005-3.645-.239-.375C-.478 10.546 4.26 1.966 12.072 1.966c2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99Z" />
                  <path d="M17.507 14.307c-2.199-1.096-2.429-1.242-2.713-.816-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.293-.506.32-.578.878-1.634.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.576-.05-.997-.042-1.368.344-1.614 1.774-1.207 3.604.174 5.55 2.714 3.552 4.16 4.206 6.804 5.114.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345Z" />
                </svg>
              </span>
            </a>

            <a
              href={`tel:${phoneTel}`}
              onClick={closeContactMenu}
              className={actionButtonClass}
              aria-label={`Call ${phoneDisplay}`}
            >
              <span className={secondaryActionLabelClass}>Call Us</span>
              <span className={actionIconClass}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M22 16.92V19.92C22 20.47 21.78 20.99 21.39 21.38C21 21.77 20.48 21.99 19.93 21.99C16.2 21.59 12.61 19.88 9.82 17.08C7.02 14.29 5.31 10.7 4.91 6.97C4.91 6.42 5.13 5.9 5.52 5.51C5.91 5.12 6.43 4.9 6.98 4.9H9.98C10.46 4.9 10.88 5.24 10.97 5.71C11.13 6.6 11.4 7.46 11.78 8.28C11.95 8.66 11.87 9.1 11.58 9.39L10.31 10.66C11.72 13.14 13.76 15.18 16.24 16.59L17.51 15.32C17.8 15.03 18.24 14.95 18.62 15.12C19.44 15.5 20.3 15.77 21.19 15.93C21.66 16.02 22 16.44 22 16.92Z" fill="currentColor" />
                </svg>
              </span>
            </a>

            <button
              type="button"
              onClick={handleOpenChatOnline}
              className={actionButtonClass}
              aria-label="Open chat online"
            >
              <span className={secondaryActionLabelClass}>Live Chat</span>
              <span className={actionIconClass}>
                <svg width="17" height="17" viewBox="0 0 23 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path
                    d="M5.25 21C5.13975 21 5.02875 20.9753 4.9245 20.9257C4.66575 20.8005 4.5 20.5387 4.5 20.25V16.5H2.25C1.0095 16.5 0 15.4905 0 14.25V2.25C0 1.0095 1.0095 0 2.25 0H20.25C21.4905 0 22.5 1.0095 22.5 2.25V14.25C22.5 15.4905 21.4905 16.5 20.25 16.5H11.1383L5.71875 20.8358C5.583 20.9445 5.41725 21 5.25 21ZM2.25 1.5C1.836 1.5 1.5 1.83675 1.5 2.25V14.25C1.5 14.6632 1.836 15 2.25 15H5.25C5.66475 15 6 15.3352 6 15.75V18.69L10.4062 15.1642C10.5398 15.0577 10.704 15 10.875 15H20.25C20.664 15 21 14.6632 21 14.25V2.25C21 1.83675 20.664 1.5 20.25 1.5H2.25Z"
                    fill="currentColor"
                  />
                  <path
                    d="M17.25 7.5H5.25C4.83525 7.5 4.5 7.164 4.5 6.75C4.5 6.336 4.83525 6 5.25 6H17.25C17.6648 6 18 6.336 18 6.75C18 7.164 17.6648 7.5 17.25 7.5Z"
                    fill="currentColor"
                  />
                  <path
                    d="M11.25 10.5H5.25C4.83525 10.5 4.5 10.164 4.5 9.75C4.5 9.336 4.83525 9 5.25 9H11.25C11.6648 9 12 9.336 12 9.75C12 10.164 11.6648 10.5 11.25 10.5Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleContactMenu}
          data-testid="mc-mobile-call-fab"
          className={triggerButtonClass}
          aria-label={isContactMenuOpen ? "Close connect menu" : "Open connect menu"}
          aria-expanded={isContactMenuOpen}
        >
          {globalMode ? (
            <span className="hidden items-center gap-2 text-[12px] font-bold uppercase tracking-[0.06em] md:inline-flex">
              {!isContactMenuOpen ? (
                <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-[#25D366]" />
              ) : null}
              {isContactMenuOpen ? "Close Chat" : "Speak to Our Travel Expert"}
            </span>
          ) : null}
          {isContactMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 23 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M5.25 21C5.13975 21 5.02875 20.9753 4.9245 20.9257C4.66575 20.8005 4.5 20.5387 4.5 20.25V16.5H2.25C1.0095 16.5 0 15.4905 0 14.25V2.25C0 1.0095 1.0095 0 2.25 0H20.25C21.4905 0 22.5 1.0095 22.5 2.25V14.25C22.5 15.4905 21.4905 16.5 20.25 16.5H11.1383L5.71875 20.8358C5.583 20.9445 5.41725 21 5.25 21ZM2.25 1.5C1.836 1.5 1.5 1.83675 1.5 2.25V14.25C1.5 14.6632 1.836 15 2.25 15H5.25C5.66475 15 6 15.3352 6 15.75V18.69L10.4062 15.1642C10.5398 15.0577 10.704 15 10.875 15H20.25C20.664 15 21 14.6632 21 14.25V2.25C21 1.83675 20.664 1.5 20.25 1.5H2.25Z"
                fill="currentColor"
              />
              <path
                d="M17.25 7.5H5.25C4.83525 7.5 4.5 7.164 4.5 6.75C4.5 6.336 4.83525 6 5.25 6H17.25C17.6648 6 18 6.336 18 6.75C18 7.164 17.6648 7.5 17.25 7.5Z"
                fill="currentColor"
              />
              <path
                d="M11.25 10.5H5.25C4.83525 10.5 4.5 10.164 4.5 9.75C4.5 9.336 4.83525 9 5.25 9H11.25C11.6648 9 12 9.336 12 9.75C12 10.164 11.6648 10.5 11.25 10.5Z"
                fill="currentColor"
              />
            </svg>
          )}
        </button>
        {/* <span className="absolute -bottom-7 right-0 text-[20px] font-semibold leading-none text-[#282777]">Connect</span> */}
      </div>
    </>
  );
}
