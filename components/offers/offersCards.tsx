"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CircleChevronRight } from "lucide-react";

type TrendingCarouselDeal = {
  id?: number | string;
  image?: string;
  badge?: string;
  location?: string;
  title?: string;
  extras?: string;
  price?: string | null;
  slug?: string;
  api_url?: string | null;
  property_rating?: string | number;
  offer_tag_type?: string;
  starting_price?: string | null;
  local_tax?: number;
  nights?: number | string;
  board_basis?: string;
  description?: string;
};
const offers: TrendingCarouselDeal[] = [
  {
    id: "1",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/vienna-budapest/Vienna1.webp",
    location: "Vienna, Budapest",
    title: "Vienna & Budapest with Iconic Experiences",
    extras: "Vienna - 2 Nights | Budapest - 2 Nights",
    property_rating: 4,
    starting_price: "269",
    slug: "vienna-budapest",
    offer_tag_type: "",
    nights: "4",
    local_tax: 0,
    board_basis: "Bed & Breakfast",
    description: "Experience Vienna’s grand elegance and Budapest’s riverside beauty.\n4★ hotels, guided city tour and a magical Buda Castle evening tour."
  },
  {
    id: "2",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/prague-vienna-budapest/Prague-2.webp",
    location: "Prague, Budapest",
    title: "Prague & Budapest featuring Charles Bridge & Buda Castle",
    extras: "Prague - 2 Nights | Budapest - 2 Nights",
    property_rating: 4,
    starting_price: "289",
    slug: "prague-budapest",
    offer_tag_type: "",
    nights: "4",
    local_tax: 0,
    board_basis: "Bed & Breakfast",
    description: "Experience Prague’s storybook charm and Budapest’s grand riverside elegance.\n4★ hotels, guided tours and a mysterious Buda Castle evening experience.",
  },
  {
    id: "3",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/prague-krakow/Thumbnail_1.webp",
    location: "Prague, Krakow",
    title: "Prague & Krakow: Castles, Kings & Salt Mine Wonders",
    extras: "Prague - 2 Nights | Krakow - 2 Nights",
    property_rating: 4,
    starting_price: "299",
    slug: "prague-krakow",
    offer_tag_type: "",
    nights: "4",
    local_tax: 5,
    board_basis: "Bed & Breakfast"
  },
  {
    id: "4",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/prague-vienna/Prague_2.webp",
    location: "Prague, Vienna",
    title: "Prague & Vienna featuring Charles Bridge & Schönbrunn Palace",
    extras: "Prague - 2 Nights | Vienna - 2 Nights",
    property_rating: 4,
    starting_price: "339",
    slug: "prague-vienna",
    offer_tag_type: "",
    nights: "4",
    local_tax: 0,
    board_basis: "Bed & Breakfast",
    description: "Experience Prague’s fairytale beauty and Vienna’s timeless elegance.\n4★ hotels, guided walking tours and scenic rail travel included.",
  },
  {
    id: "5",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/venice-rome/venice.webp",
    location: "Venice, Rome",
    title: "Gondolas, Piazzas & Eternal Wonders",
    extras: "Venice - 2 Nights | Rome - 2 Nights",
    property_rating: 4,
    starting_price: "339",
    slug: "venice-rome",
    offer_tag_type: "",
    nights: "4",
    local_tax: 0,
    board_basis: "Bed & Breakfast",
    description: "Experience Venice’s enchanting waterways and Rome’s grand history.\n4★ hotels, gondola ride and Pantheon skip-the-line entry included.",
  },
  {
    id: "6",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/porto-lisbon/exc.webp",
    location: "Lisbon, Porto",
    title: "Lisbon & Porto: Cultural Charm & Riverside Sunset",
    extras: "Lisbon - 2 Nights | Porto - 2 Nights",
    property_rating: 4,
    starting_price: "339",
    slug: "lisbon-porto",
    offer_tag_type: "",
    nights: "4",
    local_tax: 11,
    board_basis: "Bed & Breakfast",
    description: "Experience the culture of Lisbon and the riverside magic of Porto.\n4★ hotels, rail travel and a spectacular Douro sunset cruise included."
  },
  {
   id: "7",
   image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/barcelona-madrid-lisbon/Barcelona1.webp",
   location: "Barcelona, Madrid",
   title: "Barcelona & Madrid Uncovered: A Journey of Culture, Colour & Passion",
   extras: "Barcelona - 3 Nights | Madrid - 3 Nights",
   property_rating: 3,
   starting_price: "379",
   slug: "barcelona-madrid",
   offer_tag_type: "",
   nights: "06",
   local_tax: 13,
   board_basis: "Bed & Breakfast",
   description: "Experience the vibrant soul of Spain with a seamless journey through two of its most iconic cities. From Barcelona’s artistic charm to Madrid’s cultural elegance, this twin-centre escape offers the perfect blend of discovery and relaxation..", 
  },
  {

    id: "8",

    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/krakow-warsaw/Krakow_2.webp",

    location: "Krakow, warsaw",

    title: "Elegant Poland Escape: Discover Krakow’s Old Town charm and Warsaw’s vibrant culture on a stylish twin-centre journey",

    extras: "Krakow - 3 Nights | Warsaw - 3 Nights",

    property_rating: 5,

    starting_price: "399",

    slug: "krakow-warsaw",

    offer_tag_type: "",

    nights: "06",

    local_tax: 16,

    board_basis: "Bed & Breakfast",

    description: "A perfect blend of history and culture, this Krakow & Warsaw twin-centre escape showcases Poland’s timeless charm and vibrant capital.",

  },
  {
    id: "9",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/porto-lisbon/Lisbon1.webp",
    location: "Porto, Lisbon",
    title: "From Porto’s Wine Heritage to Lisbon’s Vibrant Culture",
    extras: "Porto - 2 Nights | Lisbon - 2 Nights",
    property_rating: 4,
    starting_price: "399",
    slug: "porto-lisbon",
    offer_tag_type: "",
    nights: "4",
    local_tax: 0,
    board_basis: "Bed & Breakfast",
    description: "Experience Porto’s riverside beauty and Lisbon’s timeless charm.\n4★ hotels, Douro sunset cruise and guided city tour included.",
  },
  {
    id: "10",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/las-palmas-maspalomas/Gran_Canaria.webp",
    location: "Las Palmas, Maspalomas",
    title: "Las Palmas & Maspalomas Twin-Centre Holiday: Cultural City Stay & Gran Canaria Dunes Escape",
    extras: "Las Palmas - 3 Nights | Maspalomas - 4 Nights",
    property_rating: 4,
    starting_price: "419",
    slug: "las-palmas-maspalomas",
    offer_tag_type: "",
    nights: "07",
    local_tax: 1,
    board_basis: "Bed & Breakfast",
    description: "This Las Palmas & Maspalomas twin-centre holiday offers a perfect blend of culture, adventure and relaxation.",
  },
  {

    id: "11",

    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/smy-lisboa/1.webp",

    location: "Lisbon, Madeira",

    title: "Lisbon & Madeira Getaway: Sail, Celebrate & Escape to Nature",

    extras: "Lisbon - 3 Nights | Madeira - 3 Nights",

    property_rating: 4,

    starting_price: "449",

    slug: "lisbon-madeira",

    offer_tag_type: "",

    nights: "06",

    local_tax: 16,

    board_basis: "Bed & Breakfast",

    description: "A perfect blend of Lisbon’s vibrant city life and Madeira’s breathtaking natural beauty on an unforgettable twin-centre escape..",

  },
  {

    id: "12",

    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/paris-nice/Paris.webp",

    location: "Paris, Nice",

    title: "Paris & Nice Twin-Centre Holiday: Romantic City Break & French Riviera Escape",

    extras: "Paris - 3 Nights | Nice - 3 Nights",

    property_rating: 4,

    starting_price: "469",

    slug: "paris-nice",

    offer_tag_type: "",

    nights: "06",

    local_tax: 29,

    board_basis: "Bed & Breakfast",

    description: "Experience the perfect blend of romance and coastal charm with a twin-centre escape to Paris and Nice.",

  },
  {
   id: "13",
   image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/paris-venice/1.webp",
   location: "Paris, Venice",
   title: "Paris & Venice: A Signature Journey of Romance & Elegance",
   extras: "Paris - 4 Nights | Venice - 5 Nights",
   property_rating: 5,
   starting_price: "499",
   slug: "paris-venice",
   offer_tag_type: "",
   nights: "6",
   local_tax: 27,
   board_basis: "Bed & Breakfast",
   description: "Experience the romance of Paris and the timeless charm of Venice on a seamless European escape filled with iconic sights, scenic cruises, and unforgettable cultural moments. Perfect for couples and first-time visitors, this journey blends elegance, history, and immersive experiences across two of Europe’s most enchanting cities..",
  },
  {
    id: "14",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/prague-vienna-budapest/Prague-2.webp",
    location: "Prague, Vienna, Budapest",
    title: "Imperial Europe-Prague, Vienna & Budapest with Signature Sightseeing",
    extras: "Prague - 3 Nights | Vienna - 2 Nights | Budapest - 3 Nights",
    property_rating: 4,
    starting_price: "519",
    slug: "prague-vienna-budapest",
    offer_tag_type: "",
    nights: "8",
    local_tax: 18,
    board_basis: "Bed & Breakfast",
    description: "Experience the charm of Prague, the elegance of Vienna and the energy of Budapest.\n4★ hotels, guided city tours and unforgettable cultural experiences."
  },
  {
    id: "15",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/dubrovnik-split/Thumbnail_1.webp",
    location: "Dubrovnik, Split",
    title: "Dubrovnik & Split Twin Centre Holiday: Old Town Charm & Adriatic Coastlines",
    extras: "Dubrovnik - 3 Nights | Split - 3 Nights",
    property_rating: 4,
    starting_price: "529",
    slug: "dubrovnik-split",
    offer_tag_type: "",
    nights: "6",
    local_tax: 12,
    board_basis: "Bed & Breakfast",
    description: "This Dubrovnik & Split twin-centre holiday combines Croatia’s most iconic destinations in one seamless itinerary. With guided tours, scenic coastal travel and comfortable 4★ stays, this holiday offers the perfect mix of culture, relaxation and Adriatic beauty.",
  },
  {
    id: "16",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/venice-florence-rome/venice.webp",
    location: "VENICE, FLORENCE, ROME",
    title: "Venice, Florence & Rome with Curated Experiences",
    extras: "Venice - 2 Nights | Florence - 2 Nights | Rome - 2 Nights",
    property_rating: 4,
    starting_price: "549",
    slug: "venice-florence-rome",
    offer_tag_type: "",
    nights: "6",
    local_tax: 0,
    board_basis: "Bed & Breakfast",
    description: "Experience the romance of Venice, the art of Florence and the history of Rome.\n4★ hotels, scenic rail journeys and unforgettable guided experiences included."
  },
  {
    id: "17",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/casual-kubic-athens/Athens.webp",
    location: "Athens, Istanbul, Turkey-Beach",
    title: "Ancient Wonders to Coastal Luxury — Experience Greece & Turkey in Style",
    extras: "Athens - 2 Nights | Istanbul - 2 Nights | Antalya - 3 Nights",
    property_rating: 4,
    starting_price: "559",
    slug: "athens-istanbul-turkey-beach",
    offer_tag_type: "",
    nights: "07",
    local_tax: 9,
    board_basis: "Bed & Breakfast",
    description: "Discover timeless landmarks in Athens before diving into the vibrant culture of Istanbul. Then slow down and soak up the Mediterranean charm of Antalya. One perfectly planned journey combining history, culture and beachside relaxation.",
  },
  {
    id: "18",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/barcelona-costa-brava/Barcelona.webp",
    location: "Barcelona, Costa Brava",
    title: "Barcelona & Costa Brava Twin-Centre Holiday: City Culture & Mediterranean Beach Escape",
    extras: "Barcelona - 3 Nights | Costa Brava - 4 Nights",
    property_rating: 4,
    starting_price: "569",
    slug: "barcelona-costa-brava",
    offer_tag_type: "",
    nights: "7",
    local_tax: 15,
    board_basis: "Bed & Breakfast",
    description: "This Barcelona & Costa Brava twin-centre holiday combines the cultural highlights of Barcelona with the relaxing coastal beauty of Costa Brava. With guided tours, scenic boat trips and comfortable 4★ stays, this itinerary offers the perfect mix of exploration and relaxation.",
  },
  {
    id: "19",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/tenerife-south-tenerife-north/Thumbnail_1.webp",
    location: "Tenerife South, Tenerife North",
    title: "Tenerife Twin-Centre Holiday: South & North Escape with Teide Tour & La Laguna Experience",
    extras: "Tenerife South - 4 Nights | Tenerife North - 3 Nights",
    property_rating: 4,
    starting_price: "589",
    slug: "tenerife-south-tenerife-north",
    offer_tag_type: "",
    nights: "7",
    local_tax: 0,
    board_basis: "Bed & Breakfast",
    description: "This Tenerife twin-centre holiday combines the best of both worlds – the lively beaches of Tenerife South and the cultural charm of Tenerife North.",
  },
  {
    id: "20",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/rome-amalfi-coast/Thumbnail_1.webp",
    location: "Rome, Amalfi Coast",
    title: "Rome & Amalfi Coast: Colosseum Legends & Amalfi Coast Serenity",
    extras: "Rome - 3 Nights | Amalfi Coast - 4 Nights",
    property_rating: 4,
    starting_price: "589",
    slug: "rome-amalfi-coast",
    offer_tag_type: "",
    nights: "7",
    local_tax: 32,
    board_basis: "Bed & Breakfast"
  },
  {
    id: "21",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/amsterdam-berlin-prague/Amsterdam_1.webp",
    location: "Amsterdam, Berlin, Prague",
    title: "Amsterdam, Berlin & Prague Multi-Centre Holiday: Iconic Cities & Cultural Highlights",
    extras: "Amsterdam - 2 Nights | Berlin - 2 Nights | Prague - 2 Nights",
    property_rating: 4,
    starting_price: "599",
    slug: "amsterdam-berlin-prague",
    offer_tag_type: "",
    nights: "6",
    local_tax: 24,
    board_basis: "As per Itinerary",
    description: "This Amsterdam, Berlin & Prague multi-centre holiday combines three of Europe’s most exciting cities into one seamless journey. With included experiences, central hotels and convenient rail travel, this itinerary offers the perfect balance of culture, history and exploration.",
  },
  {
    id: "22",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/venice-verona-lake-garda/Thumbnail_1.webp",
    location: "Venice, Verona, Lake Garda",
    title: "Venice, Verona & Lake Garda: Gondolas, Roman Heritage & Lakeside Charm",
    extras: "Venice - 3 Nights | Verona - 2 Nights | Lake Garda - 3 Nights",
    property_rating: 4,
    starting_price: "629",
    slug: "venice-verona-lake-garda",
    offer_tag_type: "",
    nights: "8",
    local_tax: 28,
    board_basis: "As Per Itinerary",
    description: "This carefully curated journey brings together the romance of Venice, the history of Verona and the breathtaking scenery of Lake Garda."
  },
  {
    id: "23",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/seville-cordoba-granada-costa-del-sol/Thumbnail_1.webp",
    location: "Seville, Córdoba, Granada, Costa del Sol",
    title: "Seville, Córdoba, Granada & Costa del Sol: Moorish Wonders of Andalusia",
    extras: "Seville - 3 Nights | Córdoba - 2 Nights | Granada - 2 Nights | Costa del Sol - 3 Nights",
    property_rating: 4,
    starting_price: "639",
    slug: "seville-cordoba-granada-costa-del-sol",
    offer_tag_type: "",
    nights: "10",
    local_tax: 11,
    board_basis: "Bed & Breakfast",
  },
  {
    id: "24",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/hotel-sevilla-center/0.webp",
    location: "Seville, Ronda, Marbella",
    title: "Seville, Ronda & Marbella Multi-Centre Holiday: Elegant Cities, Dramatic Landscapes & Coastal Glamour",
    extras: "Seville - 2 Nights | Ronda - 2 Nights | Marbella - 3 Nights",
    property_rating: 5,
    starting_price: "689",
    slug: "seville-ronda-marbella",
    offer_tag_type: "",
    nights: "07",
    local_tax: 0,
    board_basis: "Bed & Breakfast",
    description: "Discover the essence of southern Spain with a multi-centre journey through Seville, Ronda and Marbella.",
  },
  {
    id: "25",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/bodrum-kos/Bodrum.webp",
    location: "Bodrum, Kos",
    title: "Bodrum & Kos Twin-Centre Holiday: Cross-Border Island Escape with Boat Cruises",
    extras: "Bodrum - 5 Nights | Kos - 5 Nights",
    property_rating: 5,
    starting_price: "699",
    slug: "bodrum-kos",
    offer_tag_type: "",
    nights: "10",
    local_tax: 0,
    board_basis: "All Inclusive",
    description: "This Bodrum & Kos twin-centre holiday offers a unique cross-border experience combining Turkey’s luxury resorts with the charm of a Greek island escape.",
  },
  {
    id: "26",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/barcelona-madrid-lisbon/Barcelona1.webp",
    location: "Barcelona, Madrid, Lisbon",
    title: "Spain & Portugal Highlights: Barcelona, Madrid & Lisbon with Sagrada Familia, Royal Palace & Belém Guided Tours",
    extras: "Barcelona - 2 Nights | Madrid - 2 Nights | Lisbon - 2 Nights",
    property_rating: 4,
    starting_price: "729",
    slug: "barcelona-madrid-lisbon",
    offer_tag_type: "",
    nights: "6",
    local_tax: 17,
    board_basis: "Bed & Breakfast",
    description: "Experience the perfect mix of iconic sights and cultural highlights on this 7-day Spain & Portugal escape. From exploring the architectural wonders of Barcelona to discovering the royal heritage of Madrid and the historic charm of Lisbon, this holiday offers a rich blend of experiences and unforgettable memories.",
  },
  {
    id: "27",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/raganelli-hotel/1.webp",
    location: "Rome, Florence, Milan, Venice",
    title: "Discover Italy’s most iconic cities in one seamless journey blending history, art, fashion, and romance.",
    extras: "Rome - 2 Nights | Florence - 2 Nights | Milan - 2 Nights | Venice - 2 Nights",
    property_rating: 4,
    starting_price: "799",
    slug: "rome-florence-milan-venice",
    offer_tag_type: "",
    nights: "08",
    local_tax: 44,
    board_basis: "Bed & Breakfast",
    description: "Discover Italy’s most iconic cities in one seamless journey blending history, art, fashion, and romance.",
  },
  {
    id: "28",
    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/gibraltar-marbella/pueblos-cerca-de-marbella.webp",
    location: "Gibraltar & Marbella",
    title: "Gibraltar & Marbella Twin-Centre Holiday: Unique City Stay & Costa del Sol Beach Escape",
    extras: "Gibraltar - 3 Nights | Marbella - 4 Nights",
    property_rating: 5 & 4,
    starting_price: "829",
    slug: "gibraltar-marbella",
    offer_tag_type: "",
    nights: "7",
    local_tax: 0,
    board_basis: "As Per Itinerary",
    description: "Experience the perfect mix of iconic sights and coastal luxury on this 8-day Spain & Gibraltar escape. From staying on a unique yacht hotel in Gibraltar to soaking up the sun in glamorous Marbella, this holiday blends unforgettable experiences with relaxing Mediterranean charm.",
  },
  // {
  //   id: "12",
  //   image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/prague-krakow/Thumbnail_1.webp",
  //   location: "Prague, Krakow",
  //   title: "Prague & Krakow: Castles, Kings & Salt Mine Wonders",
  //   extras: "Prague - 2 Nights | Krakow - 2 Nights",
  //   property_rating: 4,
  //   starting_price: "284",
  //   slug: "prague-krakow",
  //   offer_tag_type: "",
  //   nights: "4",
  //   local_tax: 5,
  //   board_basis: "Bed & Breakfast"
  // },
];

export default function OfferCards() {
  function getDurationMin(apiUrl?: string | null): number | null {
    const raw = String(apiUrl ?? "");
    const match = raw.match(/(?:^|&)durationMin=(\d+)/);
    if (!match) return null;
    const value = parseInt(match[1] ?? "", 10);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  function getDisplayPrice(startingPrice?: string | null): string {
    const raw = String(startingPrice ?? "").trim();
    const num = Number(raw);
    if (raw && Number.isFinite(num) && num > 0) {
      return num.toLocaleString("en-GB", { maximumFractionDigits: 0 });
    }
    return "1,999";
  }

  return (
    <>
      {offers && offers.length > 0 && (
        <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] font-['Montserrat']">
          <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px] pb-[20px] md:pb-[50px] lg:pb-[50px]">
            <div className="w-full max-w-[1280px] mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-3 md:mb-5">
                <h2 className="text-[24px] md:text-[48px] font-semibold text-[#4c4c4c] leading-[30px] md:leading-[60px] tracking-[-0.005em] max-w-[626px]">
                  {"Luxury Multi-Centre Holiday Deals"}
                </h2>
                <a
                  href="/trending-multi-centres"
                  className="text-gray-500 text-xs underline hover:text-[#CB2187] self-start md:self-end mt-2 md:mt-0"
                >
                  view all Multi Centres
                </a>
              </div>

              <Carousel opts={{ align: "start" }} className="w-full">
                <CarouselContent>
                  {offers.map((deal, idx) => {
                    const nights = getDurationMin(deal.api_url) ?? (deal.nights ? Number(deal.nights) : 7);
                    const href = deal.slug ? (deal.slug === "#" ? "#" : `/multi-centre/${deal.slug}`) : "#";

                    return (
                      <CarouselItem key={idx} className="basis-auto">
                        <div className="flex-[0_0_auto] w-[270px] sm:w-[300px] md:w-[360px] h-[436px] font-['Montserrat']">
                          <a href={href} className="bg-white rounded-[8px] overflow-hidden flex flex-col h-full border border-[#e0e0e0] group no-underline">
                            <div className="relative w-full overflow-hidden bg-[#f5f5f5] h-[225px]">
                              <img
                                src={deal.image || " "}
                                alt={deal.title || "Hotel"}
                                className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105 group-hover:scale-105 will-change-transform"
                              />

                              {Boolean((deal.badge || "").trim()) && (
                                <span className="absolute top-0 left-0 bg-white text-[#CB2187] pr-[32px] pl-[12px] pt-[4px] pb-[4px] text-[11px] md:text-[13px] font-semibold uppercase max-w-[70%] leading-[18px] tracking-[0.015em] rounded-br-[167px] pointer-events-none">
                                  {deal.badge}
                                </span>
                              )}

                              <div className="absolute top-0 right-[-25px] pointer-events-none">
                                {deal.offer_tag_type && deal.offer_tag_type.trim() !== "" && (
                                  <img
                                    className="absolute top-5 right-2 pointer-events-none -rotate-[30deg]"
                                    src={deal.offer_tag_type}
                                    alt="tag"
                                  />
                                )}
                              </div>
                            </div>

                            <div className="pt-[6px] pr-[8px] pb-[14px] pl-[8px] flex-grow flex flex-col justify-start items-start text-left bg-white">
                              <div className="text-[14px] font-semibold text-[#4c4c4c] leading-[1.4] p-[4px] w-full line-clamp-1 min-h-[28px]">{deal.location || ""}</div>

                              <div className="flex items-center justify-start p-[4px] min-h-[28px]">
                                <span className="text-pml-primary text-[14px]">
                                  {Array.from({ length: 5 }).map((_, i) => {
                                    const rating = Number(deal?.property_rating || 0);
                                    return (
                                      <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mr-[1px]">
                                        <path d="M14.0001 5.4091L8.91313 5.07466L6.99734 0.261719L5.08156 5.07466L0.0001297 5.4091L3.89754 8.7184L2.61862 13.7384L6.99734 10.9707L11.3761 13.7384L10.0972 8.7184L14.0001 5.4091Z" fill={rating >= i + 1 ? "#CB2187" : "#E0E0E0"} />
                                      </svg>
                                    );
                                  })}
                                </span>
                              </div>

                              <h5 className="text-[14px] md:text-[16px] font-semibold text-pml-primary leading-[24px] mb-[10px] p-[4px] w-full min-h-[32px] truncate">{deal.title || ""}</h5>

                              <div className={`rounded-[8px] text-[12px] text-[#4c4c4c] font-medium mb-[9px] w-full min-h-[48px] flex items-center justify-center text-center ${Boolean((deal.extras || "").trim()) ? "bg-[#EDEDED] border border-[#DFDEDE] px-[6px] md:px-[12px] py-[6px]" : ""}`}>
                                {Boolean((deal.extras || "").trim()) ? <span className="line-clamp-2 leading-[18px] tracking-[0.02em]">{deal.extras}</span> : null}
                              </div>

                              <div className="mt-auto ml-auto flex h-[30px] w-full max-w-[289px] self-end items-center justify-end gap-[8px] px-[8px] font-['Montserrat']">
                                <div className="flex h-[30px] w-[241px] items-end p-0">
                                  <div className="flex h-[30px] w-[100px] items-center justify-center px-[2px] py-[4px]">
                                    <span className="h-[22px] w-[96px] whitespace-nowrap text-[14px] font-normal leading-[22px] tracking-[0.01em] text-[#4C4C4C]">{nights} nights from</span>
                                  </div>

                                  <div className="flex h-[28px] items-center justify-end px-[4px] py-[2px] min-w-[48px] max-w-[110px]">
                                    <span className="h-[24px] whitespace-nowrap text-[16px] font-semibold leading-[24px] text-[#CB2187] text-right">£{getDisplayPrice(deal.starting_price)}</span>
                                  </div>

                                  <div className="flex h-[30px] w-[82px] items-center justify-center px-[2px] py-[4px]">
                                    <span className="h-[22px] w-[78px] whitespace-nowrap text-[14px] font-normal leading-[22px] tracking-[0.01em] text-[#4C4C4C]">per person</span>
                                  </div>
                                </div>

                                <CircleChevronRight className="h-[24px] w-[24px] shrink-0 text-[#CB2187]" />
                              </div>
                            </div>
                          </a>
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselNext className="hidden md:flex" />
                <CarouselPrevious className="hidden md:flex" />
              </Carousel>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
