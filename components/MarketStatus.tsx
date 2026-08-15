"use client";

import { useEffect, useState } from "react";
import { getMarketStatus, type MarketStatus as Status } from "@/lib/market-hours";

const CHECK_MS = 30_000;

export default function MarketStatus() {
  // Market status depends on "now," which the server and client will
  // disagree on (and the static homepage build time is stale regardless).
  // Render nothing until mounted, then compute it client-side — the same
  // reasoning that makes the quote ticker client-only.
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const tick = () => setStatus(getMarketStatus());
    tick();
    const id = setInterval(tick, CHECK_MS);
    return () => clearInterval(id);
  }, []);

  if (!status) return null;

  const title = status.closesEarly && status.isOpen
    ? status.reason
    : status.nextOpenLabel
      ? `${status.reason} · ${status.nextOpenLabel}`
      : status.reason;

  return (
    <span
      className={`market-status ${status.isOpen ? "is-open" : "is-closed"}`}
      title={title}
    >
      <span className="dot" aria-hidden="true" />
      <span className="label">MARKET {status.label}</span>
    </span>
  );
}
