"use client";

import { useModelCard, useModelHistory } from "@/lib/hooks";
import { PageHeader, Panel, PanelHeader, Stat, Skeleton, ErrorState } from "@/components/ui";
import { fmtNum, fmtPct } from "@/lib/format";
import { clsx } from "@/lib/clsx";
import type { ModelHistoryEntry } from "@/lib/types";

const FEATURE_LABELS: Record<string, string> = {
  mom_12_1: "12-1 momentum",
  mom_excess: "Excess momentum (vs SPY)",
  mom_sharpe: "Risk-adjusted momentum",
  st_reversal: "Short-term reversal",
  ret_3m: "3-month return",
  ret_6m: "6-month return",
  vol_1m: "1-month volatility",
  vol_regime: "Volatility regime",
  downside_vol: "Downside volatility",
  rsi: "RSI",
  macd_hist: "MACD histogram",
  price_vs_sma50: "Price vs 50-day",
  sma50_vs_sma200: "50-day vs 200-day",
  dist_52w_high: "Distance from 52w high",
  consistency: "Return consistency",
  beta: "Beta",
};

export default function ModelPage() {
  const { data: card, error, isLoading, mutate } = useModelCard();
  const { data: history } = useModelHistory();

  const importances = card?.feature_importances
    ? Object.entries(card.feature_importances).sort((a, b) => b[1] - a[1])
    : [];
  const maxImp = importances.length ? importances[0][1] : 1;

  return (
    <>
      <PageHeader
        kicker="The model"
        title="Pattern engine"
        lead="A calibrated tree ensemble that estimates each stock's probability of beating the median over the next month. Rank-normalized features, purged walk-forward validation, isotonic calibration."
      />

      {error ? (
        <ErrorState message={error.message} onRetry={() => mutate()} />
      ) : isLoading || !card ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="space-y-4">
          {/* Headline metrics */}
          <Panel>
            <PanelHeader
              eyebrow="Out-of-sample performance"
              title={card.model_name ?? "Ensemble"}
              right={<span className="font-mono text-xs text-faint">trained {card.trained_at ?? "—"}</span>}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Stat label="Test AUC" accent="ion" value={fmtNum(card.test_auc, 3)} sub="ranking quality" />
              <Stat label="Test IC" accent="ion" value={fmtNum(card.test_ic, 3)} sub="rank corr." />
              <Stat label="Accuracy" value={card.test_accuracy != null ? fmtPct(card.test_accuracy * 100, 1) : "—"} sub="beats median" />
              <Stat label="CV AUC" value={fmtNum(card.cv_auc, 3)} sub="walk-forward" />
              <Stat label="CV IC" value={fmtNum(card.cv_ic, 3)} sub="walk-forward" />
              <Stat label="Horizon" value={`${card.horizon_days ?? "—"}d`} sub="forward window" />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-3 font-mono text-xs text-faint">
              <span>universe: {fmtNum(card.n_stocks, 0)} stocks</span>
              <span>data through: {card.data_through ?? "—"}</span>
              <span>scikit-learn {card.sklearn_version ?? "—"}</span>
            </div>
          </Panel>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Feature importances */}
            <Panel>
              <PanelHeader eyebrow="What drives it" title="Feature importance" />
              <div className="flex flex-col gap-2">
                {importances.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[11rem_1fr_3rem] items-center gap-2">
                    <span className="truncate text-xs text-mute" title={FEATURE_LABELS[k] ?? k}>
                      {FEATURE_LABELS[k] ?? k}
                    </span>
                    <div className="h-1.5 overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-ion" style={{ width: `${(v / maxImp) * 100}%` }} />
                    </div>
                    <span className="text-right font-mono text-xs tnum text-faint">{v.toFixed(3)}</span>
                  </div>
                ))}
                {importances.length === 0 && <span className="text-sm text-faint">No importance data.</span>}
              </div>
            </Panel>

            {/* Training history */}
            <Panel>
              <PanelHeader eyebrow="Self-evaluation over time" title="Training history" />
              <HistoryChart entries={history ?? []} />
              <div className="mt-3 max-h-56 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate">
                    <tr className="border-b border-line text-left">
                      <th className="py-1.5 text-[0.6rem] uppercase tracking-wider text-faint">Data through</th>
                      <th className="py-1.5 text-right text-[0.6rem] uppercase tracking-wider text-faint">AUC</th>
                      <th className="py-1.5 text-right text-[0.6rem] uppercase tracking-wider text-faint">Acc</th>
                      <th className="py-1.5 text-right text-[0.6rem] uppercase tracking-wider text-faint">Stocks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...(history ?? [])].reverse().map((h, i) => (
                      <tr key={i} className="border-b border-line/50 last:border-0">
                        <td className="py-1.5 font-mono text-xs text-mute">{h.data_through}</td>
                        <td className="py-1.5 text-right font-mono text-xs tnum text-ion">{fmtNum(h.auc, 3)}</td>
                        <td className="py-1.5 text-right font-mono text-xs tnum text-mute">{fmtNum(h.accuracy, 3)}</td>
                        <td className="py-1.5 text-right font-mono text-xs tnum text-faint">{h.n_stocks}</td>
                      </tr>
                    ))}
                    {(history ?? []).length === 0 && (
                      <tr><td colSpan={4} className="py-3 text-sm text-faint">No training runs recorded.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>

          {/* How it works */}
          <Panel>
            <PanelHeader eyebrow="Method" title="How the model is built" />
            <div className="grid gap-4 text-sm leading-relaxed text-mute sm:grid-cols-2">
              <Method n="01" title="Rank-normalized features">
                Each feature is ranked across all stocks on each date and mapped to [-1, 1], so signals stay
                comparable across calm and stormy regimes.
              </Method>
              <Method n="02" title="Purged walk-forward CV">
                Overlapping forward windows are separated by an embargo gap, so the validation score isn&apos;t
                inflated by leakage. The rank IC measures real ranking skill.
              </Method>
              <Method n="03" title="Calibrated ensemble">
                Random Forest + Extra Trees + gradient boosting, each isotonically calibrated — so the “ML %”
                is an honest probability, not just a rank.
              </Method>
              <Method n="04" title="Recency-weighted">
                Recent regimes carry more weight via exponential decay, keeping the model tuned to the market
                that exists now.
              </Method>
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}

function Method({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="font-mono text-xs text-ion/70">{n}</span>
      <div>
        <div className="font-display text-base text-chalk">{title}</div>
        <p className="mt-0.5 text-xs">{children}</p>
      </div>
    </div>
  );
}

function HistoryChart({ entries }: { entries: ModelHistoryEntry[] }) {
  if (entries.length < 2) {
    return (
      <div className="flex h-24 items-center justify-center text-xs text-faint">
        Need at least two training runs to chart a trend.
      </div>
    );
  }
  const W = 600;
  const H = 90;
  const pad = 8;
  const aucs = entries.map((e) => e.auc);
  const lo = Math.min(0.5, ...aucs) - 0.01;
  const hi = Math.max(...aucs) + 0.01;
  const span = hi - lo || 1;
  const x = (i: number) => pad + (i / (entries.length - 1)) * (W - pad * 2);
  const y = (v: number) => pad + (1 - (v - lo) / span) * (H - pad * 2);
  const line = aucs.map((a, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(a).toFixed(1)}`).join(" ");
  const mid = y(0.5);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-24 w-full">
      <line x1={0} x2={W} y1={mid} y2={mid} stroke="var(--color-line-2)" strokeDasharray="3 3" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <path d={line} fill="none" stroke="var(--color-ion)" strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
      {aucs.map((a, i) => (
        <circle key={i} cx={x(i)} cy={y(a)} r={2.5} className={clsx(i === aucs.length - 1 ? "fill-ion-2" : "fill-ion")} />
      ))}
    </svg>
  );
}
