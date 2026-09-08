import type { ReactNode } from "react";

/**
 * Shared iconography for the hotels-v2 "Bold Premium" variant.
 * Consolidates hand-rolled SVGs that were previously copy-pasted across
 * HotelBanner.tsx, OfferHeader.tsx, HotelCalendarSection.tsx and page.tsx.
 * Purely presentational — no behavior lives here.
 */

/** Circular colored chip wrapper used as a visual anchor for standalone icons. */
export function IconChip({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-pml-primary/10 p-2 ${className}`}
    >
      {children}
    </span>
  );
}

/** Single filled star glyph (path shared by rating displays across the route). */
export function StarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M16 6.18179L10.1863 5.79957L7.99681 0.299072L5.80734 5.79957L0 6.18179L4.45419 9.96385L2.99256 15.701L7.99681 12.5379L13.0011 15.701L11.5395 9.96385L16 6.18179Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** 0-5 star rating row (duotone: filled pml-primary stars + muted empties). */
export function StarRating({
  rating = 0,
  className = "",
}: {
  rating: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(5, Math.floor(rating)));
  return (
    <span className={`flex items-center gap-[2px] ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < clamped ? "text-pml-primary" : "text-[#E0E0E0]"}>
          <StarIcon />
        </span>
      ))}
    </span>
  );
}

/** Map-pin / location glyph. */
export function LocationPinIcon({ className = "h-[14px] w-[14px]" }: { className?: string }) {
  return (
    <svg
      className={`shrink-0 ${className}`}
      viewBox="0 0 10 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.66668 0C2.09352 0 0 2.09352 0 4.66668C0 5.43914 0.193129 6.20504 0.560273 6.88436L4.41148 13.8496C4.46275 13.9425 4.56045 14 4.66668 14C4.77291 14 4.87061 13.9425 4.92188 13.8496L8.7745 6.88207C9.14022 6.20504 9.33335 5.43911 9.33335 4.66665C9.33335 2.09352 7.23983 0 4.66668 0ZM4.66668 7C3.3801 7 2.33335 5.95325 2.33335 4.66668C2.33335 3.3801 3.3801 2.33335 4.66668 2.33335C5.95325 2.33335 7 3.3801 7 4.66668C7 5.95325 5.95325 7 4.66668 7Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** WhatsApp glyph (duotone-filled). */
export function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-current ${className}`} aria-hidden="true">
      <path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c7.905 4.27 17.661-1.4 17.665-10.449 0-3.176-1.24-6.165-3.495-8.402ZM22.002 11.866c-.006 7.633-8.385 12.4-15.012 8.504l-.36-.214-3.75.975 1.005-3.645-.239-.375C-.478 10.546 4.26 1.966 12.072 1.966c2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99Z" />
      <path d="M17.507 14.307c-2.199-1.096-2.429-1.242-2.713-.816-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.293-.506.32-.578.878-1.634.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.576-.05-.997-.042-1.368.344-1.614 1.774-1.207 3.604.174 5.55 2.714 3.552 4.16 4.206 6.804 5.114.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345Z" />
    </svg>
  );
}

/** Outline/stroke-style WhatsApp glyph, for small circular icon buttons where
 * the duotone-filled `WhatsAppIcon` above reads too heavy (e.g. the season
 * pricing cards in StaticPricingCard.tsx). Kept separate so the existing
 * filled `WhatsAppIcon` usages elsewhere are unaffected. */
export function WhatsAppOutlineIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.5 3.5A10.7 10.7 0 0 0 12.1 0.4C6.2 0.4 1.4 5.2 1.4 11.1c0 1.9.5 3.8 1.5 5.4L1 23l6.7-1.8a10.6 10.6 0 0 0 4.9 1.2h.01c5.9 0 10.7-4.8 10.7-10.7 0-2.86-1.11-5.55-3.11-7.56z" />
      <path d="M16.9 14.1c-.34-.17-1.98-.98-2.29-1.09-.31-.11-.53-.17-.76.17-.22.34-.87 1.09-1.07 1.31-.2.22-.39.25-.73.08-.34-.17-1.42-.52-2.71-1.67-1-.9-1.68-2-1.87-2.34-.2-.34-.02-.52.15-.69.15-.15.34-.39.51-.59.17-.19.22-.34.34-.56.11-.22.06-.42-.03-.59-.08-.17-.76-1.83-1.04-2.5-.27-.65-.55-.56-.76-.57h-.65c-.22 0-.59.08-.9.42-.31.34-1.18 1.15-1.18 2.81 0 1.65 1.21 3.25 1.38 3.47.17.22 2.38 3.63 5.76 5.09.8.35 1.43.55 1.92.71.81.26 1.54.22 2.12.13.65-.1 1.98-.81 2.26-1.59.28-.78.28-1.45.2-1.59-.09-.14-.31-.22-.65-.39Z" />
    </svg>
  );
}

/** Chat / message bubble glyph. */
export function ChatIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 23 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
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
  );
}
