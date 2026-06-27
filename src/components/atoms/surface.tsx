"use client";

// Atom · Surface (Panel) — the machined card every section sits in.

import { clsx } from "@/lib/clsx";

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
