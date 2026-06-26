"use client";

import { useRef, useState } from "react";
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

// ---- Interactive price area chart (SVG + hover crosshair/tooltip) -------------
function fmtTs(iso: string, intraday: boolean): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return intraday
    ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function PriceChart({
  bars,
  height = 260,
  intraday = false,
}: {
  bars: PriceBar[];
  height?: number;
  intraday?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  if (bars.length < 2) {
    return <div className="flex h-40 items-center justify-center text-sm text-mute">No price history for this range.</div>;
  }

  const W = 800;
  const H = height;
  const padY = 14;
  const closes = bars.map((b) => b.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;
  const n = bars.length;
  const x = (i: number) => (i / (n - 1)) * W;
  const y = (v: number) => padY + (1 - (v - min) / span) * (H - padY * 2);

  const line = closes.map((c, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(2)} ${y(c).toFixed(2)}`).join(" ");
  const area = `${line} L ${W} ${H - padY} L 0 ${H - padY} Z`;
  const up = closes[n - 1] >= closes[0];
  const stroke = up ? "var(--color-up)" : "var(--color-down)";
  const gridYs = [0.25, 0.5, 0.75].map((f) => padY + f * (H - padY * 2));

  function onMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    setHover(Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1)))));
  }

  const hi = hover != null ? bars[hover] : null;
  const leftPct = hover != null ? (hover / (n - 1)) * 100 : 0;
  const topPct = hi ? (y(hi.close) / H) * 100 : 0;

  return (
    <div
      ref={ref}
      className="relative w-full select-none"
      style={{ height }}
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
      onTouchMove={(e) => {
        const t = e.touches[0];
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const ratio = (t.clientX - rect.left) / rect.width;
        setHover(Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1)))));
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
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
        <path d={line} fill="none" stroke={stroke} strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
        <circle cx={x(n - 1)} cy={y(closes[n - 1])} r={3} fill={stroke} />
      </svg>

      {hi && (
        <>
          <div className="pointer-events-none absolute top-0 bottom-0 w-px bg-line-2" style={{ left: `${leftPct}%` }} />
          <div
            className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-ink"
            style={{ left: `${leftPct}%`, top: `${topPct}%`, background: stroke }}
          />
          <div
            className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 whitespace-nowrap rounded border border-line-2 bg-slate px-2 py-1 text-center shadow-lg"
            style={{ left: `${Math.min(88, Math.max(12, leftPct))}%` }}
          >
            <div className="font-mono text-sm tnum text-chalk">${hi.close.toFixed(2)}</div>
            <div className="font-mono text-[0.65rem] text-faint">{fmtTs(hi.date, intraday)}</div>
          </div>
        </>
      )}
    </div>
  );
}

// ---- Trading chart: candles or area + volume, with OHLC crosshair ------------
export function TradingChart({
  bars,
  type = "candles",
  intraday = false,
  priceHeight = 300,
  volHeight = 60,
}: {
  bars: PriceBar[];
  type?: "candles" | "area";
  intraday?: boolean;
  priceHeight?: number;
  volHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  if (bars.length < 2) {
    return <div className="flex h-48 items-center justify-center text-sm text-mute">No price history for this range.</div>;
  }

  const W = 1000;
  const n = bars.length;
  const padY = 10;
  const candles = type === "candles";

  const lo = Math.min(...bars.map((b) => (candles ? b.low : b.close)));
  const hi = Math.max(...bars.map((b) => (candles ? b.high : b.close)));
  const span = hi - lo || 1;
  const maxVol = Math.max(...bars.map((b) => b.volume), 1);

  const cx = (i: number) => (candles ? ((i + 0.5) / n) * W : (i / (n - 1)) * W);
  const py = (v: number) => padY + (1 - (v - lo) / span) * (priceHeight - padY * 2);
  const bw = Math.max(1, (W / n) * 0.64);

  const closes = bars.map((b) => b.close);
  const up = closes[n - 1] >= closes[0];
  const areaStroke = up ? "var(--color-up)" : "var(--color-down)";
  const line = closes.map((c, i) => `${i === 0 ? "M" : "L"} ${cx(i).toFixed(1)} ${py(c).toFixed(1)}`).join(" ");
  const area = `${line} L ${cx(n - 1)} ${priceHeight - padY} L ${cx(0)} ${priceHeight - padY} Z`;
  const gridYs = [0.25, 0.5, 0.75].map((f) => padY + f * (priceHeight - padY * 2));

  function pick(clientX: number) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (clientX - rect.left) / rect.width;
    setHover(Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1)))));
  }

  const b = hover != null ? bars[hover] : null;
  const leftPct = hover != null ? (cx(hover) / W) * 100 : 0;

  return (
    <div
      ref={ref}
      className="relative w-full select-none"
      onMouseMove={(e) => pick(e.clientX)}
      onMouseLeave={() => setHover(null)}
      onTouchMove={(e) => pick(e.touches[0].clientX)}
    >
      {/* price */}
      <svg viewBox={`0 0 ${W} ${priceHeight}`} preserveAspectRatio="none" className="w-full" style={{ height: priceHeight }}>
        <defs>
          <linearGradient id="tcFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={areaStroke} stopOpacity="0.2" />
            <stop offset="100%" stopColor={areaStroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridYs.map((gy, i) => (
          <line key={i} x1={0} x2={W} y1={gy} y2={gy} stroke="var(--color-line)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        ))}
        {candles
          ? bars.map((bar, i) => {
              const gain = bar.close >= bar.open;
              const col = gain ? "var(--color-up)" : "var(--color-down)";
              const x = cx(i);
              const yO = py(bar.open);
              const yC = py(bar.close);
              const top = Math.min(yO, yC);
              const h = Math.max(1, Math.abs(yC - yO));
              return (
                <g key={i}>
                  <line x1={x} x2={x} y1={py(bar.high)} y2={py(bar.low)} stroke={col} strokeWidth={1} vectorEffect="non-scaling-stroke" />
                  <rect x={x - bw / 2} y={top} width={bw} height={h} fill={col} />
                </g>
              );
            })
          : (
            <>
              <path d={area} fill="url(#tcFill)" />
              <path d={line} fill="none" stroke={areaStroke} strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
            </>
          )}
      </svg>

      {/* volume */}
      <svg viewBox={`0 0 ${W} ${volHeight}`} preserveAspectRatio="none" className="mt-1 w-full" style={{ height: volHeight }}>
        {bars.map((bar, i) => {
          const gain = bar.close >= bar.open;
          const h = (bar.volume / maxVol) * volHeight;
          return <rect key={i} x={cx(i) - bw / 2} y={volHeight - h} width={bw} height={h} fill={gain ? "var(--color-up)" : "var(--color-down)"} opacity={0.45} />;
        })}
      </svg>

      {/* crosshair + OHLC tooltip */}
      {b && (
        <>
          <div className="pointer-events-none absolute top-0 bottom-0 w-px bg-line-2" style={{ left: `${leftPct}%` }} />
          <div
            className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 whitespace-nowrap rounded border border-line-2 bg-slate px-2 py-1 shadow-lg"
            style={{ left: `${Math.min(86, Math.max(14, leftPct))}%` }}
          >
            <div className="mb-0.5 font-mono text-[0.65rem] text-faint">{fmtTs(b.date, intraday)}</div>
            <div className="grid grid-cols-4 gap-x-2 font-mono text-[0.68rem] tnum">
              <span className="text-faint">O</span><span className="text-chalk">{b.open.toFixed(2)}</span>
              <span className="text-faint">H</span><span className="text-up">{b.high.toFixed(2)}</span>
              <span className="text-faint">L</span><span className="text-down">{b.low.toFixed(2)}</span>
              <span className="text-faint">C</span><span className="text-chalk">{b.close.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
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
