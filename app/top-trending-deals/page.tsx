import type { Metadata } from "next";
import { cache } from "react";
import SeoHeadScripts from "@/components/seo/SeoHeadScripts";

import Banner from "@/components/Banner";
import Features from "@/components/Features";
import HomePageSkeleton from "@/components/HomePageSkeleton";
import Signup from "@/components/Signup";
import Trustsection from "@/components/Trustsection";
import FAQs from "@/components/faqs";
import AgentsProfile from "@/components/offers/agentsprofile";
import Coupons from "@/components/offers/coupons";
import OfferdealsOne from "@/components/offers/OfferdealsOne";
import OfferdealsTwo from "@/components/offers/OfferdealsTwo";
import OfferdealsThree from "@/components/offers/OfferdealsThree";
import type { TopTrending20Response } from "@/types/topTrending20";
import WeeklyDeal from "@/components/offers/WeeklyDeal";
import { fetchBackend } from "@/lib/backendFetch";
import { buildMetadataFromSeo, getSeoMetadata } from "@/lib/seo/metadata";

// ISR: cache this route for 10 minutes
export const revalidate = 600;

const getTopTrending20Response = cache(async (): Promise<TopTrending20Response | null> => {
  try {
    const res = await fetchBackend("/client/api/toptrendingdeals/", {
      next: { revalidate: 600 },
      // cache:"no-store",
    });

    if (!res.ok) return null;
    const data = (await res.json()) as TopTrending20Response;
    return data;
  } catch {
    return null;
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("top_trending_destinations");

  return buildMetadataFromSeo(seo, {
    twitterCard: "summary_large_image",
  });
}

export default async function TopTrending20() {
  const data = await getTopTrending20Response();
  const page = data?.page;
  const seo = await getSeoMetadata("top_trending_destinations");
  return (
    <>
      <SeoHeadScripts html={seo?.Head_Scripts} debugId="top-trending-20" />

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
                priority
              />
              <Features />
              <WeeklyDeal
                Weekly_deals_title={page?.Weekly_deals_title}
                Weekly_deals_subtitle={page?.Weekly_deals_subtitle}
                Weekly_hot_deal={page?.Weekly_hot_deal}
                card_image={page?.card_image}
                add_title={page?.add_title}
                add_subtitle={page?.add_subtitle}
                add_link={page?.add_link}
              />
              {Array.isArray(page?.trending_deals_hotels_1) && page.trending_deals_hotels_1.length > 0 && (
                <OfferdealsOne 
                  title={page?.trending_deals_title ?? page?.trending_deals_title_1} 
                  subtitle={page?.trending_deals_subtitle ?? page?.trending_deals_subtitle_1} 
                  hotels={page?.trending_deals_hotels ?? page?.trending_deals_hotels_1} 
                />
              )}
              <Coupons offercards={page?.offer_cards} />
              {Array.isArray(page?.trending_deals_hotels_2) && page.trending_deals_hotels_2.length > 0 && (
                <OfferdealsTwo
                  title={page?.trending_deals_title ?? page?.trending_deals_title_2} 
                  subtitle={page?.trending_deals_subtitle ?? page?.trending_deals_subtitle_2} 
                  hotels={page?.trending_deals_hotels ?? page?.trending_deals_hotels_2} 
                />
              )}
              {Array.isArray(page?.trending_deals_hotels_3) && page.trending_deals_hotels_3.length > 0 && (
                <OfferdealsThree
                  title={page?.trending_deals_title ?? page?.trending_deals_title_3} 
                  subtitle={page?.trending_deals_subtitle ?? page?.trending_deals_subtitle_3} 
                  hotels={page?.trending_deals_hotels ?? page?.trending_deals_hotels_3} 
                />
              )}
              <FAQs faqItems={page?.faqs} />
              {/* <AgentsProfile /> */}
              <Signup />
              <Trustsection />
            </>
          )}
        </main>
      </div>
    </>
  );
}
