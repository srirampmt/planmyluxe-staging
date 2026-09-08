import type { StaticPricingData } from "@/types/hotel";

export type { StaticPricingData, StaticPricingSeason, StaticPricingDepartureGroup } from "@/types/hotel";

// manual/legacy mode: a plain number. builder mode: an object with actualPrice/referenceId,
// and offerPrice only when that date has an active offer.
export type McCalendarDayPrice = number | { actualPrice: number; offerPrice?: number; referenceId?: string };

export type McPageResponse = {
  slug: string;
  fallbackDepartureDate: string;
  page: {
    map_image: string;
    location: string;
    destinations: string[];
    offer_header: string;
    info_paragraph?: string;
    intro_text?: string;
    starting_price?: string;
    thumbnail_1?: string;
    thumbnail_2?: string;
    thumbnail_3?: string;
    pictures?: string[];
    Banner_Image_chips?: string;
    boardBasisLabel?: string;
    durationLabel?: string;
    hotels: Array<{ location: string; description: string; images: string[] }>;
  };
  sections: {
    // map_image: string;
    whats_included: any;
    similar_deals: Array<{
      id?: string;
      image?: string;
      location: string;
      title?: string;
      description?: string;
      extras?: string;
      property_rating?: number;
      starting_price?: string;
      slug?: string;
      offer_tag_type?: string;
      nights?: string;
      local_tax?: number;
      board_basis?: string;
    }>;
    discover_the_deal: string;
    fine_print: any;
    highlights: string;
    itinerary: any[];
    galleryImages: Array<{ alt: string; src: string }>;
  };
  pricing: {
    listOfAirports: number[];
    priceDataByAirport: Record<string, Record<string, Record<number, McCalendarDayPrice>>>;
    landingMonth?: string;
    localTax?: number;
    pricingSourceMode?: "manual" | "builder";
  };
};

export type McPricingData = Record<string, Record<number, number>>;

export type PriceData = Array<{
  date: string;
  price: number;
  localTax: number;
  totalPrice: number;
  hasCustomPrice: boolean;
  referenceId?: string;
}>;

export type CalendarMonth = {
  year: number;
  month: number;
  hasPrices: boolean;
};

// Normalized shape returned by GET /api/multi-centre/[slug]/pricing/default
export type McManualPricingResponse = {
  pricingSourceMode: "manual" | "builder";
  static: false;
  slug: string;
  defaultAirportId: string | number | null;
  landingMonth: string;
  listOfAirports: number[];
  localTax?: number;
  priceDataByAirport: Record<string, Record<string, Record<number, number>>>;
};

export type McStaticPricingResponse = {
  pricingSourceMode: "static";
  static: true;
  slug: string;
  staticPricingData: StaticPricingData;
  defaultDeal: unknown | null;
};

export type McDefaultPricingResponse = McManualPricingResponse | McStaticPricingResponse;