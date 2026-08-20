import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import CopyLinkButton from "@/components/CopyLinkButton";
import { formatDate, formatStamp, getReadingTime } from "@/lib/articles";
import {
  getAiWatch,
  getAiWatchNeighbors,
  getAiWatchSlugs,
} from "@/lib/ai-watch";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

const mdxOptions = { mdxOptions: { remarkPlugins: [remarkGfm] } };

const mdxComponents = {
  table: (props: React.ComponentProps<"table">) => (
    <div className="table-wrap">
      <table {...props} />
    </div>
  ),
};

export function generateStaticParams() {
  return getAiWatchSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getAiWatch(slug);
  if (!entry) return {};

  const path = `/ai-watch/${entry.slug}`;

  return {
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: entry.title,
      description: entry.summary,
      publishedTime: entry.date,
      url: path,
      tags: entry.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.summary,
    },
  };
}

export default async function AiWatchEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = getAiWatch(slug);
  if (!entry) notFound();

  const arrow =
    entry.direction === "up" ? "▲" : entry.direction === "down" ? "▼" : "—";
  const { previous, next } = getAiWatchNeighbors(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: entry.title,
    description: entry.summary || undefined,
    datePublished: entry.date,
    dateModified: entry.date,
    url: `${SITE_URL}/ai-watch/${entry.slug}`,
    publisher: { "@type": "Organization", name: SITE_NAME },
    keywords: entry.tags.length > 0 ? entry.tags.join(", ") : undefined,
  };

  return (
    <article className="article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <p className="eyebrow">AI Watch</p>

      <div className="article-meta">
        <span>{formatStamp(entry.date)}</span>
        <span>{getReadingTime(entry.content)} min read</span>
        {entry.verdict && (
          <span className={`badge ${entry.direction}`}>
            {arrow} {entry.verdict}
          </span>
        )}
      </div>

      <h1>{entry.title}</h1>
      {entry.summary && <p className="summary">{entry.summary}</p>}

      {entry.tickers.length > 0 && (
        <section className="stats compact">
          {entry.tickers.map((row) => {
            const dir = row.change.startsWith("-") ? "down" : "up";
            return (
              <div className="stat" key={row.symbol}>
                <div className="stat-label">{row.symbol.toUpperCase()}</div>
                <div className="stat-value">{row.close}</div>
                <div className={`stat-note ${dir}`}>
                  {dir === "up" ? "▲" : "▼"} {row.change}
                </div>
              </div>
            );
          })}
        </section>
      )}

      <div className="body">
        <MDXRemote
          source={entry.content}
          options={mdxOptions}
          components={mdxComponents}
        />
      </div>

      <div className="article-meta" style={{ marginTop: "3rem" }}>
        <Link className="btn" href="/ai-watch">
          ← All AI Watch entries
        </Link>
        <CopyLinkButton />
        {entry.tags.length > 0 && <span>{entry.tags.join(" · ")}</span>}
        <span style={{ marginLeft: "auto" }}>{formatDate(entry.date)}</span>
      </div>

      {(previous || next) && (
        <nav className="issue-nav" aria-label="More AI Watch entries">
          {previous ? (
            <Link className="issue-nav-link prev" href={`/ai-watch/${previous.slug}`}>
              <span className="issue-nav-label">← Previous</span>
              <span className="issue-nav-title">{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link className="issue-nav-link next" href={`/ai-watch/${next.slug}`}>
              <span className="issue-nav-label">Next →</span>
              <span className="issue-nav-title">{next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
