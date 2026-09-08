import type { Deal, HotDeal, MultiCentreSnapshot } from "@/types/homepage";
import type { FaqItem, OfferCard } from "@/types/allOffers";

export type TopTrendingHotel = {
  id?: number;
  slug?: string;
  name?: string;
  location?: string;
  property_rating?: string;
  offer_header?: string;
  info_paragraph?: string;
  card_image?: string;
  offer_tag_type?: string;
  offer_on_card?: string;
  api_url?: string;
  hotel_status?: boolean;
  starting_price?: string;
  intro_text?: string;
};

export type TopTrending20Page = {
  id: number;
  slug?: string;

  banner_image?: string;
  banner_title?: string;
  banner_subtitle?: string;

  Weekly_deals_title?: string;
  Weekly_deals_subtitle?: string;
  // toptrendingdeals/ sends a hotel-shaped deal; toptrendingmulticentre/ sends a MultiCentreSnapshot-shaped one.
  Weekly_hot_deal?: HotDeal | MultiCentreSnapshot | null;
  Weekly_deals_hotels?: Deal[];

  card_image?: string | null;
  add_title?: string;
  add_subtitle?: string;
  add_link?: string;

  // toptrendingdeals/ (hotel cards)
  trending_deals_title?: string;
  trending_deals_subtitle?: string;
  trending_deals_hotels?: TopTrendingHotel[];

  trending_deals_title_1?: string;
  trending_deals_subtitle_1?: string;
  trending_deals_hotels_1?: TopTrendingHotel[];

  trending_deals_title_2?: string;
  trending_deals_subtitle_2?: string;
  trending_deals_hotels_2?: TopTrendingHotel[];

  trending_deals_title_3?: string;
  trending_deals_subtitle_3?: string;
  trending_deals_hotels_3?: TopTrendingHotel[];

  // toptrendingmulticentre/ (multi-centre trip cards)
  trending_deals_multicentre_1?: MultiCentreSnapshot[];
  trending_deals_multicentre_2?: MultiCentreSnapshot[];
  trending_deals_multicentre_3?: MultiCentreSnapshot[];

  offer_cards?: OfferCard[];
  faqs?: FaqItem[];

  Meta_Title?: string;
  Meta_Description?: string;
  OG_Image?: string;
  Canonical_URL?: string;
  Twitter_Image?: string;
  Head_Scripts?: string;

  created_at?: string;
  updated_at?: string;
  metadata?: {
    generated_at?: string;
    data_type?: string;
  };
};

export type TopTrending20Response = {
  success: true;
  page: TopTrending20Page;
};
