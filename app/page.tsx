import Link from "next/link";
import Sparkline from "@/components/Sparkline";
import {
  formatCode,
  formatSession,
  formatStamp,
  getAllArticles,
  getReadingTime,
  type Article,
} from "@/lib/articles";

function Verdict({ article }: { article: Article }) {
  if (!article.verdict) return null;
  const arrow =
    article.direction === "up" ? "▲" : article.direction === "down" ? "▼" : "—";

  return (
    <span className={`badge ${article.direction}`}>
      {arrow} {article.verdict}
    </span>
  );
}

export default function HomePage() {
  const articles = getAllArticles();
  const featured = articles.slice(0, 2);
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
          <section className="panel">
            <div className="panel-head">
              <span>ISSUE LOG</span>
              <span className="count">{articles.length} PUBLISHED</span>
            </div>

            <table className="log">
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
                {articles.map((article) => (
                  <tr key={article.slug}>
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
                      <Verdict article={article} />
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
          </section>

          <p className="section-label">FEATURED</p>
          <section className="featured">
            {featured.map((article) => (
              <article
                className={`card card--${article.direction}`}
                key={article.slug}
              >
                <div className="card-head">
                  <span>
                    <strong>
                      {(article.tags[0] ?? "WRAP").toUpperCase()}
                    </strong>{" "}
                    · {formatStamp(article.date)} ·{" "}
                    {getReadingTime(article.content)} min
                  </span>
                  <Verdict article={article} />
                </div>

                <Sparkline
                  points={article.sparkline}
                  direction={article.direction}
                />

                <h3>
                  <Link href={`/articles/${article.slug}`}>
                    {article.title}
                  </Link>
                </h3>
                {article.summary && <p>{article.summary}</p>}

                <Link className="card-link" href={`/articles/${article.slug}`}>
                  Read the wrap →
                </Link>
              </article>
            ))}
          </section>

          <div className="note">More issues land here after every close.</div>
        </>
      )}
    </>
  );
}
