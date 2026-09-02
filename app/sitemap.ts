import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://closing-bell-daily.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://closing-bell-daily.com/posts/2026-09-02',
      lastModified: new Date('2026-09-02'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://closing-bell-daily.com/ai-watch/2026-09-02',
      lastModified: new Date('2026-09-02'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]
}