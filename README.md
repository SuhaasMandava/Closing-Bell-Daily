# Closing Bell Daily

A daily stock market wrap-up. Next.js (App Router) + MDX, one article file per
day, with a live quote ticker across the top.

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build; prerenders every article
npm run start    # serve the production build
```

## Deploying to Vercel

Import the repo at [vercel.com/new](https://vercel.com/new). Everything is
auto-detected — no `vercel.json`, no build settings to change, and the default
Node version works with Next 16.

Set these under **Project Settings → Environment Variables**:

| Variable | Needed? | Notes |
| --- | --- | --- |
| `ALPACA_API_KEY_ID` | for live quotes | Mark **Sensitive**, Production + Preview. |
| `ALPACA_API_SECRET_KEY` | for live quotes | Mark **Sensitive**, Production + Preview. |
| `ALPACA_FEED` | optional | `delayed_sip` for full-market delayed data. |
| `FINNHUB_API_KEY` | optional fallback | Used only when no Alpaca credentials are set. |
| `NEXT_PUBLIC_SITE_URL` | only with a custom domain | e.g. `https://closingbelldaily.com`, no trailing slash. |

Keys live in Vercel only — there is no need for a local `.env.local`. Without
credentials the ticker shows `SAMPLE` and the rest of the site works normally,
which makes keyless local dev the intended workflow.

**Never prefix an API key with `NEXT_PUBLIC_`.** That prefix inlines the value
into the client bundle where anyone can read it. `NEXT_PUBLIC_SITE_URL` is
public by design; the keys must stay unprefixed and server-only.

`NEXT_PUBLIC_SITE_URL` is optional because [`lib/site.ts`](lib/site.ts) falls
back to Vercel's `VERCEL_PROJECT_PRODUCTION_URL`. It deliberately does *not*
use `VERCEL_URL`, which is unique per deployment and would put preview
hostnames into your canonical tags.

Env vars are injected at build/runtime, so **redeploy** after changing them.

### Rate limiting

Alpaca's free plan allows 200 requests/min. Four independent guards keep usage
at roughly 0.3% of that:

1. **Batching** — one snapshot call returns every symbol, so a refresh costs
   1 request regardless of how long `TICKER_SYMBOLS` gets.
2. **Next Data Cache** — 90s revalidate, distributed on Vercel, so all function
   instances share one upstream round.
3. **Per-instance floor** — `MIN_UPSTREAM_INTERVAL_MS` (60s) blocks a cold start
   from calling out mid-window.
4. **Cooldown** — a `429` honours `Retry-After`; a low `X-RateLimit-Remaining`
   triggers a pre-emptive back-off before the limit is reached.

The CDN sits in front of all of it (`s-maxage=90`), so client polls rarely reach
the function at all.

Measured against a mock upstream:

| Scenario | Client requests | Upstream calls |
| --- | --- | --- |
| Healthy | 40 | **1** |
| Cold start, upstream `429` | 25 | **1** |
| Warm, upstream `429` | 25 | **1** |
| Within the floor | 25 | **0** |

Under sustained `429`s the ticker keeps serving the last good quotes labelled
`CACHED` rather than reverting to sample data, and returns to `LIVE`
automatically once the cooldown expires — both verified.

### Publishing a new issue

Articles are files in the repo, so publishing is a commit. Push to `main` and
Vercel rebuilds; the new issue is prerendered and the sitemap updates itself.
There's no CMS and no database.

## The live ticker

The strip at the top polls `/api/quotes` every 60 seconds and shows one of
three honest states:

| Badge | Meaning |
| --- | --- |
| 🟢 `LIVE` | Real quotes, fetched within the last 90s |
| ⚪ `CACHED` | Real quotes, but stale — upstream is being backed off |
| 🟡 `SAMPLE` | No credentials configured; these numbers are placeholders |

Placeholder data is never presented as real. Getting keys:

1. Sign up at [app.alpaca.markets/signup](https://app.alpaca.markets/signup) —
   a **paper trading** account is enough, no funding required.
2. Switch to the Paper Trading account (upper-left), then
   **Home → API Keys → Generate New Keys**.
3. Copy both values. The secret is shown once.

Verify a key before wiring it up:

```bash
curl -s -H "APCA-API-KEY-ID: your_key_id" \
     -H "APCA-API-SECRET-KEY: your_secret" \
     "https://data.alpaca.markets/v2/stocks/snapshots?symbols=SPY,QQQ,NVDA"
```

Note the host is `data.alpaca.markets`, not the trading host.

Free-plan data is 15-minute delayed over REST — appropriate for a closing-bell
ticker, and better for it than real-time single-exchange prints.

Symbols live in `TICKER_SYMBOLS` in [`lib/quotes.ts`](lib/quotes.ts). To add a
provider, write a function returning `Quote[]` and slot it into `getQuotes` —
the throttling, caching and fallback are provider-agnostic.

Note that the article pages stay fully static; only the ticker is dynamic.

## Adding a new daily article

**1. Create the file.** One file per day in `content/articles/`, named for the
date it covers:

```
content/articles/2026-08-13.mdx
```

The filename (minus the extension) becomes the URL, so this one publishes at
`/articles/2026-08-13`. Both `.mdx` and `.md` work.

**2. Write the frontmatter and body.** Only `title` and `date` are required —
everything else is optional and just turns on more of the design:

```mdx
---
title: "Cooler CPI Sends Indexes to a Broad Rally"
date: "2026-08-13"
summary: "One or two sentences — this is the homepage teaser."
tags: [CPI, Rates, Small Caps]
verdict: "risk-on, on real breadth"
direction: up
sparkline: [5412, 5430, 5447, 5462, 5490]
indexes:
  - { symbol: "S&P 500", close: "5,489.90", change: "1.44%" }
  - { symbol: "Nasdaq", close: "18,201.05", change: "1.79%" }
  - { symbol: "US 10Y", close: "3.98%", change: "-0.07" }
---

Opening paragraph.

## What moved

| Sector | Change | Note |
| --- | --- | --- |
| Homebuilders | +3.9% | Best day since March |

## The number behind it

The data point that explains the move.

## What to watch

Closing thought.
```

| Field | Required | What it drives |
| --- | --- | --- |
| `title` | yes | Headline everywhere |
| `date` | yes | `YYYY-MM-DD`; sorts the homepage, newest first |
| `summary` | no | Homepage teaser and the log row subtitle |
| `tags` | no | TAGS column; the first tag labels the featured card |
| `verdict` | no | Text inside the colored CALL badge |
| `direction` | no | `up` / `down` / `flat` — colors the badge and sparkline |
| `sparkline` | no | Numbers drawn as the featured card's trend line |
| `indexes` | no | Stat cards at the top of the article page |

The build fails with a named error if `title` or `date` is missing. Keep `date`
matching the filename — the homepage sorts on the frontmatter value, not the
filename.

**3. That's it.** `npm run dev` picks it up on refresh — no index, config, or
route to update. The next `npm run build` gives it its own prerendered page.

There's a starter you can copy in `content/articles/_TEMPLATE.md.txt`. Files
that don't end in `.md`/`.mdx` are ignored, so the template never publishes.

### Markdown you can use

Standard Markdown plus GitHub-flavored extras — tables, strikethrough, and
autolinks — via `remark-gfm`. Tables get the terminal treatment automatically
and scroll horizontally if they're wide. Start body headings at `##`, since the
title is already the `<h1>`.

## Project layout

```
app/
  layout.tsx                 ticker, nav, footer, global metadata
  page.tsx                   homepage — stats, issue log, featured cards
  not-found.tsx              404
  globals.css                the whole design system
  api/quotes/route.ts        quote feed the ticker polls
  articles/[slug]/page.tsx   individual article page
components/
  Ticker.tsx                 scrolling quote strip (client)
  Sparkline.tsx              inline SVG trend line, no chart library
  sitemap.ts / robots.ts     generated from the content folder
content/articles/            one .mdx file per day  ← you edit these
lib/
  articles.ts                reads + parses the content folder
  quotes.ts                  quote provider + sample fallback
  site.ts                    resolves the absolute site URL
```

Colors, spacing, and fonts are CSS variables at the top of
[`app/globals.css`](app/globals.css) — `--up` and `--down` drive every green and
red on the site.
