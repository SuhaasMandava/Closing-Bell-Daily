import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import {
  formatDate,
  formatStamp,
  getArticle,
  getArticleSlugs,
} from "@/lib/articles";

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

  return (
    <article className="article">
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
    </article>
  );
}
