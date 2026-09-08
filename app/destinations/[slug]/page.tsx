import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import SeoHeadScripts from "@/components/seo/SeoHeadScripts";

import SearchBanner from "@/components/SearchBanner";
import DestinationDealCarousel from "@/components/destinationdetail/DestinationdealCarousel";
import Experience from "@/components/destinationdetail/Experience";
import Explore from "@/components/destinationdetail/explore";
import GoodFor from "@/components/destinationdetail/goodfor";
import Map from "@/components/destinationdetail/map";
import Weather from "@/components/destinationdetail/Weather";
import FAQs from "@/components/faqs";
import Features from "@/components/Features";
import Perfectholiday from "@/components/Perfectholiday";
import Signup from "@/components/Signup";
import Tailortripcard from "@/components/Tailortripcard";
import TrendingCarousel from "@/components/TrendingCarousel";
import Trustsection from "@/components/Trustsection";

import { fetchBackend } from "@/lib/backendFetch";
import type { DestinationResponse, DestinationSummary } from "@/types/destination";
import { buildMetadataFromSeo, getSeoMetadata } from "@/lib/seo/metadata";
import {
  isSelectableDestinationRow,
  getDestinationLabel,
  getDestinationBreadcrumb,
  makeDestinationSelection,
  encodeDestinationParam,
  type DestinationRow,
} from "@/lib/mappings/destinations";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function asArray<T>(value: T[] | "" | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

const getDestinationResponse = cache(async (slug: string): Promise<DestinationResponse | null> => {
  try {
    const encodedSlug = encodeURIComponent(slug);
    const res = await fetchBackend(`/client/api/destination/${encodedSlug}/`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const json = (await res.json()) as DestinationResponse;
    if (!json || (json as any).success !== true) return null;
    return json;
  } catch {
    return null;
  }
});

// Pre-select this page's own destination in the search bar. There's no
// slug/id linkage between the CMS destination page and the search-selectable
// destinations hierarchy, so this matches by display name/breadcrumb against
// the same backend list app/api/destinations/route.ts searches — falls back
// to no preselection (SearchBar's existing empty-state behavior) if nothing
// matches.
async function resolveInitialDest(name: string | undefined): Promise<string | undefined> {
  if (!name) return undefined;
  try {
    const res = await fetchBackend("/client/api/destinations/", { cache: "no-store" });
    if (!res.ok) return undefined;
    const data = await res.json();
    const all: DestinationRow[] = Array.isArray(data) ? data : Array.isArray(data?.destinations) ? data.destinations : [];

    const query = name.trim().toLowerCase();
    const matches = all.filter(isSelectableDestinationRow).filter((r) => {
      const label = getDestinationLabel(r).toLowerCase();
      const breadcrumb = getDestinationBreadcrumb(r).toLowerCase();
      return label.includes(query) || breadcrumb.includes(query);
    });
    if (matches.length === 0) return undefined;

    const match = matches.find((r) => getDestinationLabel(r).toLowerCase() === query) ?? matches[0];
    return encodeDestinationParam(makeDestinationSelection(match));
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getSeoMetadata("destination", slug);

  return buildMetadataFromSeo(seo);
}

export default async function DestinationPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getDestinationResponse(slug);
  const page = data?.page;
  const seo = await getSeoMetadata("destination", slug);
  if (!page) notFound();

  const initialDest = await resolveInitialDest(page.name);

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
  return (
    <>
      <SeoHeadScripts html={seo?.Head_Scripts} debugId="destination" />

      <div className="min-h-screen bg-white">
        <main className="mx-auto bg-white md:container lg:container xl:container bg-white">
          <SearchBanner title={page.banner_title} description={page.banner_subtitle} image={page.banner_image} initialDest={initialDest} disablePrefill />
          <Features />
          <Experience
            best_experience_title={page.best_experience_title}
            best_experience_line_1={page.best_experience_line_1}
            best_experience_line_2={page.best_experience_line_2}
            best_experience_line_3={page.best_experience_line_3}
            best_experience_image_1={page.best_experience_image_1}
          />
          <GoodFor title_1={page?.title_1} title_2={page?.title_2}
            title_3={page?.title_3} title_4={page?.title_4}
            description_1={page?.description_1} description_2={page?.description_2}
            description_3={page?.description_3} description_4={page?.description_4}
            destinationName={slug}
          />
          <TrendingCarousel title={page.destination_deals_title_1} deal_collection={asArray(page.destination_deals_1)} />
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
          />
          
          <Map iframeSrc={page.map_iframe || ""} />
          <Weather
            Weather_title={page?.Weather_title}
            Weather_subtitle={page?.Weather_subtitle}
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
          <DestinationDealCarousel 
            trending_deals_title_1={page?.handpicked_deals_title}
            trending_deals_subtitle_1={page?.handpicked_deals_subtitle}
            trending_deals_1={asArray(page?.handpicked_deals)} 
          />
          <Perfectholiday
            perfect_holiday_title={page.similar_destinations_title}
            perfect_holiday_types={similarDestinations}
          />
          <FAQs faqItems={asArray(page.faqs)
              .map((f) => ({ question: f.question ?? "", answer: f.answer ?? "" }))
              .filter((f) => Boolean(f.question) && Boolean(f.answer))}
          />
          <Tailortripcard />
          <Signup />
          <Trustsection />
        </main>
      </div>
    </>
  );
}