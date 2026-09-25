export type DestinationHotelsFaq = {
  question: string;
  answer: string;
  order?: number;
  active?: boolean;
};

export type DestinationHotelAddon = {
  id?: number | string | null;
  icon?: string;
  image?: string;
  title?: string;
  description?: string;
  detailedDescription?: string;
  includes?: string[];
  price?: string;
  unit?: string;
};

export type DestinationHotelStyle = {
  id: string;
  key: string;
  label: string;
};

export type DestinationHotel = {
  id?: number | string;
  hotel_key?: string;
  slug: string;
  name: string;
  location?: string;
  property_rating?: string | number;
  card_image?: string;
  offer_header?: string;
  info_paragraph?: string;
  intro_text?: string;
  hotel_status?: boolean;
  offer_on_card?: string;
  Banner_Image_chips?: string;
  saveuptotext?: string;
  starting_price?: number;
  api_url?: string;
  holidaystyle_tags?: string;
  holiday_styles: DestinationHotelStyle[];
  offer_mode: boolean;
  expiredate?: string | null;
  addons: DestinationHotelAddon[];
  base_starting_price: number;
  hidden_price_sum: number;
  display_starting_price: number;
};

export type DestinationHotelSection = {
  id: string;
  key: string;
  label: string;
  hotel_slugs: string[];
};

export type DestinationHotelsContent = {
  id?: number;
  banner_image?: string;
  banner_title?: string;
  banner_subtitle?: string;
  intro_eyebrow?: string;
  intro_title?: string;
  intro_text?: string;
  intro_more?: string;
  Meta_Title?: string;
  Meta_Description?: string;
  OG_Image?: string;
  Canonical_URL?: string;
  Twitter_Image?: string;
  Head_Scripts?: string;
  active?: boolean;
  updated_at?: string | null;
};

export type DestinationHotelsDestination = {
  name: string;
  slug?: string;
  hierarchy_level: "country" | "region" | "resort";
  hierarchy_destination_id: number;
  country_slug: string;
  region_slug?: string;
  resort_slug?: string;
  country_name?: string;
  region_name?: string;
  resort_name?: string;
  public_path: string;
  hotels_path: string;
};

export type DestinationHotelsMetadata = {
  preferred_source: "auto_preferred_hotels";
  preferred_count: number;
  returned_count: number;
  missing_count: number;
  generated_at: string;
};

export type DestinationHotelsResponse = {
  success: boolean;
  source: "cms" | "hierarchy";
  destination: DestinationHotelsDestination;
  content?: DestinationHotelsContent | null;
  faqs: DestinationHotelsFaq[];
  hotels: DestinationHotel[];
  sections: DestinationHotelSection[];
  metadata: DestinationHotelsMetadata;
  error?: string;
};
