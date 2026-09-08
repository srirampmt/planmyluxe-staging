import type { Metadata } from "next";
import SeoHeadScripts from "@/components/seo/SeoHeadScripts";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadataFromSeo, getSeoMetadata } from "@/lib/seo/metadata";
import { getHotelContent } from "@/lib/hotelServerData";
import { richTextToPlain } from "@/lib/html-utils";
import type { HotelPageData } from "@/types/hotel";

function faqsToPlain(faqs: HotelPageData["faqs"] | undefined): string {
  if (!Array.isArray(faqs)) return "";
  return faqs
    .filter((f) => f?.active !== false && f?.question && f?.answer)
    .map((f) => `Q: ${f.question} A: ${f.answer}`)
    .join(" ");
}

function popularDealsToPlain(deals: any[] | undefined): string {
  if (!Array.isArray(deals)) return "";
  return deals
    .filter((d) => d?.name)
    .map((d) => {
      const location = d.location ? ` — ${d.location}` : "";
      const price = d.starting_price ? ` from £${d.starting_price}` : "";
      return `${d.name}${location}${price}`;
    })
    .join(". ");
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getSeoMetadata("hotel", slug);
  const isTsPage = slug?.endsWith("-ts");

  return buildMetadataFromSeo(seo, {
    robots: {
      index: !isTsPage,
      follow: !isTsPage,
    },
  });
}

/**
 * Layout now just renders children.
 * No script injection.
 */
export default async function HotelSlugLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = await params;
  const [seo, hotelContent] = await Promise.all([
    getSeoMetadata("hotel", slug),
    getHotelContent(slug),
  ]);

  const page = hotelContent?.page;
  const jsonLd = page
    ? {
        "@context": "https://schema.org",
        "@type": "Hotel",
        name: page.hotel_name,
        slug: page.slug || undefined,
        description: richTextToPlain(page.intro_text) || undefined,
        location: page.location || undefined,
        location_detail: richTextToPlain(page.location_detail) || undefined,
        image: [page.thumbnail_1, page.thumbnail_2, page.thumbnail_3, ...(page.pictures || [])].filter(
          (img): img is string => typeof img === "string" && /^https?:\/\//.test(img)
        ),
        facilities: richTextToPlain(page.facilities) || undefined,
        about_the_hotel: richTextToPlain(page.about_the_hotel) || undefined,
        why_we_love_this_hotel: richTextToPlain(page.why_we_love_this_hotel) || undefined,
        about_the_deal: richTextToPlain(page.about_the_deal || page.offer_about_the_deal) || undefined,
        faqs: faqsToPlain(page.faqs) || undefined,
        popular_deals_hotels: popularDealsToPlain(page.popular_deals_hotels) || undefined,
        url: seo?.Canonical_URL || undefined,
      }
    : null;

  return (
    <>
      <SeoHeadScripts html={seo?.Head_Scripts} debugId="hotel" />
      <JsonLd data={jsonLd} />
      {children}
    </>
  );
}
