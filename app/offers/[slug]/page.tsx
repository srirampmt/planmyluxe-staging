import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import SeoHeadScripts from "@/components/seo/SeoHeadScripts";

import Banner from "@/components/Banner";
import Features from "@/components/Features";
import WeekEscapes from "@/components/WeekEscapes";
import WhybookwithPml from "@/components/WhybookwithPml";
import Signup from "@/components/Signup";
import Trustsection from "@/components/Trustsection";
import TrendingCarousel from "@/components/TrendingCarousel";
import FAQs from "@/components/faqs";
import Coupons from "@/components/offers/coupons";
import Explore from "@/components/destinationdetail/explore";

import HomePageSkeleton from "@/components/HomePageSkeleton";
import type { OfferTypeHotel, OfferTypeResponse } from "@/types/offerType";
import type { Deal, HotDeal } from "@/types/homepage";
import { fetchBackend } from "@/lib/backendFetch";
import { buildMetadataFromSeo, getSeoMetadata } from "@/lib/seo/metadata";
import OfferCards from "@/components/offers/offersCards";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function asArray<T>(value: T[] | "" | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function toDeal(input: OfferTypeHotel | null | undefined): Deal | null {
  if (!input) return null;
  return {
    id: typeof input.id === "number" ? input.id : 0,
    slug: input.slug ?? "",
    name: input.name ?? "",
    location: input.location ?? "",
    property_rating: input.property_rating ?? "",
    card_image: input.card_image ?? "",
    offer_tag_type: input.offer_tag_type ?? "",
    info_paragraph: input.info_paragraph ?? "",
    intro_text: input.intro_text ?? "",
    starting_price: input.starting_price != null ? String(input.starting_price) : undefined,
    hotel_status: input.hotel_status ?? true,
    offer_on_card: input.offer_on_card ?? "",
    api_url: input.api_url ?? undefined,
  };
}

function toHotDeal(input: OfferTypeHotel | null | undefined): HotDeal | null {
  const deal = toDeal(input);
  if (!deal) return null;
  return {
    ...deal,
    offer_header: deal.offer_on_card || "Hot Deal",
  };
}

const getOfferTypeResponse = cache(async (slug: string): Promise<OfferTypeResponse | null> => {
  async function fetchFrom(path: string): Promise<OfferTypeResponse | null> {
    try {
      const res = await fetchBackend(path, {
        cache: "no-store",
      });

      if (!res.ok) {
        return null;
      }

      const json = (await res.json()) as OfferTypeResponse;
      if (!json || (json as any).success !== true) return null;
      return json;
    } catch {
      return null;
    }
  }

  const encodedSlug = encodeURIComponent(slug);

  // Primary: legacy/expected endpoint
  const fromOffers = await fetchFrom(`/client/api/offertypes/${encodedSlug}/`);
  if (fromOffers) return fromOffers;

  // Fallback: canonical endpoint in this codebase
  return fetchFrom(`/client/api/offertypes/${encodedSlug}/`);
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getSeoMetadata("offertype", slug);

  return buildMetadataFromSeo(seo);
}

export default async function OfferTypePage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getOfferTypeResponse(slug);
  const page = data?.page;
  const seo = await getSeoMetadata("offertype", slug);
  if (!page) {
    notFound();
  }
  return (
    <>
      <SeoHeadScripts html={seo?.Head_Scripts} debugId="offer-type" />

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
              {slug !== "multi-centre" && (
                <WeekEscapes
                  Weekly_deals_title={page.Weekly_deals_title}
                  Weekly_deals_subtitle={page.Weekly_deals_subtitle}
                  Weekly_hot_deal={toHotDeal(page.Weekly_hot_deal)}
                  Weekly_deals_hotels={asArray(page.Weekly_deals_hotels)
                    .map((h) => toDeal(h))
                    .filter((d): d is Deal => Boolean(d))}
                  card_image={page.card_image}
                  add_title={page.add_title}
                  add_subtitle={page.add_subtitle}
                  add_link={page.add_link}
                />
              )}
              <Explore 
                explore_title_1={page?.explore_title_1}
                explore_subtitle_1={page?.explore_subtitle_1}
                explore_description_1={page?.explore_description_1}
                explore_image_1={page?.explore_image_1}
                explore_title_2={page?.explore_title_2}
                explore_subtitle_2={page?.explore_subtitle_2}
                explore_description_2={page?.explore_description_2}
                explore_image_2={page?.explore_image_2}
                explore_title_3={page?.explore_title_3}
                explore_subtitle_3={page?.explore_subtitle_3}
                explore_description_3={page?.explore_description_3}
                explore_image_3={page?.explore_image_3}
                explore_title_4={page?.explore_title_4}
                explore_subtitle_4={page?.explore_subtitle_4}
                explore_description_4={page?.explore_description_4}
                explore_image_4={page?.explore_image_4}
              />
              {slug !== "multi-centre" && (
                <TrendingCarousel
                  title={page.deal_collection_title}
                  deal_collection={asArray(page.deal_collection_hotels)}
                />
              )}
              {slug === "multi-centre" && (
              <OfferCards />
              )}
              <FAQs
                faqItems={asArray(page.faqs)
                  .map((f) => ({ question: f.question ?? "", answer: f.answer ?? "" }))
                  .filter((f) => Boolean(f.question) && Boolean(f.answer))}
              />
              <Coupons
                offercards={asArray(page.offer_cards).map((c) => ({
                  banner_title: c.title,
                  banner_image: c.image,
                  offer_card_title: c.title,
                  offer_card_content_1: c.subtitle,
                  offer_card_content_2: "",
                }))}
              />
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


