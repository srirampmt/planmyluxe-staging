"use client";

import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

interface BreadcrumbsProps {
  destination?: string;
  slug?: string;
  className?: string;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function Breadcrumbs({ destination, slug, className = "" }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`font-['Montserrat'] text-[12px] md:text-[13px] ${className}`}>
      <ol className="flex flex-wrap items-center gap-1 text-[#595858]">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 text-[#595858] hover:text-pml-primary hover:underline"
          >
            <Home className="h-[14px] w-[14px] shrink-0" />
            Home
          </Link>
        </li>
        {!!destination && (
          <>
            <li aria-hidden="true" className="flex items-center">
              <ChevronRight className="h-[14px] w-[14px]" />
            </li>
            <li>
              <Link
                href={`/destinations/${slugify(destination)}`}
                className="hover:text-pml-primary capitalize hover:underline"
              >
                {destination}
              </Link>
            </li>
          </>
        )}
        {!!slug && (
          <>
            <li aria-hidden="true" className="flex items-center">
              <ChevronRight className="h-[14px] w-[14px]" />
            </li>
            <li className="font-bold text-pml-primary" aria-current="page">
              {slug}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
