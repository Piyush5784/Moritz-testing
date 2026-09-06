function formatMinutes(minutes: number): string {
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/** Clock signal: risk under zero, watch under an hour, plain text above.
 *  Plain colored text, not a badge — same tone colors as StatusBadge,
 *  applied directly so the Left column reads as a number, not a pill. */
export function MinutesLeft({
  minutes,
  delivered = false,
}: {
  minutes: number;
  delivered?: boolean;
}) {
  if (delivered) {
    return <span className="num text-text-tertiary">-</span>;
  }
  if (minutes < 0) {
    return (
      <span className="num" style={{ color: "var(--status-risk-fg)" }}>
        -{Math.abs(minutes)}m
      </span>
    );
  }
  if (minutes < 60) {
    return (
      <span className="num" style={{ color: "var(--status-watch-fg)" }}>
        {minutes}m
      </span>
    );
  }
  return (
    <span className="num text-text-secondary">{formatMinutes(minutes)}</span>
  );
}
