"use client";

// The async UX trio every data view needs: loading, error, and empty.
// Kept together so a page handling one is one import away from handling all.

import { clsx } from "@/lib/clsx";
import { Panel } from "./primitives";

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

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Panel className="flex flex-col items-start gap-2 border-down/30">
      <div className="eyebrow text-down">Signal lost</div>
      <p className="max-w-prose text-sm text-mute">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded border border-line-2 px-2.5 py-1 font-mono text-xs text-chalk hover:border-brass hover:text-brass"
        >
          Retry
        </button>
      )}
    </Panel>
  );
}

export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-[var(--radius-panel)] border border-dashed border-line-2 px-6 py-12 text-center">
      <div className="font-display text-lg text-chalk">{title}</div>
      {hint && <div className="max-w-sm text-sm text-mute">{hint}</div>}
    </div>
  );
}
