import type { Metadata } from "next";
import { cache } from "react";
import HomePageSkeleton from "@/components/HomePageSkeleton";
import SeoHeadScripts from "@/components/seo/SeoHeadScripts";
import type { DestinationsHomepageResponse } from "@/types/destinationsHomepage";
import { Perfectholiday } from "@/components/Perfectholiday";
import SearchBanner from "@/components/SearchBanner";
import Features from "@/components/Features";
import DestinationCarousel from "@/components/DestinationCarousel";
import Broucher from "@/components/Broucher";
import WhybookwithPml from "@/components/WhybookwithPml";
import Signup from "@/components/Signup";
import Trustsection from "@/components/Trustsection";
import Largecard from "@/components/Largecard";
import Worldofplanmyluxe from "@/components/Worldofplanmyluxe";
import Tailortripcard from "@/components/Tailortripcard";
import DealCollections from "@/components/DealCollection";
import ChatSection from "@/components/ChatSection";
import { fetchBackend } from "@/lib/backendFetch";
import { buildMetadataFromSeo, getSeoMetadata } from "@/lib/seo/metadata";

const getDestinationHomeResponse = cache(
  async (): Promise<DestinationsHomepageResponse | null> => {
  try {
    const res = await fetchBackend("/client/api/destination-home/", {
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = (await res.json()) as DestinationsHomepageResponse;
    if (!data || (data as any).success !== true) return null;
    return data;
  } catch {
    return null;
  }
}
);

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("destinations_homepage");

  return buildMetadataFromSeo(seo);
}

export default async function Destinations() {
  const data = await getDestinationHomeResponse();
  const page = data?.page;
  const seo = await getSeoMetadata("destinations_homepage");

  return (
    <>
      <SeoHeadScripts html={seo?.Head_Scripts} debugId="destinations" />

      <div className="min-h-screen bg-white">
        <main className="mx-auto bg-white md:container lg:container xl:container bg-white">
          {!page ? 
          <HomePageSkeleton /> : 
            <>
              <SearchBanner
                title={page?.banner_title}
                description={page?.banner_subtitle}
                image={page?.banner_image}
                disablePrefill
              />
              <Features />
              <ChatSection chat_title={page?.chat_title} chat_subtitle={page?.chat_subtitle} />
              
              <Largecard
                title={page?.Weekly_deals_title}
                deal={page?.Weekly_hot_deal}
              />
              <DealCollections
                deal_collection_title={page?.deal_collection_title}
                deal_collection_tag_1={page?.deal_collection_tag_1}
                tag_1_deals={page?.tag_1_deals}
                deal_collection_tag_2={page?.deal_collection_tag_2}
                tag_2_deals={page?.tag_2_deals}
                deal_collection_tag_3={page?.deal_collection_tag_3}
                tag_3_deals={page?.tag_3_deals}
                deal_collection_tag_4={page?.deal_collection_tag_4}
                tag_4_deals={page?.tag_4_deals}
                deal_collection_tag_5={page?.deal_collection_tag_5}
                tag_5_deals={page?.tag_5_deals}
                deal_collection_tag_6={page?.deal_collection_tag_6}
                tag_6_deals={page?.tag_6_deals}
              />
              <DestinationCarousel
                Destination_collection_title={
                  page?.Desination_collection_title
                }
                description={
                  page?.Destination_collection_description
                } // optional
                Destination_collection_tag_1={
                  page?.Destination_collection_tag_1
                }
                tag_1_destination={page?.tag_1_destination}
                Destination_collection_tag_2={
                  page?.Destination_collection_tag_2
                }
                tag_2_destination={page?.tag_2_destination}
                Destination_collection_tag_3={
                  page?.Destination_collection_tag_3
                }
                tag_3_destination={page?.tag_3_destination}
                Destination_collection_tag_4={
                  page?.Destination_collection_tag_4
                }
                tag_4_destination={page?.tag_4_destination}
                Destination_collection_tag_5={
                  page?.Destination_collection_tag_5
                }
                tag_5_destination={page?.tag_5_destination}
                Destination_collection_tag_6={
                  page?.Destination_collection_tag_6
                }
                tag_6_destination={page?.tag_6_destination}
              />
              <Worldofplanmyluxe />
              <Tailortripcard />
              <Perfectholiday
                perfect_holiday_title={page?.perfect_holiday_title}
                perfect_holiday_subtitle={page?.perfect_holiday_subtitle}
                perfect_holiday_types={page?.perfect_holiday_types}
              />
              <Broucher />
              <WhybookwithPml />
              <Signup />
              <Trustsection />
            </>
          }
        </main>
      </div>
    </>
  );
}


