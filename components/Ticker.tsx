"use client";

import { useEffect, useState } from "react";
import { SAMPLE_FEED, type QuoteFeed } from "@/lib/quotes";

const POLL_MS = 60_000;

function formatPrice(price: number): string {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPercent(pct: number): string {
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
}

export default function Ticker() {
  const [feed, setFeed] = useState<QuoteFeed>(SAMPLE_FEED);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/quotes");
        if (!res.ok) return;
        const next = (await res.json()) as QuoteFeed;
        if (!cancelled) setFeed(next);
      } catch {
        // Keep whatever is on screen; the next poll can recover.
      }
    }

    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // The track holds two copies of the list so the CSS translate can loop
  // seamlessly at -50%.
  const run = [...feed.quotes, ...feed.quotes];

  return (
    <div className="ticker">
      <div
        className={`ticker-status ${feed.live ? "is-live" : "is-sample"}`}
        title={
          feed.live
            ? "Live quotes, refreshed every 60s"
            : "Sample data — set FINNHUB_API_KEY to go live"
        }
      >
        <span className="dot" aria-hidden="true" />
        {feed.live ? "LIVE" : "SAMPLE"}
      </div>

      <div className="ticker-viewport">
        <div className="ticker-track">
          {run.map((q, i) => {
            const up = q.changePercent >= 0;
            return (
              <span className="ticker-item" key={`${q.symbol}-${i}`}>
                <span className="ticker-symbol">{q.symbol}</span>
                <span className="ticker-price">{formatPrice(q.price)}</span>
                <span className={up ? "up" : "down"}>
                  {up ? "▲" : "▼"} {formatPercent(q.changePercent)}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
