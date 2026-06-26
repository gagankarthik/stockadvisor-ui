"use client";

import Link from "next/link";
import { useSWRConfig } from "swr";
import { usePlans } from "@/lib/hooks";
import { api } from "@/lib/api";
import { PageHeader, Panel, Badge, Stat, Skeleton, ErrorState, EmptyState } from "@/components/ui";
import { fmtMoney, fmtSignedPct } from "@/lib/format";
import { clsx } from "@/lib/clsx";
import type { PlanRow } from "@/lib/types";

export default function PlansPage() {
  const { data, error, isLoading, mutate } = usePlans();
  const { mutate: globalMutate } = useSWRConfig();
  const plans = data?.plans ?? [];

  async function remove(index: number) {
    await api.del(`/plans/${index}`);
    globalMutate("/plans");
  }

  const totals = plans.reduce(
    (a, p) => ({
      invested: a.invested + p.invested_usd,
      value: a.value + p.value_now_usd,
      beating: a.beating + (p.vs_market === "BEATING" ? 1 : 0),
    }),
    { invested: 0, value: 0, beating: 0 },
  );
  const totalPnlPct = totals.invested ? ((totals.value - totals.invested) / totals.invested) * 100 : 0;

  return (
    <>
      <PageHeader
        kicker="Track record"
        title="My plans"
        lead="Every saved plan, marked to live prices and benchmarked against an equal S&P 500 buy-and-hold from the same day. The desk keeps itself honest."
        actions={
          <Link
            href="/allocation"
            className="rounded-[var(--radius-panel)] border border-brass bg-brass/15 px-3 py-2 font-mono text-xs text-brass hover:bg-brass/25"
          >
            + New plan
          </Link>
        }
      />

      {error ? (
        <ErrorState message={error.message} onRetry={() => mutate()} />
      ) : isLoading || !data ? (
        <Skeleton className="h-72" />
      ) : plans.length === 0 ? (
        <EmptyState
          title="No saved plans yet"
          hint={
            <>
              Build one in the{" "}
              <Link href="/allocation" className="text-brass hover:text-brass-2">Allocation</Link>{" "}
              tab and hit “Save this plan” to start tracking it against the market.
            </>
          }
        />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total invested" value={fmtMoney(totals.invested, 0)} />
            <Stat label="Value now" value={fmtMoney(totals.value, 0)} accent="brass" />
            <Stat label="Total P/L" tone={totalPnlPct >= 0 ? "text-up" : "text-down"} value={fmtSignedPct(totalPnlPct, 1)} />
            <Stat label="Beating market" value={`${totals.beating}/${plans.length}`} sub="plans ahead of SPY" />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {plans.map((p) => (
              <PlanCard key={p.index} p={p} onDelete={() => remove(p.index)} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function PlanCard({ p, onDelete }: { p: PlanRow; onDelete: () => void }) {
  const beating = p.vs_market === "BEATING";
  const due = p.review === "DUE";
  return (
    <Panel className="relative">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-lg text-chalk">{p.profile}</span>
            <Badge
              fg={beating ? "text-up" : "text-down"}
              bg={beating ? "bg-up/10" : "bg-down/10"}
              bd={beating ? "border-up/40" : "border-down/40"}
            >
              {beating ? "BEATING SPY" : "TRAILING SPY"}
            </Badge>
          </div>
          <div className="mt-0.5 font-mono text-xs text-faint">
            saved {p.saved_at} · {p.days_held}d held
          </div>
        </div>
        <button
          onClick={onDelete}
          aria-label="Delete plan"
          className="rounded border border-line px-2 py-1 font-mono text-xs text-faint hover:border-down hover:text-down"
        >
          Delete
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Field label="Invested" value={fmtMoney(p.invested_usd, 0)} />
        <Field label="Value now" value={fmtMoney(p.value_now_usd, 0)} tone="text-chalk" />
        <Field
          label="Plan P/L"
          value={fmtSignedPct(p.pnl_pct, 1)}
          tone={p.pnl_pct >= 0 ? "text-up" : "text-down"}
        />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs">
        <span className="text-faint">
          vs SPY same-day:{" "}
          <span className={clsx("font-mono tnum", p.spy_same_day_pct >= 0 ? "text-up" : "text-down")}>
            {fmtSignedPct(p.spy_same_day_pct, 1)}
          </span>
        </span>
        <Badge
          fg={due ? "text-brass" : "text-faint"}
          bg={due ? "bg-brass/10" : "bg-mute/5"}
          bd={due ? "border-brass/40" : "border-line-2"}
        >
          {due ? "🔔 REVIEW DUE" : `review ${p.review}`}
        </Badge>
      </div>
    </Panel>
  );
}

function Field({ label, value, tone = "text-mute" }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div className={clsx("mt-0.5 font-mono text-base tnum", tone)}>{value}</div>
    </div>
  );
}
