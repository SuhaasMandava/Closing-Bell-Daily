# Closing Bell Daily

**A daily US stock market wrap — one short read, written after every close.**

🔗 **Live site: [closingbelldaily.vercel.app](https://closingbelldaily.vercel.app/)**

![Closing Bell Daily](https://closingbelldaily.vercel.app/opengraph-image)

## What this is

Every trading day, once the US market closes, a new issue goes up: what
moved, the one number that explains it, and something worth watching
tomorrow. No hot takes, no price targets — just the essentials, fast.

There's also **[AI Watch](https://closingbelldaily.vercel.app/ai-watch)**, a
sister feed tracking the AI trade specifically — Nvidia, AMD, Broadcom, and
the capex/financing moving those names.

A live ticker runs across the top of every page with real quotes, and the
whole site works in both light and dark mode.

## Features

- 📰 **A new issue every session** — headline, summary, the key data points, and a "what to watch" for tomorrow
- 🤖 **AI Watch** — a focused feed just for AI-trade names
- 📈 **Live ticker** — real-time-ish quotes across major tickers, with an honest indicator when data is delayed or sample-only
- 🌗 **Light & dark mode** — follows your system setting, or toggle it yourself
- ⚡ **Fast, static pages** — every issue is prerendered, so pages load instantly
- 📱 **Works on any device** — phone, tablet, or desktop

## Tech stack

Built with [Next.js](https://nextjs.org/) (App Router) and plain CSS — no
component library, no CMS, no database. Each issue is just a Markdown
(`.mdx`) file in the repo, so "publishing" is a `git push`.

| | |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Content | MDX files, one per day |
| Styling | Hand-written CSS, no framework |
| Hosting | [Vercel](https://vercel.com/) |
| Live quotes | [Alpaca Markets](https://alpaca.markets/) API |

## Running it locally

```bash
npm install
npm run dev      # starts the site at http://localhost:3000
```

That's it — no API keys or database setup needed. Without live-quote
credentials, the ticker just shows sample data labeled `SAMPLE`, and
everything else works normally.

```bash
npm run build    # production build; prerenders every issue
npm run start    # serve that production build
```

## Publishing a new issue

There's no admin panel — an issue is just a file. Drop a new `.mdx` file into
[`content/articles/`](content/articles/), named for the date it covers:

```
content/articles/2026-08-13.mdx
```

with frontmatter like this at the top:

```mdx
---
title: "Cooler CPI Sends Indexes to a Broad Rally"
date: "2026-08-13"
summary: "One or two sentences — this is the homepage teaser."
tags: [CPI, Rates, Small Caps]
verdict: "risk-on, on real breadth"
direction: up
---

Opening paragraph.

## What moved
...

## The number behind it
...

## What to watch
...
```

Only `title` and `date` are required. Push to `main` and Vercel rebuilds the
site automatically — the new issue is live within a minute or two. There's a
ready-to-copy starter at
[`content/articles/_TEMPLATE.md.txt`](content/articles/_TEMPLATE.md.txt), and
a full field reference in [Adding a new daily article](#adding-a-new-daily-article-details)
below.

AI Watch entries work the same way, in [`content/ai-watch/`](content/ai-watch/).

---

## Deploying to Vercel

Import the repo at [vercel.com/new](https://vercel.com/new) — everything is
auto-detected, no config needed.

To turn on live quotes, set these under **Project Settings → Environment
Variables**:

| Variable | Needed? | Notes |
| --- | --- | --- |
| `ALPACA_API_KEY_ID` | for live quotes | Mark **Sensitive**, Production + Preview. |
| `ALPACA_API_SECRET_KEY` | for live quotes | Mark **Sensitive**, Production + Preview. |
| `ALPACA_FEED` | optional | `delayed_sip` for full-market delayed data. |
| `FINNHUB_API_KEY` | optional fallback | Used only when no Alpaca credentials are set. |
| `NEXT_PUBLIC_SITE_URL` | only with a custom domain | e.g. `https://closingbelldaily.com`, no trailing slash. |

Keys live in Vercel only — there's no need for a local `.env.local`.
**Never prefix an API key with `NEXT_PUBLIC_`** — that inlines it into the
client bundle where anyone can read it.

Redeploy after changing any environment variable.

### Getting live-quote API keys

1. Sign up at [app.alpaca.markets/signup](https://app.alpaca.markets/signup) —
   a **paper trading** account is enough, no funding required.
2. Switch to the Paper Trading account (upper-left), then
   **Home → API Keys → Generate New Keys**.
3. Copy both values — the secret is shown once.

The ticker shows one of three honest states, never pretending sample data is
real:

| Badge | Meaning |
| --- | --- |
| 🟢 `LIVE` | Real quotes, fetched within the last 90 seconds |
| ⚪ `CACHED` | Real quotes, but a bit stale while the feed catches up |
| 🟡 `SAMPLE` | No credentials configured — these numbers are placeholders |

### Rate limiting

Alpaca's free plan allows 200 requests/min. The ticker uses roughly 0.3% of
that, through four layers: one batched API call covers every symbol, a 90s
shared cache means all server instances share one upstream call, a
per-instance floor stops cold starts from calling out too often, and a
cooldown backs off automatically on a `429`. Under sustained rate-limiting the
ticker keeps showing the last good quotes (`CACHED`) rather than falling back
to sample data.

## Project layout

```
app/
  layout.tsx                 ticker, nav, footer, global metadata
  page.tsx                   homepage — stats, issue log, featured cards
  globals.css                the whole design system
  api/quotes/route.ts        quote feed the ticker polls
  articles/[slug]/page.tsx   individual article page
  ai-watch/                  the AI Watch section
components/
  Ticker.tsx                 scrolling quote strip (client)
  Sparkline.tsx              inline SVG trend line, no chart library
content/articles/            one .mdx file per day  ← you edit these
content/ai-watch/            one .mdx file per AI Watch entry
lib/
  articles.ts                reads + parses the content folder
  quotes.ts                  quote provider + sample fallback
```

Colors, spacing, and fonts are all CSS variables at the top of
[`app/globals.css`](app/globals.css) — `--up` and `--down` drive every green
and red on the site.

## Light and dark mode

The site follows your OS setting by default; the toggle in the nav overrides
it and remembers your choice. There's no flash of the wrong theme on load —
an inline script applies the saved choice before the page paints.

---

## Adding a new daily article (details)

Full frontmatter reference for `content/articles/*.mdx`:

| Field | Required | What it drives |
| --- | --- | --- |
| `title` | yes | Headline everywhere |
| `date` | yes | `YYYY-MM-DD`; sorts the homepage, newest first |
| `summary` | no | Homepage teaser and the log row subtitle |
| `tags` | no | TAGS column; the first tag labels the featured card |
| `verdict` | no | Text inside the colored CALL badge |
| `direction` | no | `up` / `down` / `flat` — colors the badge and sparkline |
| `sparkline` | no | Numbers drawn as the featured card's trend line |
| `indexes` | no | Stat cards at the top of the article page, e.g. `{ symbol: "S&P 500", close: "5,489.90", change: "1.44%" }` |

The build fails with a named error if `title` or `date` is missing. Keep
`date` matching the filename — the homepage sorts on the frontmatter value,
not the filename.

Standard Markdown plus GitHub-flavored extras (tables, strikethrough,
autolinks) work in the body via `remark-gfm`. Start body headings at `##`,
since the title is already the page's `<h1>`.

To draft an issue with Claude instead of writing it cold,
[`DAILY_PROMPT.md`](DAILY_PROMPT.md) has a reusable prompt that researches the
session and returns a ready-to-save file.
