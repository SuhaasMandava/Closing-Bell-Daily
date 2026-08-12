import { NextResponse } from "next/server";
import { getQuotes } from "@/lib/quotes";

// The pages themselves stay static; the ticker polls this route for live data.
export const dynamic = "force-dynamic";

export async function GET() {
  const feed = await getQuotes();

  return NextResponse.json(feed, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
