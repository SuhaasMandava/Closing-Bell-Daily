import type { IndexClose } from "@/lib/articles";

/**
 * AI Watch entries track named tickers instead of an intraday shape, so
 * they get a small board of those movers as their card "image" instead of
 * the price-shape banner articles use.
 */
export default function TickerBoard({ tickers }: { tickers: IndexClose[] }) {
  if (tickers.length === 0) return null;

  return (
    <div className="ticker-board">
      {tickers.slice(0, 3).map((row) => {
        const dir = row.change.trim().startsWith("-") ? "down" : "up";
        return (
          <div className={`ticker-board-cell ${dir}`} key={row.symbol}>
            <span className="ticker-board-symbol">{row.symbol}</span>
            <span className="ticker-board-change">
              {dir === "up" ? "▲" : "▼"} {row.change.replace(/^-/, "")}
            </span>
          </div>
        );
      })}
    </div>
  );
}
