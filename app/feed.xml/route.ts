import { NextResponse } from 'next/server';

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Blog Feed - Generated at 2026-09-02 -->
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Closing Bell Daily</title>
  <subtitle>Market insights and AI analysis</subtitle>
  <link href="https://closing-bell-daily.com" rel="self"/>
  <link href="https://closing-bell-daily.com" title="Home"/>
  <updated>2026-09-02T14:30:00Z</updated>
  <author>
    <name>Closing Bell Team</name>
    <email>team@closing-bell-daily.com</email>
  </author>

  <!-- AI-Watch Post -->
  <entry>
    <title>Sovereign AI push and rising hyperscaler capex forecasts buoy chipmakers</title>
    <link href="https://closing-bell-daily.com/ai-watch/2026-09-02" />
    <id>https://closing-bell-daily.com/ai-watch/2026-09-02</id>
    <published>2026-09-02T14:30:00Z</published>
    <updated>2026-09-02T14:30:00Z</updated>
    <summary>Nvidia CEO Jensen Huang highlighted national infrastructure as a critical demand driver...</summary>
    <category term="AI" />
    <category term="Semiconductors" />
  </entry>

  <!-- Main Post -->
  <entry>
    <title>Equities Stabilize as AI Strength Offsets Geopolitical Jitters</title>
    <link href="https://closing-bell-daily.com/posts/2026-09-02" />
    <id>https://closing-bell-daily.com/posts/2026-09-02</id>
    <published>2026-09-02T14:30:00Z</published>
    <updated>2026-09-02T14:30:00Z</updated>
    <summary>U.S. benchmarks edged higher after early volatility...</summary>
    <category term="Equities" />
    <category term="AI" />
  </entry>
</feed>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}