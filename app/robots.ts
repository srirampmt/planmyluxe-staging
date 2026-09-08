import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

// robots.txt configuration for better SEO crawling
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const sitemapUrl = new URL("/sitemap.xml", siteUrl).toString();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/Travelzoo/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        crawlDelay: 0,
        disallow: ["/api/", "/Travelzoo/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        crawlDelay: 1,
        disallow: ["/api/", "/Travelzoo/"],
      },
      {
        userAgent: "TikTokSpider",
        disallow: "/",
      },
    ],
    sitemap: [sitemapUrl],
    host: siteUrl,
  };
}


