export type FilterOption = {
  value: string;
  label: string;
  count?: number;
};

export type HomePageResponse = {
  success: true;
  page: HomePage;
};

export type HomePage = {
  id: number;

  banner_image: string;
  banner_title: string;
  banner_subtitle: string;

  chat_title?: string;
  chat_subtitle?: string;

  offers_title: string;
  offers_subtitle: string;
  offer_1_image: string;
  offer_1_title: string;
  offer_1_subtitle: string;
  offer_1_url: string;
  offer_2_image: string;
  offer_2_title: string;
  offer_2_subtitle: string;
  offer_2_url: string;
  offer_3_image: string;
  offer_3_title: string;
  offer_3_subtitle: string;
  offer_3_url: string;
  offer_4_image: string;
  offer_4_title: string;
  offer_4_subtitle: string;
  offer_4_url: string;

  Weekly_deals_title: string;
  Weekly_deals_subtitle: string;
  Weekly_hot_deal: HotDeal;
  Weekly_deals_hotels: Deal[];

  multicentre_collection_title: string;
  multicentre_collection_snapshots: MultiCentreSnapshot[];

  card_image?: string;
  add_title?: string;
  add_subtitle?: string;
  add_link?: string;

  deal_collection_title: string;
  deal_collection_tag_1: string;
  tag_1_deals: Deal[];
  deal_collection_tag_2: string;
  tag_2_deals: Deal[];
  deal_collection_tag_3: string;
  tag_3_deals: Deal[];
  deal_collection_tag_4: string;
  tag_4_deals: Deal[];
  deal_collection_tag_5: string;
  tag_5_deals: Deal[];
  deal_collection_tag_6: string;
  tag_6_deals: Deal[];

  Desination_collection_title: string;
  Destination_collection_description?: string;
  Destination_collection_tag_1: string;
  tag_1_destination: Destination[];
  Destination_collection_tag_2: string;
  tag_2_destination: Destination[];
  Destination_collection_tag_3: string;
  tag_3_destination: Destination[];
  Destination_collection_tag_4: string;
  tag_4_destination: Destination[];
  Destination_collection_tag_5: string;
  tag_5_destination: Destination[];
  Destination_collection_tag_6: string;
  tag_6_destination: Destination[];

  perfect_holiday_title: string;
  perfect_holiday_subtitle: string;
  perfect_holiday_types: HolidayType[];

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

export type HotDeal = Deal & {
  offer_header: string;
  starting_price?: string;
  durationMax?: number;
};

export type Deal = {
  id: number;
  slug: string;
  name: string;
  title?: string;
  location: string;
  property_rating: string;
  card_image: string;
  offer_tag_type: string;
  info_paragraph: string;
  intro_text?: string;
  extras?: string;
  price?: string;
  hotel_status: boolean;
  offer_on_card: string;
  api_url?: string;
  starting_price?: string;
  durationMax?: number;
};

export type MultiCentreSnapshot = {
  id: string;
  image: string;
  location: string;
  title: string;
  intro_text?: string;
  extras?: string;
  property_rating: number;
  starting_price: string;
  slug: string;
  offer_tag_type?: string;
  tag_for_card?: string;
  nights: string;
  local_tax?: number;
  board_basis?: string;
};

export type Destination = {
  id: number;
  name: string;
  slug: string;
  banner_image: string;
  active: boolean;
};

export type HolidayType = {
  id: number;
  name: string;
  slug: string;
  card_image: string;
  card_subtitle: string;
};
