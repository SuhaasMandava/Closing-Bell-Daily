# Daily issue prompt

Paste the block below into Claude (claude.ai) to generate one day's issue.
Change the **two dates** at the top for each new issue; everything else stays
the same.

Claude needs web search enabled — the whole point is that the numbers are real.
Save the returned block to `content/articles/YYYY-MM-DD.mdx`, then commit and
push. Vercel does the rest.

---

You are writing one issue of **Closing Bell Daily**, a short daily wrap of the
US stock market close. Today's issue covers **Wednesday, August 12, 2026**.

**First, research.** Search the web for that session's actual closing data.
Do not write anything until you have real numbers. I need:

- Closing levels and % change for the S&P 500, Nasdaq Composite, and one other
  index that best fits the day's story (Dow or Russell 2000)
- The US 10-year Treasury yield and its change in basis points
- Which sectors led and lagged, with figures
- The single most important catalyst — a data release, Fed comment, earnings
  report, or major single-stock move
- Anything notable about breadth or volume

**Then write the issue** as a single MDX file in exactly this format:

```mdx
---
title: "Headline, under 70 characters, specific to the day"
date: "2026-08-12"
summary: "One or two sentences. This is the homepage teaser — make it carry the day's actual story, not a generic market description."
tags: [Tag1, Tag2, Tag3]
verdict: "short call, lowercase, 3-5 words"
direction: up
sparkline: [5412, 5430, 5447, 5462, 5490]
indexes:
  - { symbol: "S&P 500", close: "5,489.90", change: "1.44%" }
  - { symbol: "Nasdaq", close: "18,201.05", change: "1.79%" }
  - { symbol: "Russell 2000", close: "2,244.61", change: "2.30%" }
  - { symbol: "US 10Y", close: "3.98%", change: "-0.07" }
---

Two or three sentences opening on what actually happened and why it mattered.
Lead with the most interesting fact, not a summary of the summary.

## What moved

| Sector | Change | Note |
| --- | --- | --- |
| Leader | +3.9% | Why it led, in five words |
| Second | +3.1% | ... |
| Laggard | -1.2% | ... |

One or two sentences reading the table — what the pattern says about the day.

## The number behind it

The specific data point or event that explains the move, with the actual
figure and what the market expected. Say what it changed in rate expectations
or positioning.

## What to watch

One forward-looking paragraph. Name the specific catalyst and what would
confirm or break the day's read.
```

**Field rules**

- `date` — must be `2026-08-12`, matching the filename
- `tags` — 2 to 4, plain words, no `#`
- `verdict` — the day's call in a few words, e.g. `risk-on, on real breadth`
  or `no conviction either way`
- `direction` — `up`, `down`, or `flat`, matching the S&P's close
- `indexes` — `close` is a formatted string; `change` is a percent string like
  `"1.44%"` or `"-0.34%"`. For the 10-year, use the yield as `close` and the
  basis-point move as `change` (e.g. `"-0.07"`). Lead with a minus sign for
  declines — that drives the red styling.
- `sparkline` — 8 to 12 real intraday S&P 500 levels in chronological order.
  **If you cannot source real intraday levels, omit this field entirely.** Do
  not invent a plausible-looking curve; a missing chart is fine, a fake one is
  not.

**Voice**

- Plain and factual. You are explaining the day to someone who missed it.
- Every number must come from your research. No estimates presented as facts.
- No price targets, no buy/sell language, no predictions dressed as analysis.
- Say what happened and what it implies. Do not tell the reader what to do.
- Short sentences. Cut adjectives. "Breadth was the story" beats "It was a
  remarkably broad-based and impressive rally."
- If the day was boring, say so. A quiet session honestly described is better
  than a manufactured narrative.

**Output**

Return the complete file in one fenced `mdx` code block, ready to save as
`content/articles/2026-08-12.mdx`. After the block, list the sources you used
as plain links so I can spot-check the figures. Nothing else.

---

## Optional: a PDF version

If you also want a print/PDF copy of the issue, send this as a follow-up in the
same chat:

> Now render that same issue as a formatted document I can export to PDF.
> Keep the headline, date, the index table, and all three sections. Add a
> "Closing Bell Daily" header and the source list as footnotes. Clean and
> readable — dark text on white, no decoration.

Then use your browser's Print → Save as PDF on the resulting document.
