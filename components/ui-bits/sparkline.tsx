export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;

  const width = 76;
  const height = 26;
  const inset = 4;
  const dotRadius = 2;
  const centerY = height / 2;
  const upRoom = centerY - inset;
  const downRoom = height - inset - centerY;

  // Scale every point relative to how far it deviates from the *last*
  // value, not the series min/max, so the last point always lands exactly
  // at centerY — the height the number beside it sits at — with no
  // after-the-fact clamping that could pull it back off-center.
  const last = values[values.length - 1];
  const deltas = values.map((v) => v - last);
  const maxAbove = Math.max(0, ...deltas);
  const maxBelow = Math.max(0, ...deltas.map((d) => -d));
  const scaleUp = maxAbove > 0 ? upRoom / maxAbove : 0;
  const scaleDown = maxBelow > 0 ? downRoom / maxBelow : 0;
  const ys = deltas.map((d) =>
    d >= 0 ? centerY - d * scaleUp : centerY - d * scaleDown
  );

  // Leave room on the right so the terminal dot doesn't get clipped by the
  // viewBox edge.
  const step = (width - dotRadius) / (values.length - 1);
  const points = values.map((_, i) => `${i * step},${ys[i]}`).join(" ");
  const lastX = (values.length - 1) * step;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      className="shrink-0"
    >
      <polyline
        points={points}
        fill="none"
        stroke="var(--spark-stroke)"
        strokeWidth="var(--spark-width)"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={centerY} r={dotRadius} fill="var(--spark-dot)" />
    </svg>
  );
}
