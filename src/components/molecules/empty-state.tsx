"use client";

// Molecule · EmptyState — a contextual "nothing here" panel with a title and an
// optional hint/CTA (callers pass a filtered-vs-fresh message).

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
