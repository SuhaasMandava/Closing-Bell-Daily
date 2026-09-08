"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Article, Direction } from "@/lib/articles";
import { formatSession, formatStamp } from "@/lib/format";

const PAGE_SIZE_INITIAL = 5;
const PAGE_SIZE_STEP = 10;

function Verdict({
  verdict,
  direction,
}: {
  verdict: string;
  direction: Direction;
}) {
  if (!verdict) return null;
  const arrow = direction === "up" ? "▲" : direction === "down" ? "▼" : "—";

  return (
    <span className={`badge ${direction}`}>
      {arrow} {verdict}
    </span>
  );
}

/** One lowercased blob per article so filtering is a single substring check. */
function toHaystack(article: Article): string {
  return [
    article.title,
    article.summary,
    article.tags.join(" "),
    article.verdict,
    article.date,
    formatStamp(article.date),
  ]
    .join(" ")
    .toLowerCase();
}

export default function IssueLog({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE_INITIAL);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((article) => toHaystack(article).includes(q));
  }, [articles, query]);

  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;

  function handleQueryChange(value: string) {
    setQuery(value);
    setVisible(PAGE_SIZE_INITIAL);
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <span>ISSUE LOG</span>
        <span className="count">{articles.length} PUBLISHED</span>
      </div>

      <div className="panel-search">
        <input
          type="search"
          className="search-input"
          placeholder="Search by title, tag, date, or call…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          aria-label="Search issues"
        />
      </div>

      {shown.length === 0 ? (
        <div className="log-empty">No issues match &ldquo;{query}&rdquo;.</div>
      ) : (
        <div className="table-scroll">
          <table className="log">
            <colgroup>
              <col className="col-session" />
              <col className="col-headline" />
              <col className="col-tags" />
              <col className="col-call" />
              <col className="col-date" />
              <col className="col-action" />
            </colgroup>
            <thead>
              <tr>
                <th>SESSION</th>
                <th>HEADLINE</th>
                <th>TAGS</th>
                <th>CALL</th>
                <th>DATE</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((article) => (
                <tr key={article.slug} data-direction={article.direction}>
                  <td className="log-code">{formatSession(article)}</td>
                  <td>
                    <Link
                      className="log-title"
                      href={`/articles/${article.slug}`}
                    >
                      {article.title}
                    </Link>
                    {article.summary && (
                      <p className="log-sub">{article.summary}</p>
                    )}
                  </td>
                  <td className="log-tags">{article.tags.join(", ")}</td>
                  <td>
                    <Verdict
                      verdict={article.verdict}
                      direction={article.direction}
                    />
                  </td>
                  <td className="log-date">{formatStamp(article.date)}</td>
                  <td className="log-action">
                    <Link className="btn" href={`/articles/${article.slug}`}>
                      Read
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {remaining > 0 && (
        <div className="panel-more">
          <button
            type="button"
            className="btn"
            onClick={() => setVisible((v) => v + PAGE_SIZE_STEP)}
          >
            Show {Math.min(PAGE_SIZE_STEP, remaining)} more
            <span className="panel-more-count"> · {remaining} left</span>
          </button>
        </div>
      )}
    </section>
  );
}
