"use client";

import { useMemo, useState } from "react";
import {
  X,
  Share2,
  Check,
} from "lucide-react";
import { usePathname } from "next/navigation";

interface ShareOfferProps {
  className?: string;
  variant?: "button" | "headerRow" | "icon";
}

export default function ShareOffer({
  className = "",
  variant = "button",
}: ShareOfferProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  const pageUrl = useMemo(() => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) return `${siteUrl}${pathname}`;
    if (typeof window !== "undefined") return `${window.location.origin}${pathname}`;
    return pathname;
  }, [pathname]);

  const shareText = useMemo(() => `Check this offer: ${pageUrl}`, [pageUrl]);

  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);

  const emailHref = useMemo(() => {
    const subject = encodeURIComponent("Check out this offer");
    const body = encodeURIComponent(`${shareText}`);
    return `mailto:?subject=${subject}&body=${body}`;
  }, [shareText]);

  const whatsappHref = useMemo(() => {
    const text = encodeURIComponent(shareText);
    return `https://wa.me/?text=${text}`;
  }, [shareText]);

  const facebookHref = useMemo(() => {
    const u = encodeURIComponent(pageUrl);
    return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
  }, [pageUrl]);

  const messengerHref = useMemo(() => {
    const link = encodeURIComponent(pageUrl);
    return isMobile ? `fb-messenger://share/?link=${link}` : facebookHref;
  }, [facebookHref, isMobile, pageUrl]);

  const twitterHref = useMemo(() => {
    const url = encodeURIComponent(pageUrl);
    const text = encodeURIComponent("Check this out");
    return `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
  }, [pageUrl]);

  const linkedinHref = useMemo(() => {
    const url = encodeURIComponent(pageUrl);
    return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  }, [pageUrl]);

  const pinterestHref = useMemo(() => {
    const url = encodeURIComponent(pageUrl);
    return `https://pinterest.com/pin/create/button/?url=${url}`;
  }, [pageUrl]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAfterShareClick = () => {
    setOpen(false);
  };

  return (
    <>
      {/* ===== SHARE BUTTON ===== */}
      {variant === "icon" ? (
        <button
          onClick={() => setOpen(true)}
          aria-label="Share this offer"
          className={`${className} inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#FCE7F3] bg-white text-pml-primary shadow-sm transition-all duration-200 hover:bg-[#FFF0F7] active:scale-95`}
        >
          <Share2 className="h-4 w-4" />
        </button>
      ) : variant === "headerRow" ? (
        <div className="flex items-start justify-center md:justify-end">
          <button
            onClick={() => setOpen(true)}
            aria-label="Share this offer"
            className={`${className} shrink-0 flex items-center gap-2 bg-[#9F9F9F] text-white px-[32px] py-[4px] font-bold rounded-full hover:bg-[#8a8a8a] text-[14px] leading-[140%]`}
          >
            <Share2 size={16} />
            Share This Offer
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Share this offer"
          className={`${className} ml-auto flex items-center gap-2 bg-[#9F9F9F] text-white px-[32px] py-[4px] mb-5 font-bold rounded-full hover:bg-[#8a8a8a] text-[14px] leading-[140%]`}
        >
          <Share2 size={16} />
          Share This Offer
        </button>
      )}

      {/* ===== MODAL ===== */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* Modal box */}
          <div className="relative bg-white w-[80%] md:w-[450px]  rounded-md shadow-lg border-4 border-[#595858] p-4 z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-xl text-[#595858]">
                Share via
              </h3>
              <button onClick={() => setOpen(false)} aria-label="Close share dialog">
                <X size={18} className="text-gray-500 hover:text-gray-800" />
              </button>
            </div>

            {/* Share options */}
            <div className="space-y-4 text-sm text-[#595858]">
              <ShareItem
                icon={
                  <svg
                    width="24"
                    height="17"
                    viewBox="0 0 24 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21.8906 0H2.10938C0.948656 0 0 0.944484 0 2.10938V14.7656C0 15.9309 0.949266 16.875 2.10938 16.875H21.8906C23.0513 16.875 24 15.9305 24 14.7656V2.10938C24 0.944203 23.0509 0 21.8906 0ZM21.5667 1.40625C20.8847 2.09048 12.874 10.1273 12.5449 10.4575C12.27 10.7332 11.7301 10.7334 11.4551 10.4575L2.43328 1.40625H21.5667ZM1.40625 14.5071V2.36789L7.45617 8.4375L1.40625 14.5071ZM2.43328 15.4688L8.44894 9.4335L10.4592 11.4503C11.283 12.2768 12.7174 12.2764 13.5409 11.4503L15.5511 9.43355L21.5667 15.4688H2.43328ZM22.5938 14.5071L16.5438 8.4375L22.5938 2.36789V14.5071Z"
                      fill="currentColor"
                    />
                  </svg>
                }
                label="Email"
                href={emailHref}
                onClick={handleAfterShareClick}
              />
              <ShareItem
                icon={
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z"
                      fill="currentColor"
                    />
                  </svg>
                }
                label="Facebook"
                href={facebookHref}
                onClick={handleAfterShareClick}
              />
              <ShareItem
                icon={
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_26_17309)">
                      <path
                        d="M12 0.00233361C5.51529 -0.125529 0.149284 5.01691 0.0012207 11.5012C0.0181409 14.802 1.4797 17.9298 4.00081 20.0603V23.5C4.00081 23.7761 4.22467 24 4.50078 24C4.59448 24 4.68629 23.9736 4.76574 23.924L7.55247 22.1832C8.97227 22.7262 10.4799 23.0032 12 23.0001C18.4848 23.128 23.8508 17.9855 23.9989 11.5012C23.8508 5.01691 18.4848 -0.125529 12 0.00233361Z"
                        fill="currentColor"
                      />
                      <path
                        d="M19.8992 8.20149C19.7505 8.00211 19.4777 7.94244 19.2593 8.06149L14.0598 10.8962L10.8252 8.12247C10.6268 7.95242 10.331 7.96372 10.1462 8.14848L4.14684 14.1479C3.95218 14.3437 3.95312 14.6603 4.14899 14.8549C4.30559 15.0106 4.5457 15.0451 4.73979 14.9398L9.93927 12.1051L13.1769 14.8798C13.3753 15.0499 13.6711 15.0386 13.8559 14.8538L19.8553 8.8544C20.0301 8.67793 20.0488 8.39985 19.8992 8.20149Z"
                        fill="#FAFAFA"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_26_17309">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                }
                label="Messenger"
                href={messengerHref}
                target={isMobile ? "_self" : "_blank"}
                onClick={handleAfterShareClick}
              />
              <ShareItem
                icon={
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_26_17314)">
                      <path
                        d="M17.507 14.3069L17.498 14.3819C15.299 13.2859 15.069 13.1399 14.785 13.5659C14.588 13.8609 14.014 14.5299 13.841 14.7279C13.666 14.9229 13.492 14.9379 13.195 14.8029C12.895 14.6529 11.932 14.3379 10.792 13.3179C9.90402 12.5229 9.30802 11.5479 9.13202 11.2479C8.83902 10.7419 9.45202 10.6699 10.01 9.61393C10.11 9.40393 10.059 9.23893 9.98502 9.08993C9.91002 8.93993 9.31302 7.46993 9.06302 6.88393C8.82302 6.29993 8.57602 6.37393 8.39102 6.37393C7.81502 6.32393 7.39402 6.33193 7.02302 6.71793C5.40902 8.49193 5.81602 10.3219 7.19702 12.2679C9.91102 15.8199 11.357 16.4739 14.001 17.3819C14.715 17.6089 15.366 17.5769 15.881 17.5029C16.455 17.4119 17.648 16.7819 17.897 16.0769C18.152 15.3719 18.152 14.7869 18.077 14.6519C18.003 14.5169 17.807 14.4419 17.507 14.3069Z"
                        fill="currentColor"
                      />
                      <path
                        d="M20.52 3.44919C12.831 -3.98381 0.106 1.40719 0.101 11.8932C0.101 13.9892 0.65 16.0332 1.696 17.8382L0 24.0002L6.335 22.3482C14.24 26.6182 23.996 20.9482 24 11.8992C24 8.72319 22.76 5.73419 20.505 3.48819L20.52 3.44919ZM22.002 11.8662C21.996 19.4992 13.617 24.2662 6.99 20.3702L6.63 20.1562L2.88 21.1312L3.885 17.4862L3.646 17.1112C-0.478 10.5462 4.26 1.96619 12.072 1.96619C14.726 1.96619 17.217 3.00119 19.093 4.87619C20.968 6.73519 22.002 9.22619 22.002 11.8662Z"
                        fill="currentColor"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_26_17314">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                }
                label="Whatsapp"
                href={whatsappHref}
                onClick={handleAfterShareClick}
              />
              <ShareItem
                icon={
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M24 19.1269C24 21.8071 21.8071 24 19.1269 24H4.8731C2.19287 24 0 21.8071 0 19.1269V4.8731C0 2.19292 2.19287 0 4.8731 0H19.1269C21.8071 0 24 2.19292 24 4.8731V19.1269Z"
                      fill="currentColor"
                    />
                    <path
                      d="M13.7961 10.8035L19.5691 3.60815H17.897L12.9603 9.76154L8.02304 3.60815H2.51086L10.2039 13.1967L4.43034 20.3925H6.10252L11.0397 14.2386L15.9775 20.3925H21.4896L13.7961 10.8035ZM5.22913 4.91245H7.39695L18.7709 19.0881H16.603L5.22913 4.91245Z"
                      fill="#F0F0F1"
                    />
                  </svg>
                }
                label="Twitter"
                href={twitterHref}
                onClick={handleAfterShareClick}
              />
              <ShareItem
                icon={
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_26_17325)">
                      <path
                        d="M22.2234 0H1.77187C0.792187 0 0 0.773438 0 1.72969V22.2656C0 23.2219 0.792187 24 1.77187 24H22.2234C23.2031 24 24 23.2219 24 22.2703V1.72969C24 0.773438 23.2031 0 22.2234 0ZM7.12031 20.4516H3.55781V8.99531H7.12031V20.4516ZM5.33906 7.43438C4.19531 7.43438 3.27188 6.51094 3.27188 5.37187C3.27188 4.23281 4.19531 3.30937 5.33906 3.30937C6.47813 3.30937 7.40156 4.23281 7.40156 5.37187C7.40156 6.50625 6.47813 7.43438 5.33906 7.43438ZM20.4516 20.4516H16.8937V14.8828C16.8937 13.5562 16.8703 11.8453 15.0422 11.8453C13.1906 11.8453 12.9094 13.2937 12.9094 14.7891V20.4516H9.35625V8.99531H12.7687V10.5609H12.8156C13.2891 9.66094 14.4516 8.70938 16.1813 8.70938C19.7859 8.70938 20.4516 11.0813 20.4516 14.1656V20.4516Z"
                        fill="currentColor"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_26_17325">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                }
                label="LinkedIn"
                href={linkedinHref}
                onClick={handleAfterShareClick}
              />
              <ShareItem
                icon={
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_26_17330)">
                      <path
                        d="M11.9999 23.9998C18.6272 23.9998 23.9997 18.6273 23.9997 12C23.9997 5.37273 18.6272 0.000244141 11.9999 0.000244141C5.37261 0.000244141 0.00012207 5.37273 0.00012207 12C0.00012207 18.6273 5.37261 23.9998 11.9999 23.9998Z"
                        fill="currentColor"
                      />
                      <path
                        d="M12.9686 16.0691C12.0614 15.9989 11.6802 15.5491 10.9688 15.1172C10.5778 17.1688 10.0999 19.1355 8.68447 20.1629C8.24703 17.0621 9.32577 14.733 9.82674 12.2609C8.97282 10.8234 9.92942 7.93012 11.7305 8.64308C13.9472 9.51967 9.81134 13.988 12.5879 14.5461C15.4865 15.1288 16.6699 9.51646 14.8722 7.69097C12.2749 5.05542 7.31204 7.63108 7.92232 11.404C8.07099 12.3263 9.02416 12.6064 8.30308 13.8791C6.6408 13.511 6.14496 12.1999 6.20871 10.4521C6.3116 7.59108 8.77945 5.58783 11.2548 5.31061C14.3853 4.96023 17.3236 6.46015 17.7291 9.4048C18.1854 12.7283 16.3158 16.3275 12.9686 16.0691Z"
                        fill="#F1F2F2"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_26_17330">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                }
                label="Pinterest"
                href={pinterestHref}
                onClick={handleAfterShareClick}
              />

              {/* Copy link */}
              <button
                onClick={handleCopy}
                className="flex items-center text-lg gap-2 w-full hover:text-[#cb2187]"
              >
                {copied ? (
                  <>
                    <Check /> Copied!
                  </>
                ) : (
                  <>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_26_17337)">
                        <path
                          d="M9.94969 18.2927L7.12165 21.1207C5.94921 22.2932 4.05053 22.2932 2.87907 21.121C1.70737 19.9493 1.70737 18.0504 2.87883 16.8789L8.53588 11.2219C9.70734 10.0504 11.6062 10.0504 12.7777 11.2219C13.1682 11.6124 13.8014 11.6124 14.1919 11.2219C14.5824 10.8314 14.5824 10.1982 14.1919 9.80767C12.2394 7.85513 9.0742 7.85513 7.12165 9.80767L1.46465 15.4647C-0.487892 17.4172 -0.487892 20.5824 1.46465 22.5349C3.41696 24.4885 6.58235 24.4885 8.53593 22.5349L11.364 19.7069C11.7545 19.3164 11.7545 18.6832 11.364 18.2927C10.9734 17.9021 10.3402 17.9022 9.94969 18.2927Z"
                          fill="currentColor"
                        />
                        <path
                          d="M22.5352 1.46441C20.5827 -0.488136 17.4165 -0.488136 15.464 1.46441L12.0709 4.85743C11.6804 5.24794 11.6804 5.88114 12.0709 6.27165C12.4615 6.66217 13.0947 6.66217 13.4852 6.27165L16.8782 2.87863C18.0497 1.70713 19.9495 1.70713 21.121 2.87863C22.2925 4.05009 22.2925 5.94896 21.121 7.12042L14.899 13.3425C13.7275 14.514 11.8286 14.514 10.6572 13.3425C10.2667 12.952 9.63348 12.952 9.24296 13.3425C8.85244 13.733 8.85244 14.3662 9.24296 14.7567C11.1955 16.7093 14.3607 16.7093 16.3132 14.7567L22.5352 8.5347C24.4878 6.58216 24.4878 3.41695 22.5352 1.46441Z"
                          fill="currentColor"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_26_17337">
                          <rect width="24" height="24" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                    Copy link to clipboard
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ===== Helper Item ===== */

function ShareItem({
  icon,
  label,
  href,
  target = "_blank",
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  target?: "_blank" | "_self";
  onClick?: () => void;
}) {
  const className = "flex text-base md:text-lg items-center gap-2 w-full hover:text-[#cb2187]";

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        onClick={onClick}
        className={className}
      >
        {icon}
        {label}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {icon}
      {label}
    </button>
  );
}
