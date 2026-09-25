import Link from "next/link";
import { destinationBreadcrumbs } from "@/lib/destinations/path";
import type { DestinationPage } from "@/types/destination";

const LEVEL_LABEL: Record<string, string> = {
  region: "Region",
  resort: "Resort",
};

export default function HierarchyDestinationPage({ page }: { page: DestinationPage }) {
  const crumbs = destinationBreadcrumbs(page);
  const level = LEVEL_LABEL[page.hierarchy_level || ""] || "Destination";

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          {crumbs.map((crumb, index) => (
            <span key={crumb.slug} className="flex items-center gap-2">
              {index > 0 ? <span>/</span> : null}
              {index < crumbs.length - 1 ? (
                <Link href={crumb.slug} className="hover:text-[#D63384]">{crumb.name}</Link>
              ) : (
                <span className="text-gray-900">{crumb.name}</span>
              )}
            </span>
          ))}
        </nav>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#D63384]">{level}</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">{page.name}</h1>
      </main>
    </div>
  );
}
