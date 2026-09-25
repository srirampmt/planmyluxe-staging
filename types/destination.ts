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
  public_path?: string;
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
  flight_time?: string | { value?: string; detail?: string };
  time_difference?: string | { value?: string; detail?: string };
  currency?: string | { value?: string; detail?: string };
  language?: string | { value?: string; detail?: string };
  resorts_hierarchy?: Array<{
    name: string;
    latitude?: number | null;
    longitude?: number | null;
    href?: string;
    country?: number;
    region?: number;
    resort?: number;
    city?: number;
  }> | null;
  weather_data?: Array<{
    month_name?: string;
    month?: string;
    temperature?: string | number;
    temp?: string | number;
    metric?: "daily_max";
  }> | "" | null;
  highlights?: string;
  faqs?: DestinationFaq[] | "" | null;
  hierarchy_destination_id?: number | null;
  hierarchy_level?: "" | "country" | "region" | "resort";
  country_slug?: string;
  region_slug?: string;
  resort_slug?: string;
  country_name?: string;
  region_name?: string;
  resort_name?: string;
  public_path?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type DestinationPathResponse = {
  success: boolean;
  source?: "cms" | "hierarchy";
  page?: DestinationPage | null;
  error?: string;
};

export type DestinationResponse = {
  success: boolean;
  page?: DestinationPage | null;
  error?: string;
};
