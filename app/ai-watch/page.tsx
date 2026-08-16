import type { Metadata } from "next";
import Link from "next/link";
import { formatStamp, getReadingTime } from "@/lib/articles";
import { getAllAiWatch } from "@/lib/ai-watch";

export const metadata: Metadata = {
  title: "AI Watch",
  description:
    "Coverage of the AI trade — Nvidia, AMD, Broadcom and the chip and infrastructure names moving the market.",
  alternates: { canonical: "/ai-watch" },
};

function Verdict({
  verdict,
  direction,
}: {
  verdict: string;
  direction: "up" | "down" | "flat";
}) {
  if (!verdict) return null;
  const arrow = direction === "up" ? "▲" : direction === "down" ? "▼" : "—";
  return (
    <span className={`badge ${direction}`}>
      {arrow} {verdict}
    </span>
  );
}

export default function AiWatchPage() {
  const entries = getAllAiWatch();

  return (
    <>
      <section className="hero">
        <p className="eyebrow">_ /AI Watch _</p>
        <h1>The AI Trade</h1>
        <p>
          Nvidia, AMD, Broadcom and the rest of the AI infrastructure
          complex — capex, financing, and the chip names moving on it. Same
          rules as the daily wrap: what moved, the number behind it, no
          price targets.
        </p>
      </section>

      {entries.length === 0 ? (
        <div className="note">
          No entries yet. Drop an .mdx file in content/ai-watch/ to publish
          one.
        </div>
      ) : (
        <section className="featured">
          {entries.map((entry) => (
            <article className="card" key={entry.slug}>
              <div className="card-head">
                <span>
                  <strong>{(entry.tags[0] ?? "AI").toUpperCase()}</strong> ·{" "}
                  {formatStamp(entry.date)} · {getReadingTime(entry.content)}{" "}
                  min
                </span>
                <Verdict verdict={entry.verdict} direction={entry.direction} />
              </div>

              <h3>
                <Link href={`/ai-watch/${entry.slug}`}>{entry.title}</Link>
              </h3>
              {entry.summary && <p>{entry.summary}</p>}

              <Link className="card-link" href={`/ai-watch/${entry.slug}`}>
                Read the entry →
              </Link>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
