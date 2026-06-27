"use client";

// Atom · Skeleton — a pulsing placeholder shaped by its className, matching the
// content it stands in for.

import { clsx } from "@/lib/clsx";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-[var(--radius-panel)] border border-line bg-slate/60",
        className,
      )}
    />
  );
}
