import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Site-wide share-card image. Next serves this automatically for the
 * homepage's og:image and twitter:image — without it, links shared to
 * Slack/X/iMessage show text only, no preview.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#08090a",
          color: "#e8eaec",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", color: "#4ade80", fontSize: 28, marginBottom: 28 }}>
          _ /Daily wrap _
        </div>
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700, letterSpacing: -3 }}>
          Closing Bell
        </div>
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700, letterSpacing: -3 }}>
          Daily_
        </div>
        <div style={{ display: "flex", color: "#9aa2ac", fontSize: 30, marginTop: 36 }}>
          A daily wrap of the US market close
        </div>
      </div>
    ),
    { ...size },
  );
}

export const alt = SITE_NAME;
