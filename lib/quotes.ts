export type Quote = {
  symbol: string;
  price: number;
  changePercent: number;
};

export type FeedState =
  /** Real quotes, fetched fresh */
  | "live"
  /** Real quotes, but we're serving the last good copy while backing off */
  | "cached"
  /** No provider configured, or we've never had a successful fetch */
  | "sample";

export type QuoteFeed = {
  quotes: Quote[];
  state: FeedState;
  /** ISO timestamp of the upstream fetch these quotes came from */
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
 * Rate-limit budget.
 *
 * Alpaca's free plan allows 200 requests/min. One batch snapshot call covers
 * every symbol, so a refresh costs exactly 1 request no matter how long
 * TICKER_SYMBOLS gets. At a 90s refresh that's ~0.67 req/min — roughly 0.3% of
 * the ceiling. Four independent guards keep it there:
 *
 *  1. Batching        — 1 upstream call per refresh, not 1 per symbol
 *  2. Next Data Cache — distributed on Vercel, dedupes across instances
 *  3. MIN_UPSTREAM_INTERVAL_MS — per-instance floor, guards cold starts
 *  4. 429 / low-quota cooldown — honours Retry-After and X-RateLimit-Remaining
 */
export const REFRESH_SECONDS = 90;
const MIN_UPSTREAM_INTERVAL_MS = 60_000;
const RATE_LIMIT_COOLDOWN_MS = 120_000;
const ERROR_COOLDOWN_MS = 15_000;
/** Back off proactively once Alpaca says this little of the minute's quota is left. */
const LOW_QUOTA_THRESHOLD = 20;

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

/**
 * Rendered before the client's first fetch resolves, and whenever no provider
 * is configured. The ticker labels this state "SAMPLE" so these numbers are
 * never passed off as real quotes.
 */
export const SAMPLE_FEED: QuoteFeed = {
  quotes: SAMPLE_QUOTES,
  state: "sample",
  asOf: "1970-01-01T00:00:00.000Z",
};

/*
 * Module-level throttle state. On Vercel this lives for the life of a warm
 * function instance — it is a per-instance guard, not a global lock, which is
 * why it sits behind the Data Cache rather than replacing it.
 */
let lastGood: QuoteFeed | null = null;
let lastUpstreamAt = 0;
let cooldownUntil = 0;

type Snapshot = {
  latestTrade?: { p?: number };
  dailyBar?: { c?: number };
  prevDailyBar?: { c?: number };
};

function toQuote(symbol: string, snap: Snapshot): Quote | null {
  const price = snap.latestTrade?.p ?? snap.dailyBar?.c;
  if (typeof price !== "number" || price === 0) return null;

  const prevClose = snap.prevDailyBar?.c;
  const changePercent =
    typeof prevClose === "number" && prevClose !== 0
      ? ((price - prevClose) / prevClose) * 100
      : 0;

  return { symbol, price, changePercent };
}

class RateLimited extends Error {
  constructor(public retryAfterMs: number) {
    super("rate limited");
  }
}

/**
 * One batch request covers every symbol:
 * https://data.alpaca.markets/v2/stocks/snapshots?symbols=SPY,QQQ,...
 */
async function fetchAlpaca(keyId: string, secret: string): Promise<Quote[]> {
  const params = new URLSearchParams({ symbols: TICKER_SYMBOLS.join(",") });
  // Optional: set ALPACA_FEED=delayed_sip for full-market delayed data
  // instead of the plan's default feed.
  if (process.env.ALPACA_FEED) params.set("feed", process.env.ALPACA_FEED);

  const res = await fetch(
    `https://data.alpaca.markets/v2/stocks/snapshots?${params}`,
    {
      headers: {
        "APCA-API-KEY-ID": keyId,
        "APCA-API-SECRET-KEY": secret,
        accept: "application/json",
      },
      next: { revalidate: REFRESH_SECONDS },
    },
  );

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("retry-after"));
    throw new RateLimited(
      Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : RATE_LIMIT_COOLDOWN_MS,
    );
  }
  if (!res.ok) throw new Error(`alpaca ${res.status}`);

  // Alpaca tells us how much of the minute's budget is left; if we're close to
  // the edge, sit out the next window rather than risk a 429.
  const remaining = Number(res.headers.get("x-ratelimit-remaining"));
  if (Number.isFinite(remaining) && remaining < LOW_QUOTA_THRESHOLD) {
    cooldownUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
  }

  const data = (await res.json()) as Record<string, Snapshot>;

  return TICKER_SYMBOLS.map((symbol) => {
    const snap = data[symbol];
    return snap ? toQuote(symbol, snap) : null;
  }).filter((q): q is Quote => q !== null);
}

/**
 * Kept as a fallback provider. Finnhub needs one request per symbol, so a
 * refresh costs 14x what Alpaca's batch call does — used only when no Alpaca
 * credentials are present.
 */
async function fetchFinnhubSymbol(
  symbol: string,
  key: string,
): Promise<Quote | null> {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
    symbol,
  )}&token=${encodeURIComponent(key)}`;

  const res = await fetch(url, { next: { revalidate: REFRESH_SECONDS } });
  if (res.status === 429) throw new RateLimited(RATE_LIMIT_COOLDOWN_MS);
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

async function fetchFinnhub(key: string): Promise<Quote[]> {
  const results = await Promise.all(
    TICKER_SYMBOLS.map((symbol) =>
      fetchFinnhubSymbol(symbol, key).catch((err) => {
        if (err instanceof RateLimited) throw err;
        return null;
      }),
    ),
  );
  return results.filter((q): q is Quote => q !== null);
}

/** Last known good quotes, relabelled so the UI can show they aren't fresh. */
function degraded(): QuoteFeed {
  return lastGood ? { ...lastGood, state: "cached" } : SAMPLE_FEED;
}

export async function getQuotes(): Promise<QuoteFeed> {
  const alpacaKey = process.env.ALPACA_API_KEY_ID;
  const alpacaSecret = process.env.ALPACA_API_SECRET_KEY;
  const finnhubKey = process.env.FINNHUB_API_KEY;

  const hasAlpaca = Boolean(alpacaKey && alpacaSecret);
  if (!hasAlpaca && !finnhubKey) return SAMPLE_FEED;

  const now = Date.now();

  // Guard 4: backing off after a 429 or a low-quota warning.
  if (now < cooldownUntil) return degraded();

  // Guard 3: never call upstream more often than the floor, even on a cache
  // miss or a cold start that lands mid-window.
  if (lastGood && now - lastUpstreamAt < MIN_UPSTREAM_INTERVAL_MS) {
    return lastGood;
  }

  try {
    const quotes = hasAlpaca
      ? await fetchAlpaca(alpacaKey!, alpacaSecret!)
      : await fetchFinnhub(finnhubKey!);

    // A couple of missing symbols is fine; a mostly-empty response is not.
    if (quotes.length < TICKER_SYMBOLS.length / 2) {
      cooldownUntil = now + ERROR_COOLDOWN_MS;
      return degraded();
    }

    lastUpstreamAt = now;
    lastGood = { quotes, state: "live", asOf: new Date(now).toISOString() };
    return lastGood;
  } catch (err) {
    cooldownUntil =
      now + (err instanceof RateLimited ? err.retryAfterMs : ERROR_COOLDOWN_MS);
    return degraded();
  }
}
