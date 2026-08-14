"use client";

import { useState } from "react";

/**
 * Copies the current page URL. Uses window.location rather than a prop so
 * this stays a plain client component with no data threaded down from the
 * server component that renders it.
 */
export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable (older browser, insecure context) — no
      // fallback dialog; the button just silently no-ops.
    }
  }

  return (
    <button type="button" className="btn copy-link-btn" onClick={copy}>
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
