export type Quote = {
  symbol: string;
  price: number;
  changePercent: number;
};

export type QuoteFeed = {
  quotes: Quote[];
  /** false when we fell back to sample data (no API key, or upstream failed) */
  live: boolean;
  /** ISO timestamp of the fetch */
  asOf: string;
};

export const TICKER_SYMBOLS = [
  "SPY",
  "QQQ",
  "AAPL",
  "MSFT",
  "NVDA",
  "AMD",
  "GOOGL",
  "AMZN",
  "META",
  "TSLA",
  "NFLX",
  "AVGO",
  "JPM",
  "XOM",
];

/**
 * Rendered before the client's first fetch resolves, and whenever the upstream
 * feed is unavailable. The ticker labels this state "SAMPLE" so these numbers
 * are never passed off as real quotes.
 */
export const SAMPLE_QUOTES: Quote[] = [
  { symbol: "SPY", price: 772.49, changePercent: 0.25 },
  { symbol: "QQQ", price: 723.78, changePercent: 0.73 },
  { symbol: "AAPL", price: 302.25, changePercent: -0.87 },
  { symbol: "MSFT", price: 492.43, changePercent: -2.26 },
  { symbol: "NVDA", price: 224.09, changePercent: 3.03 },
  { symbol: "AMD", price: 482.93, changePercent: 1.82 },
  { symbol: "GOOGL", price: 343.54, changePercent: -0.88 },
  { symbol: "AMZN", price: 267.28, changePercent: -1.83 },
  { symbol: "META", price: 578.85, changePercent: -3.38 },
  { symbol: "TSLA", price: 327.51, changePercent: -1.59 },
  { symbol: "NFLX", price: 74.21, changePercent: -0.78 },
  { symbol: "AVGO", price: 416.85, changePercent: -0.81 },
  { symbol: "JPM", price: 291.4, changePercent: 0.44 },
  { symbol: "XOM", price: 118.62, changePercent: 0.19 },
];

export const SAMPLE_FEED: QuoteFeed = {
  quotes: SAMPLE_QUOTES,
  live: false,
  asOf: "1970-01-01T00:00:00.000Z",
};

/**
 * Finnhub free tier: one request per symbol, 60 req/min.
 * Set FINNHUB_API_KEY in .env.local to go live.
 */
async function fetchFinnhub(symbol: string, key: string): Promise<Quote | null> {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
    symbol,
  )}&token=${encodeURIComponent(key)}`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return null;

  const data = (await res.json()) as { c?: number; dp?: number };
  // Finnhub returns c: 0 for symbols it has no data for.
  if (typeof data.c !== "number" || data.c === 0) return null;

  return {
    symbol,
    price: data.c,
    changePercent: typeof data.dp === "number" ? data.dp : 0,
  };
}

export async function getQuotes(): Promise<QuoteFeed> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return SAMPLE_FEED;

  try {
    const results = await Promise.all(
      TICKER_SYMBOLS.map((symbol) =>
        fetchFinnhub(symbol, key).catch(() => null),
      ),
    );
    const quotes = results.filter((q): q is Quote => q !== null);

    // A couple of missing symbols is fine; a mostly-empty response is not.
    if (quotes.length < TICKER_SYMBOLS.length / 2) return SAMPLE_FEED;

    return { quotes, live: true, asOf: new Date().toISOString() };
  } catch {
    return SAMPLE_FEED;
  }
}
