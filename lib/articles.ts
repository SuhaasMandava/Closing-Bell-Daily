import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

export type Direction = "up" | "down" | "flat";

export type IndexClose = {
  symbol: string;
  close: string;
  change: string;
};

export type ArticleMeta = {
  /** URL slug — the filename without its extension, e.g. "2026-08-12" */
  slug: string;
  title: string;
  /** ISO date string from frontmatter, e.g. "2026-08-12" */
  date: string;
  summary: string;
  tags: string[];
  /** Short badge label for the day's call, e.g. "risk-on rally" */
  verdict: string;
  /** Colors the verdict badge and the sparkline */
  direction: Direction;
  /** Intraday shape for the featured card chart */
  sparkline: number[];
  /** Optional index closes rendered as stat cards on the article page */
  indexes: IndexClose[];
};

export type Article = ArticleMeta & {
  /** Raw MDX body, frontmatter stripped */
  content: string;
};

function toDirection(value: unknown): Direction {
  return value === "up" || value === "down" || value === "flat"
    ? value
    : "flat";
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((s) => s.trim());
  }
  return [];
}

function toIndexes(value: unknown): IndexClose[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
    .map((row) => ({
      symbol: String(row.symbol ?? ""),
      close: String(row.close ?? ""),
      change: String(row.change ?? ""),
    }))
    .filter((row) => row.symbol);
}

function readArticleFile(slug: string): Article {
  const mdx = path.join(ARTICLES_DIR, `${slug}.mdx`);
  const md = path.join(ARTICLES_DIR, `${slug}.md`);
  const file = fs.existsSync(mdx) ? mdx : md;

  const { data, content } = matter(fs.readFileSync(file, "utf8"));

  if (!data.title) throw new Error(`${slug}: frontmatter is missing "title"`);
  if (!data.date) throw new Error(`${slug}: frontmatter is missing "date"`);

  return {
    slug,
    title: String(data.title),
    // A bare YAML date like 2026-08-12 is parsed into a Date by gray-matter,
    // so normalize back to a plain ISO day string.
    date:
      data.date instanceof Date
        ? data.date.toISOString().slice(0, 10)
        : String(data.date),
    summary: data.summary ? String(data.summary) : "",
    tags: toStringArray(data.tags),
    verdict: data.verdict ? String(data.verdict) : "",
    direction: toDirection(data.direction),
    sparkline: Array.isArray(data.sparkline) ? data.sparkline.map(Number) : [],
    indexes: toIndexes(data.indexes),
    content,
  };
}

/** All articles, newest first. */
export function getAllArticles(): Article[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];

  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((name) => /\.mdx?$/.test(name))
    .map((name) => readArticleFile(name.replace(/\.mdx?$/, "")))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getArticleSlugs(): string[] {
  return getAllArticles().map((a) => a.slug);
}

export function getArticle(slug: string): Article | null {
  // Slugs come from the URL, so keep them to plain filename characters —
  // no separators, no traversal.
  if (!/^[a-zA-Z0-9._-]+$/.test(slug) || slug.includes("..")) return null;

  const exists = [".mdx", ".md"].some((ext) =>
    fs.existsSync(path.join(ARTICLES_DIR, `${slug}${ext}`)),
  );
  // Missing file -> 404. A malformed file still throws, so bad frontmatter
  // surfaces as a build error instead of silently disappearing.
  return exists ? readArticleFile(slug) : null;
}

export type ArticleNav = { slug: string; title: string } | null;

/**
 * The issue immediately before and after this one, by date — since the list
 * is newest-first, "previous" (older) is the following array entry and "next"
 * (newer) is the preceding one.
 */
export function getArticleNeighbors(slug: string): {
  previous: ArticleNav;
  next: ArticleNav;
} {
  const all = getAllArticles();
  const i = all.findIndex((a) => a.slug === slug);
  if (i === -1) return { previous: null, next: null };

  const toNav = (a: Article | undefined): ArticleNav =>
    a ? { slug: a.slug, title: a.title } : null;

  return { previous: toNav(all[i + 1]), next: toNav(all[i - 1]) };
}

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
