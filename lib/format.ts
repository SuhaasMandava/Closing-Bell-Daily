/**
 * Pure date/reading-time helpers with no filesystem access, split out of
 * lib/articles.ts so client components can import them directly. Importing
 * a runtime binding from lib/articles.ts — even just one function — pulls
 * its top-level `node:fs` import into the client bundle, which the bundler
 * can't resolve for the browser at all.
 */

const WORDS_PER_MINUTE = 200;

/** Rough reading time from word count, floored at 1 minute. */
export function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** "August 12, 2026" — formatted in UTC so server and client always agree. */
export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** "08/12/2026" — the terminal-style stamp used on cards and rows. */
export function formatStamp(date: string): string {
  const [y, m, d] = date.split("-");
  return `${m}/${d}/${y}`;
}

/** "08/12" — the short code used in the issue log's first column. */
export function formatCode(date: string): string {
  const [, m, d] = date.split("-");
  return `${m}/${d}`;
}

/** "08/17" or "08/17 PREMARKET" — the issue log's session label. */
export function formatSession(article: {
  date: string;
  isPremarket: boolean;
}): string {
  const code = formatCode(article.date);
  return article.isPremarket ? `${code} PREMARKET` : code;
}
