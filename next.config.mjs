/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Cloudflare Pages: every page, OG image and the feed is
  // rendered at build time into `out/`. Live quotes are served by the Pages
  // Function in functions/api/quotes.ts, which Next doesn't know about.
  output: "export",
  // The image optimizer needs a server; export mode serves files as-is.
  images: { unoptimized: true },
};

export default nextConfig;
