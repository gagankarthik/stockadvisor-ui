"use client";

// Organism · ArcGauge — the VIX arc. pathLength=100 fills the arc by percentage
// without needle trigonometry.

function topArc(cx: number, cy: number, r: number): string {
  return `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`;
}

export function ArcGauge({
  value,
  max = 50,
  label,
  zoneColor,
}: {
  value: number | null;
  max?: number;
  label?: string;
  zoneColor: string;
}) {
  const cx = 60;
  const cy = 58;
  const r = 46;
  const pct =
    value == null ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <svg viewBox="0 0 120 70" className="w-full" role="img" aria-label={`${label}: ${value ?? "n/a"}`}>
      <path d={topArc(cx, cy, r)} fill="none" stroke="var(--color-line)" strokeWidth={7} strokeLinecap="round" />
      <path
        d={topArc(cx, cy, r)}
        fill="none"
        stroke={zoneColor}
        strokeWidth={7}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${pct} 100`}
        style={{ transition: "stroke-dasharray 600ms ease" }}
      />
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-chalk font-mono" style={{ fontSize: 18 }}>
        {value == null ? "—" : value.toFixed(1)}
      </text>
      {label && (
        <text x={cx} y={cy + 7} textAnchor="middle" className="fill-faint font-sans" style={{ fontSize: 7, letterSpacing: 1.5 }}>
          {label.toUpperCase()}
        </text>
      )}
    </svg>
  );
}
