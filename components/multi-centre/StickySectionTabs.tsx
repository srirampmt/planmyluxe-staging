import ItinerarySection, { type ItineraryItem } from "@/components/multi-centre/ItinerarySection";
import Highlights from "./Highlights";
import WhatsIncluded from "./WhatsIncluded";
import { FeaturedPackageHotels } from "./FeaturedPackageHotels";

type HotelCard = {
  id?: string | number;
  location: string;
  description: string;
  images: string[];
  rating?: number;
  duration?: string;
  hotelName?: string;
  board?: string;
  extras?: string[];
};

type Props = {
  highlights: string;
  whatsIncluded: string;
  itinerary: ItineraryItem[];
  hotels: HotelCard[];
};

export default function StickySectionTabs({
  highlights,
  whatsIncluded,
  itinerary,
  hotels,
}: Props) {
  return (
    <div className="!mt-2">
      <div className="grid grid-cols-1">
        <section
          id="mc-highlights"
          className="scroll-mt-[calc(var(--main-nav-height)+52px)] rounded-[16px] border border-[#EDEDED] bg-white p-4 shadow-xs md:p-6"
        >
          <Highlights highlights={highlights} />
        </section>

        <section
          id="whats-included"
          className="scroll-mt-[calc(var(--main-nav-height)+52px)] mt-8 rounded-[16px] border border-[#EDEDED] bg-white p-4 shadow-xs md:p-6"
        >
          <WhatsIncluded whatsIncluded={whatsIncluded} />
        </section>
      </div>

      <section id="mc-itinerary" className="scroll-mt-[calc(var(--main-nav-height)+52px)] mt-8">
        <div className="overflow-hidden rounded-[16px] border border-[#EDEDED] bg-white">
          <div className="max-h-[500px] overflow-y-auto p-4">
            <ItinerarySection itinerary={itinerary} />
          </div>
        </div>
      </section>

      <section id="hotel-details" className="scroll-mt-[calc(var(--main-nav-height)+52px)] mt-8">
        <FeaturedPackageHotels hotels={hotels} />
      </section>
    </div>
  );
}
