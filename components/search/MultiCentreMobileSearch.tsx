"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Edit, MapPin, Plane, X } from "lucide-react";
import MultiCenterSearchBar from "@/components/search/MultiCenterSearchBar";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatMonth(mon: string): string {
  const clean = mon.replace(/[^0-9]/g, "").slice(0, 6);
  if (!/^\d{6}$/.test(clean)) return mon || "Any month";
  const year = clean.slice(0, 4);
  const monthIndex = Number(clean.slice(4, 6)) - 1;
  if (monthIndex < 0 || monthIndex > 11) return mon;
  return `${MONTHS[monthIndex]} ${year}`;
}

function formatAirports(air: string): string {
  const codes = air.split(",").map((code) => code.trim()).filter(Boolean);
  if (codes.length === 0) return "All airports";
  if (codes.length === 1) return codes[0];
  return `${codes[0]} +${codes.length - 1}`;
}

function formatDestination(d: string): string {
  const names = d.split(",").map((name) => name.trim()).filter(Boolean);
  if (names.length === 0) return "Any destination";
  if (names.length === 1) return names[0];
  return `${names[0]} +${names.length - 1}`;
}

export default function MultiCentreMobileSearch({
  d = "",
  air = "",
  mon = "",
}: {
  d?: string;
  air?: string;
  mon?: string;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isEditing) {
      document.body.style.overflow = "hidden";
      window.dispatchEvent(new Event("hideNavbar"));
    } else {
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("showNavbar"));
    }
    return () => {
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("showNavbar"));
    };
  }, [isEditing]);

  return (
    <div className="w-full lg:hidden">
      <div className="flex w-full items-center justify-between py-2">
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Back to home"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-100/80 bg-white text-[#CB2187] shadow-sm"
        >
          <ArrowLeft size={16} />
        </button>

        <button
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label="Edit search"
          className="mx-2 flex h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[14px] border border-[#CB2187]/30 bg-[#FFF5FA] px-3 shadow-[0_2px_10px_rgba(203,33,135,0.12)]"
        >
          <span className="flex max-w-full items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-pml-primary" aria-hidden="true" />
            <span className="truncate text-[14px] font-bold leading-none text-slate-900">
              {formatDestination(d)}
            </span>
          </span>
          <span className="flex max-w-full min-w-0 items-center justify-center gap-1 text-[11px] font-semibold leading-none text-slate-600">
            <Calendar className="h-3 w-3 shrink-0 text-pml-primary" aria-hidden="true" />
            <span className="shrink-0">{formatMonth(mon)}</span>
            <span className="shrink-0 text-slate-300">·</span>
            <Plane className="h-3 w-3 shrink-0 text-pml-primary" aria-hidden="true" />
            <span className="min-w-0 truncate">{formatAirports(air)}</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label="Edit search"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pml-primary text-white shadow-[0_4px_12px_rgba(203,33,135,0.35)]"
        >
          <Edit size={16} />
        </button>
      </div>

      {isEditing ? (
        <div className="fixed inset-0 z-[1100] overflow-y-auto bg-white">
          <style dangerouslySetInnerHTML={{ __html: "header.fixed { display: none !important; }" }} />
          <div className="mx-auto w-full max-w-[640px] px-4 pb-8 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[16px] font-bold text-[#1a1a1a]">Edit search</p>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                aria-label="Close search"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EDEDED] text-[#4C4C4C]"
              >
                <X size={16} />
              </button>
            </div>
            <MultiCenterSearchBar d={d} air={air} mon={mon} onSearch={() => setIsEditing(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
