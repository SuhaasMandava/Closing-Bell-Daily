import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The terms for using ${SITE_NAME}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="article">
      <div className="article-meta">
        <span>Last updated September 9, 2026</span>
      </div>

      <h1>Terms of Use</h1>
      <p className="summary">
        By reading {SITE_NAME}, you agree to the terms below.
      </p>

      <div className="body">
        <h2>Not financial advice</h2>
        <p>
          {SITE_NAME} is a daily summary of US market activity, written for
          informational and educational purposes only. Nothing on this site
          — including verdicts, sparklines, index levels, or the AI Watch
          coverage — is investment, financial, tax, or legal advice, and none
          of it is a recommendation to buy, hold, or sell any security.
          Market data shown may be delayed, approximate, or illustrative
          rather than sourced live from an exchange. Always do your own
          research and consult a licensed financial advisor before making
          investment decisions.
        </p>

        <h2>No warranty</h2>
        <p>
          Content is provided &ldquo;as is,&rdquo; without warranty of any
          kind. We make reasonable efforts to be accurate, but we don&rsquo;t
          guarantee that figures, dates, or facts on this site are complete,
          current, or error-free. We are not liable for any loss or damage
          arising from reliance on this content.
        </p>

        <h2>Intellectual property</h2>
        <p>
          Original text and design on this site belong to {SITE_NAME}.
          Company names, ticker symbols, and logos referenced in articles
          belong to their respective owners. Photos used as issue headers are
          sourced for illustrative purposes — if you believe an image on this
          site infringes your rights, contact us and we&rsquo;ll address it
          promptly.
        </p>

        <h2>Acceptable use</h2>
        <p>
          You may read, share, and link to articles on this site. You may
          not scrape, republish, or redistribute site content at scale
          without permission, and you may not use this site in any way that
          disrupts its normal operation.
        </p>

        <h2>Third-party links</h2>
        <p>
          Articles may link to third-party sites for context or sourcing. We
          don&rsquo;t control and aren&rsquo;t responsible for the content or
          practices of those sites.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms as the site evolves. Continued use of
          the site after a change means you accept the updated terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent through the contact
          information listed on our{" "}
          <a
            href="https://github.com/SuhaasMandava/Closing-Bell-Daily"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub repository
          </a>
          .
        </p>
      </div>

      <div className="article-meta" style={{ marginTop: "3rem" }}>
        <Link className="btn" href="/">
          ← Back home
        </Link>
        <Link href="/privacy">Privacy policy</Link>
      </div>
    </article>
  );
}
