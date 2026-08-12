import { NextResponse } from "next/server";
import { getQuotes, REFRESH_SECONDS } from "@/lib/quotes";

// The pages themselves stay static; the ticker polls this route for live data.
export const dynamic = "force-dynamic";

export async function GET() {
  const feed = await getQuotes();

  // Fresh data gets the full window at the CDN edge, so client polls almost
  // never reach the function. Degraded states cache briefly instead, so the
  // ticker recovers quickly once upstream is healthy again — the backoff in
  // getQuotes is what stops that turning into upstream pressure.
  const maxAge = feed.state === "live" ? REFRESH_SECONDS : 30;

  return NextResponse.json(feed, {
    headers: {
      "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=600`,
    },
  });
}
