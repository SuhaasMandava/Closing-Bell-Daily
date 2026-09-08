import Link from "next/link";
import CardImage from "@/components/CardImage";
import ChartBanner from "@/components/ChartBanner";
import IssueLog from "@/components/IssueLog";
import TickerBoard from "@/components/TickerBoard";
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
  const featured = articles.slice(0, 2);
  const featuredAiWatch = getAllAiWatch().slice(0, 3);
  const latest = articles[0];

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Daily Wrap</p>
        <h1>Closing Bell</h1>
        <p>
          One issue per session, written after the US close. What moved, the
          number behind it, and the one thing worth watching tomorrow — no
          hot takes, no price targets.
        </p>
      </section>

      {featured.length > 0 && (
        <>
          <p className="section-label">FEATURED</p>
          <section className="featured">
            {featured.map((article) => (
              <article
                className={`card card--${article.direction}`}
                key={article.slug}
              >
                {article.image ? (
                  <CardImage src={article.image} alt={article.imageAlt} />
                ) : (
                  <ChartBanner
                    points={article.sparkline}
                    direction={article.direction}
                  />
                )}

                <div className="card-body">
                  <div className="card-head">
                    <span>
                      <strong>
                        {(article.tags[0] ?? "WRAP").toUpperCase()}
                      </strong>{" "}
                      · {formatStamp(article.date)} ·{" "}
                      {getReadingTime(article.content)} min
                    </span>
                    <Verdict
                      verdict={article.verdict}
                      direction={article.direction}
                    />
                  </div>

                  <h3>
                    <Link href={`/articles/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>
                  {article.summary && <p>{article.summary}</p>}

                  <Link
                    className="card-link"
                    href={`/articles/${article.slug}`}
                  >
                    Read the wrap <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      {featuredAiWatch.length > 0 && (
        <>
          <div className="section-head">
            <p className="section-label">AI Watch</p>
            <Link href="/ai-watch" className="section-more">
              See all →
            </Link>
          </div>
          <section className="featured">
            {featuredAiWatch.map((entry) => (
              <article
                className={`card card--${entry.direction}`}
                key={entry.slug}
              >
                {entry.image ? (
                  <CardImage src={entry.image} alt={entry.imageAlt} />
                ) : (
                  <TickerBoard tickers={entry.tickers} />
                )}

                <div className="card-body">
                  <div className="card-head">
                    <span>
                      <strong>AI WATCH</strong> · {formatStamp(entry.date)} ·{" "}
                      {getReadingTime(entry.content)} min
                    </span>
                    <Verdict
                      verdict={entry.verdict}
                      direction={entry.direction}
                    />
                  </div>

                  <h3>
                    <Link href={`/ai-watch/${entry.slug}`}>{entry.title}</Link>
                  </h3>
                  {entry.summary && <p>{entry.summary}</p>}

                  <Link className="card-link" href={`/ai-watch/${entry.slug}`}>
                    Read the entry <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      <div className="note">
        Check out <Link href="/ai-watch">AI Watch</Link> — our dedicated
        coverage of the AI trade: Nvidia, AMD, Broadcom, and the capex and
        financing moving those names.
      </div>

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
