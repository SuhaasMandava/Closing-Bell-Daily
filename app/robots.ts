import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Rendered once at build time (required for the static export).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The quote feed is for the ticker, not for crawlers.
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
