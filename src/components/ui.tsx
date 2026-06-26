"use client";

import { clsx } from "@/lib/clsx";

// ---- Panel: the machined card every section sits in ----
export function Panel({
  children,
  className,
  flush,
}: {
  children: React.ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <section
      className={clsx(
        "rounded-[var(--radius-panel)] border border-line bg-slate/80",
        !flush && "p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

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

// ---- Stat: a labelled instrument readout ----
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

// ---- Badge ----
export function Badge({
  children,
  fg = "text-mute",
  bg = "bg-mute/5",
  bd = "border-line-2",
  className,
}: {
  children: React.ReactNode;
  fg?: string;
  bg?: string;
  bd?: string;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[0.68rem] font-medium tracking-wide",
        fg,
        bg,
        bd,
        className,
      )}
    >
      {children}
    </span>
  );
}

// ---- Score bar: a filled gauge for a 0..100 value ----
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

// ---- Segmented control ----
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex rounded-[var(--radius-panel)] border border-line bg-ink p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={clsx(
            "rounded-[3px] font-mono tracking-wide transition-colors",
            size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
            value === o.value
              ? "bg-slate-2 text-brass shadow-[inset_0_0_0_1px_var(--color-line-2)]"
              : "text-mute hover:text-chalk",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ---- Toggle ----
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-2"
    >
      <span
        className={clsx(
          "relative h-4 w-7 rounded-full border transition-colors",
          checked ? "border-brass/50 bg-brass/25" : "border-line-2 bg-ink",
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 h-2.5 w-2.5 rounded-full transition-all",
            checked ? "left-3.5 bg-brass" : "left-0.5 bg-mute",
          )}
        />
      </span>
      <span className="font-mono text-xs text-mute group-hover:text-chalk">{label}</span>
    </button>
  );
}

// ---- States ----
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
