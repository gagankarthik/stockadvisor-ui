"use client";

// Instrument gauges: the VIX arc and the breadth depth-meter.

// ---- Arc gauge (used for VIX) -------------------------------------------------
// pathLength=100 lets us fill the arc by percentage without needle trig.

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

// ---- Breadth depth-gauge: % above 200DMA as a centered meter ------------------
export function BreadthMeter({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  const tone = v >= 60 ? "var(--color-up)" : v <= 40 ? "var(--color-down)" : "var(--color-brass)";
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="eyebrow">{label}</span>
        <span className="font-mono text-sm tnum text-chalk">{v.toFixed(0)}%</span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-line">
        {/* 50% reference notch */}
        <div className="absolute left-1/2 top-[-2px] h-3 w-px bg-line-2" />
        <div
          className="h-full rounded-full"
          style={{ width: `${v}%`, background: tone, transition: "width 600ms ease" }}
        />
      </div>
    </div>
  );
}
