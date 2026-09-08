import type { DestinationDealHotel, DestinationFaq } from "@/types/destination";
import type { MultiCentreSnapshot } from "@/types/homepage";

export type HolidayStyleTypeCard = {
  id?: number | string;
  name?: string;
  slug?: string;
  card_image?: string;
  card_subtitle?: string;
};

export type HolidayStylePage = {
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

  trending_deals_title_1?: string;
  trending_deals_subtitle_1?: string;
  trending_deals_1?: Array<DestinationDealHotel | string> | "" | null;

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

  add_card_image?: string;
  add_title?: string;
  add_subtitle?: string;
  add_link?: string;

  handpicked_deals_title?: string;
  handpicked_deals_subtitle?: string;
  handpicked_deals?: Array<DestinationDealHotel | string> | "" | null;

  // multi-centre holiday style only
  handpicked_multi_center_deals_title?: string;
  handpicked_multi_center_deals_subtitle?: string;
  handpicked_multi_center_deals?: MultiCentreSnapshot[] | "" | null;

  perfect_holiday_title?: string;
  perfect_holiday_subtitle?: string;
  perfect_holiday_types?: Array<HolidayStyleTypeCard | string> | "" | null;

  card_image?: string;
  card_subtitle?: string;
  active?: boolean;

  Meta_Title?: string;
  Meta_Description?: string;
  OG_Image?: string;
  Canonical_URL?: string;
  Twitter_Image?: string;
  Head_Scripts?: string;

  faqs?: DestinationFaq[] | "" | null;
};

export type HolidayStyleResponse = {
  success: boolean;
  page?: HolidayStylePage | null;
  error?: string;
};
