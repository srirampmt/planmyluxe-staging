// import type { Metadata } from "next";

// import Banner from "@/components/Banner";
// import Features from "@/components/Features";
// import Signup from "@/components/Signup";
// import Trustsection from "@/components/Trustsection";
// import Coupons from "@/components/offers/coupons";
// import TrendingMultiCentre from "@/components/multi-centre/trending-multi-centre";

// // ISR: cache this route for 10 minutes
// export const revalidate = 600;

// export async function generateMetadata(): Promise<Metadata> {
//   const canonical = "/trending-multi-centres";

//   const title = "Top Trending Multi-Centres";
//   const description = "";
//   const ogImage =
//     "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/multi-centre/Multi_Centre_Holidays.webp";

//   return {
//     title,
//     description,
//     alternates: {
//       canonical,
//     },
//     openGraph: {
//       title,
//       description,
//       url: canonical,
//       images: ogImage ? [{ url: ogImage }] : undefined,
//     },
//     twitter: {
//       card: "summary_large_image",
//       title,
//       description,
//       images: ogImage ? [{ url: ogImage }] : undefined,
//     },
//   };
// }

// const PAGE_TITLE = "Top Trending Multi-centers";
// const PAGE_DESCRIPTION = "Explore what’s trending right now";
// const BANNER_IMAGE = "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/multi-centre/Multi_Centre_Holidays.webp";
// const TRENDING_TITLE = "";
// const TRENDING_SUBTITLE = "";

// const similar_deals = [
//   {
//     id: "1",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/vienna-budapest/Vienna1.webp",
//     location: "Vienna, Budapest",
//     title: "Vienna & Budapest with Iconic Experiences",
//     extras: "Vienna - 2 Nights | Budapest - 2 Nights",
//     property_rating: 4,
//     starting_price: "269",
//     slug: "vienna-budapest",
//     offer_tag_type: "",
//     nights: "4",
//     local_tax: 0,
//     board_basis: "Bed & Breakfast",
//     description: "Experience Vienna’s grand elegance and Budapest’s riverside beauty.\n4★ hotels, guided city tour and a magical Buda Castle evening tour."
//   },
//   {
//     id: "2",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/prague-vienna-budapest/Prague-2.webp",
//     location: "Prague, Budapest",
//     title: "Prague & Budapest featuring Charles Bridge & Buda Castle",
//     extras: "Prague - 2 Nights | Budapest - 2 Nights",
//     property_rating: 4,
//     starting_price: "289",
//     slug: "prague-budapest",
//     offer_tag_type: "",
//     nights: "4",
//     local_tax: 0,
//     board_basis: "Bed & Breakfast",
//     description: "Experience Prague’s storybook charm and Budapest’s grand riverside elegance.\n4★ hotels, guided tours and a mysterious Buda Castle evening experience.",
//   },
//   {
//     id: "3",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/prague-krakow/Thumbnail_1.webp",
//     location: "Prague, Krakow",
//     title: "Prague & Krakow: Castles, Kings & Salt Mine Wonders",
//     extras: "Prague - 2 Nights | Krakow - 2 Nights",
//     property_rating: 4,
//     starting_price: "299",
//     slug: "prague-krakow",
//     offer_tag_type: "",
//     nights: "4",
//     local_tax: 5,
//     board_basis: "Bed & Breakfast"
//   },
//   {
//     id: "4",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/prague-vienna/Prague_2.webp",
//     location: "Prague, Vienna",
//     title: "Prague & Vienna featuring Charles Bridge & Schönbrunn Palace",
//     extras: "Prague - 2 Nights | Vienna - 2 Nights",
//     property_rating: 4,
//     starting_price: "339",
//     slug: "prague-vienna",
//     offer_tag_type: "",
//     nights: "4",
//     local_tax: 0,
//     board_basis: "Bed & Breakfast",
//     description: "Experience Prague’s fairytale beauty and Vienna’s timeless elegance.\n4★ hotels, guided walking tours and scenic rail travel included.",
//   },
//   {
//     id: "5",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/venice-rome/venice.webp",
//     location: "Venice, Rome",
//     title: "Gondolas, Piazzas & Eternal Wonders",
//     extras: "Venice - 2 Nights | Rome - 2 Nights",
//     property_rating: 4,
//     starting_price: "339",
//     slug: "venice-rome",
//     offer_tag_type: "",
//     nights: "4",
//     local_tax: 0,
//     board_basis: "Bed & Breakfast",
//     description: "Experience Venice’s enchanting waterways and Rome’s grand history.\n4★ hotels, gondola ride and Pantheon skip-the-line entry included.",
//   },
//   {
//     id: "6",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/porto-lisbon/exc.webp",
//     location: "Lisbon, Porto",
//     title: "Lisbon & Porto: Cultural Charm & Riverside Sunset",
//     extras: "Lisbon - 2 Nights | Porto - 2 Nights",
//     property_rating: 4,
//     starting_price: "339",
//     slug: "lisbon-porto",
//     offer_tag_type: "",
//     nights: "4",
//     local_tax: 11,
//     board_basis: "Bed & Breakfast",
//     description: "Experience the culture of Lisbon and the riverside magic of Porto.\n4★ hotels, rail travel and a spectacular Douro sunset cruise included."
//   },
//   {
//    id: "7",
//    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/barcelona-madrid-lisbon/Barcelona1.webp",
//    location: "Barcelona, Madrid",
//    title: "Barcelona & Madrid Uncovered: A Journey of Culture, Colour & Passion",
//    extras: "Barcelona - 3 Nights | Madrid - 3 Nights",
//    property_rating: 3,
//    starting_price: "379",
//    slug: "barcelona-madrid",
//    offer_tag_type: "",
//    nights: "06",
//    local_tax: 13,
//    board_basis: "Bed & Breakfast",
//    description: "Experience the vibrant soul of Spain with a seamless journey through two of its most iconic cities. From Barcelona’s artistic charm to Madrid’s cultural elegance, this twin-centre escape offers the perfect blend of discovery and relaxation..", 
//   },
//   {

//     id: "8",

//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/krakow-warsaw/Krakow_2.webp",

//     location: "Krakow, warsaw",

//     title: "Elegant Poland Escape: Discover Krakow’s Old Town charm and Warsaw’s vibrant culture on a stylish twin-centre journey",

//     extras: "Krakow - 3 Nights | Warsaw - 3 Nights",

//     property_rating: 5,

//     starting_price: "399",

//     slug: "krakow-warsaw",

//     offer_tag_type: "",

//     nights: "06",

//     local_tax: 16,

//     board_basis: "Bed & Breakfast",

//     description: "A perfect blend of history and culture, this Krakow & Warsaw twin-centre escape showcases Poland’s timeless charm and vibrant capital.",

//   },
//   {
//     id: "9",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/porto-lisbon/Lisbon1.webp",
//     location: "Porto, Lisbon",
//     title: "From Porto’s Wine Heritage to Lisbon’s Vibrant Culture",
//     extras: "Porto - 2 Nights | Lisbon - 2 Nights",
//     property_rating: 4,
//     starting_price: "399",
//     slug: "porto-lisbon",
//     offer_tag_type: "",
//     nights: "4",
//     local_tax: 0,
//     board_basis: "Bed & Breakfast",
//     description: "Experience Porto’s riverside beauty and Lisbon’s timeless charm.\n4★ hotels, Douro sunset cruise and guided city tour included.",
//   },
//   {
//     id: "10",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/las-palmas-maspalomas/Gran_Canaria.webp",
//     location: "Las Palmas, Maspalomas",
//     title: "Las Palmas & Maspalomas Twin-Centre Holiday: Cultural City Stay & Gran Canaria Dunes Escape",
//     extras: "Las Palmas - 3 Nights | Maspalomas - 4 Nights",
//     property_rating: 4,
//     starting_price: "419",
//     slug: "las-palmas-maspalomas",
//     offer_tag_type: "",
//     nights: "07",
//     local_tax: 1,
//     board_basis: "Bed & Breakfast",
//     description: "This Las Palmas & Maspalomas twin-centre holiday offers a perfect blend of culture, adventure and relaxation.",
//   },
//   {

//     id: "11",

//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/smy-lisboa/1.webp",

//     location: "Lisbon, Madeira",

//     title: "Lisbon & Madeira Getaway: Sail, Celebrate & Escape to Nature",

//     extras: "Lisbon - 3 Nights | Madeira - 3 Nights",

//     property_rating: 4,

//     starting_price: "449",

//     slug: "lisbon-madeira",

//     offer_tag_type: "",

//     nights: "06",

//     local_tax: 16,

//     board_basis: "Bed & Breakfast",

//     description: "A perfect blend of Lisbon’s vibrant city life and Madeira’s breathtaking natural beauty on an unforgettable twin-centre escape..",

//   },
//   {

//     id: "12",

//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/paris-nice/Paris.webp",

//     location: "Paris, Nice",

//     title: "Paris & Nice Twin-Centre Holiday: Romantic City Break & French Riviera Escape",

//     extras: "Paris - 3 Nights | Nice - 3 Nights",

//     property_rating: 4,

//     starting_price: "469",

//     slug: "paris-nice",

//     offer_tag_type: "",

//     nights: "06",

//     local_tax: 29,

//     board_basis: "Bed & Breakfast",

//     description: "Experience the perfect blend of romance and coastal charm with a twin-centre escape to Paris and Nice.",

//   },
//   {
//    id: "13",
//    image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/paris-venice/1.webp",
//    location: "Paris, Venice",
//    title: "Paris & Venice: A Signature Journey of Romance & Elegance",
//    extras: "Paris - 4 Nights | Venice - 5 Nights",
//    property_rating: 5,
//    starting_price: "499",
//    slug: "paris-venice",
//    offer_tag_type: "",
//    nights: "6",
//    local_tax: 27,
//    board_basis: "Bed & Breakfast",
//    description: "Experience the romance of Paris and the timeless charm of Venice on a seamless European escape filled with iconic sights, scenic cruises, and unforgettable cultural moments. Perfect for couples and first-time visitors, this journey blends elegance, history, and immersive experiences across two of Europe’s most enchanting cities..",
//   },
//   {
//     id: "14",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/prague-vienna-budapest/Prague-2.webp",
//     location: "Prague, Vienna, Budapest",
//     title: "Imperial Europe-Prague, Vienna & Budapest with Signature Sightseeing",
//     extras: "Prague - 3 Nights | Vienna - 2 Nights | Budapest - 3 Nights",
//     property_rating: 4,
//     starting_price: "519",
//     slug: "prague-vienna-budapest",
//     offer_tag_type: "",
//     nights: "8",
//     local_tax: 18,
//     board_basis: "Bed & Breakfast",
//     description: "Experience the charm of Prague, the elegance of Vienna and the energy of Budapest.\n4★ hotels, guided city tours and unforgettable cultural experiences."
//   },
//   {
//     id: "15",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/dubrovnik-split/Thumbnail_1.webp",
//     location: "Dubrovnik, Split",
//     title: "Dubrovnik & Split Twin Centre Holiday: Old Town Charm & Adriatic Coastlines",
//     extras: "Dubrovnik - 3 Nights | Split - 3 Nights",
//     property_rating: 4,
//     starting_price: "529",
//     slug: "dubrovnik-split",
//     offer_tag_type: "",
//     nights: "6",
//     local_tax: 12,
//     board_basis: "Bed & Breakfast",
//     description: "This Dubrovnik & Split twin-centre holiday combines Croatia’s most iconic destinations in one seamless itinerary. With guided tours, scenic coastal travel and comfortable 4★ stays, this holiday offers the perfect mix of culture, relaxation and Adriatic beauty.",
//   },
//   {
//     id: "16",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/venice-florence-rome/venice.webp",
//     location: "VENICE, FLORENCE, ROME",
//     title: "Venice, Florence & Rome with Curated Experiences",
//     extras: "Venice - 2 Nights | Florence - 2 Nights | Rome - 2 Nights",
//     property_rating: 4,
//     starting_price: "549",
//     slug: "venice-florence-rome",
//     offer_tag_type: "",
//     nights: "6",
//     local_tax: 0,
//     board_basis: "Bed & Breakfast",
//     description: "Experience the romance of Venice, the art of Florence and the history of Rome.\n4★ hotels, scenic rail journeys and unforgettable guided experiences included."
//   },
//   {
//     id: "17",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/casual-kubic-athens/Athens.webp",
//     location: "Athens, Istanbul, Turkey-Beach",
//     title: "Ancient Wonders to Coastal Luxury — Experience Greece & Turkey in Style",
//     extras: "Athens - 2 Nights | Istanbul - 2 Nights | Antalya - 3 Nights",
//     property_rating: 4,
//     starting_price: "559",
//     slug: "athens-istanbul-turkey-beach",
//     offer_tag_type: "",
//     nights: "07",
//     local_tax: 9,
//     board_basis: "Bed & Breakfast",
//     description: "Discover timeless landmarks in Athens before diving into the vibrant culture of Istanbul. Then slow down and soak up the Mediterranean charm of Antalya. One perfectly planned journey combining history, culture and beachside relaxation.",
//   },
//   {
//     id: "18",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/barcelona-costa-brava/Barcelona.webp",
//     location: "Barcelona, Costa Brava",
//     title: "Barcelona & Costa Brava Twin-Centre Holiday: City Culture & Mediterranean Beach Escape",
//     extras: "Barcelona - 3 Nights | Costa Brava - 4 Nights",
//     property_rating: 4,
//     starting_price: "569",
//     slug: "barcelona-costa-brava",
//     offer_tag_type: "",
//     nights: "7",
//     local_tax: 15,
//     board_basis: "Bed & Breakfast",
//     description: "This Barcelona & Costa Brava twin-centre holiday combines the cultural highlights of Barcelona with the relaxing coastal beauty of Costa Brava. With guided tours, scenic boat trips and comfortable 4★ stays, this itinerary offers the perfect mix of exploration and relaxation.",
//   },
//   {
//     id: "19",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/tenerife-south-tenerife-north/Thumbnail_1.webp",
//     location: "Tenerife South, Tenerife North",
//     title: "Tenerife Twin-Centre Holiday: South & North Escape with Teide Tour & La Laguna Experience",
//     extras: "Tenerife South - 4 Nights | Tenerife North - 3 Nights",
//     property_rating: 4,
//     starting_price: "589",
//     slug: "tenerife-south-tenerife-north",
//     offer_tag_type: "",
//     nights: "7",
//     local_tax: 0,
//     board_basis: "Bed & Breakfast",
//     description: "This Tenerife twin-centre holiday combines the best of both worlds – the lively beaches of Tenerife South and the cultural charm of Tenerife North.",
//   },
//   {
//     id: "20",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/rome-amalfi-coast/Thumbnail_1.webp",
//     location: "Rome, Amalfi Coast",
//     title: "Rome & Amalfi Coast: Colosseum Legends & Amalfi Coast Serenity",
//     extras: "Rome - 3 Nights | Amalfi Coast - 4 Nights",
//     property_rating: 4,
//     starting_price: "589",
//     slug: "rome-amalfi-coast",
//     offer_tag_type: "",
//     nights: "7",
//     local_tax: 32,
//     board_basis: "Bed & Breakfast"
//   },
//   {
//     id: "21",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/amsterdam-berlin-prague/Amsterdam_1.webp",
//     location: "Amsterdam, Berlin, Prague",
//     title: "Amsterdam, Berlin & Prague Multi-Centre Holiday: Iconic Cities & Cultural Highlights",
//     extras: "Amsterdam - 2 Nights | Berlin - 2 Nights | Prague - 2 Nights",
//     property_rating: 4,
//     starting_price: "599",
//     slug: "amsterdam-berlin-prague",
//     offer_tag_type: "",
//     nights: "6",
//     local_tax: 24,
//     board_basis: "As per Itinerary",
//     description: "This Amsterdam, Berlin & Prague multi-centre holiday combines three of Europe’s most exciting cities into one seamless journey. With included experiences, central hotels and convenient rail travel, this itinerary offers the perfect balance of culture, history and exploration.",
//   },
//   {
//     id: "22",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/venice-verona-lake-garda/Thumbnail_1.webp",
//     location: "Venice, Verona, Lake Garda",
//     title: "Venice, Verona & Lake Garda: Gondolas, Roman Heritage & Lakeside Charm",
//     extras: "Venice - 3 Nights | Verona - 2 Nights | Lake Garda - 3 Nights",
//     property_rating: 4,
//     starting_price: "629",
//     slug: "venice-verona-lake-garda",
//     offer_tag_type: "",
//     nights: "8",
//     local_tax: 28,
//     board_basis: "As Per Itinerary",
//     description: "This carefully curated journey brings together the romance of Venice, the history of Verona and the breathtaking scenery of Lake Garda."
//   },
//   {
//     id: "23",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/seville-cordoba-granada-costa-del-sol/Thumbnail_1.webp",
//     location: "Seville, Córdoba, Granada, Costa del Sol",
//     title: "Seville, Córdoba, Granada & Costa del Sol: Moorish Wonders of Andalusia",
//     extras: "Seville - 3 Nights | Córdoba - 2 Nights | Granada - 2 Nights | Costa del Sol - 3 Nights",
//     property_rating: 4,
//     starting_price: "639",
//     slug: "seville-cordoba-granada-costa-del-sol",
//     offer_tag_type: "",
//     nights: "10",
//     local_tax: 11,
//     board_basis: "Bed & Breakfast",
//   },
//   {
//     id: "24",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/hotel-sevilla-center/0.webp",
//     location: "Seville, Ronda, Marbella",
//     title: "Seville, Ronda & Marbella Multi-Centre Holiday: Elegant Cities, Dramatic Landscapes & Coastal Glamour",
//     extras: "Seville - 2 Nights | Ronda - 2 Nights | Marbella - 3 Nights",
//     property_rating: 5,
//     starting_price: "689",
//     slug: "seville-ronda-marbella",
//     offer_tag_type: "",
//     nights: "07",
//     local_tax: 0,
//     board_basis: "Bed & Breakfast",
//     description: "Discover the essence of southern Spain with a multi-centre journey through Seville, Ronda and Marbella.",
//   },
//   {
//     id: "25",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/bodrum-kos/Bodrum.webp",
//     location: "Bodrum, Kos",
//     title: "Bodrum & Kos Twin-Centre Holiday: Cross-Border Island Escape with Boat Cruises",
//     extras: "Bodrum - 5 Nights | Kos - 5 Nights",
//     property_rating: 5,
//     starting_price: "699",
//     slug: "bodrum-kos",
//     offer_tag_type: "",
//     nights: "10",
//     local_tax: 0,
//     board_basis: "All Inclusive",
//     description: "This Bodrum & Kos twin-centre holiday offers a unique cross-border experience combining Turkey’s luxury resorts with the charm of a Greek island escape.",
//   },
//   {
//     id: "26",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/barcelona-madrid-lisbon/Barcelona1.webp",
//     location: "Barcelona, Madrid, Lisbon",
//     title: "Spain & Portugal Highlights: Barcelona, Madrid & Lisbon with Sagrada Familia, Royal Palace & Belém Guided Tours",
//     extras: "Barcelona - 2 Nights | Madrid - 2 Nights | Lisbon - 2 Nights",
//     property_rating: 4,
//     starting_price: "729",
//     slug: "barcelona-madrid-lisbon",
//     offer_tag_type: "",
//     nights: "6",
//     local_tax: 17,
//     board_basis: "Bed & Breakfast",
//     description: "Experience the perfect mix of iconic sights and cultural highlights on this 7-day Spain & Portugal escape. From exploring the architectural wonders of Barcelona to discovering the royal heritage of Madrid and the historic charm of Lisbon, this holiday offers a rich blend of experiences and unforgettable memories.",
//   },
//   {
//     id: "27",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/raganelli-hotel/1.webp",
//     location: "Rome, Florence, Milan, Venice",
//     title: "Discover Italy’s most iconic cities in one seamless journey blending history, art, fashion, and romance.",
//     extras: "Rome - 2 Nights | Florence - 2 Nights | Milan - 2 Nights | Venice - 2 Nights",
//     property_rating: 4,
//     starting_price: "799",
//     slug: "rome-florence-milan-venice",
//     offer_tag_type: "",
//     nights: "08",
//     local_tax: 44,
//     board_basis: "Bed & Breakfast",
//     description: "Discover Italy’s most iconic cities in one seamless journey blending history, art, fashion, and romance.",
//   },
//   {
//     id: "28",
//     image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/gibraltar-marbella/pueblos-cerca-de-marbella.webp",
//     location: "Gibraltar & Marbella",
//     title: "Gibraltar & Marbella Twin-Centre Holiday: Unique City Stay & Costa del Sol Beach Escape",
//     extras: "Gibraltar - 3 Nights | Marbella - 4 Nights",
//     property_rating: 5 & 4,
//     starting_price: "829",
//     slug: "gibraltar-marbella",
//     offer_tag_type: "",
//     nights: "7",
//     local_tax: 0,
//     board_basis: "As Per Itinerary",
//     description: "Experience the perfect mix of iconic sights and coastal luxury on this 8-day Spain & Gibraltar escape. From staying on a unique yacht hotel in Gibraltar to soaking up the sun in glamorous Marbella, this holiday blends unforgettable experiences with relaxing Mediterranean charm.",
//   },
//   // {
//   //   id: "12",
//   //   image: "https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/prague-krakow/Thumbnail_1.webp",
//   //   location: "Prague, Krakow",
//   //   title: "Prague & Krakow: Castles, Kings & Salt Mine Wonders",
//   //   extras: "Prague - 2 Nights | Krakow - 2 Nights",
//   //   property_rating: 4,
//   //   starting_price: "284",
//   //   slug: "prague-krakow",
//   //   offer_tag_type: "",
//   //   nights: "4",
//   //   local_tax: 5,
//   //   board_basis: "Bed & Breakfast"
//   // },
// ];

// export default async function TopTrendingMultiCentres() {
//   return (
//     <>
//       <div className="min-h-screen bg-white">
//         <main className="mx-auto bg-white md:container lg:container xl:container bg-white">
//           <>
//             <Banner
//               title={PAGE_TITLE}
//               image={BANNER_IMAGE}
//               description={PAGE_DESCRIPTION}
//               priority
//             />
//             <Features />

//             <TrendingMultiCentre
//               title={TRENDING_TITLE}
//               subtitle={TRENDING_SUBTITLE}
//               hotels={similar_deals}
//             />

//             <Coupons />

//             <Signup />
//             <Trustsection />
//           </>
//         </main>
//       </div>
//     </>
//   );
// }

import type { Metadata } from "next";
import { cache } from "react";
import SeoHeadScripts from "@/components/seo/SeoHeadScripts";

import Banner from "@/components/Banner";
import Features from "@/components/Features";
import HomePageSkeleton from "@/components/HomePageSkeleton";
import Signup from "@/components/Signup";
import Trustsection from "@/components/Trustsection";
import FAQs from "@/components/faqs";
import AgentsProfile from "@/components/offers/agentsprofile";
import Coupons from "@/components/offers/coupons";
import TrendingMultiCentre from "@/components/multi-centre/trending-multi-centre";
import type { TopTrending20Response } from "@/types/topTrending20";
import WeeklyDeal from "@/components/offers/WeeklyDeal";
import { fetchBackend } from "@/lib/backendFetch";
import { buildMetadataFromSeo, getSeoMetadata } from "@/lib/seo/metadata";

// ISR: cache this route for 10 minutes
export const revalidate = 600;

const getTopTrending20Response = cache(async (): Promise<TopTrending20Response | null> => {
  try {
    const res = await fetchBackend("/client/api/toptrendingmulticentre/", {
      next: { revalidate: 600 },
      // cache:"no-store",
    });

    if (!res.ok) return null;
    const data = (await res.json()) as TopTrending20Response;
    return data;
  } catch {
    return null;
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("top_trending_destinations");

  return buildMetadataFromSeo(seo, {
    twitterCard: "summary_large_image",
  });
}

export default async function TopTrending20() {
  const data = await getTopTrending20Response();
  const page = data?.page;
  const seo = await getSeoMetadata("top_trending_destinations");
  return (
    <>
      <SeoHeadScripts html={seo?.Head_Scripts} debugId="top-trending-20" />

      <div className="min-h-screen bg-white">
        <main className="mx-auto bg-white md:container lg:container xl:container bg-white">
          {!page ? (
            <HomePageSkeleton />
          ) : (
            <>
              <Banner
                title={page?.banner_title}
                image={page?.banner_image}
                description={page?.banner_subtitle}
                priority
              />
              <Features />
              <WeeklyDeal
                Weekly_deals_title={page?.Weekly_deals_title}
                Weekly_deals_subtitle={page?.Weekly_deals_subtitle}
                Weekly_hot_deal={page?.Weekly_hot_deal}
                card_image={page?.card_image}
                add_title={page?.add_title}
                add_subtitle={page?.add_subtitle}
                add_link={page?.add_link}
              />
              {Array.isArray(page?.trending_deals_multicentre_1) && page.trending_deals_multicentre_1.length > 0 && (
                <TrendingMultiCentre
                  title={page?.trending_deals_title_1}
                  subtitle={page?.trending_deals_subtitle_1}
                  hotels={page?.trending_deals_multicentre_1}
                />
              )}
              <Coupons />
              {Array.isArray(page?.trending_deals_multicentre_2) && page.trending_deals_multicentre_2.length > 0 && (
                <TrendingMultiCentre
                  title={page?.trending_deals_title_2}
                  subtitle={page?.trending_deals_subtitle_2}
                  hotels={page?.trending_deals_multicentre_2}
                />
              )}
              {Array.isArray(page?.trending_deals_multicentre_3) && page.trending_deals_multicentre_3.length > 0 && (
                <TrendingMultiCentre
                  title={page?.trending_deals_title_3}
                  subtitle={page?.trending_deals_subtitle_3}
                  hotels={page?.trending_deals_multicentre_3}
                />
              )}
              <FAQs faqItems={page?.faqs} />
              {/* <AgentsProfile /> */}
              <Signup />
              <Trustsection />
            </>
          )}
        </main>
      </div>
    </>
  );
}

