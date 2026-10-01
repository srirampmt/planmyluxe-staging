import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import SearchBanner from "@/components/SearchBanner";
import DestinationGuideTabs from "@/components/destination-guides/DestinationGuideTabs";
import FAQs from "@/components/faqs";
import JsonLd from "@/components/seo/JsonLd";
import SeoHeadScripts from "@/components/seo/SeoHeadScripts";
import type { DestinationHotelsRouteParams } from "@/components/destination-hotels/DestinationHotelsLanding";
import { getDestinationGuide } from "@/lib/destinations/guides";
import { sanitizeGuideHtml } from "@/lib/sanitizeGuideHtml";
import { buildMetadataFromSeo } from "@/lib/seo/metadata";
import { getSiteUrl } from "@/lib/site-url";
import type {
  DestinationGuidePageType,
  DestinationGuideResponse,
} from "@/types/destinationGuide";

type DestinationGuidePageProps = {
  params: Promise<DestinationHotelsRouteParams>;
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1800&q=85";

function guideTitle(label: string, destinationName: string) {
  if (label === "Best time to visit") return `Best Time to Visit ${destinationName}`;
  if (label === "Things to do") return `Things to Do in ${destinationName}`;
  return `Places to Visit in ${destinationName}`;
}

function buildBreadcrumbs(data: DestinationGuideResponse, params: DestinationHotelsRouteParams) {
  const { destination, content } = data;
  const segments = [params.slug, params.region, params.resort].filter(
    (segment): segment is string => Boolean(segment),
  );
  const names = [destination.country_name, destination.region_name, destination.resort_name];
  return [
    { name: "Home", href: "/" },
    { name: "Destinations", href: "/destinations" },
    ...segments.map((segment, index) => ({
      name: names[index] || (index === segments.length - 1 ? destination.name : segment),
      href: `/destinations/${segments.slice(0, index + 1).map(encodeURIComponent).join("/")}`,
    })),
    { name: content.label, href: `${destination.public_path}/${content.page_type}` },
  ];
}

async function loadGuide(pageType: DestinationGuidePageType, params: DestinationHotelsRouteParams) {
  const result = await getDestinationGuide(pageType, params.slug, params.region, params.resort);
  return result.status === "ok" ? result.data : null;
}

function DestinationGuideLanding({
  data,
  params,
}: {
  data: DestinationGuideResponse;
  params: DestinationHotelsRouteParams;
}) {
  const { destination, content } = data;
  const destinationName = destination.name;
  const title = content.intro_title || guideTitle(content.label, destinationName);
  const breadcrumbs = buildBreadcrumbs(data, params);
  const body = sanitizeGuideHtml(content.body);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-montserrat text-[#1a1a1a]">
      <link rel="stylesheet" href="/guide-content.css" />
      <main className="w-full overflow-x-clip">
        <SearchBanner
          title={content.banner_title || guideTitle(content.label, destinationName)}
          description={content.banner_subtitle || ""}
          image={content.banner_image || HERO_IMAGE}
          disablePrefill
          badge={`${destinationName} Luxury Holiday Planner`}
        />

        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1280px]">
            <DestinationGuideTabs tabs={data.tabs} />

            <nav aria-label="Breadcrumb" className="py-3 sm:pb-5 sm:pt-1">
              <ol className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#667085]">
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <li key={crumb.href} className="flex items-center gap-1.5">
                      {index > 0 ? (
                        <span className="text-gray-300" aria-hidden="true">/</span>
                      ) : null}
                      {isLast ? (
                        <span className="font-semibold text-[#1a1a1a]" aria-current="page">
                          {crumb.name}
                        </span>
                      ) : (
                        <Link href={crumb.href} className="transition-colors hover:text-pml-primary">
                          {crumb.name}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>

            <div className="space-y-5 pb-10">
              <section className="rounded-[8px] border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6 md:p-8">
                {content.intro_eyebrow ? (
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-pml-primary">
                    {content.intro_eyebrow}
                  </p>
                ) : null}
                <h2 className="mt-2 text-[24px] font-semibold leading-tight tracking-[-0.02em] text-[#1a1a1a] md:text-[32px]">
                  {title}
                </h2>
                {content.intro_text ? (
                  <p className="mt-4 whitespace-pre-line text-[14px] leading-7 text-[#4c4c4c] md:text-[15px]">
                    {content.intro_text}
                  </p>
                ) : null}
                {content.intro_more ? (
                  <details className="group mt-3">
                    <summary className="inline-flex cursor-pointer list-none text-[13px] font-semibold text-pml-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-pml-primary [&::-webkit-details-marker]:hidden">
                      <span className="group-open:hidden">Read more</span>
                      <span className="hidden group-open:inline">Read less</span>
                    </summary>
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <p className="whitespace-pre-line text-[14px] leading-7 text-[#4c4c4c] md:text-[15px]">
                        {content.intro_more}
                      </p>
                    </div>
                  </details>
                ) : null}
              </section>

              {body ? (
                <section className="rounded-[8px] border border-gray-200/80 bg-white px-5 py-6 shadow-sm sm:px-6 md:px-8 md:py-8">
                  <div className="guide-content" dangerouslySetInnerHTML={{ __html: body }} />
                </section>
              ) : null}

              {data.faqs.length ? (
                <FAQs
                  id="guide-faqs"
                  variant="card"
                  sectionClassName=""
                  eyebrow="Good to know"
                  title={`${destinationName} ${content.label.toLowerCase()} FAQs`}
                  faqItems={data.faqs}
                />
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function destinationGuidePage(pageType: DestinationGuidePageType) {
  return async function DestinationGuidePage({ params }: DestinationGuidePageProps) {
    const resolvedParams = await params;
    const data = await loadGuide(pageType, resolvedParams);
    if (!data) notFound();

    const siteUrl = getSiteUrl();
    const absoluteUrl = (path: string) => new URL(path, `${siteUrl}/`).toString();
    const breadcrumbs = buildBreadcrumbs(data, resolvedParams);
    const schemaGraph: Record<string, unknown>[] = [
      {
        "@type": "WebPage",
        name: data.content.banner_title || guideTitle(data.content.label, data.destination.name),
        url: absoluteUrl(`${data.destination.public_path}/${pageType}`),
        description: data.content.Meta_Description || data.content.banner_subtitle || undefined,
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
    if (data.faqs.length) {
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
        <SeoHeadScripts html={data.content.Head_Scripts} debugId={`destination-${pageType}`} />
        <JsonLd data={{ "@context": "https://schema.org", "@graph": schemaGraph }} />
        <DestinationGuideLanding data={data} params={resolvedParams} />
      </>
    );
  };
}

export function destinationGuideMetadata(pageType: DestinationGuidePageType) {
  return async function generateMetadata({ params }: DestinationGuidePageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const data = await loadGuide(pageType, resolvedParams);
    if (!data) return { title: "Page not found | PlanMyLuxe" };

    const { content, destination } = data;
    const title = guideTitle(content.label, destination.name);
    return buildMetadataFromSeo(
      {
        Meta_Title: content.Meta_Title || "",
        Meta_Description: content.Meta_Description || "",
        OG_Image: content.OG_Image || content.banner_image || "",
        Canonical_URL: content.Canonical_URL || "",
        Twitter_Image: content.Twitter_Image || "",
        Head_Scripts: content.Head_Scripts || "",
        slug: destination.slug || resolvedParams.slug,
        model: `destination_${pageType.replace(/-/g, "_")}`,
      },
      {
        fallbackTitle: `${title} | PlanMyLuxe`,
        fallbackDescription:
          content.banner_subtitle || `${title}: a PlanMyLuxe guide to planning your luxury holiday.`,
        fallbackPath: `${destination.public_path}/${pageType}`,
        twitterCard: "summary_large_image",
      },
    );
  };
}
