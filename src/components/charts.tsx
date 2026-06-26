"use client";

import { clsx } from "@/lib/clsx";
import type { PriceBar } from "@/lib/types";

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

// ---- Price area chart (SVG) ---------------------------------------------------
export function PriceChart({ bars, height = 240 }: { bars: PriceBar[]; height?: number }) {
  const W = 800;
  const H = height;
  const padX = 4;
  const padY = 12;
  if (bars.length < 2) {
    return <div className="flex h-40 items-center justify-center text-sm text-mute">No price history.</div>;
  }
  const closes = bars.map((b) => b.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;
  const x = (i: number) => padX + (i / (bars.length - 1)) * (W - padX * 2);
  const y = (v: number) => padY + (1 - (v - min) / span) * (H - padY * 2);

  const line = closes.map((c, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(2)} ${y(c).toFixed(2)}`).join(" ");
  const area = `${line} L ${x(bars.length - 1).toFixed(2)} ${H - padY} L ${x(0).toFixed(2)} ${H - padY} Z`;
  const up = closes[closes.length - 1] >= closes[0];
  const stroke = up ? "var(--color-up)" : "var(--color-down)";
  const gridYs = [0.25, 0.5, 0.75].map((f) => padY + f * (H - padY * 2));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="priceFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridYs.map((gy, i) => (
        <line key={i} x1={0} x2={W} y1={gy} y2={gy} stroke="var(--color-line)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      ))}
      <path d={area} fill="url(#priceFill)" />
      <path d={line} fill="none" stroke={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <circle cx={x(bars.length - 1)} cy={y(closes[closes.length - 1])} r={3} fill={stroke} />
    </svg>
  );
}

// ---- Sector bars: diverging 1M% performance ----------------------------------
export function SectorBars({
  rows,
}: {
  rows: { Sector: string; "1M %": number; Stocks: number }[];
}) {
  const maxAbs = Math.max(1, ...rows.map((r) => Math.abs(r["1M %"])));
  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((r) => {
        const v = r["1M %"];
        const w = (Math.abs(v) / maxAbs) * 50;
        const pos = v >= 0;
        return (
          <div key={r.Sector} className="grid grid-cols-[9.5rem_1fr_3.2rem] items-center gap-2">
            <span className="truncate text-xs text-mute" title={r.Sector}>
              {r.Sector}
            </span>
            <div className="relative h-3.5 rounded-sm bg-ink">
              <div className="absolute left-1/2 top-0 h-full w-px bg-line-2" />
              <div
                className={clsx("absolute top-0 h-full", pos ? "bg-up/70" : "bg-down/70")}
                style={{
                  width: `${w}%`,
                  left: pos ? "50%" : `${50 - w}%`,
                  transition: "width 500ms ease",
                }}
              />
            </div>
            <span className={clsx("text-right font-mono text-xs tnum", pos ? "text-up" : "text-down")}>
              {pos ? "+" : ""}
              {v.toFixed(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---- Tiny sparkline (optional reuse) -----------------------------------------
export function Sparkline({ values, up }: { values: number[]; up: boolean }) {
  if (values.length < 2) return null;
  const W = 80;
  const H = 22;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const d = values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (values.length - 1)) * W} ${H - ((v - min) / span) * H}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-5 w-20" preserveAspectRatio="none">
      <path d={d} fill="none" stroke={up ? "var(--color-up)" : "var(--color-down)"} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
