"use client";

// Interactive price area chart (SVG + hover crosshair/tooltip).

import { useRef, useState } from "react";
import type { PriceBar } from "@/lib/types";
import { fmtTs } from "./utils";

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
