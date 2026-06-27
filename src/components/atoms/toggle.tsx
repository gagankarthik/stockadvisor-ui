"use client";

// Atom · Toggle — an accessible on/off switch (role="switch" + aria-checked).

import { clsx } from "@/lib/clsx";

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
