import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Direction, IndexClose } from "@/lib/articles";

export const AI_WATCH_DIR = path.join(process.cwd(), "content", "ai-watch");

export type AiWatchMeta = {
  /** URL slug — the filename without its extension */
  slug: string;
  title: string;
  /** ISO date string from frontmatter, e.g. "2026-08-17" */
  date: string;
  summary: string;
  tags: string[];
  /** Short badge label for the entry's call, e.g. "capex supercycle intact" */
  verdict: string;
  /** Colors the verdict badge */
  direction: Direction;
  /** Tickers rendered as stat cards, e.g. NVDA, AMD, AVGO */
  tickers: IndexClose[];
};

export type AiWatchEntry = AiWatchMeta & {
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

function toTickers(value: unknown): IndexClose[] {
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

function readEntryFile(slug: string): AiWatchEntry {
  const mdx = path.join(AI_WATCH_DIR, `${slug}.mdx`);
  const md = path.join(AI_WATCH_DIR, `${slug}.md`);
  const file = fs.existsSync(mdx) ? mdx : md;

  const { data, content } = matter(fs.readFileSync(file, "utf8"));

  if (!data.title) throw new Error(`${slug}: frontmatter is missing "title"`);
  if (!data.date) throw new Error(`${slug}: frontmatter is missing "date"`);

  return {
    slug,
    title: String(data.title),
    date:
      data.date instanceof Date
        ? data.date.toISOString().slice(0, 10)
        : String(data.date),
    summary: data.summary ? String(data.summary) : "",
    tags: toStringArray(data.tags),
    verdict: data.verdict ? String(data.verdict) : "",
    direction: toDirection(data.direction),
    tickers: toTickers(data.tickers),
    content,
  };
}

/** All AI Watch entries, newest first. */
export function getAllAiWatch(): AiWatchEntry[] {
  if (!fs.existsSync(AI_WATCH_DIR)) return [];

  return fs
    .readdirSync(AI_WATCH_DIR)
    .filter((name) => /\.mdx?$/.test(name))
    .map((name) => readEntryFile(name.replace(/\.mdx?$/, "")))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getAiWatchSlugs(): string[] {
  return getAllAiWatch().map((e) => e.slug);
}

export function getAiWatch(slug: string): AiWatchEntry | null {
  // Slugs come from the URL, so keep them to plain filename characters —
  // no separators, no traversal.
  if (!/^[a-zA-Z0-9._-]+$/.test(slug) || slug.includes("..")) return null;

  const exists = [".mdx", ".md"].some((ext) =>
    fs.existsSync(path.join(AI_WATCH_DIR, `${slug}${ext}`)),
  );
  return exists ? readEntryFile(slug) : null;
}

export type AiWatchNav = { slug: string; title: string } | null;

export function getAiWatchNeighbors(slug: string): {
  previous: AiWatchNav;
  next: AiWatchNav;
} {
  const all = getAllAiWatch();
  const i = all.findIndex((e) => e.slug === slug);
  if (i === -1) return { previous: null, next: null };

  const toNav = (e: AiWatchEntry | undefined): AiWatchNav =>
    e ? { slug: e.slug, title: e.title } : null;

  return { previous: toNav(all[i + 1]), next: toNav(all[i - 1]) };
}
