import { fetchBackend } from "@/lib/backendFetch";
import type { DestinationPage, DestinationPathResponse } from "@/types/destination";

export type DestinationCrumb = { name: string; slug: string };

export function destinationBreadcrumbs(page: DestinationPage): DestinationCrumb[] {
  const crumbs: DestinationCrumb[] = [
    { name: "Home", slug: "/" },
    { name: "Destinations", slug: "/destinations" },
  ];
  const level = page.hierarchy_level || "";
  const country = (page.country_slug || "").trim();
  const region = (page.region_slug || "").trim();
  if (country && level !== "country") {
    crumbs.push({
      name: page.country_name || country,
      slug: `/destinations/${country}`,
    });
  }
  if (country && region && level === "resort") {
    crumbs.push({
      name: page.region_name || region,
      slug: `/destinations/${country}/${region}`,
    });
  }
  crumbs.push({
    name: page.name || "Destination",
    slug: page.public_path || (page.slug ? `/destinations/${page.slug}` : "/destinations"),
  });
  return crumbs;
}

export async function getDestinationByPath(segments: string[]): Promise<DestinationPathResponse | null> {
  const path = segments.map((segment) => encodeURIComponent(segment)).join("/");
  try {
    const res = await fetchBackend(`/client/api/destination-path/${path}/`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as DestinationPathResponse;
    if (!json?.success || !json.page) return null;
    return json;
  } catch {
    return null;
  }
}
