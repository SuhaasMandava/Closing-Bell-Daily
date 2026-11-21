import { getQuotes, REFRESH_SECONDS } from "../../lib/quotes";

/**
 * Live ticker feed, served as a Cloudflare Pages Function at /api/quotes.
 * The rest of the site is static; only this route runs code at request time.
 *
 * Provider keys come from Pages environment variables (secrets). The
 * `nodejs_compat` flag in wrangler.toml exposes them as process.env, which is
 * what lib/quotes.ts reads.
 */
export const onRequestGet: PagesFunction = async () => {
  const feed = await getQuotes();

  // Fresh data gets the full window at the CDN edge, so client polls almost
  // never reach the function. Degraded states cache briefly instead, so the
  // ticker recovers quickly once upstream is healthy again.
  const maxAge = feed.state === "live" ? REFRESH_SECONDS : 30;

  return Response.json(feed, {
    headers: {
      "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=600`,
    },
  });
};
