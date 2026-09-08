import type { Metadata } from "next";
import SeoHeadScripts from "@/components/seo/SeoHeadScripts";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadataFromSeo, getSeoMetadata } from "@/lib/seo/metadata";
import { getMultiCentreContent } from "@/lib/multiCentreServerData";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getSeoMetadata("multi_center", slug);
  const isTsPage = slug?.endsWith("-ts");

  return buildMetadataFromSeo(seo, {
    fallbackPath: `/multi-centre/${slug}`,
    robots: {
      index: !isTsPage,
      follow: !isTsPage,
    },
  });
}

export default async function MultiCentreSlugLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = await params;
  const [seo, content] = await Promise.all([
    getSeoMetadata("multi_center", slug),
    getMultiCentreContent(slug),
  ]);

  const page = content?.page;
  const sections = content?.sections;
  const canonicalUrl = seo?.Canonical_URL || undefined;

  const jsonLd = page
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "TouristTrip",
            "@id": canonicalUrl ? `${canonicalUrl}#tour` : undefined,
            name: page.offer_header,
            description: page.intro_text || undefined,
            url: canonicalUrl,
            image: [page.thumbnail_1, page.thumbnail_2, page.thumbnail_3, ...(page.pictures || [])].filter(
              (img): img is string => typeof img === "string" && /^https?:\/\//.test(img)
            ),
            offers: page.starting_price
              ? {
                  "@type": "Offer",
                  price: page.starting_price,
                  priceCurrency: "GBP",
                  url: canonicalUrl,
                }
              : undefined,
            itinerary: sections?.itinerary?.length
              ? {
                  "@type": "ItemList",
                  name: page.destinations?.length
                    ? `${page.destinations.join(" and ")} ${sections.itinerary.length} Day Itinerary`
                    : undefined,
                  numberOfItems: sections.itinerary.length,
                  itemListElement: sections.itinerary.map((day: any, index: number) => ({
                    "@type": "ListItem",
                    position: index + 1,
                    name: day.day ? `Day ${day.day}: ${day.title}` : day.title,
                  })),
                }
              : undefined,
          },
        ],
      }
    : null;

  return (
    <>
      <SeoHeadScripts html={seo?.Head_Scripts} debugId="multi_center" />
      <JsonLd data={jsonLd} />
      {children}
    </>
  );
}
