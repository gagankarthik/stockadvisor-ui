"use client";

// Interactive form controls — shared, accessible inputs the pages compose into
// filter rails and forms. Each owns its own keyboard/ARIA semantics.

import { clsx } from "@/lib/clsx";

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

// ---- Select: a styled native <select> (keeps native a11y + mobile pickers) ----
export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-[var(--radius-panel)] border border-line bg-ink px-2 font-mono text-sm text-chalk outline-none focus:border-brass"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v} className="bg-slate">
          {l}
        </option>
      ))}
    </select>
  );
}

// ---- Range: a labelled slider with a live value readout ----
export function Range({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix: string;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <span className="font-mono text-xs tnum text-chalk">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full accent-[var(--color-brass)]"
      />
    </label>
  );
}
