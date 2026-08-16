import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { getAllAiWatch } from "@/lib/ai-watch";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const aiWatch = getAllAiWatch();

  return [
    {
      url: SITE_URL,
      lastModified: articles[0] ? new Date(articles[0].date) : new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/ai-watch`,
      lastModified: aiWatch[0] ? new Date(aiWatch[0].date) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...articles.map((article) => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: new Date(article.date),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
    ...aiWatch.map((entry) => ({
      url: `${SITE_URL}/ai-watch/${entry.slug}`,
      lastModified: new Date(entry.date),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
