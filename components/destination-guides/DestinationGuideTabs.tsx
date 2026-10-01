import Link from "next/link";
import { BedDouble, CalendarDays, Compass, MapPin, type LucideIcon } from "lucide-react";

import type { DestinationPageTab } from "@/types/destinationHotels";

const TAB_ICONS: Record<string, LucideIcon> = {
  hotels: BedDouble,
  "places-to-visit": MapPin,
  "things-to-do": Compass,
  "best-time-to-visit": CalendarDays,
};

export default function DestinationGuideTabs({
  tabs,
}: {
  tabs: DestinationPageTab[];
}) {
  if (tabs.length < 2) return null;

  return (
    <nav
      aria-label="Destination guide pages"
      className="-mt-5 grid gap-1 rounded-[8px] border border-gray-200/80 bg-white p-1 shadow-sm sm:my-4"
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((tab) => {
        const Icon = TAB_ICONS[tab.key];
        return (
          <Link
            key={tab.key}
            href={tab.path}
            aria-current={tab.active ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1 rounded-[6px] px-1 py-2 text-center text-[11px] font-semibold leading-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CB2187] sm:flex-row sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[14px] ${
              tab.active
                ? "bg-[#CB2187] text-white"
                : "text-[#4c4c4c] hover:bg-[#FBE8F4] hover:text-[#CB2187]"
            }`}
          >
            {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
