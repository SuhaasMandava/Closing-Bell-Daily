type Props = {
  points: number[];
  /** Overrides the trend color inferred from first vs. last point */
  direction?: "up" | "down" | "flat";
};

const WIDTH = 260;
const HEIGHT = 44;
const PAD = 3;

/** Tiny inline trend line — no chart library, no client JS. */
export default function Sparkline({ points, direction }: Props) {
  if (points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = (WIDTH - PAD * 2) / (points.length - 1);

  const path = points
    .map((value, i) => {
      const x = PAD + i * step;
      const y = PAD + (1 - (value - min) / span) * (HEIGHT - PAD * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const trend =
    direction ??
    (points[points.length - 1] >= points[0] ? "up" : "down");

  return (
    <svg
      className={`sparkline ${trend}`}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden="true"
    >
      <path d={path} fill="none" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
