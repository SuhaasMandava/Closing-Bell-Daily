import Link from "next/link";
import CardImage from "@/components/CardImage";
import ChartBanner from "@/components/ChartBanner";
import IssueLog from "@/components/IssueLog";
import {
  formatCode,
  formatStamp,
  getAllArticles,
  getReadingTime,
  type Direction,
} from "@/lib/articles";
import { getAllAiWatch } from "@/lib/ai-watch";

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

export default function HomePage() {
  const articles = getAllArticles();
  const lead = articles[0];
  const moreHeadlines = articles.slice(1, 6);
  const marketsLead = articles[6];
  const marketsRest = articles.slice(7, 11);
  const aiWatch = getAllAiWatch();
  const aiWatchLead = aiWatch[0];
  const aiWatchRest = aiWatch.slice(1, 5);
  const latest = articles[0];

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Daily Wrap</p>
        <h1>Closing Bell</h1>
      </section>

      {lead && (
        <>
          <p className="section-title">Top stories</p>
          <section className="top-grid">
            <article className={`card card--${lead.direction}`}>
              {lead.image ? (
                <CardImage variant="lead" src={lead.image} alt={lead.imageAlt} />
              ) : (
                <ChartBanner
                  size="lead"
                  points={lead.sparkline}
                  direction={lead.direction}
                />
              )}

              <div className="card-body">
                <div className="card-head">
                  <span>
                    <strong>{lead.tags[0] ?? "Wrap"}</strong> ·{" "}
                    {formatStamp(lead.date)} · {getReadingTime(lead.content)}{" "}
                    min
                  </span>
                  <Verdict verdict={lead.verdict} direction={lead.direction} />
                </div>

                <h3>
                  <Link href={`/articles/${lead.slug}`}>{lead.title}</Link>
                </h3>
                {lead.summary && <p>{lead.summary}</p>}

                <Link className="card-link" href={`/articles/${lead.slug}`}>
                  Read the wrap <span>→</span>
                </Link>
              </div>
            </article>

            {moreHeadlines.length > 0 && (
              <aside className="headline-rail">
                <div className="rail-head">More headlines</div>
                {moreHeadlines.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/articles/${article.slug}`}
                    className="rail-item"
                  >
                    <div className="rail-title">{article.title}</div>
                    <div className="rail-meta">
                      <span>{article.tags[0] ?? "Wrap"}</span>
                      <span>· {formatStamp(article.date)}</span>
                    </div>
                  </Link>
                ))}
              </aside>
            )}
          </section>
        </>
      )}

      {(marketsLead || aiWatchLead) && (
        <section className="category-grid">
          {marketsLead && (
            <div className="category-col">
              <div className="category-head">
                <span>More from the markets</span>
              </div>

              <Link href={`/articles/${marketsLead.slug}`} className="category-lead">
                {marketsLead.image && (
                  <CardImage
                    variant="thumb"
                    src={marketsLead.image}
                    alt={marketsLead.imageAlt}
                  />
                )}
                <div>
                  <div className="category-lead-title">
                    {marketsLead.title}
                  </div>
                  <div className="category-meta">
                    <span>{marketsLead.tags[0] ?? "Wrap"}</span>
                    <span>· {formatStamp(marketsLead.date)}</span>
                  </div>
                </div>
              </Link>

              {marketsRest.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="category-item"
                >
                  <div className="category-item-title">{article.title}</div>
                  <div className="category-meta">
                    <span>{article.tags[0] ?? "Wrap"}</span>
                    <span>· {formatStamp(article.date)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {aiWatchLead && (
            <div className="category-col">
              <div className="category-head">
                <span>AI Watch</span>
                <Link href="/ai-watch" className="section-more">
                  See all →
                </Link>
              </div>

              <Link
                href={`/ai-watch/${aiWatchLead.slug}`}
                className="category-lead"
              >
                {aiWatchLead.image && (
                  <CardImage
                    variant="thumb"
                    src={aiWatchLead.image}
                    alt={aiWatchLead.imageAlt}
                  />
                )}
                <div>
                  <div className="category-lead-title">
                    {aiWatchLead.title}
                  </div>
                  <div className="category-meta">
                    {aiWatchLead.tickers.slice(0, 2).map((t) => (
                      <span
                        key={t.symbol}
                        className={parseFloat(t.change) < 0 ? "down" : "up"}
                      >
                        {t.symbol} {t.change}
                      </span>
                    ))}
                    <span>· {formatStamp(aiWatchLead.date)}</span>
                  </div>
                </div>
              </Link>

              {aiWatchRest.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/ai-watch/${entry.slug}`}
                  className="category-item"
                >
                  <div className="category-item-title">{entry.title}</div>
                  <div className="category-meta">
                    {entry.tickers.slice(0, 2).map((t) => (
                      <span
                        key={t.symbol}
                        className={parseFloat(t.change) < 0 ? "down" : "up"}
                      >
                        {t.symbol} {t.change}
                      </span>
                    ))}
                    <span>· {formatStamp(entry.date)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="stats">
        <div className="stat">
          <div className="stat-label">ISSUES</div>
          <div className="stat-value">{articles.length}</div>
          <div className="stat-note up">▲ published</div>
        </div>
        <div className="stat">
          <div className="stat-label">LATEST</div>
          <div className="stat-value">
            {latest ? formatCode(latest.date) : "--/--"}
          </div>
          <div className="stat-note up">▲ most recent</div>
        </div>
        <div className="stat">
          <div className="stat-label">COVERAGE</div>
          <div className="stat-value">US</div>
          <div className="stat-note up">— equities and rates</div>
        </div>
        <div className="stat">
          <div className="stat-label">SINCE</div>
          <div className="stat-value">
            {articles.length
              ? articles[articles.length - 1].date.slice(0, 4)
              : new Date().getFullYear()}
          </div>
          <div className="stat-note up">▲ day one</div>
        </div>
      </section>

      {articles.length === 0 ? (
        <div className="note">
          No issues yet. Drop an .mdx file in content/articles/ to publish one.
        </div>
      ) : (
        <>
          <IssueLog articles={articles} />

          <div className="note">More issues land here after every close.</div>
        </>
      )}
    </>
  );
}
