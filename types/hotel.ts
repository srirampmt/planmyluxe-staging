// ==================== HOTEL API TYPES ====================

export interface HotelDeal {
  totalPrice: number;
  // auto:false deals omit these top-level fields
  tradingNameId?: string;
  preferred?: boolean;
  premium?: boolean;
  quoteReference?: string;

  // Rich text notes about the deal
  Notes?: string;

  hotel: {
    checkInDate: string; // ISO format "2026-01-16"
    boardBasis: string; // auto:true → "HB"/"AI" text code; auto:false → "3"/"5" numeric string
    availableBoardBasis?: string; // comma-separated codes for this deal, e.g. "SC,HB,FB,BB,RO"
    // auto:true fields
    duration?: number;
    rating?: string;
    hotelName?: string;
    resortName?: string;
    hotelId?: string;
    clientHotelId?: string;
    giataId?: string;
    airportCode?: string;
    rooms?: Array<{
      id: number;
      adults: number;
      children: number;
      supplierName: string;
      hotelSupplierId: string;
      type: string;
      nonRefundable: number;
    }>;
    // auto:false fields
    nights?: string;       // string "4" — use when duration is absent
    fromAirport?: string;  // numeric ID string "14" — use when flight.departureAirportCode is absent
    landingMonth?: string; // "202606"
  };

  // auto:false deals have no flight object
  flight?: {
    outboundFlightSupplier: string; // Airline code "FR", "U2"
    inboundFlightSupplier: string;
    outboundFlightNumber: string;
    inboundFlightNumber: string;
    departureAirportCode: string;
    arrivalAirportCode: string;
    outboundDepartureDate: string; // ISO DateTime
    outboundArrivalDate: string;
    inboundDepartureDate: string;
    inboundArrivalDate: string;
    adultBagPrice: string; // String "50.00"
    childBagPrice: string;
    inboundLegCount: string;
    outboundLegCount: string;
    inboundDirect: string; // "Y" or "N"
    outboundDirect: string;
    inboundFlightDuration: string; // Minutes as string
    outboundFlightDuration: string;
  };
  
  customPricing: {
    hasCustomPrice: boolean; // KEY FLAG for custom pricing
    customPrice: number | null;
    hidden_price_sum?: number; // sum of active free add-ons' hidden_price, only present while the hotel's offer is active
    custom_search_data?: {
      departure_airports: Array<{
        id: string;
        text: string;
      }>;
      board_basis_multiple?: Array<{
        id: string;
        code: string;
        text?: string;
      }>;
      duration: string[];
    };
    selected_params?: {
      departure_id?: string | number;
      duration?: string | number;
      board_basis?: string | number;
    };

    force_default_pricing?: boolean;
  };

  // Live API tourist tax — amount is per room for the full stay; divide by adults for per-person
  touristTax?: {
    amount: number;
    currency: string;
    formatted: string; // may be garbled from backend encoding — do not render directly
    per_night_equivalent: number;
    breakdown: Array<{
      rule_description: string;
      amount: number;
      calculation_detail: string;
    }>;
  };
}

export interface SearchParams {
  tradingNameId: string;
  dateMin: string;
  dateMax: string;
  durationMin: string;
  durationMax: string;
  adults: number;
  children: number;
  hotelKey: string;
  destinationId: string;
  timeout: number;
  boardBasisId: number[];
  departureId: string;
  seats: number;
}

export interface HotelAddon {
  id: number;
  icon: string;               // lucide-react icon name e.g. "BedDouble"
  image: string;
  title: string;
  description: string;
  detailedDescription: string;
  includes: string[];
  price: string;              // "Free", "£20" etc.
  unit: string;               // "", "/person/night", "/day" etc.
}

export interface HotelGoogleReview {
  author: string;
  text: string;
  rating: number;
  relative_time: string;
}

export interface HotelPageData {
  hotel_name: string;
  slug: string;
  hotelKey: string;
  api_url: string;
  offer_header: string;
  location: string;
  location_detail: string;
  starting_price: string;
  info_paragraph: string;
  intro_text?: string;
  hotel_destinations: string;
  hotel_holidaystyles: string;
  destination_tags: string;
  holidaystyle_tags: string;
  offer_tags: string;
  saveuptotext: string;
  headline_review: string;
  property_rating: string;

  // Offer mode
  offer_mode: boolean;
  expiredate: string;
  addons: HotelAddon[];

  // Rich text HTML fields
  about_the_deal?: string;         // present when offer_mode === false
  offer_about_the_deal?: string;   // present when offer_mode === true
  why_we_love_this_hotel: string;
  about_the_hotel: string;
  facilities: string;
  fine_print: string;
  
  // Images
  pictures: string[];
  thumbnail_1: string;
  thumbnail_2: string;
  thumbnail_3: string;
  card_image: string;
  
  // TripAdvisor
  trip_advisor_rating: string;
  trip_advisor_reviews: string;
  trip_advisor_reviews_last_updated_date: string;
  trip_advisor_reviews_rating: string;

  // Google
  address?: string;
  latitude?: string;
  longitude?: string;
  google_rating?: string;
  google_review_count?: number;
  google_reviews?: HotelGoogleReview[];

  // Tax
  Tax_per_night?: number;
  tax_country?: string;
  tax_city?: string;
  property_room_count?: number | null;

  // Maps and coordinates
  hotel_cordinates: string;

  // Tags
  tag_list: string[];

  // Metadata
  offer_tag_type: string;
  offer_on_card: string;
  hotel_status: boolean;
  Banner_Image_chips: string;
  created_by?: string;
  updated_by?: string;
  
  // SEO
  Meta_Title: string;
  Meta_Description: string;
  OG_Image: string;
  Canonical_URL: string;
  Twitter_Image: string;
  Head_Scripts: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // FAQs
  faqs: Array<{
    question: string;
    answer: string;
    order: number;
    active: boolean;
  }>;
  
  // Related deals
  popular_deals_hotels: any[];
  trending_deal_title: string;
  trending_deal_subtitle: string;
  trending_deal_list: any[];
  popular_deals_title: string;
  popular_deals_subtitle: string;
}

export interface HotelPageResponse {
  page: HotelPageData;
  /**
   * Optional compact filter metadata provided by the content endpoint.
   * When present, the live deals endpoint can omit repeated custom_search_data on each deal.
   */
  custom_search_data?: {
    departure_airports: string[];
    duration: string[];
    primary_month?: string | null;
  };
  api_data: {
    default_deal: HotelDeal;
    api_deals: {
      Results: HotelDeal[];
      Search: SearchParams;
      static?: StaticPricingData;
    };
    slug: string;
  };
}

export interface StaticPricingSeason {
  name: string;
  dates: string;
  price: string;
}

export interface StaticPricingDepartureGroup {
  price: string;
  dates: string[];
}

export interface StaticPricingData {
  totalDuration: string;
  fromPrice: string;
  seasons: StaticPricingSeason[];
  departureDates: StaticPricingDepartureGroup[];
  localTaxes: string[];
}

// ==================== DEAL PROCESSING TYPES ====================

export interface ProcessedDeal {
  price: number;
  deal: HotelDeal;
  isDefault: boolean;
  hasCustomPrice: boolean;
}

export interface DealsByDate {
  [date: string]: ProcessedDeal;
}

// ==================== ENQUIRY FORM TYPES ====================

export interface EnquiryFormData {
  firstName: string;
  email: string;
  phone: string;
  enquiry: string;
  enquiry_source: string;
  badge_text: string;
  quote_reference: string;
  deal_data_json: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utmid: string;
  utm_is_organic: '0' | '1';
  'accept-terms-conditions': ''; // Honeypot field (must be empty)
}

export interface EnquiryResponse {
  success: boolean;
  message?: string;
  enquiry_id?: number;
  error?: string;
}

// ==================== SEARCH UPDATE TYPES ====================

export interface SearchUpdatePayload {
  hotelKey: string;
  departure: string;
  boardBasis: string;
  duration: string;
  adults: number;
  children: number;
}

export interface SearchUpdateResponse {
  success: boolean;
  data?: {
    success: boolean;
    api_data?: {
      default_deal?: HotelDeal;
      api_deals: {
        Results: HotelDeal[];
        Search: SearchParams;
      };
      slug?: string;
    };
    auto?: boolean;
  };
  error?: string;
  backendStatus?: number;
}

// ==================== COMPONENT PROP TYPES ====================

export interface FilterOptions {
  departureAirports: Array<{
    id: string;
    text: string;
  }>;
  boardBasis: Array<{
    id: string;
    code: string;
    text: string;
  }>;
  durations: string[];
}

export interface CalendarCellData {
  date: string;
  price: number | null;
  hasCustomPrice: boolean;
  isSelected: boolean;
  isPast: boolean;
  hasDeal: boolean;
}
