import type {
  DestinationHotelsContent,
  DestinationHotelsDestination,
  DestinationHotelsFaq,
  DestinationPageTab,
} from "@/types/destinationHotels";

export type DestinationGuidePageType =
  | "places-to-visit"
  | "things-to-do"
  | "best-time-to-visit";

export type DestinationGuideContent = DestinationHotelsContent & {
  page_type: DestinationGuidePageType;
  label: string;
  body: string;
};

export type DestinationGuideResponse = {
  success: boolean;
  destination: DestinationHotelsDestination;
  content: DestinationGuideContent;
  faqs: DestinationHotelsFaq[];
  tabs: DestinationPageTab[];
  error?: string;
};
