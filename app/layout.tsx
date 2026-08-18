import type { Metadata } from "next";
import Link from "next/link";
import { Inter, JetBrains_Mono } from "next/font/google";
import Ticker from "@/components/Ticker";
import ThemeToggle from "@/components/ThemeToggle";
import MarketStatus from "@/components/MarketStatus";
import { getAllArticles } from "@/lib/articles";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  // Without this, the OpenGraph URLs below stay relative and link previews break.
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const count = getAllArticles().length;

  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Applies the saved theme before first paint. Without this the page
          renders in the system theme and then snaps to the stored one — a
          visible flash on every navigation.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`,
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <Ticker />

        <div className="container">
          <nav className="nav">
            <Link href="/" className="wordmark">
              <span>Closing Bell</span>
              <span>Daily_</span>
            </Link>
            <span className="nav-links">
              <Link href="/ai-watch" className="nav-link">
                AI Watch
              </Link>
            </span>
            <span className="nav-right">
              <MarketStatus />
              <span className="nav-meta">
                {count} {count === 1 ? "ISSUE" : "ISSUES"}
              </span>
              <ThemeToggle />
            </span>
          </nav>
        </div>

        <main className="container" id="main">
          {children}
        </main>

        <footer className="site-footer">
          <div className="container">
            <span>Closing Bell Daily · Written after every US close</span>
            <Link href="/ai-watch">AI Watch</Link>
            <Link href="/">↑ Latest</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
