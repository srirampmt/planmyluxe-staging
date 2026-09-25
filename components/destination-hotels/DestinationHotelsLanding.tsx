import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BedDouble, Download, Search } from "lucide-react";

import SearchBanner from "@/components/SearchBanner";
import BookingConfidence from "@/components/destinationdetail/BookingConfidence";
import DestinationHotelCarousel from "@/components/destination-hotels/DestinationHotelCarousel";
import HotelSignupCard from "@/components/destination-hotels/HotelSignupCard";
import FAQs from "@/components/faqs";
import JsonLd from "@/components/seo/JsonLd";
import SeoHeadScripts from "@/components/seo/SeoHeadScripts";
import { getDestinationHotels } from "@/lib/destinations/hotels";
import { buildMetadataFromSeo } from "@/lib/seo/metadata";
import { getSiteUrl } from "@/lib/site-url";
import type {
  DestinationHotel,
  DestinationHotelsDestination,
  DestinationHotelsResponse,
} from "@/types/destinationHotels";

export type DestinationHotelsRouteParams = {
  slug: string;
  region?: string;
  resort?: string;
};

export type DestinationHotelsPageProps = {
  params: Promise<DestinationHotelsRouteParams>;
};

type DestinationLevel = "country" | "region" | "resort";

type AreaCard = {
  name: string;
  description: string;
  image: string;
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1800&q=85";

const BROCHURE_URL =
  "https://accelerate-digital.paperturn-view.com/?pid=ODg8871976&v=8.5&p=1&source=qr";

const AREA_IMAGES = [
  "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80",
];

const TURKEY_AREAS: Record<DestinationLevel, string[]> = {
  country: ["Antalya", "Belek", "Bodrum", "Fethiye", "Marmaris", "Istanbul"],
  region: ["Belek", "Lara Beach", "Side", "Kemer", "Alanya", "Kaş"],
  resort: [
    "Beachfront resorts",
    "Golf hotels",
    "Family resorts",
    "Adults-only stays",
    "Spa retreats",
    "All-inclusive hotels",
  ],
};

const GENERIC_AREAS: Record<DestinationLevel, string[]> = {
  country: [
    "Coastal escapes",
    "City stays",
    "Island retreats",
    "Historic hotels",
    "Family resorts",
    "Boutique stays",
  ],
  region: [
    "Beachfront stays",
    "Town-centre hotels",
    "Family resorts",
    "Quiet retreats",
    "Spa hotels",
    "All-inclusive stays",
  ],
  resort: [
    "Near the beach",
    "Near the old town",
    "Family-friendly stays",
    "Couples' retreats",
    "Spa hotels",
    "All-inclusive hotels",
  ],
};

const NAME_OVERRIDES: Record<string, string> = {
  "balearic-islands": "Balearic Islands",
  "canary-islands": "Canary Islands",
  "channel-islands": "Channel Islands",
  "czech-republic": "Czech Republic",
  "united-kingdom": "United Kingdom",
};

function slugToLabel(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  if (NAME_OVERRIDES[normalized]) return NAME_OVERRIDES[normalized];

  return normalized
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getDestinationContext(
  params: DestinationHotelsRouteParams,
  destination?: DestinationHotelsDestination | null,
) {
  const segments = [params.slug, params.region, params.resort].filter(
    (segment): segment is string => Boolean(segment)
  );
  const names = segments.map(slugToLabel);
  if (destination) {
    names[0] = destination.country_name || (
      destination.hierarchy_level === "country" ? destination.name : names[0]
    );
    if (segments.length > 1) {
      names[1] = destination.region_name || (
        destination.hierarchy_level === "region" ? destination.name : names[1]
      );
    }
    if (segments.length > 2) {
      names[2] = destination.resort_name || destination.name;
    }
  }
  const level: DestinationLevel = destination?.hierarchy_level || (
    params.resort ? "resort" : params.region ? "region" : "country"
  );
  const destinationName =
    destination?.name || names[names.length - 1] || "Your destination";
  const destinationPath =
    destination?.public_path ||
    `/destinations/${segments.map(encodeURIComponent).join("/")}`;

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Destinations", href: "/destinations" },
    ...segments.map((_, index) => ({
      name: names[index],
      href: `/destinations/${segments
        .slice(0, index + 1)
        .map(encodeURIComponent)
        .join("/")}`,
    })),
    { name: "Hotels", href: `${destinationPath}/hotels` },
  ];

  return {
    level,
    destinationName,
    destinationPath,
    breadcrumbs,
  };
}

function buildAreaCards(
  level: DestinationLevel,
  countrySlug: string
): AreaCard[] {
  const names =
    countrySlug.toLowerCase() === "turkey"
      ? TURKEY_AREAS[level]
      : GENERIC_AREAS[level];

  return names.map((name, index) => ({
    name,
    description:
      level === "resort"
        ? "Explore handpicked hotels for this style of stay."
        : "Discover luxury hotels, package offers and tailored escapes.",
    image: AREA_IMAGES[index],
  }));
}

function getLevelCopy(level: DestinationLevel, destinationName: string) {
  if (level === "country") {
    return {
      eyebrow: "Country hotel guide",
      intro: `${destinationName} brings together luxurious beach resorts, characterful city hotels and relaxing all-inclusive stays. Compare locations, hotel styles and holiday experiences before choosing the right escape.`,
      introMore: `When comparing hotels in ${destinationName}, look beyond the star rating. The location, room category, board basis, included facilities and airport transfer time can all shape the experience and total holiday price.`,
      areaTitle: `Where to stay in ${destinationName}`,
      areaIntro: `Explore popular places and hotel styles across ${destinationName}.`,
    };
  }

  if (level === "region") {
    return {
      eyebrow: "Regional hotel guide",
      intro: `${destinationName} offers a varied collection of luxury hotels, from beachfront resorts to smaller stays close to local attractions. Compare the areas, facilities and board options that suit your trip.`,
      introMore: `Choose your base in ${destinationName} around the experience that matters most to you, whether that is the beach, family facilities, dining or a quieter setting. Check each hotel’s exact location and transfer time before booking.`,
      areaTitle: `Popular stays around ${destinationName}`,
      areaIntro: `Compare resort areas and hotel styles within the wider ${destinationName} region.`,
    };
  }

  return {
    eyebrow: "Resort hotel guide",
    intro: `${destinationName} is an ideal base for a refined hotel escape, with options for couples, families and all-inclusive stays. Compare beachfront locations, facilities and room styles before you book.`,
    introMore: `For the best ${destinationName} stay, compare the hotel location, board basis and facilities alongside the complete package price. Room category and included extras can make a significant difference to the overall value.`,
    areaTitle: `Find your ideal stay in ${destinationName}`,
    areaIntro: `Browse the most popular ways to stay in and around ${destinationName}.`,
  };
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-pml-primary">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-[24px] font-semibold leading-tight tracking-[-0.02em] text-[#1a1a1a] md:text-[32px]">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-3xl text-[14px] leading-6 text-[#5c6370] md:text-[15px]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function DestinationHotelsLanding({
  params,
  data,
}: {
  params: DestinationHotelsRouteParams;
  data?: DestinationHotelsResponse | null;
}) {
  const { level, destinationName, breadcrumbs } =
    getDestinationContext(params, data?.destination);
  const copy = getLevelCopy(level, destinationName);
  const content = data?.content;
  const introText = content?.intro_text || copy.intro;
  const introMore = content?.intro_more || copy.introMore;
  const areaCards = buildAreaCards(level, params.slug);
  const destinationArticle = /^[aeiou]/i.test(destinationName) ? "an" : "a";
  const levelLabel =
    level === "country"
      ? "Country hotels"
      : level === "region"
        ? "Region hotels"
        : "Resort hotels";
  const hotelBySlug = new Map<string, DestinationHotel>(
    (data?.hotels || []).map((hotel) => [hotel.slug, hotel]),
  );
  const hotelSections = (data?.sections || [])
    .map((section) => ({
      ...section,
      hotels: section.hotel_slugs
        .map((slug) => hotelBySlug.get(slug))
        .filter((hotel): hotel is DestinationHotel => Boolean(hotel)),
    }))
    .filter((section) => section.hotels.length > 0);
  const navigation = [
    ...hotelSections.map((section) => ({
      label:
        section.key === "preferred"
          ? "Preferred Hotels"
          : `${section.label} Hotels`,
      href: `#hotel-section-${section.key}`,
    })),
    { label: "Where to stay", href: "#places-to-stay" },
    { label: "Hotel guide", href: "#hotel-guide" },
    ...(data?.faqs?.length
      ? [{ label: "FAQs", href: "#hotel-faqs" }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-montserrat text-[#1a1a1a]">
      <main className="w-full overflow-x-clip">
        <SearchBanner
          title={content?.banner_title || `Luxury Hotels in ${destinationName}`}
          description={
            content?.banner_subtitle ||
            `Explore handpicked 4 and 5 star hotels, all-inclusive resorts and luxury stays in ${destinationName}.`
          }
          image={content?.banner_image || HERO_IMAGE}
          disablePrefill
        />

        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1280px]">
            <nav
              aria-label="Hotel page sections"
              className="scrollbar-hide flex gap-2 overflow-x-auto rounded-[8px] border border-gray-200/80 bg-white p-2 shadow-sm"
            >
              {navigation.map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-[8px] px-3 py-2 text-[12px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-pml-primary ${
                    index === 0
                      ? "bg-pml-primary text-white"
                      : "text-[#4c4c4c] hover:bg-[#FBE8F4] hover:text-pml-primary"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <nav aria-label="Breadcrumb" className="py-5">
              <ol className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#667085]">
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <li key={crumb.href} className="flex items-center gap-1.5">
                      {index > 0 ? (
                        <span className="text-gray-300" aria-hidden="true">
                          /
                        </span>
                      ) : null}
                      {isLast ? (
                        <span
                          className="font-semibold text-[#1a1a1a]"
                          aria-current="page"
                        >
                          {crumb.name}
                        </span>
                      ) : (
                        <Link
                          href={crumb.href}
                          className="transition-colors hover:text-pml-primary"
                        >
                          {crumb.name}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>

            <div className="grid items-start gap-5 pb-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
              <div className="min-w-0 space-y-5">
                <section className="rounded-[8px] border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6 md:p-8">
                  <SectionHeading
                    eyebrow={content?.intro_eyebrow || copy.eyebrow}
                    title={content?.intro_title || `Luxury Hotels in ${destinationName}`}
                  />
                  <p className="mt-4 text-[14px] leading-7 text-[#4c4c4c] md:text-[15px]">
                    {introText}
                  </p>
                  {introMore ? (
                    <details className="group mt-3">
                      <summary className="inline-flex cursor-pointer list-none text-[13px] font-semibold text-pml-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-pml-primary [&::-webkit-details-marker]:hidden">
                        <span className="group-open:hidden">Read more</span>
                        <span className="hidden group-open:inline">Read less</span>
                      </summary>
                      <div className="mt-3 border-t border-gray-100 pt-3">
                        <p className="text-[14px] leading-7 text-[#4c4c4c] md:text-[15px]">
                          {introMore}
                        </p>
                      </div>
                    </details>
                  ) : null}
                </section>

                {hotelSections.length > 0 ? (
                  hotelSections.map((section) => (
                    <DestinationHotelCarousel
                      key={section.key}
                      id={`hotel-section-${section.key}`}
                      title={
                        section.key === "preferred"
                          ? `Preferred Hotels in ${destinationName}`
                          : `${section.label} Hotels in ${destinationName}`
                      }
                      description={
                        section.key === "preferred"
                          ? `Explore preferred ${destinationName} hotels that are not assigned to a holiday style yet.`
                          : `Explore preferred ${destinationName} hotels matched to ${section.label.toLowerCase()} holidays.`
                      }
                      hotels={section.hotels}
                      destinationName={destinationName}
                    />
                  ))
                ) : (
                  <section
                    id="hotel-sections"
                    className="scroll-mt-28 rounded-[8px] border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6 md:p-8"
                  >
                    <SectionHeading
                      eyebrow="Hotel collection"
                      title={`Hotels in ${destinationName}`}
                      description="No preferred hotels are available for this destination yet."
                    />
                    <Link
                      href={`/hotels?q=${encodeURIComponent(destinationName)}`}
                      className="mt-5 inline-flex items-center gap-2 rounded-[8px] bg-pml-primary px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#a81970]"
                    >
                      Search all hotels
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </section>
                )}

                <section
                  id="places-to-stay"
                  className="scroll-mt-28 rounded-[8px] border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6 md:p-8"
                >
                  <SectionHeading
                    eyebrow="Hotels by location"
                    title={copy.areaTitle}
                    description={copy.areaIntro}
                  />
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {areaCards.map((area) => (
                      <Link
                        key={area.name}
                        href={`/hotels?q=${encodeURIComponent(area.name)}`}
                        className="group overflow-hidden rounded-[8px] border border-gray-200/80 bg-white transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pml-primary"
                      >
                        <div className="relative h-[150px] overflow-hidden bg-gray-100">
                          <Image
                            src={area.image}
                            alt={`Hotels in ${area.name}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 280px"
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                          <span className="absolute bottom-3 left-3 right-3 text-[17px] font-semibold text-white drop-shadow">
                            {area.name}
                          </span>
                        </div>
                        <div className="p-3.5">
                          <p className="text-[12px] leading-5 text-[#667085]">
                            {area.description}
                          </p>
                          <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-pml-primary">
                            Find hotels
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>

                {data?.faqs?.length ? (
                  <FAQs
                    id="hotel-faqs"
                    variant="card"
                    sectionClassName=""
                    eyebrow="Good to know"
                    title={`${destinationName} hotel FAQs`}
                    faqItems={data.faqs}
                  />
                ) : null}

                <section
                  id="hotel-guide"
                  className="scroll-mt-28 rounded-[8px] border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6 md:p-8"
                >
                  <SectionHeading
                    eyebrow="Plan your stay"
                    title={`Choosing a luxury hotel in ${destinationName}`}
                    description={`The right hotel in ${destinationName} depends on the location, atmosphere and facilities that matter most to you.`}
                  />
                  <div className="mt-6 rounded-[8px] bg-[#111111] p-5 text-white sm:flex sm:items-center sm:justify-between sm:gap-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e8b5d3]">
                        Holiday brochure
                      </p>
                      <h3 className="mt-2 text-[18px] font-semibold">
                        Explore our latest luxury holiday collection
                      </h3>
                      <p className="mt-2 max-w-2xl text-[12px] leading-5 text-white/75">
                        Browse handpicked destinations, exclusive offers and
                        added extras in the latest PlanMyLuxe brochure.
                      </p>
                    </div>
                    <a
                      href={BROCHURE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-[8px] bg-pml-primary px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#a81970] focus:outline-none focus:ring-2 focus:ring-white sm:mt-0"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Download brochure
                    </a>
                  </div>
                  <details className="group mt-5">
                    <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-[8px] border border-pml-primary px-4 py-2 text-[13px] font-semibold text-pml-primary transition-colors hover:bg-pml-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-pml-primary focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                      <span className="group-open:hidden">Read the hotel guide</span>
                      <span className="hidden group-open:inline">Close hotel guide</span>
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-open:rotate-90"
                        aria-hidden="true"
                      />
                    </summary>
                    <div className="mt-5 space-y-4 border-t border-gray-100 pt-5 text-[14px] leading-7 text-[#4c4c4c]">
                      <p>
                        Begin with location. A beachfront resort can make a
                        relaxed holiday effortless, while a central hotel may
                        be better for restaurants, shopping and sightseeing.
                        Check the journey from the airport as well as the
                        distance to the places you plan to visit.
                      </p>
                      <p>
                        Look beyond the star rating when comparing hotels.
                        Room category, board basis, pool and beach access,
                        family facilities and included extras can all change
                        the overall experience and final price.
                      </p>
                      <p>
                        Package details will vary by travel date and departure
                        airport. Review the complete offer before booking, and
                        speak to a PlanMyLuxe expert if you want help narrowing
                        down the options.
                      </p>
                    </div>
                  </details>
                </section>
              </div>

              <aside className="space-y-4 lg:sticky lg:top-[calc(var(--main-nav-height)+24px)] lg:max-h-[calc(100vh-var(--main-nav-height)-32px)] lg:overflow-y-auto lg:pr-2">
                <section className="rounded-[8px] border border-gray-200/80 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-pml-primary">
                    {levelLabel}
                  </p>
                  <h2 className="mt-2 text-[20px] font-semibold text-[#1a1a1a]">
                    Explore {destinationName} hotels
                  </h2>
                  <p className="mt-2 text-[12px] leading-5 text-[#667085]">
                    Jump directly to each section of this hotel guide.
                  </p>
                  <nav aria-label="Hotel guide navigation" className="mt-4 space-y-1">
                    {navigation.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="group flex items-center justify-between rounded-[8px] px-3 py-2.5 text-[12px] font-semibold text-[#4c4c4c] transition-colors hover:bg-[#FBE8F4] hover:text-pml-primary focus:outline-none focus:ring-2 focus:ring-pml-primary"
                      >
                        {item.label}
                        <ArrowRight
                          className="h-3.5 w-3.5 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-pml-primary"
                          aria-hidden="true"
                        />
                      </a>
                    ))}
                  </nav>
                </section>

                <section className="rounded-[8px] border border-gray-200/80 bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#FBE8F4] text-pml-primary">
                    <BedDouble className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="mt-3 text-[20px] font-semibold text-[#1a1a1a]">
                    Find {destinationArticle} {destinationName} hotel
                  </h2>
                  <p className="mt-1 text-[12px] leading-5 text-[#667085]">
                    Start with a destination and hotel style. You can refine
                    the results on the hotel search page.
                  </p>
                  <form action="/hotels" method="get" className="mt-4 space-y-3">
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-semibold text-[#4c4c4c]">
                        Destination
                      </span>
                      <input
                        type="search"
                        name="q"
                        defaultValue={destinationName}
                        className="h-10 w-full rounded-[8px] border border-gray-300 bg-white px-3 text-[12px] text-[#1a1a1a] outline-none transition focus:border-pml-primary focus:ring-2 focus:ring-pml-primary/20"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-semibold text-[#4c4c4c]">
                        Hotel type
                      </span>
                      <select
                        name="type"
                        defaultValue=""
                        className="h-10 w-full rounded-[8px] border border-gray-300 bg-white px-3 text-[12px] text-[#1a1a1a] outline-none transition focus:border-pml-primary focus:ring-2 focus:ring-pml-primary/20"
                      >
                        <option value="">All hotel types</option>
                        <option value="5-star">5 Star</option>
                        <option value="4-star">4 Star</option>
                        <option value="all-inclusive">All Inclusive</option>
                        <option value="family">Family</option>
                        <option value="beach">Beach</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-semibold text-[#4c4c4c]">
                        Board basis
                      </span>
                      <select
                        name="board_basis"
                        defaultValue=""
                        className="h-10 w-full rounded-[8px] border border-gray-300 bg-white px-3 text-[12px] text-[#1a1a1a] outline-none transition focus:border-pml-primary focus:ring-2 focus:ring-pml-primary/20"
                      >
                        <option value="">Any board basis</option>
                        <option value="AI">All Inclusive</option>
                        <option value="HB">Half Board</option>
                        <option value="BB">Bed & Breakfast</option>
                      </select>
                    </label>
                    <button
                      type="submit"
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-pml-primary px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#a81970] focus:outline-none focus:ring-2 focus:ring-pml-primary focus:ring-offset-2"
                    >
                      <Search className="h-4 w-4" aria-hidden="true" />
                      Search hotels
                    </button>
                  </form>
                </section>

                <HotelSignupCard destinationName={destinationName} />
              </aside>
            </div>
          </div>
        </div>

        <BookingConfidence destinationName={destinationName} />
      </main>
    </div>
  );
}

export async function DestinationHotelsPage({
  params,
}: DestinationHotelsPageProps) {
  const resolvedParams = await params;
  const result = await getDestinationHotels(
    resolvedParams.slug,
    resolvedParams.region,
    resolvedParams.resort,
  );
  if (result.status === "not_found") notFound();

  const data = result.status === "ok" ? result.data : null;
  const { destinationName, breadcrumbs, destinationPath } =
    getDestinationContext(resolvedParams, data?.destination);
  const siteUrl = getSiteUrl();
  const absoluteUrl = (path: string) =>
    new URL(path, `${siteUrl}/`).toString();
  const pagePath = data?.destination.hotels_path || `${destinationPath}/hotels`;
  const schemaGraph: Record<string, unknown>[] = [
    {
      "@type": "CollectionPage",
      name: data?.content?.banner_title || `Luxury Hotels in ${destinationName}`,
      url: absoluteUrl(pagePath),
      description:
        data?.content?.Meta_Description ||
        data?.content?.banner_subtitle ||
        undefined,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: data?.hotels.length || 0,
        itemListElement: (data?.hotels || []).map((hotel, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: hotel.name,
          url: absoluteUrl(`/hotels/${hotel.slug}`),
        })),
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.href),
      })),
    },
  ];
  if (data?.faqs.length) {
    schemaGraph.push({
      "@type": "FAQPage",
      mainEntity: data.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer
            .replace(/<[^>]*>/g, " ")
            .replace(/&nbsp;/gi, " ")
            .replace(/\s+/g, " ")
            .trim(),
        },
      })),
    });
  }

  return (
    <>
      <SeoHeadScripts
        html={data?.content?.Head_Scripts}
        debugId="destination-hotels"
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": schemaGraph,
        }}
      />
      <DestinationHotelsLanding params={resolvedParams} data={data} />
    </>
  );
}

export async function generateDestinationHotelsMetadata({
  params,
}: DestinationHotelsPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const result = await getDestinationHotels(
    resolvedParams.slug,
    resolvedParams.region,
    resolvedParams.resort,
  );
  const data = result.status === "ok" ? result.data : null;
  const { destinationName, destinationPath } =
    getDestinationContext(resolvedParams, data?.destination);
  const content = data?.content;
  const fallbackDescription = `Explore luxury hotels in ${destinationName}, including 4 and 5 star hotels, all-inclusive resorts, family hotels and beach stays.`;
  const seo = content
    ? {
        Meta_Title: content.Meta_Title || "",
        Meta_Description: content.Meta_Description || "",
        OG_Image: content.OG_Image || "",
        Canonical_URL: content.Canonical_URL || "",
        Twitter_Image: content.Twitter_Image || "",
        Head_Scripts: content.Head_Scripts || "",
        slug: data?.destination.slug || resolvedParams.slug,
        model: "destination_hotels",
      }
    : null;

  return buildMetadataFromSeo(seo, {
    fallbackTitle: `Luxury Hotels in ${destinationName} | PlanMyLuxe`,
    fallbackDescription,
    fallbackPath:
      data?.destination.hotels_path || `${destinationPath}/hotels`,
    twitterCard: "summary_large_image",
  });
}
