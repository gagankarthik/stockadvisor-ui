"use client";

import { useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useSWRConfig } from "swr";
import { PageHeader, Panel, PanelHeader, Stat, Badge, Segmented, Toggle, ErrorState } from "@/components/ui";
import { fmtMoney, fmtNum, fmtPct, fmtSignedPct, PROFILES } from "@/lib/format";
import { PROFILE_SEGMENTS } from "@/lib/constants";
import { clsx } from "@/lib/clsx";
import type { Allocation, RiskProfile } from "@/lib/types";

const PRESETS = [1000, 5000, 10000, 25000, 50000];

export default function AllocationPage() {
  const [amount, setAmount] = useState(10000);
  const [profile, setProfile] = useState<RiskProfile>("Balanced");
  const [nPicks, setNPicks] = useState(8);
  const [adaptive, setAdaptive] = useState(true);
  const [useMl, setUseMl] = useState(true);

  const [result, setResult] = useState<Allocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const { mutate } = useSWRConfig();

  const body = { amount, profile, n_picks: nPicks, adaptive, use_ml: useMl };

  async function build() {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      setResult(await api.post<Allocation>("/allocation", body));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not build the plan.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function savePlan() {
    try {
      await api.post("/plans", body);
      setSaved(true);
      mutate("/plans");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save the plan.");
    }
  }

  const profileBlurb = PROFILES.find((p) => p.id === profile)?.blurb;

  return (
    <>
      <PageHeader
        kicker="Allocation engine"
        title="Build a plan"
        lead="Turn an amount and a comfort level into an exact dollar-and-share split across core funds and top-scored stocks — with the risk spelled out before you commit."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[20rem_1fr]">
        {/* Controls */}
        <Panel className="h-fit lg:sticky lg:top-4">
          <PanelHeader eyebrow="Inputs" title="Your plan" />

          <label className="eyebrow">Amount to invest</label>
          <div className="mt-1.5 flex items-center rounded-[var(--radius-panel)] border border-line bg-ink px-3 focus-within:border-brass">
            <span className="font-mono text-mute">$</span>
            <input
              type="number"
              min={100}
              step={500}
              value={amount}
              onChange={(e) => setAmount(Math.max(100, Number(e.target.value) || 0))}
              className="w-full bg-transparent py-2 pl-1.5 font-mono text-lg text-chalk outline-none tnum"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(p)}
                className={clsx(
                  "rounded border px-2 py-0.5 font-mono text-xs",
                  amount === p ? "border-brass/60 bg-brass/10 text-brass" : "border-line text-mute hover:text-chalk",
                )}
              >
                ${p.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="mt-5">
            <label className="eyebrow">Comfort with risk</label>
            <div className="mt-1.5">
              <Segmented
                size="sm"
                value={profile}
                onChange={(v) => setProfile(v as RiskProfile)}
                options={PROFILE_SEGMENTS}
              />
            </div>
            <p className="mt-2 text-xs leading-snug text-mute">{profileBlurb}</p>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <label className="eyebrow">Individual stocks</label>
              <span className="font-mono text-sm text-chalk tnum">{nPicks}</span>
            </div>
            <input
              type="range"
              min={3}
              max={15}
              value={nPicks}
              onChange={(e) => setNPicks(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--color-brass)]"
            />
          </div>

          <div className="mt-5 flex items-center gap-5 border-t border-line pt-4">
            <Toggle checked={adaptive} onChange={setAdaptive} label="adaptive" />
            <Toggle checked={useMl} onChange={setUseMl} label="ML blend" />
          </div>

          <button
            onClick={build}
            disabled={loading}
            className="mt-5 w-full rounded-[var(--radius-panel)] border border-brass bg-brass/15 py-2.5 font-mono text-sm font-medium text-brass transition-colors hover:bg-brass/25 disabled:opacity-50"
          >
            {loading ? "Building…" : "Build my plan"}
          </button>
        </Panel>

        {/* Result */}
        <div className="min-w-0">
          {error && <div className="mb-4"><ErrorState message={error} /></div>}

          {!result && !error && (
            <Panel className="flex min-h-[20rem] flex-col items-center justify-center text-center">
              <div className="font-display text-xl text-chalk">Your plan appears here</div>
              <p className="mt-1.5 max-w-sm text-sm text-mute">
                Set an amount and comfort level, then build. You&apos;ll get the exact
                holdings, weights, and a full risk read.
              </p>
            </Panel>
          )}

          {result && <ResultView result={result} onSave={savePlan} saved={saved} />}
        </div>
      </div>
    </>
  );
}

function ResultView({ result, onSave, saved }: { result: Allocation; onSave: () => void; saved: boolean }) {
  const risk = result.risk;
  const riskTone =
    risk.risk_level === "LOW" ? { fg: "text-up", bg: "bg-up/10", bd: "border-up/40" } :
    risk.risk_level === "HIGH" ? { fg: "text-down", bg: "bg-down/10", bd: "border-down/40" } :
    { fg: "text-brass", bg: "bg-brass/10", bd: "border-brass/40" };

  return (
    <div className="space-y-4">
      {/* Risk summary */}
      <Panel>
        <PanelHeader
          eyebrow="Risk analysis"
          title="What could happen"
          right={<Badge fg={riskTone.fg} bg={riskTone.bg} bd={riskTone.bd}>{risk.risk_level} RISK</Badge>}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Annual volatility" value={fmtPct(risk.ann_vol_pct, 1)} sub="expected swing" accent="brass" />
          <Stat label="A bad month" tone="text-down" value={fmtMoney(risk.bad_month_usd, 0)} sub="5th percentile" />
          <Stat label="A good month" tone="text-up" value={fmtMoney(risk.best_month_usd, 0)} sub="95th percentile" />
          <Stat label="Worst drawdown" tone="text-down" value={fmtPct(risk.max_drawdown_pct, 1)} sub={fmtMoney(risk.max_drawdown_usd, 0)} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 border-t border-line pt-3 text-xs sm:grid-cols-4">
          <Meta label="Backtest return" value={fmtSignedPct(risk.backtest_return_pct, 1)} />
          <Meta label="Largest position" value={fmtPct(risk.largest_position_pct, 1)} />
          <Meta label="Sectors" value={String(risk.n_sectors)} />
          <Meta label="Fund cushion" value={fmtPct(risk.etf_pct, 0)} />
        </div>
      </Panel>

      {/* Holdings */}
      <Panel flush>
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <div>
            <div className="eyebrow">Holdings</div>
            <div className="font-display text-lg text-chalk">
              {fmtMoney(result.amount, 0)} · {result.profile}
            </div>
          </div>
          <button
            onClick={onSave}
            disabled={saved}
            className={clsx(
              "rounded-[var(--radius-panel)] border px-3 py-1.5 font-mono text-xs transition-colors",
              saved ? "border-up/50 bg-up/10 text-up" : "border-line-2 text-chalk hover:border-brass hover:text-brass",
            )}
          >
            {saved ? "✓ Saved — track it in My Plans" : "Save this plan"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="py-2 pl-5 text-[0.62rem] uppercase tracking-wider text-faint">Holding</th>
                <th className="py-2 text-[0.62rem] uppercase tracking-wider text-faint">Weight</th>
                <th className="py-2 text-right text-[0.62rem] uppercase tracking-wider text-faint">Allocation</th>
                <th className="py-2 text-right text-[0.62rem] uppercase tracking-wider text-faint">Shares</th>
                <th className="py-2 pr-5 text-right text-[0.62rem] uppercase tracking-wider text-faint">Price</th>
              </tr>
            </thead>
            <tbody>
              {result.allocation.map((h) => {
                const isCore = h.Type.includes("ETF");
                return (
                  <tr key={h.Ticker} className="border-b border-line/60 last:border-0 hover:bg-slate-2">
                    <td className="py-2.5 pl-5">
                      <div className="flex items-center gap-2">
                        <Link href={`/stock/${h.Ticker}`} className="font-mono text-sm text-chalk hover:text-brass">
                          {h.Ticker}
                        </Link>
                        {isCore && <Badge fg="text-mute" bg="bg-mute/5" bd="border-line-2">CORE</Badge>}
                      </div>
                      <div className="max-w-[14rem] truncate text-xs text-faint">{h.Name}</div>
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-line">
                          <div
                            className={clsx("h-full rounded-full", isCore ? "bg-mute" : "bg-brass")}
                            style={{ width: `${Math.min(100, h["Weight %"])}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs tnum text-mute">{fmtPct(h["Weight %"], 1)}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-mono text-sm tnum text-chalk">{fmtMoney(h["Allocation $"], 0)}</td>
                    <td className="py-2.5 text-right font-mono text-sm tnum text-mute">{fmtNum(h.Shares, 2)}</td>
                    <td className="py-2.5 pr-5 text-right font-mono text-sm tnum text-mute">{fmtNum(h.Price)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start sm:justify-start">
      <span className="text-faint">{label}</span>
      <span className="font-mono tnum text-chalk">{value}</span>
    </div>
  );
}
