"use client";

// Sector bars: diverging 1-month performance, centered on zero.

import { clsx } from "@/lib/clsx";

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
