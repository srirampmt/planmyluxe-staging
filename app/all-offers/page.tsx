import type { Metadata } from "next";
import { cache } from "react";
import SeoHeadScripts from "@/components/seo/SeoHeadScripts";

import Banner from "@/components/Banner";
import Broucher from "@/components/Broucher";
import Features from "@/components/Features";
import ForFlight from "@/components/offers/ForFlight";
import HomePageSkeleton from "@/components/HomePageSkeleton";
import Signup from "@/components/Signup";
import TrendingCarousel from "@/components/TrendingCarousel";
import Trustsection from "@/components/Trustsection";
import WeekEscapes from "@/components/WeekEscapes";
import WhybookwithPml from "@/components/WhybookwithPml";
import FAQs from "@/components/faqs";
import Coupons from "@/components/offers/coupons";
import { fetchBackend } from "@/lib/backendFetch";
import type { AllOffersResponse } from "@/types/allOffers";
import { buildMetadataFromSeo, getSeoMetadata } from "@/lib/seo/metadata";

const getAllOffersResponse = cache(async (): Promise<AllOffersResponse | null> => {
  try {
    const res = await fetchBackend("/client/api/all-offers/", {
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = (await res.json()) as AllOffersResponse;
    return data;
  } catch {
    return null;
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("all_offers");

  return buildMetadataFromSeo(seo, {
    twitterCard: "summary_large_image",
  });
}

export default async function AllOffers() {
  const data = await getAllOffersResponse();
  const page = data?.page;
  const seo = await getSeoMetadata("all_offers");

  return (
    <>
      <SeoHeadScripts html={seo?.Head_Scripts} debugId="all-offers" />

      <div className="min-h-screen bg-white">
        <main className="mx-auto bg-white md:container lg:container xl:container bg-white">
          {!page ? (
            <HomePageSkeleton />
          ) : (
            <>
              <Banner
                title={page?.banner_title}
                image={page?.banner_image}
                description={page?.banner_subtitle}
              />
              <Features />
              <WeekEscapes
                Weekly_deals_title={page?.Weekly_deals_title}
                Weekly_deals_subtitle={page?.Weekly_deals_subtitle}
                Weekly_hot_deal={page?.Weekly_hot_deal}
                Weekly_deals_hotels={page?.Weekly_deals_hotels}
                card_image={page?.card_image}
                add_title={page?.add_title}
                add_subtitle={page?.add_subtitle}
                add_link={page?.add_link}
              />
              <TrendingCarousel
                title={page?.deal_collection_title_1}
                deal_collection={page?.deal_collection_hotels_1}
              />
              <TrendingCarousel
                title={page?.deal_collection_title_2}
                deal_collection={page?.deal_collection_hotels_2}
              />
              <TrendingCarousel
                title={page?.deal_collection_title_3}
                deal_collection={page?.deal_collection_hotels_3}
              />
              <Coupons />
              <FAQs faqItems={page?.faqs}/>
              <ForFlight />
              <Broucher />
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

