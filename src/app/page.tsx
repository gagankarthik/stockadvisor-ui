"use client";

import Link from "next/link";
import { useDashboard } from "@/lib/hooks";
import { Panel, PanelHeader, Stat, Badge, PageHeader, Skeleton, ErrorState } from "@/components/ui";
import { BreadthMeter, SectorBars } from "@/components/charts";
import { dirClass, fmtNum, fmtPct, fmtSignedPct } from "@/lib/format";
import { clsx } from "@/lib/clsx";
import type { MoverRow } from "@/lib/types";

export default function DashboardPage() {
  const { data, error, isLoading, mutate } = useDashboard();

  if (error) return <Wrap><ErrorState message={error.message} onRetry={() => mutate()} /></Wrap>;

  return (
    <Wrap>
      {isLoading || !data ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Breadth instrument row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Panel className="lg:col-span-2">
              <PanelHeader
                eyebrow="Market breadth"
                title="How much of the market is participating"
                right={<Badge fg="text-brass" bg="bg-brass/10" bd="border-brass/40">{data.regime}</Badge>}
              />
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <BreadthMeter value={data.breadth.above_200dma} label="Above 200-day average" />
                <BreadthMeter value={data.breadth.above_50dma} label="Above 50-day average" />
                <BreadthMeter value={data.breadth.uptrend_share} label="In a full uptrend" />
                <BreadthMeter value={data.breadth.advancing_today} label="Advancing today" />
              </div>
              <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-mute">
                Breadth reads the tape beneath the index: when most stocks sit above their
                200-day average the trend is broad and durable; when few do, a handful of
                names are masking a weak market.
              </p>
            </Panel>

            <Panel>
              <PanelHeader eyebrow="Factor regime" title="What's working now" />
              <p className="mb-3 text-xs text-mute">
                Recent rank-correlation (IC) of each factor with returns. Positive means the
                factor has been picking winners lately.
              </p>
              <div className="flex flex-col gap-2.5">
                {Object.entries(data.ics).length === 0 && (
                  <span className="text-sm text-faint">No factor data.</span>
                )}
                {Object.entries(data.ics).map(([k, v]) => (
                  <FactorIC key={k} name={k} value={v} />
                ))}
              </div>
            </Panel>
          </div>

          {/* Sectors + movers */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Panel className="lg:col-span-2">
              <PanelHeader eyebrow="Sector rotation" title="1-month performance by sector" />
              <SectorBars rows={data.sectors} />
            </Panel>

            <div className="flex flex-col gap-4">
              <Panel flush>
                <div className="border-b border-line px-4 py-2.5">
                  <span className="eyebrow text-up">Top gainers — today</span>
                </div>
                <MoversList rows={data.movers.gainers} />
              </Panel>
              <Panel flush>
                <div className="border-b border-line px-4 py-2.5">
                  <span className="eyebrow text-down">Top losers — today</span>
                </div>
                <MoversList rows={data.movers.losers} />
              </Panel>
            </div>
          </div>

          {/* Model card teaser */}
          {data.model && (
            <Panel className="mt-4">
              <PanelHeader
                eyebrow="The AI model"
                title="How good are its picks?"
                right={
                  <Link href="/model" className="font-mono text-xs text-ion hover:text-ion-2">
                    details →
                  </Link>
                }
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Ranking quality" accent="ion" value={fmtNum(data.model.test_auc, 3)} sub="AUC · 0.5 = coin flip" />
                <Stat label="Hit rate" value={data.model.test_accuracy != null ? fmtPct(data.model.test_accuracy * 100, 1) : "—"} sub="calls right" />
                <Stat label="Edge" accent="ion" value={fmtNum(data.model.test_ic, 3)} sub="rank correlation" />
                <Stat label="Stocks covered" value={fmtNum(data.model.n_stocks, 0)} sub={`as of ${data.model.data_through ?? "—"}`} />
              </div>
            </Panel>
          )}
        </>
      )}
    </Wrap>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader
        kicker="The Desk"
        title="Market read"
        lead="A live instrument read of the US market — breadth, the working factor regime, sector rotation, and today's extremes."
      />
      {children}
    </>
  );
}

function FactorIC({ name, value }: { name: string; value: number }) {
  const pos = value >= 0;
  const w = Math.min(50, Math.abs(value) * 100); // IC ~ -0.5..0.5
  const label = name.replace("_", " ");
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm capitalize text-chalk">{label}</span>
        <span className={clsx("font-mono text-xs tnum", pos ? "text-up" : "text-down")}>
          {pos ? "+" : ""}
          {value.toFixed(3)}
        </span>
      </div>
      <div className="relative h-1.5 rounded-full bg-line">
        <div className="absolute left-1/2 top-[-2px] h-[10px] w-px bg-line-2" />
        <div
          className={clsx("absolute top-0 h-full rounded-full", pos ? "bg-up/80" : "bg-down/80")}
          style={{ width: `${w}%`, left: pos ? "50%" : `${50 - w}%`, transition: "width 500ms ease" }}
        />
      </div>
    </div>
  );
}

function MoversList({ rows }: { rows: MoverRow[] }) {
  if (!rows?.length) return <div className="px-4 py-5 text-sm text-faint">No data.</div>;
  return (
    <ul className="divide-y divide-line">
      {rows.map((r) => (
        <li key={r.Ticker}>
          <Link
            href={`/stock/${r.Ticker}`}
            className="flex items-center justify-between gap-3 px-4 py-2 hover:bg-slate-2"
          >
            <div className="min-w-0">
              <div className="font-mono text-sm text-chalk">{r.Ticker}</div>
              <div className="truncate text-xs text-faint">{r.Name}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm tnum text-chalk">{fmtNum(r.Price)}</div>
              <div className={clsx("font-mono text-xs tnum", dirClass(r["1D %"]))}>
                {fmtSignedPct(r["1D %"])}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 lg:col-span-2" />
        <Skeleton className="h-64" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}
