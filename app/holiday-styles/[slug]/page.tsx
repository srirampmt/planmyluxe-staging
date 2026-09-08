import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import SeoHeadScripts from "@/components/seo/SeoHeadScripts";

import { Perfectholiday } from "@/components/Perfectholiday";
import Banner from "@/components/Banner";
import Features from "@/components/Features";
import Signup from "@/components/Signup";
import Trustsection from "@/components/Trustsection";
import TrendingCarousel from "@/components/TrendingCarousel";
import Tailortripcard from "@/components/Tailortripcard";
import Experience from "@/components/destinationdetail/Experience";
import DestinationDealCarousel from "@/components/destinationdetail/DestinationdealCarousel";
import Explore from "@/components/destinationdetail/explore";
import FAQs from "@/components/faqs";
import { fetchBackend } from "@/lib/backendFetch";
import type { HolidayStyleResponse } from "@/types/holidayStyle";
import { buildMetadataFromSeo, getSeoMetadata } from "@/lib/seo/metadata";
import TrendingMultiCenterCards from "@/components/multi-centre/TrendingMultiCenterCards";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function asArray<T>(value: T[] | "" | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

const getHolidayStyleResponse = cache(async (slug: string): Promise<HolidayStyleResponse | null> => {
  try {
    const encodedSlug = encodeURIComponent(slug);
    const res = await fetchBackend(`/client/api/holiday-style/${encodedSlug}/`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = (await res.json()) as HolidayStyleResponse;
    if (!json || (json as any).success !== true) return null;
    return json;
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getSeoMetadata("holidaystyle", slug);

  return buildMetadataFromSeo(seo);
}

export default async function HolidayStyleDetail({ params }: PageProps) {
  const { slug } = await params;
  const data = await getHolidayStyleResponse(slug);
  const page = data?.page;
  const seo = await getSeoMetadata("holidaystyle", slug);
  if (!page) notFound();

  return (
    <>
      <SeoHeadScripts html={seo?.Head_Scripts} debugId="holiday-style" />

      <div className="min-h-screen bg-white">
        <main className="mx-auto bg-white md:container lg:container xl:container bg-white">
        <Banner
          title={page.banner_title}
          description={page.banner_subtitle}
          image={page.banner_image}
        />
        <Features />
        {/* {slug !== "multi-centre" && (
        )} */}
        <Experience
          best_experience_title={page.best_experience_title}
          best_experience_line_1={page.best_experience_line_1}
          best_experience_line_2={page.best_experience_line_2}
          best_experience_line_3={page.best_experience_line_3}
          best_experience_image_1={page.best_experience_image_1}
        />

        {slug !== "multi-centre" && (
          <DestinationDealCarousel
            trending_deals_title_1={page.trending_deals_title_1}
            trending_deals_subtitle_1={page.trending_deals_subtitle_1}
            trending_deals_1={asArray(page.trending_deals_1)}
          />
        )}

        {slug === "multi-centre" && (
          <TrendingMultiCenterCards
            title={page.handpicked_multi_center_deals_title}
            subtitle={page.handpicked_multi_center_deals_subtitle}
            hotels={asArray(page.handpicked_multi_center_deals)}
          />
        )}

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

        {/* {slug !== "multi-centre" && (
          <Trendingbanner
            add_card_image={page.add_card_image}
            add_title={page.add_title}
            add_subtitle={page.add_subtitle}
            add_link={page.add_link}
          />
        )} */}

        <FAQs
          faqItems={asArray(page.faqs)
            .map((f) => ({ question: f.question ?? "", answer: f.answer ?? "" }))
            .filter((f) => Boolean(f.question) && Boolean(f.answer))}
        />

        {slug !== "multi-centre" && (
          <TrendingCarousel
            title={page.handpicked_deals_title}
            deal_collection={asArray(page.handpicked_deals)}
          />
        )}

        <Tailortripcard />

        {slug !== "multi-centre" && (
          <Perfectholiday
            perfect_holiday_title={page.perfect_holiday_title}
            perfect_holiday_subtitle={page.perfect_holiday_subtitle}
            perfect_holiday_types={asArray(page.perfect_holiday_types).filter(
              (t): t is Exclude<typeof t, string> => typeof t !== "string"
            )}
          />
        )}

        <Signup />

        <Trustsection />

        </main>
        
      </div>
    </>
  );
}


