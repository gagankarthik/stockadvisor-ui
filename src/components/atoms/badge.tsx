"use client";

// Atom · Badge — a small status pill. Colors are passed as token classes so the
// same atom serves signals, risk levels, and connection states.

import { clsx } from "@/lib/clsx";

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
