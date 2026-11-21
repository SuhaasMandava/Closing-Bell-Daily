import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { getAllAiWatch } from "@/lib/ai-watch";
import { SITE_URL } from "@/lib/site";

// Rendered once at build time (required for the static export).
export const dynamic = "force-static";

/**
 * Built from the content folders, so a new issue shows up in the sitemap on
 * the next deploy with no manual edit.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const aiWatch = getAllAiWatch();
  const latest = [...articles, ...aiWatch].map((e) => e.date).sort().pop();
  const asDate = (d: string) => new Date(`${d}T00:00:00Z`);

  return [
    {
      url: SITE_URL,
      lastModified: latest ? asDate(latest) : undefined,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/ai-watch`,
      lastModified: aiWatch[0] ? asDate(aiWatch[0].date) : undefined,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...articles.map((a) => ({
      url: `${SITE_URL}/articles/${a.slug}`,
      lastModified: asDate(a.date),
      changeFrequency: "never" as const,
      priority: 0.8,
    })),
    ...aiWatch.map((e) => ({
      url: `${SITE_URL}/ai-watch/${e.slug}`,
      lastModified: asDate(e.date),
      changeFrequency: "never" as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
