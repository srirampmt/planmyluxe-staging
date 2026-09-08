"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const PROMO_MODAL_CACHE_PREFIX = "promo-modal:v1:";
const PROMO_MODAL_TTL_MS = 60 * 60 * 1000;

type PromoModalContent = {
  badgeText: string;
  headlineLines: string[];
  ctaText: string;
  dismissText: string;
  imageUrl?: string;
  imageAlt?: string;
};

type PromoModalConfig = {
  enabled: boolean;
  delayMs: number;
  slugs: string[];
  redirectUrl: string;
  content: PromoModalContent;
};

type PromoModalResponse = {
  items: PromoModalConfig[];
};

type PromoModalCacheEntry = {
  expiresAt: number;
  items: PromoModalConfig[];
};

function getPromoModalCacheKey(pathname: string) {
  return `${PROMO_MODAL_CACHE_PREFIX}${pathname}`;
}

function readPromoModalCache(pathname: string): PromoModalConfig[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const cacheKey = getPromoModalCacheKey(pathname);
    const raw = window.localStorage.getItem(cacheKey);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PromoModalCacheEntry;
    if (!Array.isArray(parsed?.items) || typeof parsed?.expiresAt !== "number") {
      window.localStorage.removeItem(cacheKey);
      return null;
    }

    if (parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(cacheKey);
      return null;
    }

    return parsed.items;
  } catch {
    return null;
  }
}

function writePromoModalCache(pathname: string, items: PromoModalConfig[]) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: PromoModalCacheEntry = {
    expiresAt: Date.now() + PROMO_MODAL_TTL_MS,
    items,
  };

  try {
    window.localStorage.setItem(getPromoModalCacheKey(pathname), JSON.stringify(payload));
  } catch {
    // Ignore storage quota and serialization failures.
  }
}

const PromoModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [configs, setConfigs] = useState<PromoModalConfig[]>([]);
  const pathname = usePathname();
  const currentPathname = pathname || "/";

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const cachedItems = readPromoModalCache(currentPathname);

    setIsOpen(false);

    if (cachedItems) {
      setConfigs(cachedItems);
      return () => {
        isMounted = false;
        controller.abort();
      };
    }

    setConfigs([]);

    const loadConfig = async () => {
      try {
        const response = await fetch(
          `/api/promo-modal?slug=${encodeURIComponent(currentPathname)}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          if (isMounted) {
            setConfigs([]);
          }
          return;
        }

        const data = (await response.json()) as PromoModalResponse;
        const normalized = Array.isArray(data?.items) ? data.items : [];

        writePromoModalCache(currentPathname, normalized);

        if (isMounted) {
          setConfigs(normalized);
        }
      } catch {
        if (isMounted && !controller.signal.aborted) {
          setConfigs([]);
        }
      }
    };

    void loadConfig();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [currentPathname]);

  const matchedConfig = useMemo(() => {
    if (!configs || configs.length === 0) return null;
    return (
      configs.find(
        (item) =>
          item.enabled &&
          (!item.slugs ||
            item.slugs.length === 0 ||
            item.slugs.includes("*") ||
            item.slugs.includes(currentPathname))
      ) || null
    );
  }, [configs, currentPathname]);

  useEffect(() => {
    if (!matchedConfig) return;
    const rawDelay = matchedConfig.delayMs ?? 0;
    const delayMs = Math.max(0, rawDelay * 1000);
    const timer = setTimeout(() => setIsOpen(true), delayMs);
    return () => clearTimeout(timer);
  }, [matchedConfig]);

  const handleExploreDeals = () => {
    setIsOpen(false);
    const targetUrl = matchedConfig?.redirectUrl;
    if (targetUrl && typeof window !== "undefined") {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (!isOpen || !matchedConfig || !matchedConfig.content.imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-[promo-fade-in_350ms_ease-out]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[90vw] overflow-hidden rounded-2xl shadow-[0_8px_32px_0_rgba(203,33,135,0.25)] sm:max-w-[420px] md:max-w-[520px] lg:max-w-[600px] animate-[promo-pop-in_350ms_ease-out] [animation-fill-mode:both]"
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-3 top-3 z-20 rounded-full bg-black/30 p-2 text-white/80 backdrop-blur-sm transition-all hover:bg-black hover:text-white animate-[promo-fade-in_250ms_ease-out] [animation-delay:200ms] [animation-fill-mode:both]"
          aria-label="Close"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <button onClick={handleExploreDeals} className="relative block w-full overflow-hidden bg-black" aria-label="Open offer" >
          <Image
            src={matchedConfig.content.imageUrl}
            alt={matchedConfig.content.imageAlt || "Promotional offer"}
            className="h-auto w-full object-contain"
            width={1200}
            height={1200}
            priority
          />
        </button>

        <div className="rounded-b-2xl border-t border-gray-100 bg-white px-4 pb-4 pt-3 text-center shadow-inner ">
          <button
            onClick={() => setIsOpen(false)}
            className="text-base font-medium text-gray-400 transition-colors hover:text-gray-700"
          >
            May Be
          </button>
        </div>
        <style jsx global>{`
          @keyframes promo-fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes promo-pop-in {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes promo-slide-up {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PromoModal;
