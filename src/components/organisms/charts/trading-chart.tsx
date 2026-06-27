"use client";

// Organism · TradingChart — candles or area + volume, with an OHLC crosshair.

import { useRef, useState } from "react";
import type { PriceBar } from "@/lib/types";
import { fmtTs } from "./utils";

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
