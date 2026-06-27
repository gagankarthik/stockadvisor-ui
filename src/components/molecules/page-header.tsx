"use client";

// Molecule · PageHeader — the kicker + H1 + lead + actions block at the top of
// every page.

export function PageHeader({
  kicker,
  title,
  lead,
  actions,
}: {
  kicker: string;
  title: string;
  lead?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="eyebrow text-brass">{kicker}</div>
        <h1 className="mt-1 font-display text-3xl tracking-tight text-chalk sm:text-4xl">
          {title}
        </h1>
        {lead && <p className="mt-1.5 max-w-2xl text-sm text-mute">{lead}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
