import type { Deal, HotDeal } from "@/types/homepage";

export type FaqItem = {
  question: string;
  answer: string;
  order?: number;
  active?: boolean;
};

export type OfferCard = {
  source?: string;
  slug?: string;
  banner_title?: string;
  banner_image?: string;
  offer_card_title?: string;
  offer_card_content_1?: string;
  offer_card_content_2?: string;
};

export type AllOffersPage = {
  id: number;
  slug?: string;

  banner_image?: string;
  banner_title?: string;
  banner_subtitle?: string;

  Weekly_deals_title?: string;
  Weekly_deals_subtitle?: string;
  Weekly_hot_deal?: HotDeal | null;
  Weekly_deals_hotels?: Deal[];

  card_image?: string | null;
  add_title?: string;
  add_subtitle?: string;
  add_link?: string;

  deal_collection_title_1?: string;
  deal_collection_hotels_1?: Deal[];

  deal_collection_title_2?: string;
  deal_collection_hotels_2?: Deal[];

  deal_collection_title_3?: string;
  deal_collection_hotels_3?: Deal[];

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

export type AllOffersResponse = {
  success: true;
  page: AllOffersPage;
};
