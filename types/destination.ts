export type DestinationDealHotel = {
  id?: number | string;
  slug?: string;
  name?: string;
  location?: string;
  property_rating?: string | number;
  card_image?: string;
  offer_header?: string;
  offer_tag_type?: string;
  info_paragraph?: string;
  hotel_status?: boolean;
  offer_on_card?: string;
  api_url?: string;
  intro_text?: string;
};

export type DestinationSummary = {
  id?: number | string;
  name?: string;
  slug?: string;
  banner_image?: string;
  card_image?: string;
  card_subtitle?: string;
  active?: boolean;
};

export type DestinationFaq = {
  question?: string;
  answer?: string;
  order?: number;
  active?: boolean;
};

export type DestinationPage = {
  id?: number;
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

  title_1?: string;
  description_1?: string;
  title_2?: string;
  description_2?: string;
  title_3?: string;
  description_3?: string;
  title_4?: string;
  description_4?: string;

  destination_deals_title_1?: string;
  destination_deals_1?: Array<DestinationDealHotel | string> | "" | null;

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

  map_iframe?: string;

  Weather_title?: string;
  Weather_subtitle?: string;
  season_card_image_1?: string;
  season_card_title_1?: string;
  season_card_description_1?: string;
  season_card_image_2?: string;
  season_card_title_2?: string;
  season_card_description_2?: string;
  season_card_image_3?: string;
  season_card_title_3?: string;
  season_card_description_3?: string;
  season_card_image_4?: string;
  season_card_title_4?: string;
  season_card_description_4?: string;

  handpicked_deals_title?: string;
  handpicked_deals_subtitle?: string;
  handpicked_deals?: Array<DestinationDealHotel | string> | "" | null;

  similar_destinations_title?: string;
  similar_destinations?: Array<DestinationSummary | string> | "" | null;

  Meta_Title?: string;
  Meta_Description?: string;
  OG_Image?: string;
  Canonical_URL?: string;
  Twitter_Image?: string;
  Head_Scripts?: string;

  faqs?: DestinationFaq[] | "" | null;
};

export type DestinationResponse = {
  success: boolean;
  page?: DestinationPage | null;
  error?: string;
};
