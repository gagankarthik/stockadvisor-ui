"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { PageHeader, Panel, PanelHeader, Stat, Badge, Skeleton, ErrorState } from "@/components/ui";
import { TradingChart } from "@/components/charts";
import { dirClass, fmtMoney, fmtNum, fmtPct, fmtSignedPct, signalTone } from "@/lib/format";
import { clsx } from "@/lib/clsx";
import type { StockDetail } from "@/lib/types";

// Time ranges → (yfinance period, interval, intraday?). 1D/5D are intraday.
const RANGES = [
  { label: "1D", period: "1d", interval: "5m", intraday: true },
  { label: "5D", period: "5d", interval: "15m", intraday: true },
  { label: "1M", period: "1mo", interval: "1d", intraday: false },
  { label: "3M", period: "3mo", interval: "1d", intraday: false },
  { label: "6M", period: "6mo", interval: "1d", intraday: false },
  { label: "1Y", period: "1y", interval: "1d", intraday: false },
  { label: "5Y", period: "5y", interval: "1wk", intraday: false },
] as const;

function validationTone(status: string) {
  if (status === "VERIFIED") return { fg: "text-up", bg: "bg-up/10", bd: "border-up/40" };
  if (status === "MISMATCH") return { fg: "text-down", bg: "bg-down/10", bd: "border-down/40" };
  if (status === "MINOR DIVERGENCE") return { fg: "text-brass", bg: "bg-brass/10", bd: "border-brass/40" };
  return { fg: "text-mute", bg: "bg-mute/5", bd: "border-line-2" };
}

export default function StockDetailPage() {
  const params = useParams<{ ticker: string }>();
  const ticker = (params.ticker || "").toUpperCase();
  const [rangeIdx, setRangeIdx] = useState(5); // default 1Y
  const [chartType, setChartType] = useState<"candles" | "area">("candles");
  const range = RANGES[rangeIdx];

  const { data, error, isLoading, mutate } = useSWR<StockDetail>(
    ticker ? `/stocks/${ticker}?period=${range.period}&interval=${range.interval}` : null,
    { refreshInterval: 60000 }, // live: refresh quote + chart each minute
  );

  const snap = data?.snapshot;
  const quote = data?.quote;
  const name = (data?.profile?.name as string) || snap?.name || ticker;

  // change/high/low over the visible range (from the chart series)
  const rangeStats = useMemo(() => {
    const h = data?.history ?? [];
    if (h.length < 2) return null;
    const first = h[0].close;
    const last = h[h.length - 1].close;
    return {
      changePct: ((last - first) / first) * 100,
      high: Math.max(...h.map((b) => b.high)),
      low: Math.min(...h.map((b) => b.low)),
    };
  }, [data]);

  return (
    <>
      <PageHeader
        kicker="Stock Lab"
        title={ticker}
        lead={typeof name === "string" && name !== ticker ? name : undefined}
        actions={
          quote ? (
            <div className="text-right">
              <div className="font-mono text-2xl tnum text-chalk">{fmtMoney(quote.price)}</div>
              <div className={clsx("font-mono text-sm tnum", dirClass(quote.change_pct))}>
                {fmtSignedPct(quote.change_pct)}
              </div>
            </div>
          ) : undefined
        }
      />

      {error ? (
        <ErrorState message={error.message} onRetry={() => mutate()} />
      ) : isLoading || !data ? (
        <div className="space-y-4">
          <Skeleton className="h-80" />
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-48 lg:col-span-2" />
            <Skeleton className="h-48" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Chart — the hero */}
          <Panel>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
              <div className="flex items-baseline gap-3">
                <div>
                  <div className="eyebrow flex items-center gap-1.5">
                    Price · {range.label}
                    <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-up align-middle" title="live — refreshes each minute" />
                  </div>
                  {rangeStats && (
                    <div className={clsx("font-mono text-sm tnum", dirClass(rangeStats.changePct))}>
                      {fmtSignedPct(rangeStats.changePct)} <span className="text-faint">this {range.label}</span>
                    </div>
                  )}
                </div>
                {rangeStats && (
                  <div className="hidden gap-4 sm:flex">
                    <RangeStat label="High" value={fmtMoney(rangeStats.high)} />
                    <RangeStat label="Low" value={fmtMoney(rangeStats.low)} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* candles / area toggle */}
                <div className="flex gap-1 rounded-[var(--radius-panel)] border border-line bg-ink p-0.5">
                  {(["candles", "area"] as const).map((t) => (
                    <button key={t} onClick={() => setChartType(t)} aria-pressed={chartType === t}
                      className={clsx("rounded-[3px] px-2 py-1 font-mono text-xs capitalize transition-colors",
                        chartType === t ? "bg-slate-2 text-brass shadow-[inset_0_0_0_1px_var(--color-line-2)]" : "text-mute hover:text-chalk")}>
                      {t}
                    </button>
                  ))}
                </div>
                {/* range pills (scrollable on mobile) */}
                <div className="flex gap-1 overflow-x-auto rounded-[var(--radius-panel)] border border-line bg-ink p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {RANGES.map((r, i) => (
                    <button
                      key={r.label}
                      onClick={() => setRangeIdx(i)}
                      aria-pressed={i === rangeIdx}
                      className={clsx(
                        "shrink-0 rounded-[3px] px-2.5 py-1 font-mono text-xs transition-colors",
                        i === rangeIdx ? "bg-slate-2 text-brass shadow-[inset_0_0_0_1px_var(--color-line-2)]" : "text-mute hover:text-chalk",
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <TradingChart bars={data.history} type={chartType} intraday={range.intraday} priceHeight={300} />
          </Panel>

          {/* Validation */}
          <Panel>
            <PanelHeader eyebrow="Quote validation" title="Triangulated across sources" />
            <div className="flex flex-wrap items-center gap-3">
              <Badge {...validationTone(data.validation.status)}>
                {data.validation.icon} {data.validation.status}
              </Badge>
              <span className="text-sm text-mute">{data.validation.detail}</span>
              {data.validation.spread_pct != null && (
                <span className="font-mono text-xs text-faint">spread {fmtPct(data.validation.spread_pct, 2)}</span>
              )}
            </div>
            {Object.keys(data.validation.sources).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-4 border-t border-line pt-3">
                {Object.entries(data.validation.sources).map(([src, px]) => (
                  <div key={src}>
                    <div className="eyebrow">{src}</div>
                    <div className="font-mono text-sm tnum text-chalk">{fmtMoney(px)}</div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Model read + analysts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {snap && (
              <Panel className="lg:col-span-2">
                <PanelHeader eyebrow="Our read" title="Rating, AI odds & signal" />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="Rating" accent="brass" value={fmtNum(snap.score, 0)} sub={snap.lean ?? ""} />
                  <Stat label="AI Odds" accent="ion" value={snap.ml_pct == null ? "—" : fmtPct(snap.ml_pct, 0)} sub="beats market next month" />
                  <Stat label="Confidence" value={fmtNum(snap.confidence_pct, 0)} sub="signals agree" />
                  <Stat label="Signal" value={<SignalText signal={snap.signal} />} sub="chart pattern" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 border-t border-line pt-3 text-xs">
                  <Mini label="Price heat (RSI)" value={fmtNum(snap.rsi, 0)} />
                  <Mini label="Volatility" value={fmtPct(snap.volatility_pct, 1)} />
                  <Mini label="12-month momentum" value={fmtSignedPct(snap.ret_12_1m_pct, 1)} tone={dirClass(snap.ret_12_1m_pct)} />
                </div>
                {snap.reasons && (
                  <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-mute">
                    <span className="text-faint">Why: </span>
                    {snap.reasons}
                  </p>
                )}
              </Panel>
            )}

            <Panel className={snap ? "" : "lg:col-span-3"}>
              <PanelHeader eyebrow="Analyst consensus" title="Wall Street ratings" />
              <AnalystBar recs={data.recommendations} />
            </Panel>
          </div>

          {/* Profile + News */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Panel>
              <PanelHeader eyebrow="Company" title="Profile" />
              <ProfileGrid profile={data.profile} />
            </Panel>

            <Panel flush className="lg:col-span-2">
              <div className="border-b border-line px-5 py-3">
                <span className="eyebrow">Latest news</span>
              </div>
              {data.news.length === 0 ? (
                <div className="px-5 py-6 text-sm text-faint">No recent headlines.</div>
              ) : (
                <ul className="divide-y divide-line">
                  {data.news.map((n, i) => (
                    <li key={i}>
                      <a
                        href={n.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-5 py-3 hover:bg-slate-2"
                      >
                        <div className="text-sm text-chalk">{n.title}</div>
                        <div className="mt-0.5 font-mono text-xs text-faint">
                          {n.provider} · {n.date}
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}

function SignalText({ signal }: { signal: string | null }) {
  const t = signalTone(signal);
  return <span className={t.fg}>{signal ?? "—"}</span>;
}

function RangeStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="eyebrow leading-none">{label}</div>
      <div className="mt-0.5 font-mono text-sm tnum text-mute">{value}</div>
    </div>
  );
}

function Mini({ label, value, tone = "text-chalk" }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div className={clsx("mt-0.5 font-mono text-sm tnum", tone)}>{value}</div>
    </div>
  );
}

function AnalystBar({ recs }: { recs: Record<string, number> | null }) {
  if (!recs) return <p className="text-sm text-faint">No analyst data available.</p>;
  const order: [string, string, string][] = [
    ["strongBuy", "Strong buy", "var(--color-up)"],
    ["buy", "Buy", "#6fae7f"],
    ["hold", "Hold", "var(--color-mute)"],
    ["sell", "Sell", "#d08a6a"],
    ["strongSell", "Strong sell", "var(--color-down)"],
  ];
  const total = order.reduce((s, [k]) => s + (Number(recs[k]) || 0), 0);
  if (total === 0) return <p className="text-sm text-faint">No analyst data available.</p>;
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {order.map(([k, , color]) => {
          const v = Number(recs[k]) || 0;
          if (!v) return null;
          return <div key={k} style={{ width: `${(v / total) * 100}%`, background: color }} title={`${k}: ${v}`} />;
        })}
      </div>
      <ul className="mt-3 space-y-1.5">
        {order.map(([k, label, color]) => (
          <li key={k} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-mute">
              <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
              {label}
            </span>
            <span className="font-mono tnum text-chalk">{Number(recs[k]) || 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProfileGrid({ profile }: { profile: Record<string, unknown> | null }) {
  if (!profile) return <p className="text-sm text-faint">No company profile available.</p>;
  const rows: [string, string][] = [
    ["Industry", String(profile.finnhubIndustry ?? "—")],
    ["Country", String(profile.country ?? "—")],
    ["Exchange", String(profile.exchange ?? "—")],
    ["Market cap", profile.marketCapitalization ? `$${fmtNum(Number(profile.marketCapitalization) / 1000, 1)}B` : "—"],
    ["IPO", String(profile.ipo ?? "—")],
  ];
  return (
    <dl className="space-y-2">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between border-b border-line/60 pb-1.5 text-sm last:border-0">
          <dt className="text-faint">{k}</dt>
          <dd className="font-mono text-chalk">{v}</dd>
        </div>
      ))}
      {typeof profile.weburl === "string" && (
        <a href={profile.weburl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block font-mono text-xs text-ion hover:text-ion-2">
          {String(profile.weburl).replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
        </a>
      )}
    </dl>
  );
}
