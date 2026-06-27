"use client";

// Organism · RegimeTape — the always-on market status strip: regime, breadth,
// the ETF ticker, VIX gauge, and connection state.

import { useDashboard, useHealth } from "@/lib/hooks";
import { clsx } from "@/lib/clsx";
import { ArcGauge } from "./charts";
import { fmtNum, fmtSignedPct } from "@/lib/format";

function regimeStyle(regime: string | undefined): { fg: string; dot: string } {
  switch (regime) {
    case "RISK-ON":
      return { fg: "text-up", dot: "bg-up" };
    case "RISK-OFF":
      return { fg: "text-down", dot: "bg-down" };
    default:
      return { fg: "text-brass", dot: "bg-brass" };
  }
}

function vixZone(vix: number | null): { color: string; mood: string } {
  if (vix == null) return { color: "var(--color-mute)", mood: "—" };
  if (vix < 15) return { color: "var(--color-up)", mood: "CALM" };
  if (vix < 20) return { color: "var(--color-brass)", mood: "NORMAL" };
  if (vix < 30) return { color: "var(--color-brass-2)", mood: "ELEVATED" };
  return { color: "var(--color-down)", mood: "HIGH FEAR" };
}

export function RegimeTape() {
  const { data: dash } = useDashboard();
  const { data: health, error: healthError } = useHealth();

  const reg = regimeStyle(dash?.regime);
  const conn = healthError
    ? { cls: "bg-down", label: "offline" }
    : health?.snapshot_stale
      ? { cls: "bg-brass", label: "stale data" }
      : health?.snapshot_available
        ? { cls: "bg-up animate-pulse", label: "live" }
        : { cls: "bg-mute", label: "no snapshot" };
  const vix = vixZone(dash?.vix ?? null);

  return (
    <div className="scan relative z-20 border-b border-line bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/80">
      <div className="flex items-stretch divide-x divide-line overflow-hidden">
        {/* Regime + breadth */}
        <div className="flex shrink-0 items-center gap-3 px-4 py-2">
          <span className={clsx("h-1.5 w-1.5 rounded-full", reg.dot)} />
          <div>
            <div className="eyebrow leading-none">Market regime</div>
            <div className={clsx("font-display text-base leading-tight", reg.fg)}>
              {dash?.regime ?? "—"}
            </div>
          </div>
          <div className="ml-1 hidden w-24 sm:block">
            <div className="eyebrow leading-none">› 200d</div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-line">
              <div
                className="h-full rounded-full bg-brass"
                style={{
                  width: `${Math.max(0, Math.min(100, dash?.breadth.above_200dma ?? 0))}%`,
                  transition: "width 600ms ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* ETF ticks */}
        <div className="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(dash?.etfs ?? []).map((e) => (
            <div key={e.ticker} className="flex shrink-0 items-baseline gap-1.5">
              <span className="font-mono text-xs font-medium text-chalk">{e.ticker}</span>
              <span className="font-mono text-xs tnum text-mute">{fmtNum(e.price)}</span>
              <span
                className={clsx(
                  "font-mono text-[0.7rem] tnum",
                  e.change_pct >= 0 ? "text-up" : "text-down",
                )}
              >
                {fmtSignedPct(e.change_pct)}
              </span>
            </div>
          ))}
          {!dash && <span className="font-mono text-xs text-faint">loading market tape…</span>}
        </div>

        {/* VIX + status */}
        <div className="hidden shrink-0 items-center gap-3 px-4 py-1.5 md:flex">
          <div className="w-20">
            <ArcGauge value={dash?.vix ?? null} max={50} label={`VIX · ${vix.mood}`} zoneColor={vix.color} />
          </div>
          <div className="flex flex-col items-end gap-1 pl-1">
            <div className="flex items-center gap-1.5">
              <span className={clsx("h-1.5 w-1.5 rounded-full", conn.cls)} />
              <span className="eyebrow leading-none">{conn.label}</span>
            </div>
            <span className="font-mono text-[0.7rem] tnum text-faint">
              as of {dash?.data_through ?? "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
