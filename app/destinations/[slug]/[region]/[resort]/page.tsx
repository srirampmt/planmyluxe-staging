import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DestinationCmsPage, getDestinationResponse } from "@/app/destinations/[slug]/page";
import HierarchyDestinationPage from "@/components/destinationdetail/HierarchyDestinationPage";
import { getDestinationByPath } from "@/lib/destinations/path";
import { buildMetadataFromSeo, getSeoMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string; region: string; resort: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, region, resort } = await params;
  const data = await getDestinationByPath([slug, region, resort]);
  if (data?.source === "cms" && data.page?.slug) {
    return buildMetadataFromSeo(await getSeoMetadata("destination", data.page.slug));
  }
  return { title: data?.page?.name || resort };
}

export default async function DestinationResortPage({ params }: PageProps) {
  const { slug, region, resort } = await params;
  const data = await getDestinationByPath([slug, region, resort]);
  if (!data?.page) notFound();

  if (data.source === "cms" && data.page.slug) {
    const full = await getDestinationResponse(data.page.slug);
    const seo = await getSeoMetadata("destination", data.page.slug);
    if (!full?.page) notFound();
    return <DestinationCmsPage page={full.page} seo={seo} slug={data.page.slug} />;
  }

  return <HierarchyDestinationPage page={data.page} />;
}
