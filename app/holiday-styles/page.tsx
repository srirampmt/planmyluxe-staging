import type { Metadata } from "next";
import { cache } from "react";
import SeoHeadScripts from "@/components/seo/SeoHeadScripts";
import { Perfectholiday } from "@/components/Perfectholiday";
import Banner from "@/components/Banner";
import Features from "@/components/Features";
import Broucher from "@/components/Broucher";
import WhybookwithPml from "@/components/WhybookwithPml";
import Signup from "@/components/Signup";
import Trustsection from "@/components/Trustsection";
import Tailortripcard from "@/components/Tailortripcard";
import Experience from "@/components/destinationdetail/Experience";
// import Trendingbanner from "@/components/holidaystyleshome/trendingbanner";
import HolidayTypes from "@/components/holidaystyleshome/HolidayTypes";
import HomePageSkeleton from "@/components/HomePageSkeleton";
import { fetchBackend } from "@/lib/backendFetch";
import type { Destination, HolidayType } from "@/types/homepage";
import { buildMetadataFromSeo, getSeoMetadata } from "@/lib/seo/metadata";

type HolidayStylesPage = {
  id: number;
  name?: string;
  slug?: string;

  banner_image?: string;
  banner_title?: string;
  banner_subtitle?: string;

  best_experience_title?: string;
  best_experience_line_1?: string;
  best_experience_line_2?: string;
  best_experience_line_3?: string;
  best_experience_image_1?: string;

  All_holidays_title?: string;
  All_holidays_types?: HolidayType[];

  card_image?: string;
  add_title?: string;
  add_subtitle?: string;
  add_link?: string;

  destinations_title?: string;
  destinations?: Destination[];

  Meta_Title?: string;
  Meta_Description?: string;
  OG_Image?: string;
  Canonical_URL?: string;
  Twitter_Image?: string;
  Head_Scripts?: string;
};

type HolidayStylesResponse = {
  success: true;
  page: HolidayStylesPage;
};

const getHolidayStylesResponse = cache(async (): Promise<HolidayStylesResponse | null> => {
  try {
    const res = await fetchBackend("/client/api/holidaystyles-home/", {
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = (await res.json()) as HolidayStylesResponse;
    if (!data || (data as any).success !== true) return null;
    return data;
  } catch {
    return null;
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("holiday_styles_homepage");

  return buildMetadataFromSeo(seo);
}

export default async function HolidayStyles() {
  const holidayData = await getHolidayStylesResponse();
  const page = holidayData?.page;
  const seo = await getSeoMetadata("holiday_styles_homepage");

  return (
    <>
      <SeoHeadScripts html={seo?.Head_Scripts} debugId="holiday-styles" />

      <div className="min-h-screen bg-white">
        <main className="mx-auto bg-white md:container lg:container xl:container bg-white">
          {!page ? (
            <HomePageSkeleton />
          ) : (
            <>
              <Banner
                title={page.banner_title}
                description={page.banner_subtitle}
                image={page.banner_image}
              />
              <Features />
              <Experience
                best_experience_title={page.best_experience_title}
                best_experience_line_1={page.best_experience_line_1}
                best_experience_line_2={page.best_experience_line_2}
                best_experience_line_3={page.best_experience_line_3}
                best_experience_image_1={page.best_experience_image_1}
              />

              <HolidayTypes
                title={page.All_holidays_title}
                holidays={page.All_holidays_types}
              />
              {/* <Trendingbanner
                card_image={page.card_image}
                add_title={page.add_title}
                add_subtitle={page.add_subtitle}
                add_link={page.add_link}
              /> */}

              {/* actually they are destinations  */}
              <Perfectholiday
                perfect_holiday_title={page.destinations_title}
                perfect_holiday_types={page.destinations}
              />
              <Tailortripcard />
              {/* <Broucher /> */}
              <WhybookwithPml />
              <Signup />
              <Trustsection />
            </>
          )}
        </main>
      </div>
    </>
  );
}