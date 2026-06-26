"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { PageHeader, Panel, PanelHeader, Stat, Badge, Segmented, Skeleton, ErrorState } from "@/components/ui";
import { PriceChart } from "@/components/charts";
import { dirClass, fmtMoney, fmtNum, fmtPct, fmtSignedPct, signalTone } from "@/lib/format";
import { clsx } from "@/lib/clsx";
import type { StockDetail } from "@/lib/types";

const PERIODS = [
  { value: "1mo", label: "1M" },
  { value: "3mo", label: "3M" },
  { value: "6mo", label: "6M" },
  { value: "1y", label: "1Y" },
  { value: "5y", label: "5Y" },
];

function validationTone(status: string) {
  if (status === "VERIFIED") return { fg: "text-up", bg: "bg-up/10", bd: "border-up/40" };
  if (status === "MISMATCH") return { fg: "text-down", bg: "bg-down/10", bd: "border-down/40" };
  if (status === "MINOR DIVERGENCE") return { fg: "text-brass", bg: "bg-brass/10", bd: "border-brass/40" };
  return { fg: "text-mute", bg: "bg-mute/5", bd: "border-line-2" };
}

export default function StockDetailPage() {
  const params = useParams<{ ticker: string }>();
  const ticker = (params.ticker || "").toUpperCase();
  const [period, setPeriod] = useState("1y");

  const { data, error, isLoading, mutate } = useSWR<StockDetail>(
    ticker ? `/stocks/${ticker}?period=${period}&interval=1d` : null,
  );

  const snap = data?.snapshot;
  const quote = data?.quote;
  const name = (data?.profile?.name as string) || snap?.name || ticker;

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
          {/* Chart */}
          <Panel>
            <PanelHeader
              eyebrow="Price history"
              title={`${ticker} — adjusted close`}
              right={<Segmented size="sm" value={period} onChange={setPeriod} options={PERIODS} />}
            />
            <PriceChart bars={data.history} />
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
                <PanelHeader eyebrow="The desk's read" title="Score, model & signal" />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="Score" accent="brass" value={fmtNum(snap.score, 0)} sub={snap.lean ?? ""} />
                  <Stat label="ML probability" accent="ion" value={snap.ml_pct == null ? "—" : fmtPct(snap.ml_pct, 0)} sub="beats median" />
                  <Stat label="Confidence" value={fmtNum(snap.confidence_pct, 0)} sub="engines agree" />
                  <Stat label="Signal" value={<SignalText signal={snap.signal} />} sub="technical" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 border-t border-line pt-3 text-xs">
                  <Mini label="RSI" value={fmtNum(snap.rsi, 0)} />
                  <Mini label="Volatility" value={fmtPct(snap.volatility_pct, 1)} />
                  <Mini label="12-1M momentum" value={fmtSignedPct(snap.ret_12_1m_pct, 1)} tone={dirClass(snap.ret_12_1m_pct)} />
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
