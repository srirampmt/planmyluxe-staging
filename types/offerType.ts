export type OfferTypeHotel = {
  intro_text: string;
  id?: number;
  slug?: string;
  name?: string;
  location?: string;
  property_rating?: string;
  card_image?: string;
  offer_tag_type?: string;
  info_paragraph?: string;
  starting_price?: string | number | null;
  hotel_status?: boolean;
  offer_on_card?: string;
  api_url?: string | null;
  
};

export type OfferTypeFaqItem = {
  question?: string;
  answer?: string;
};

export type OfferTypeOfferCard = {
  id?: number;
  title?: string;
  subtitle?: string;
  image?: string;
  link?: string;
  source?: string;
  data_type?: string;
};

export type OfferTypePage = {
  id?: number;
  slug?: string;

  // SEO/meta
  Meta_Title?: string;
  Meta_Description?: string;
  Canonical_URL?: string;
  OG_Image?: string;
  Twitter_Image?: string;
  Head_Scripts?: string;

  // Banner
  banner_image?: string;
  banner_title?: string;
  banner_subtitle?: string;

  // Weekly deals section
  Weekly_deals_title?: string;
  Weekly_deals_subtitle?: string;
  Weekly_hot_deal?: OfferTypeHotel | null;
  Weekly_deals_hotels?: OfferTypeHotel[] | "" | null;
  card_image?: string | null;
  add_title?: string;
  add_subtitle?: string;
  add_link?: string;

  // Explore section
  explore_title_1?: string;
  explore_subtitle_1?: string;
  explore_description_1?: string;
  explore_image_1?: string;
  explore_title_2?: string;
  explore_subtitle_2?: string;
  explore_description_2?: string;
  explore_image_2?: string;
  explore_title_3?: string;
  explore_subtitle_3?: string;
  explore_description_3?: string;
  explore_image_3?: string;
  explore_title_4?: string;
  explore_subtitle_4?: string;
  explore_description_4?: string;
  explore_image_4?: string;

  // Carousel
  deal_collection_title?: string;
  deal_collection_hotels?: OfferTypeHotel[] | "" | null;

  // FAQs / coupons
  faqs?: OfferTypeFaqItem[] | null;
  offer_cards?: OfferTypeOfferCard[] | null;

  // Allow backend to add additional keys without breaking builds.
  [key: string]: unknown;
};

export type OfferTypeResponse = {
  success?: boolean;
  page?: OfferTypePage;
  [key: string]: unknown;
};
