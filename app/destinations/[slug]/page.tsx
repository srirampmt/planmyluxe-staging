import type { Metadata } from "next";
import { notFound } from "next/navigation";
 
import { cache } from "react";
import SeoHeadScripts from "@/components/seo/SeoHeadScripts";
import JsonLd from "@/components/seo/JsonLd";
import SearchBanner from "@/components/SearchBanner";
import DestinationDealCarousel from "@/components/destinationdetail/DestinationdealCarousel";
import IntroDescription from "@/components/destinationdetail/introDescription";
import Explore from "@/components/destinationdetail/explore";
import KeyFacts from "@/components/destinationdetail/KeyFacts";
import ResortsMap from "@/components/destinationdetail/resortsMap";
import Weather from "@/components/destinationdetail/Weather";
import FAQs from "@/components/faqs";
import DestinationHighlights from "@/components/destinationdetail/DestinationHighlights";
import BookingConfidence from "@/components/destinationdetail/BookingConfidence";
 
import { fetchBackend } from "@/lib/backendFetch";
import type {
  DestinationDealHotel,
  DestinationResponse,
  DestinationSummary,
} from "@/types/destination";
import {
  encodeDestinationParam,
  getDestinationBreadcrumb,
  getDestinationLabel,
  getDestinationLevel,
  isSelectableDestinationRow,
  makeDestinationSelection,
  type DestinationLevel,
  type DestinationRow,
} from "@/lib/mappings/destinations";
import { destinationBreadcrumbs } from "@/lib/destinations/path";
import { buildMetadataFromSeo, getSeoMetadata } from "@/lib/seo/metadata";
import { getSiteUrl } from "@/lib/site-url";
import PopularResorts from "@/components/destinationdetail/PopularResorts";
 
type PageProps = {
  params: Promise<{ slug: string }>;
};
 
function asArray<T>(value: T[] | "" | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function plainText(value?: string): string {
  return (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
 
const slugToName = (slug: string): string => {
  const customMap: Record<string, string> = {
    'canary-islands': 'Canary Islands',
    'balearic-islands': 'Balearic Islands',
    'united-kingdom': 'United Kingdom',
    'czech-republic': 'Czech Republic',
    'channel-islands': 'Channel Islands',
    'spain': 'Spain',
    'morocco': 'Morocco',
  };
 
  if (customMap[slug.toLowerCase()]) {
    return customMap[slug.toLowerCase()];
  }
 
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const LEVEL_RANK: DestinationLevel[] = ["city", "resort", "region", "country", "top_level"];

async function resolveDestinationHotelsHref(name: string): Promise<string> {
  const params = new URLSearchParams();
  params.set("q", name);
  try {
    const res = await fetchBackend("/client/api/destinations/", { cache: "no-store" });
    if (!res.ok) return `/hotels?${params.toString()}`;
    const data = await res.json();
    const all: DestinationRow[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.destinations)
        ? data.destinations
        : [];
    const query = name.trim().toLowerCase();
    const named = all
      .filter(isSelectableDestinationRow)
      .filter((row) => getDestinationLabel(row).trim().toLowerCase() === query);
    named.sort((a, b) => {
      const rank = (row: DestinationRow) => {
        const level = getDestinationLevel(row);
        const index = level ? LEVEL_RANK.indexOf(level) : LEVEL_RANK.length;
        return index < 0 ? LEVEL_RANK.length : index;
      };
      return rank(a) - rank(b);
    });
    const match = named[0];
    if (match) params.set("did", encodeDestinationParam(makeDestinationSelection(match)));
  } catch {
    // Search still opens with the destination name.
  }
  return `/hotels?${params.toString()}`;
}

async function resolveInitialDest(name: string | undefined): Promise<string | undefined> {
  if (!name) return undefined;
  try {
    const res = await fetchBackend("/client/api/destinations/", { cache: "no-store" });
    if (!res.ok) return undefined;
    const data = await res.json();
    const all: DestinationRow[] = Array.isArray(data) ? data : Array.isArray(data?.destinations) ? data.destinations : [];

    const query = name.trim().toLowerCase();
    const matches = all.filter(isSelectableDestinationRow).filter((row) => {
      const label = getDestinationLabel(row).toLowerCase();
      const breadcrumb = getDestinationBreadcrumb(row).toLowerCase();
      return label.includes(query) || breadcrumb.includes(query);
    });
    if (matches.length === 0) return undefined;

    const match = matches.find((row) => getDestinationLabel(row).toLowerCase() === query) ?? matches[0];
    return encodeDestinationParam(makeDestinationSelection(match));
  } catch {
    return undefined;
  }
}
 
export const getDestinationResponse = cache(async (slug: string): Promise<DestinationResponse | null> => {
  try {
    const encodedSlug = encodeURIComponent(slug);
    const res = await fetchBackend(`/client/api/destination/${encodedSlug}/`, {
      cache: "no-store",
    });
 
    // if (!res.ok) {
    //   console.error(`[Destination Backend Error] Status: ${res.status} for slug: ${slug}`);
    //   return null;
    // }
 
    const json = (await res.json()) as DestinationResponse;
    // console.log(`============= Backend Response for Destination: ${slug} =============`);
    // console.log(JSON.stringify(json, null, 2));
    // console.log("======================================================================");
 
    if (!json || (json as any).success !== true) return null;
    return json;
  } catch (error) {
    // console.error(`[Destination Backend Exception] Error fetching slug: ${slug}`, error);
    return null;
  }
});
 
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getSeoMetadata("destination", slug);
 
  return buildMetadataFromSeo(seo);
}
 
export async function DestinationCmsPage({
  page,
  seo,
  slug,
}: {
  page: DestinationResponse["page"];
  seo: Awaited<ReturnType<typeof getSeoMetadata>>;
  slug: string;
}) {
  if (!page) notFound();

  const similarDestinations = asArray(page.similar_destinations).map((d) => {
    const input: DestinationSummary =
      typeof d === "string"
        ? { id: d, slug: d, name: d }
        : (d as DestinationSummary);
    return {
      ...input,
      card_image: input.card_image || input.banner_image,
    };
  });
  const destinationDeals = asArray(page.destination_deals_1).filter(
    (deal): deal is DestinationDealHotel => Boolean(deal) && typeof deal === "object"
  );
  const handpickedDeals = asArray(page.handpicked_deals).filter(
    (deal): deal is DestinationDealHotel => Boolean(deal) && typeof deal === "object"
  );
 
  const targetName = page.name || slugToName(slug);
  const initialDest = await resolveInitialDest(page.name);
  const destinationHotelsHref = await resolveDestinationHotelsHref(targetName);
  const breadcrumbs = destinationBreadcrumbs({
    ...page,
    name: targetName,
    public_path: page.public_path || `/destinations/${slug}`,
  });
  const faqItems = asArray(page.faqs)
    .map((faq) => ({
      question: faq.question?.trim() || "",
      answer: faq.answer?.trim() || "",
    }))
    .filter((faq) => faq.question && faq.answer);
  const siteUrl = getSiteUrl();
  const publicPath = page.public_path || `/destinations/${slug}`;
  const absoluteUrl = (path: string) => new URL(path, `${siteUrl}/`).toString();
  const schemaGraph: Record<string, unknown>[] = [
    {
      "@type": "TouristDestination",
      name: targetName,
      url: absoluteUrl(publicPath),
      description:
        page.Meta_Description ||
        plainText(page.best_experience_line_1) ||
        undefined,
      image: page.banner_image || undefined,
      touristType: [
        page.title_1,
        page.title_2,
        page.title_3,
        page.title_4,
      ].filter(Boolean),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.slug),
      })),
    },
  ];
  if (faqItems.length > 0) {
    schemaGraph.push({
      "@type": "FAQPage",
      mainEntity: faqItems.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: plainText(faq.answer),
        },
      })),
    });
  }
  const destinationJsonLd = {
    "@context": "https://schema.org",
    "@graph": schemaGraph,
  };
 
  return (
    <>
      <SeoHeadScripts html={seo?.Head_Scripts} debugId="destination" />
      <JsonLd data={destinationJsonLd} />
      <div className="min-h-screen bg-[#F9FAFB]">
        <main className="w-full bg-[#F9FAFB] overflow-x-clip">
          <SearchBanner title={page.banner_title} description={page.banner_subtitle} image={page.banner_image} initialDest={initialDest} disablePrefill />
          <IntroDescription
            title={page.best_experience_title || `Luxury Holidays in ${targetName}`}
            line1={page.best_experience_line_1}
            line2={page.best_experience_line_2}
            line3={page.best_experience_line_3}
            breadcrumbs={breadcrumbs}
            destinationName={targetName}
            goodForItems={[
              { title: page.title_1, description: page.description_1 },
              { title: page.title_2, description: page.description_2 },
              { title: page.title_3, description: page.description_3 },
              { title: page.title_4, description: page.description_4 },
            ]}
          />
          <KeyFacts
            destinationName={targetName}
            flight_time={page.flight_time}
            time_difference={page.time_difference}
            currency={page.currency}
            language={page.language}
          />
          <DestinationDealCarousel
            trending_deals_title_1={
              page.destination_deals_title_1 ||
              page.handpicked_deals_title ||
              `Handpicked ${targetName} deals`
            }
            trending_deals_subtitle_1={page.handpicked_deals_subtitle}
            trending_deals_1={destinationDeals}
            sectionClassName="py-6 md:py-8"
            viewAllHref={destinationHotelsHref}
            viewAllLabel="Explore more deals"
          />
          <BookingConfidence destinationName={targetName} />
          <Explore
            explore_title_1={page.explore_title_1}
            explore_subtitle_1={page.explore_subtitle_1}
            explore_description_1={page.explore_description_1}
            explore_image_1={page.explore_image_1}
            explore_title_2={page.explore_title_2}
            explore_subtitle_2={page.explore_subtitle_2}
            explore_description_2={page.explore_description_2}
            explore_image_2={page.explore_image_2}
            explore_title_3={page.explore_title_3}
            explore_subtitle_3={page.explore_subtitle_3}
            explore_description_3={page.explore_description_3}
            explore_image_3={page.explore_image_3}
            explore_title_4={page.explore_title_4}
            explore_subtitle_4={page.explore_subtitle_4}
            explore_description_4={page.explore_description_4}
            explore_image_4={page.explore_image_4}
            sectionClassName="py-6 md:py-8"
          />
          <ResortsMap
            destinationName={targetName}
            resortsList={page.resorts_hierarchy}
            hierarchyLevel={page.hierarchy_level}
          />
          <Weather
            Weather_title={page?.Weather_title}
            Weather_subtitle={page?.Weather_subtitle}
            destinationName={targetName}
            weatherData={asArray(page.weather_data)}
            seasonCards={[
              {
                image: page?.season_card_image_1,
                title: page?.season_card_title_1,
                description: page?.season_card_description_1,
              },
              {
                image: page?.season_card_image_2,
                title: page?.season_card_title_2,
                description: page?.season_card_description_2,
              },
              {
                image: page?.season_card_image_3,
                title: page?.season_card_title_3,
                description: page?.season_card_description_3,
              },
              {
                image: page?.season_card_image_4,
                title: page?.season_card_title_4,
                description: page?.season_card_description_4,
              },
            ]}
          />
          <DestinationHighlights destinationName={targetName} highlights={page.highlights} />
          <FAQs faqItems={faqItems} sectionClassName="py-6 md:py-8" />
          <DestinationDealCarousel
            trending_deals_title_1={page.handpicked_deals_title || `Exclusive handpicked deals to explore`}
            trending_deals_subtitle_1={page.handpicked_deals_subtitle}
            trending_deals_1={handpickedDeals}
            sectionClassName="py-6 md:py-8"
            viewAllHref={destinationHotelsHref}
            viewAllLabel="Explore more deals"
          />
          <PopularResorts
            title={page.similar_destinations_title}
            subtitle={targetName}
            resorts={similarDestinations}
          />
        </main>
      </div>
    </>
  );
}

export default async function DestinationPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getDestinationResponse(slug);
  const seo = await getSeoMetadata("destination", slug);
  if (!data?.page) notFound();
  const publicPath = data.page.public_path;
  if (publicPath && publicPath !== `/destinations/${slug}`) {
    notFound();
  }
  return <DestinationCmsPage page={data.page} seo={seo} slug={slug} />;
}