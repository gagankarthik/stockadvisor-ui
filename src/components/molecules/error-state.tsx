"use client";

// Molecule · ErrorState — a contained failure card with an optional retry, so a
// section can degrade gracefully without taking down the page.

import { Panel } from "@/components/atoms";

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
