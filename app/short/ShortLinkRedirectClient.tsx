"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function mergeMissingSearchParams(targetUrl: string, inbound: URLSearchParams): string {
  let resolved: URL;
  try {
    resolved = new URL(targetUrl, window.location.origin);
  } catch {
    return targetUrl;
  }

  for (const [key, value] of inbound.entries()) {
    if (key === "link") continue;
    if (!resolved.searchParams.has(key)) {
      resolved.searchParams.append(key, value);
    }
  }

  if (targetUrl.startsWith("/") && resolved.origin === window.location.origin) {
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  }

  return resolved.toString();
}

export default function ShortLinkRedirectClient() {
  const searchParams = useSearchParams();
  const link = (searchParams.get("link") || "").trim();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveAndRedirect() {
      if (!link) {
        setError("This short link is missing a keyword.");
        return;
      }

      try {
        const res = await fetch(`/api/short-link?link=${encodeURIComponent(link)}`, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        const payload = (await res.json().catch(() => null)) as {
          target_url?: string;
          error?: string;
        } | null;

        if (!res.ok || !payload?.target_url) {
          if (!cancelled) {
            setError(payload?.error || "This short link is invalid or no longer available.");
          }
          return;
        }

        const destination = mergeMissingSearchParams(payload.target_url, searchParams);
        window.location.replace(destination);
      } catch {
        if (!cancelled) {
          setError("Unable to resolve this short link. Please try again.");
        }
      }
    }

    void resolveAndRedirect();

    return () => {
      cancelled = true;
    };
  }, [link, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Link unavailable</h1>
        <p className="max-w-md text-sm text-slate-600">{error}</p>
        <Link
          href="/"
          className="rounded-full bg-[#D63384] px-5 py-2 text-sm font-semibold text-white"
        >
          Go to homepage
        </Link>
      </div>
    );
  }

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
