import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import {
  formatDate,
  formatStamp,
  getArticle,
  getArticleNeighbors,
  getArticleSlugs,
} from "@/lib/articles";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

// GFM gives us tables, strikethrough and autolinks in article bodies.
const mdxOptions = { mdxOptions: { remarkPlugins: [remarkGfm] } };

// Wide market tables should scroll inside the column, not stretch the page.
const mdxComponents = {
  table: (props: React.ComponentProps<"table">) => (
    <div className="table-wrap">
      <table {...props} />
    </div>
  ),
};

/** Pre-render every article at build time. */
export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  const path = `/articles/${article.slug}`;

  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      publishedTime: article.date,
      url: path,
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const arrow =
    article.direction === "up" ? "▲" : article.direction === "down" ? "▼" : "—";
  const { previous, next } = getArticleNeighbors(slug);

  // NewsArticle structured data — helps search engines surface the
  // headline and publish date directly in results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary || undefined,
    datePublished: article.date,
    dateModified: article.date,
    url: `${SITE_URL}/articles/${article.slug}`,
    publisher: { "@type": "Organization", name: SITE_NAME },
    keywords: article.tags.length > 0 ? article.tags.join(", ") : undefined,
  };

  return (
    <article className="article">
      <script
        type="application/ld+json"
        // JSON.stringify escapes quotes but not "</", so guard against a
        // stray </script> in article content breaking out of this tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <p className="eyebrow">_ /Closing bell _</p>

      <div className="article-meta">
        <span>{formatStamp(article.date)}</span>
        {article.verdict && (
          <span className={`badge ${article.direction}`}>
            {arrow} {article.verdict}
          </span>
        )}
      </div>

      <h1>{article.title}</h1>
      {article.summary && <p className="summary">{article.summary}</p>}

      {article.indexes.length > 0 && (
        <section className="stats compact">
          {article.indexes.map((row) => {
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
          source={article.content}
          options={mdxOptions}
          components={mdxComponents}
        />
      </div>

      <div className="article-meta" style={{ marginTop: "3rem" }}>
        <Link className="btn" href="/">
          ← All issues
        </Link>
        {article.tags.length > 0 && <span>{article.tags.join(" · ")}</span>}
        <span style={{ marginLeft: "auto" }}>{formatDate(article.date)}</span>
      </div>

      {(previous || next) && (
        <nav className="issue-nav" aria-label="More issues">
          {previous ? (
            <Link className="issue-nav-link prev" href={`/articles/${previous.slug}`}>
              <span className="issue-nav-label">← Previous</span>
              <span className="issue-nav-title">{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link className="issue-nav-link next" href={`/articles/${next.slug}`}>
              <span className="issue-nav-label">Next →</span>
              <span className="issue-nav-title">{next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
