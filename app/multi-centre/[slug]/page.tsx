import { getMultiCentreContent, getMultiCentreDefaultPricing } from "@/lib/multiCentreServerData";
import MultiCentrePageClient from "./MultiCentrePageClient";

export const dynamic = "force-dynamic"; // live fetch is no-store; matches today's always-fresh behavior

const toStr = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";

export default async function MultiCentreSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const urlMonth = toStr(query.mon) || toStr(query.month);
  const urlAirport = toStr(query.air) || toStr(query.airport);

  const [initialContent, initialPricing] = await Promise.all([
    getMultiCentreContent(slug),
    getMultiCentreDefaultPricing(slug),
  ]);

  return (
    <MultiCentrePageClient
      key={`${slug}-${urlMonth}-${urlAirport}`}
      initialContent={initialContent}
      initialPricing={initialPricing}
      urlMonth={urlMonth}
      urlAirport={urlAirport}
    />
  );
}
