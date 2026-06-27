"use client";

import { memo, useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { useScreener } from "@/lib/hooks";
import { PageHeader, Panel, Badge, ScoreBar, Segmented, Toggle, Select, Range, FilterField, Skeleton, ErrorState, EmptyState } from "@/components/ui";
import { dirClass, fmtNum, fmtSignedPct, signalTone } from "@/lib/format";
import { PROFILE_SEGMENTS } from "@/lib/constants";
import { clsx } from "@/lib/clsx";
import type { RiskProfile, StockRow } from "@/lib/types";

type SortKey = "score" | "ml_pct" | "confidence_pct" | "ret_12_1m_pct" | "volatility_pct" | "rsi";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "score", label: "Rating" },
  { key: "ml_pct", label: "AI Odds" },
  { key: "confidence_pct", label: "Confidence" },
  { key: "ret_12_1m_pct", label: "Momentum" },
  { key: "volatility_pct", label: "Volatility" },
  { key: "rsi", label: "Price heat (RSI)" },
];

const DEFAULTS = { minScore: 0, minMl: 0, minConf: 0, maxVol: 100, signal: "", sector: "" };

export default function ScreenerPage() {
  // server key — only refetch when these change (everything else is client-side)
  const [profile, setProfile] = useState<RiskProfile>("Balanced");
  const [adaptive, setAdaptive] = useState(true);
  const [useMl, setUseMl] = useState(true);

  // client-side filters (instant, no network)
  const [search, setSearch] = useState("");
  const [signal, setSignal] = useState("");
  const [sector, setSector] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [minMl, setMinMl] = useState(0);
  const [minConf, setMinConf] = useState(0);
  const [maxVol, setMaxVol] = useState(100);
  const [sort, setSort] = useState<SortKey>("score");

  const { data, error, isLoading, mutate } = useScreener({
    profile, adaptive, use_ml: useMl, limit: 500,
  });

  const sectors = useMemo(() => {
    const s = new Set<string>();
    data?.stocks.forEach((r) => r.sector && s.add(r.sector));
    return Array.from(s).sort();
  }, [data]);

  // defer the search term so typing stays smooth on large lists
  const deferredSearch = useDeferredValue(search);

  const rows = useMemo(() => {
    let r = data?.stocks ?? [];
    const q = deferredSearch.trim().toLowerCase();
    r = r.filter((x) => {
      if (sector && x.sector !== sector) return false;
      if (signal && x.signal !== signal) return false;
      if ((x.score ?? 0) < minScore) return false;
      if ((x.ml_pct ?? 0) < minMl) return false;
      if ((x.confidence_pct ?? 0) < minConf) return false;
      if ((x.volatility_pct ?? 0) > maxVol) return false;
      if (q && !`${x.ticker} ${x.name ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const dir = sort === "volatility_pct" ? 1 : -1;
    return [...r].sort((a, b) => (((a[sort] ?? -Infinity) as number) - ((b[sort] ?? -Infinity) as number)) * dir);
  }, [data, deferredSearch, sector, signal, minScore, minMl, minConf, maxVol, sort]);

  const activePills = useMemo(() => {
    const p: { label: string; clear: () => void }[] = [];
    if (sector) p.push({ label: sector, clear: () => setSector("") });
    if (signal) p.push({ label: `Signal: ${signal}`, clear: () => setSignal("") });
    if (minScore) p.push({ label: `Score ≥ ${minScore}`, clear: () => setMinScore(0) });
    if (minMl) p.push({ label: `ML ≥ ${minMl}%`, clear: () => setMinMl(0) });
    if (minConf) p.push({ label: `Conf ≥ ${minConf}`, clear: () => setMinConf(0) });
    if (maxVol < 100) p.push({ label: `Vol ≤ ${maxVol}%`, clear: () => setMaxVol(100) });
    if (search) p.push({ label: `“${search}”`, clear: () => setSearch("") });
    return p;
  }, [sector, signal, minScore, minMl, minConf, maxVol, search]);

  function resetAll() {
    setSearch(""); setSignal(""); setSector("");
    setMinScore(0); setMinMl(0); setMinConf(0); setMaxVol(100);
  }

  return (
    <>
      <PageHeader
        kicker="Screener"
        title="Scored universe"
        lead="Every stock graded by the adaptive factor score, the ML pattern model, and technical signals. Filters apply instantly."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[17rem_1fr]">
        {/* Filter rail */}
        <Panel className="h-fit lg:sticky lg:top-4">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Filters</span>
            <button onClick={resetAll} className="font-mono text-xs text-faint hover:text-brass">reset</button>
          </div>

          <div className="mt-3 space-y-4">
            <FilterField label="Risk profile">
              <Segmented size="sm" value={profile} onChange={(v) => setProfile(v as RiskProfile)} options={PROFILE_SEGMENTS} />
            </FilterField>

            <FilterField label="Engines">
              <div className="flex items-center gap-4">
                <Toggle checked={adaptive} onChange={setAdaptive} label="adaptive" />
                <Toggle checked={useMl} onChange={setUseMl} label="ML blend" />
              </div>
            </FilterField>

            <FilterField label="Search">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ticker or name" spellCheck={false}
                className="h-9 w-full rounded-[var(--radius-panel)] border border-line bg-ink px-2.5 font-mono text-sm text-chalk outline-none focus:border-brass" />
            </FilterField>

            <div className="grid grid-cols-2 gap-3">
              <FilterField label="Signal">
                <Select value={signal} onChange={setSignal} options={[["", "Any"], ["BUY", "Buy"], ["HOLD", "Hold"], ["SELL", "Sell"]]} />
              </FilterField>
              <FilterField label="Sort by">
                <Select value={sort} onChange={(v) => setSort(v as SortKey)} options={SORTS.map((s) => [s.key, s.label])} />
              </FilterField>
            </div>

            <FilterField label="Sector">
              <Select value={sector} onChange={setSector} options={[["", "All sectors"], ...sectors.map((s) => [s, s] as [string, string])]} />
            </FilterField>

            <Range label="Min rating" value={minScore} min={0} max={100} step={5} onChange={setMinScore} suffix="" />
            <Range label="Min AI odds" value={minMl} min={0} max={100} step={5} onChange={setMinMl} suffix="%" />
            <Range label="Min confidence" value={minConf} min={0} max={100} step={5} onChange={setMinConf} suffix="" />
            <Range label="Max volatility" value={maxVol} min={5} max={100} step={5} onChange={setMaxVol} suffix="%" />
          </div>
        </Panel>

        {/* Results */}
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-mute">
              {data ? `${rows.length} match${rows.length === 1 ? "" : "es"}` : "…"}
              {data ? <span className="text-faint"> / {data.count}</span> : null}
            </span>
            {activePills.map((pill) => (
              <button key={pill.label} onClick={pill.clear}
                className="inline-flex items-center gap-1 rounded-full border border-line-2 bg-slate-2 px-2 py-0.5 font-mono text-xs text-mute hover:border-brass hover:text-brass">
                {pill.label} <span aria-hidden>×</span>
              </button>
            ))}
          </div>
          <p className="mb-3 text-xs text-faint">
            <b className="text-mute">Rating</b> 0–100 overall grade · <b className="text-ion">AI Odds</b> model&apos;s
            chance it beats the market next month · <b className="text-mute">Confidence</b> how strongly our signals
            agree · <b className="text-mute">Momentum</b> 12-month trend · <b className="text-mute">Heat</b> overbought/oversold.
          </p>

          {error ? (
            <ErrorState message={error.message} onRetry={() => mutate()} />
          ) : isLoading || !data ? (
            <Skeleton className="h-[28rem]" />
          ) : rows.length === 0 ? (
            <EmptyState title="Nothing matches" hint="Loosen a filter or reset." />
          ) : (
            <>
              {/* Desktop table */}
              <Panel flush className="hidden overflow-hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-sm">
                    <thead>
                      <tr className="border-b border-line text-left">
                        <Th className="pl-4">Stock</Th>
                        <Th sortKey="score" sort={sort} setSort={setSort} className="w-44">Rating</Th>
                        <Th sortKey="ml_pct" sort={sort} setSort={setSort}>AI Odds</Th>
                        <Th sortKey="confidence_pct" sort={sort} setSort={setSort}>Confidence</Th>
                        <Th>Signal</Th>
                        <Th sortKey="ret_12_1m_pct" sort={sort} setSort={setSort}>Momentum</Th>
                        <Th sortKey="volatility_pct" sort={sort} setSort={setSort}>Volatility</Th>
                        <Th sortKey="rsi" sort={sort} setSort={setSort} className="pr-4">Heat</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => <Row key={r.ticker} r={r} />)}
                    </tbody>
                  </table>
                </div>
              </Panel>

              {/* Mobile cards */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:hidden">
                {rows.map((r) => <StockCard key={r.ticker} r={r} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Th({ children, className, sortKey, sort, setSort }: {
  children: React.ReactNode; className?: string; sortKey?: SortKey; sort?: SortKey; setSort?: (k: SortKey) => void;
}) {
  const active = sortKey && sort === sortKey;
  return (
    <th
      className={clsx("select-none py-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-faint",
        sortKey && "cursor-pointer hover:text-mute", active && "text-brass", className)}
      onClick={sortKey && setSort ? () => setSort(sortKey) : undefined}
      aria-sort={active ? "descending" : undefined}
    >
      {children}{active && <span className="ml-1">↓</span>}
    </th>
  );
}

const Row = memo(function Row({ r }: { r: StockRow }) {
  const sig = signalTone(r.signal);
  return (
    <tr className="group border-b border-line/60 last:border-0 hover:bg-slate-2">
      <td className="py-2 pl-4">
        <Link href={`/stock/${r.ticker}`} className="block">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-chalk group-hover:text-brass">{r.ticker}</span>
            {r.lean && <span className={clsx("text-[0.62rem]", r.lean === "Bullish" ? "text-up" : "text-down")}>{r.lean === "Bullish" ? "▲" : "▼"}</span>}
          </div>
          <div className="max-w-[12rem] truncate text-xs text-faint">{r.name}</div>
        </Link>
      </td>
      <td className="py-2 pr-4"><div className="w-32"><ScoreBar value={r.score} /></div></td>
      <td className="py-2"><span className="font-mono text-sm tnum text-ion">{r.ml_pct == null ? "—" : r.ml_pct.toFixed(0)}</span></td>
      <td className="py-2"><span className="font-mono text-sm tnum text-mute">{r.confidence_pct == null ? "—" : r.confidence_pct.toFixed(0)}</span></td>
      <td className="py-2"><Badge fg={sig.fg} bg={sig.bg} bd={sig.bd}>{r.signal ?? "—"}</Badge></td>
      <td className={clsx("py-2 font-mono text-sm tnum", dirClass(r.ret_12_1m_pct))}>{fmtSignedPct(r.ret_12_1m_pct, 1)}</td>
      <td className="py-2 font-mono text-sm tnum text-mute">{fmtNum(r.volatility_pct, 1)}</td>
      <td className="py-2 pr-4 font-mono text-sm tnum text-mute">{fmtNum(r.rsi, 0)}</td>
    </tr>
  );
});

const StockCard = memo(function StockCard({ r }: { r: StockRow }) {
  const sig = signalTone(r.signal);
  return (
    <Link href={`/stock/${r.ticker}`} className="block rounded-[var(--radius-panel)] border border-line bg-slate p-3 active:bg-slate-2">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="font-mono text-base text-chalk">{r.ticker}</div>
          <div className="max-w-[10rem] truncate text-xs text-faint">{r.name}</div>
        </div>
        <Badge fg={sig.fg} bg={sig.bg} bd={sig.bd}>{r.signal ?? "—"}</Badge>
      </div>
      <div className="mt-2"><ScoreBar value={r.score} /></div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <Mini label="AI Odds" value={r.ml_pct == null ? "—" : r.ml_pct.toFixed(0)} tone="text-ion" />
        <Mini label="Conf." value={r.confidence_pct == null ? "—" : r.confidence_pct.toFixed(0)} tone="text-mute" />
        <Mini label="Mom." value={fmtSignedPct(r.ret_12_1m_pct, 0)} tone={dirClass(r.ret_12_1m_pct)} />
      </div>
    </Link>
  );
});

function Mini({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded border border-line/60 py-1">
      <div className="text-[0.6rem] uppercase tracking-wider text-faint">{label}</div>
      <div className={clsx("font-mono text-sm tnum", tone)}>{value}</div>
    </div>
  );
}
