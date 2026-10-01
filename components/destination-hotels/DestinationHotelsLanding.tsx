import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Download,
  Gift,
  MapPin,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import SearchBanner from "@/components/SearchBanner";
import DestinationGuideTabs from "@/components/destination-guides/DestinationGuideTabs";
import BookingConfidence from "@/components/destinationdetail/BookingConfidence";
import DestinationHotelCarousel from "@/components/destination-hotels/DestinationHotelCarousel";
import HotelSignupCard from "@/components/destination-hotels/HotelSignupCard";
import EnquiryForm from "@/components/hotels/EnquiryForm";
import FAQs from "@/components/faqs";
import JsonLd from "@/components/seo/JsonLd";
import SeoHeadScripts from "@/components/seo/SeoHeadScripts";
import { getDestinationHotels } from "@/lib/destinations/hotels";
import { buildMetadataFromSeo } from "@/lib/seo/metadata";
import { getSiteUrl } from "@/lib/site-url";
import type {
  DestinationHotel,
  DestinationHotelArea,
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

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1800&q=85";

const BROCHURE_URL =
  "https://accelerate-digital.paperturn-view.com/?pid=ODg8871976&v=8.5&p=1&source=qr";

const BROCHURE_COVER =
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80";

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

function getLevelCopy(level: DestinationLevel, destinationName: string) {
  if (level === "country") {
    return {
      eyebrow: "Country hotel guide",
      intro: `${destinationName} brings together luxurious beach resorts, characterful city hotels and relaxing all-inclusive stays. Compare locations, hotel styles and holiday experiences before choosing the right escape.`,
      introMore: `When comparing hotels in ${destinationName}, look beyond the star rating. The location, room category, board basis, included facilities and airport transfer time can all shape the experience and total holiday price.`,
      areaTitle: `Where to stay in ${destinationName}`,
      areaIntro: `Browse hotels in every region and resort across ${destinationName}.`,
    };
  }

  if (level === "region") {
    return {
      eyebrow: "Regional hotel guide",
      intro: `${destinationName} offers a varied collection of luxury hotels, from beachfront resorts to smaller stays close to local attractions. Compare the areas, facilities and board options that suit your trip.`,
      introMore: `Choose your base in ${destinationName} around the experience that matters most to you, whether that is the beach, family facilities, dining or a quieter setting. Check each hotel’s exact location and transfer time before booking.`,
      areaTitle: `Where to stay in ${destinationName}`,
      areaIntro: `Browse hotels in each resort within the ${destinationName} region.`,
    };
  }

  return {
    eyebrow: "Resort hotel guide",
    intro: `${destinationName} is an ideal base for a refined hotel escape, with options for couples, families and all-inclusive stays. Compare beachfront locations, facilities and room styles before you book.`,
    introMore: `For the best ${destinationName} stay, compare the hotel location, board basis and facilities alongside the complete package price. Room category and included extras can make a significant difference to the overall value.`,
    areaTitle: `More places to stay near ${destinationName}`,
    areaIntro: `Browse hotels in the other resorts close to ${destinationName}.`,
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

function AreaPill({ area }: { area: DestinationHotelArea }) {
  return (
    <Link
      href={area.path}
      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-medium text-[#4c4c4c] transition-colors hover:border-pml-primary hover:bg-[#FBE8F4] hover:text-pml-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-pml-primary"
    >
      {area.name}
    </Link>
  );
}

export function DestinationHotelsLanding({
  params,
  data,
}: {
  params: DestinationHotelsRouteParams;
  data?: DestinationHotelsResponse | null;
}) {
  const { level, destinationName, destinationPath, breadcrumbs } =
    getDestinationContext(params, data?.destination);
  const copy = getLevelCopy(level, destinationName);
  const content = data?.content;
  const introText = content?.intro_text || copy.intro;
  const introMore = content?.intro_more || copy.introMore;
  const areas = data?.areas || [];
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
    ...(areas.length ? [{ label: "Where to stay", href: "#places-to-stay" }] : []),
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
          image={content?.banner_image || HERO_IMAGE}
          disablePrefill
          badge={`${destinationName} Luxury Holiday Planner`}
        />

        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1280px]">
            <DestinationGuideTabs
              tabs={
                data?.tabs?.length
                  ? data.tabs
                  : [{ key: "hotels", label: "Hotels", path: `${destinationPath}/hotels`, active: true }]
              }
            />

            <nav aria-label="Breadcrumb" className="py-3 sm:py-5">
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

                {areas.length ? (
                  <section
                    id="places-to-stay"
                    className="scroll-mt-28 rounded-[8px] border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6 md:p-8"
                  >
                    <SectionHeading
                      eyebrow="Hotels by location"
                      title={copy.areaTitle}
                      description={copy.areaIntro}
                    />
                    {level === "country" ? (
                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {areas.map((region) => (
                          <div
                            key={region.path}
                            className="rounded-[8px] border border-gray-200/80 bg-[#FCFCFD] p-4"
                          >
                            <Link
                              href={region.path}
                              className="group flex items-center justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-pml-primary"
                            >
                              <span className="flex min-w-0 items-center gap-2.5">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FBE8F4] text-pml-primary">
                                  <MapPin className="h-4 w-4" aria-hidden="true" />
                                </span>
                                <span className="min-w-0 truncate text-[15px] font-semibold text-[#1a1a1a] transition-colors group-hover:text-pml-primary">
                                  {region.name}
                                </span>
                              </span>
                              <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-pml-primary">
                                Hotels
                                <ArrowRight
                                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                                  aria-hidden="true"
                                />
                              </span>
                            </Link>
                            {region.children.length ? (
                              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-gray-100 pt-3">
                                {region.children.map((resort) => (
                                  <AreaPill key={resort.path} area={resort} />
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {areas.map((resort) => (
                          <AreaPill key={resort.path} area={resort} />
                        ))}
                      </div>
                    )}
                  </section>
                ) : null}

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
                  <div className="relative mt-6 overflow-hidden rounded-[12px] bg-gradient-to-br from-[#111111] via-[#1d1320] to-[#4a0f33] p-4 text-white sm:p-8">
                    <div
                      className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-pml-primary/30 blur-3xl"
                      aria-hidden="true"
                    />
                    <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-center">
                      <a
                        href={BROCHURE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open the PlanMyLuxe brochure"
                        className="group relative h-[200px] w-[150px] shrink-0"
                      >
                        <span
                          className="absolute inset-0 translate-x-3 translate-y-2 rotate-6 rounded-[6px] bg-white/15"
                          aria-hidden="true"
                        />
                        <span
                          className="absolute inset-0 translate-x-1.5 translate-y-1 rotate-3 rounded-[6px] bg-white/25"
                          aria-hidden="true"
                        />
                        <span className="absolute inset-0 overflow-hidden rounded-[6px] shadow-2xl ring-1 ring-white/20 transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-2">
                          <Image
                            src={BROCHURE_COVER}
                            alt=""
                            fill
                            sizes="150px"
                            className="object-cover"
                          />
                          <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
                          <span className="absolute left-3 top-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/90">
                            PlanMyLuxe
                          </span>
                          <span className="absolute bottom-3 left-3 right-3 text-[14px] font-semibold leading-tight text-white">
                            Luxury Holiday Collection
                          </span>
                        </span>
                      </a>

                      <div className="w-full min-w-0 flex-1 text-center sm:text-left">
                        <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#f3c4e0]">
                          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                          Free brochure
                        </p>
                        <h3 className="mt-3 text-[20px] font-semibold leading-tight md:text-[24px]">
                          Download our latest luxury holiday brochure
                        </h3>
                        <p className="mt-2 hidden text-[13px] leading-6 text-white/75 sm:block">
                          Get inspired with handpicked hotels in {destinationName} and
                          beyond, exclusive offers and the added extras our experts love.
                        </p>
                        <ul className="mt-4 flex flex-nowrap items-center justify-center whitespace-nowrap text-[10.5px] text-white/85 sm:grid sm:grid-cols-3 sm:gap-2 sm:text-left sm:text-[12px]">
                          {[
                            { icon: Sparkles, label: "Handpicked hotels" },
                            { icon: Gift, label: "Exclusive extras" },
                            { icon: MapPin, label: "Insider tips" },
                          ].map(({ icon: Icon, label }) => (
                            <li
                              key={label}
                              className="flex items-center before:mx-1.5 before:text-[#f3c4e0] before:content-['•'] first:before:content-none sm:gap-2 sm:before:content-none"
                            >
                              <Icon className="hidden h-4 w-4 shrink-0 text-[#f3c4e0] sm:block" aria-hidden="true" />
                              {label}
                            </li>
                          ))}
                        </ul>
                        <a
                          href={BROCHURE_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex items-center gap-2 rounded-[8px] bg-pml-primary px-5 py-3 text-[13px] font-semibold text-white shadow-lg shadow-pml-primary/30 transition-colors hover:bg-[#a81970] focus:outline-none focus:ring-2 focus:ring-white"
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          Download brochure
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="space-y-4">
                <section className="hidden rounded-[8px] border border-gray-200/80 bg-white p-5 shadow-sm lg:block">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-pml-primary">
                    {levelLabel}
                  </p>
                  <h2 className="mt-2 text-[20px] font-semibold text-[#1a1a1a]">
                    Explore {destinationName} hotels
                  </h2>
                  <p className="mt-2 text-[12px] leading-5 text-[#667085]">
                    Jump directly to each section of this hotel guide.
                  </p>
                  <nav
                    aria-label="Hotel guide navigation"
                    className="scroll-on-hover mt-4 max-h-[320px] space-y-1 overflow-y-auto pr-1"
                  >
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
                    <MessageSquare className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="mt-3 text-[20px] font-semibold text-[#1a1a1a]">
                    Enquire about {destinationName} hotels
                  </h2>
                  <p className="mt-1 text-[12px] leading-5 text-[#667085]">
                    Tell us what you are looking for and a PlanMyLuxe expert
                    will be in touch with tailored hotel options.
                  </p>
                  <EnquiryForm
                    initialValues={{
                      destination: destinationName,
                      source: `Hotels Page - ${destinationPath}/hotels`,
                    }}
                    showQuickHelp={false}
                    containerClassName="mt-4"
                    messageRows={3}
                  />
                </section>

                <HotelSignupCard destinationName={destinationName} />
              </aside>
            </div>
          </div>
        </div>

        <BookingConfidence
          destinationName={destinationName}
          source={`${destinationName} hotels page`}
        />
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
