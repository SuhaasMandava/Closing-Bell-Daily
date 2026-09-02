import { ImageResponse } from "next/og";
import { getArticle, getArticleSlugs, formatStamp } from "@/lib/articles";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

const UP = "#4ade80";
const DOWN = "#f2645a";
const FLAT = "#9aa2ac";

/**
 * Per-issue share card. Without this, sharing a specific article's link only
 * inherits the site-wide image — a generic wordmark with no indication of
 * which day's news it is. This carries the actual headline and verdict, so
 * the card someone sees in Slack or X matches what they're clicking into.
 */
export default async function ArticleOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);

  const color =
    article?.direction === "up" ? UP : article?.direction === "down" ? DOWN : FLAT;
  const arrow = article?.direction === "up" ? "▲" : article?.direction === "down" ? "▼" : "—";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#08090a",
          color: "#e8eaec",
          fontFamily: "monospace",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", fontSize: 26, color: "#9aa2ac" }}>
            Closing Bell Daily
          </div>
          {article && (
            <div style={{ display: "flex", fontSize: 26, color: "#4d535b" }}>
              · {formatStamp(article.date)}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {article?.verdict && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                borderRadius: 999,
                border: `2px solid ${color}55`,
                background: `${color}18`,
                color,
                fontSize: 26,
                width: "auto",
              }}
            >
              {arrow} {article.verdict}
            </div>
          )}
          <div
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: -2,
            }}
          >
            {article?.title ?? "Closing Bell Daily"}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
