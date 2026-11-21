/**
 * Absolute base URL for metadata, sitemap and robots.
 *
 * Priority:
 *  1. NEXT_PUBLIC_SITE_URL — set this once you point a custom domain at the app
 *  2. VERCEL_PROJECT_PRODUCTION_URL — only set when still building on Vercel
 *  3. localhost, for `npm run dev`
 *
 * On Cloudflare Pages, set NEXT_PUBLIC_SITE_URL (it's read at build time) —
 * the per-deployment CF_PAGES_URL is deliberately not used, since it would put
 * preview hostnames into canonical tags.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Closing Bell Daily";
export const SITE_DESCRIPTION =
  "A daily wrap of the US market close: what moved, why, and what to watch tomorrow.";
