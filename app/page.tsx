import type { Metadata } from "next";
import { cache } from "react";
import Banner from "@/components/Banner";
import Features from "@/components/Features";
import Handpickedescapes from "@/components/Handpickedescapes";
import WeekEscapes from "@/components/WeekEscapes";
import DealCollections from "@/components/DealCollection";
import DestinationCarousel from "@/components/DestinationCarousel";
import HomePageDeferredSections from "@/components/HomePageDeferredSections";
import HomePageSkeleton from "@/components/HomePageSkeleton";
import SeoHeadScripts from "@/components/seo/SeoHeadScripts";
import { fetchBackend } from "@/lib/backendFetch";
import type { HomePageResponse } from "@/types/homepage";
import { buildMetadataFromSeo, getSeoMetadata } from "@/lib/seo/metadata";
import SearchBanner from "@/components/SearchBanner";
import TrustBullets from "@/components/search/TrustBullets";
import MultiCentreSection from "@/components/search/MultiCentreSection";

const getHomePageResponse = cache(async (): Promise<HomePageResponse | null> => {
  try {
    const res = await fetchBackend("/client/api/home/", {
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = (await res.json()) as HomePageResponse;
    if (!data || (data as any).success !== true) return null;
    return data;
  } catch {
    return null;
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("homepage");

  return {
    ...buildMetadataFromSeo(seo),
    icons: {
      icon: "/favicon.ico",
      apple: "/favicon.ico",
    },
  };
}

export default async function Home() {
  const data = await getHomePageResponse();
  const page = data?.page;
  const seo = await getSeoMetadata("homepage");
  return (
    <div>
      <SeoHeadScripts html={seo?.Head_Scripts} debugId="homepage" />
      <div className="min-h-screen bg-white">
        <main className="mx-auto bg-white md:container lg:container xl:container bg-white">
          {!page ? (
            <HomePageSkeleton />
          ) : (
            <>
              {/* <Banner
                title={page?.banner_title}
                description={page?.banner_subtitle}
                image={page?.banner_image}
              /> */}
              <SearchBanner
                title={page?.banner_title}
                description={page?.banner_subtitle}
                image={page?.banner_image}
                priority
              />

              {/* <Features /> */}
              <TrustBullets />
              <Handpickedescapes
                offers_title={page?.offers_title}
                offers_subtitle={page?.offers_subtitle}
                offer_1_title={page?.offer_1_title}
                offer_1_subtitle={page?.offer_1_subtitle}
                offer_1_image={page?.offer_1_image}
                offer_1_url={page?.offer_1_url}
                offer_2_title={page?.offer_2_title}
                offer_2_subtitle={page?.offer_2_subtitle}
                offer_2_image={page?.offer_2_image}
                offer_2_url={page?.offer_2_url}
                offer_3_title={page?.offer_3_title}
                offer_3_subtitle={page?.offer_3_subtitle}
                offer_3_image={page?.offer_3_image}
                offer_3_url={page?.offer_3_url}
                offer_4_title={page?.offer_4_title}
                offer_4_subtitle={page?.offer_4_subtitle}
                offer_4_image={page?.offer_4_image}
                offer_4_url={page?.offer_4_url}
              />
              
              <WeekEscapes
                Weekly_deals_title={page?.Weekly_deals_title ?? ""}
                Weekly_deals_subtitle={page?.Weekly_deals_subtitle ?? ""}
                Weekly_hot_deal={page?.Weekly_hot_deal ?? null}
                Weekly_deals_hotels={page?.Weekly_deals_hotels ?? []}
                card_image={page?.card_image ?? null}
                add_title={page?.add_title ?? ""}
                add_subtitle={page?.add_subtitle ?? ""}
                add_link={page?.add_link ?? ""}
              />

              <MultiCentreSection
                multicentre_collection_title={page?.multicentre_collection_title}
                multicentre_collection_snapshots={page?.multicentre_collection_snapshots}
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
                Destination_collection_title={page?.Desination_collection_title}
                description={page?.Destination_collection_description}
                Destination_collection_tag_1={page?.Destination_collection_tag_1}
                tag_1_destination={page?.tag_1_destination}
                Destination_collection_tag_2={page?.Destination_collection_tag_2}
                tag_2_destination={page?.tag_2_destination}
                Destination_collection_tag_3={page?.Destination_collection_tag_3}
                tag_3_destination={page?.tag_3_destination}
                Destination_collection_tag_4={page?.Destination_collection_tag_4}
                tag_4_destination={page?.tag_4_destination}
                Destination_collection_tag_5={page?.Destination_collection_tag_5}
                tag_5_destination={page?.tag_5_destination}
                Destination_collection_tag_6={page?.Destination_collection_tag_6}
                tag_6_destination={page?.tag_6_destination}
              />
              <HomePageDeferredSections page={page} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}


