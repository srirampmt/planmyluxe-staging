import type { Metadata } from "next";
import { Suspense } from "react";

import ShortLinkRedirectClient from "./ShortLinkRedirectClient";

export const metadata: Metadata = {
  title: "Redirecting…",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

function ShortLinkFallback() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-[#D63384] border-t-transparent"
        aria-hidden="true"
      />
      <p className="text-sm text-slate-600">Redirecting…</p>
    </div>
  );
}

export default function ShortPage() {
  return (
    <Suspense fallback={<ShortLinkFallback />}>
      <ShortLinkRedirectClient />
    </Suspense>
  );
}
