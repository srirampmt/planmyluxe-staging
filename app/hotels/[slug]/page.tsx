import { getHotelInitialData, getHotelSearchInitialData } from "@/lib/hotelServerData";
import HotelPageClient from "./HotelPageClient";

export const dynamic = "force-dynamic"; // live fetch is no-store; matches today's always-fresh behavior

const toStr = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";

export default async function HotelPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const isSearchMode = resolvedSearchParams.search === "true";
  let content = null;
  let live = null;

  if (isSearchMode) {
    const searchInitial = await getHotelSearchInitialData(slug, {
      departure: toStr(resolvedSearchParams.departure),
      duration: toStr(resolvedSearchParams.duration),
      boardBasis: toStr(resolvedSearchParams.boardBasis),
      checkinDate: toStr(resolvedSearchParams.checkinDate),
    });
    content = searchInitial.content;
    live = searchInitial.live;
  } else {
    const initial = await getHotelInitialData(slug);
    content = initial.content;
    live = initial.live;
  }
 
  return (
    <HotelPageClient
      key={slug}
      slug={slug}
      initialHotelData={content}
      initialLive={live}
    />
  );
}
