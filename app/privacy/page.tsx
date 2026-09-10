import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles data from visitors to this site.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="article">
      <div className="article-meta">
        <span>Last updated September 9, 2026</span>
      </div>

      <h1>Privacy Policy</h1>
      <p className="summary">
        {SITE_NAME} is a static publication. This page explains the little
        data that passes through it.
      </p>

      <div className="body">
        <h2>What we collect</h2>
        <p>
          {SITE_NAME} does not require an account, and we do not ask visitors
          for their name, email address, or any other personal information.
          There are no comment sections, newsletters, or sign-up forms on
          this site.
        </p>

        <h2>Hosting and server logs</h2>
        <p>
          This site is hosted on Vercel. Like any web host, Vercel's
          infrastructure automatically logs standard technical information
          for every request — such as IP address, browser type, and the page
          requested — for security and reliability purposes. We do not
          access or use these logs to identify individual visitors. See{" "}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vercel&rsquo;s privacy policy
          </a>{" "}
          for details on how they handle this data.
        </p>

        <h2>Local storage</h2>
        <p>
          The light/dark theme toggle in the header saves your preference in
          your browser&rsquo;s local storage. This stays on your device,
          isn&rsquo;t sent to us, and isn&rsquo;t used for tracking.
        </p>

        <h2>Cookies and tracking</h2>
        <p>
          We don&rsquo;t use cookies, analytics scripts, or third-party
          advertising trackers on this site.
        </p>

        <h2>Third-party links</h2>
        <p>
          Articles may link out to other websites (news sources, company
          filings, and similar). We aren&rsquo;t responsible for the privacy
          practices of those sites — check their own policies before sharing
          any information with them.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          If this policy changes, we&rsquo;ll update this page and the date
          above.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy can be sent through the contact
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
        <Link href="/terms">Terms of use</Link>
      </div>
    </article>
  );
}
