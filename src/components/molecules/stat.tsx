"use client";

// Molecule · Stat — a labelled instrument readout (label + value + optional sub),
// with an accent edge for the brand/model tones.

import { clsx } from "@/lib/clsx";

export function Stat({
  label,
  value,
  sub,
  tone = "text-chalk",
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: string;
  accent?: "brass" | "ion";
}) {
  return (
    <div
      className={clsx(
        "relative rounded-[var(--radius-panel)] border border-line bg-slate px-3.5 py-3",
        accent === "brass" && "border-l-2 border-l-brass",
        accent === "ion" && "border-l-2 border-l-ion",
      )}
    >
      <div className="eyebrow">{label}</div>
      <div className={clsx("mt-1 font-mono text-2xl leading-none tnum", tone)}>{value}</div>
      {sub && <div className="mt-1.5 text-xs text-mute">{sub}</div>}
    </div>
  );
}
