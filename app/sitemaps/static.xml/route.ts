import { createSitemapBucketResponse } from "@/lib/sitemap";

export async function GET() {
  return createSitemapBucketResponse("static");
}