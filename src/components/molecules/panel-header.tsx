"use client";

// Molecule · PanelHeader — the eyebrow + title + optional right-slot row that
// caps a Panel.

export function PanelHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string;
  title?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3 border-b border-line pb-2.5">
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        {title && (
          <h2 className="mt-0.5 truncate text-lg leading-tight text-chalk">{title}</h2>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
