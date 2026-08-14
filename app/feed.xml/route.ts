import { formatDate, getAllArticles } from "@/lib/articles";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

/** Escapes the five XML predefined entities so titles with & or " stay valid. */
function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = getAllArticles();
  const updated = articles[0]
    ? new Date(`${articles[0].date}T21:00:00Z`)
    : new Date(0);

  const items = articles
    .map((article) => {
      const url = `${SITE_URL}/articles/${article.slug}`;
      // Issues are written after the US close, so stamp them at 21:00 UTC
      // (5pm ET) rather than midnight.
      const pubDate = new Date(`${article.date}T21:00:00Z`).toUTCString();

      return `    <item>
      <title>${xml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${xml(article.summary || formatDate(article.date))}</description>
${article.tags.map((t) => `      <category>${xml(t)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${xml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${updated.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
