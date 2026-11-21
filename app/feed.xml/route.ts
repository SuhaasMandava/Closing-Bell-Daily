import { getAllArticles } from "@/lib/articles";
import { getAllAiWatch } from "@/lib/ai-watch";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// Rendered once at build time (required for the static export).
export const dynamic = "force-static";

const MAX_ENTRIES = 60;
// Issues are dated, not timestamped; publish time is the US close (4pm ET).
const stamp = (date: string) => `${date}T21:00:00Z`;

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Atom feed of the latest daily wraps and AI Watch entries, newest first. */
export async function GET() {
  const items = [
    ...getAllArticles().map((a) => ({ ...a, path: `/articles/${a.slug}`, section: "Daily wrap" })),
    ...getAllAiWatch().map((e) => ({ ...e, path: `/ai-watch/${e.slug}`, section: "AI Watch" })),
  ]
    .sort((a, b) => (a.date === b.date ? b.slug.localeCompare(a.slug) : b.date.localeCompare(a.date)))
    .slice(0, MAX_ENTRIES);

  const updated = items[0] ? stamp(items[0].date) : new Date().toISOString();

  const entries = items
    .map((item) => {
      const url = `${SITE_URL}${item.path}`;
      const categories = [item.section, ...item.tags]
        .map((t) => `    <category term="${esc(t)}" />`)
        .join("\n");
      return `  <entry>
    <title>${esc(item.title)}</title>
    <link href="${url}" />
    <id>${url}</id>
    <published>${stamp(item.date)}</published>
    <updated>${stamp(item.date)}</updated>
    <summary>${esc(item.summary)}</summary>
${categories}
  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${esc(SITE_NAME)}</title>
  <subtitle>${esc(SITE_DESCRIPTION)}</subtitle>
  <link href="${SITE_URL}/feed.xml" rel="self" />
  <link href="${SITE_URL}" />
  <id>${SITE_URL}/</id>
  <updated>${updated}</updated>
${entries}
</feed>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
