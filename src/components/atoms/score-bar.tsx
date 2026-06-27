"use client";

// Atom · ScoreBar — a filled gauge + readout for a 0..100 value. Clamps and
// renders an em-dash for null/non-finite input.

import { clsx } from "@/lib/clsx";

export function ScoreBar({
  value,
  color = "brass",
}: {
  value: number | null | undefined;
  color?: "brass" | "ion";
}) {
  const v = value == null || !isFinite(value) ? 0 : Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className={clsx(
            "h-full rounded-full transition-[width] duration-500",
            color === "brass" ? "bg-brass" : "bg-ion",
          )}
          style={{ width: `${v}%` }}
        />
      </div>
      <span className="w-9 shrink-0 text-right font-mono text-xs tnum text-mute">
        {value == null || !isFinite(value) ? "—" : v.toFixed(0)}
      </span>
    </div>
  );
}
