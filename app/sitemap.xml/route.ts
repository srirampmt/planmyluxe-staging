import { createSitemapIndexResponse } from "@/lib/sitemap";

export async function GET() {
  return createSitemapIndexResponse();
}
