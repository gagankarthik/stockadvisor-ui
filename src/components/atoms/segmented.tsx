"use client";

// Atom · Segmented — a single-select pill group. Generic over the option value
// so callers keep their own union types.

import { clsx } from "@/lib/clsx";

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
