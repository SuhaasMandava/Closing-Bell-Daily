type Props = {
  points: number[];
  direction?: "up" | "down" | "flat";
  size?: "banner" | "lead";
};

const WIDTH = 400;
const HEIGHT = 132;
const PAD_X = 0;
const PAD_Y = 14;

/**
 * Full-bleed area chart used as a card's "image." Reuses the same
 * sparkline data authored in frontmatter — no photo pipeline needed, and a
 * real price shape is more honest than a stock photo for a market wrap.
 */
export default function ChartBanner({ points, direction, size = "banner" }: Props) {
  if (points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = (WIDTH - PAD_X * 2) / (points.length - 1);

  const coords = points.map((value, i) => {
    const x = PAD_X + i * step;
    const y = PAD_Y + (1 - (value - min) / span) * (HEIGHT - PAD_Y * 2);
    return [x, y] as const;
  });

  const line = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  const area = `${line} L${WIDTH.toFixed(1)},${HEIGHT} L0,${HEIGHT} Z`;

  const trend =
    direction ?? (points[points.length - 1] >= points[0] ? "up" : "down");

  const gradientId = `chart-fill-${trend}`;

  return (
    <svg
      className={`chart-banner chart-banner--${size} ${trend}`}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="chart-banner-fill" d={area} fill={`url(#${gradientId})`} />
      <path
        className="chart-banner-line"
        d={line}
        fill="none"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
