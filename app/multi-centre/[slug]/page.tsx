import { getMultiCentreContent, getMultiCentreDefaultPricing } from "@/lib/multiCentreServerData";
import MultiCentrePageClient from "./MultiCentrePageClient";

export const dynamic = "force-dynamic"; // live fetch is no-store; matches today's always-fresh behavior

export default async function MultiCentreSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [initialContent, initialPricing] = await Promise.all([
    getMultiCentreContent(slug),
    getMultiCentreDefaultPricing(slug),
  ]);

  return (
    <MultiCentrePageClient key={slug} initialContent={initialContent} initialPricing={initialPricing} />
  );
}
