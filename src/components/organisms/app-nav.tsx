"use client";

// Organism · App navigation — the route config, wordmark, and nav-item list
// shared between the desktop rail and the mobile bar.

import Link from "next/link";
import { clsx } from "@/lib/clsx";
import { Icon } from "@/components/atoms";

export const NAV = [
  { href: "/", label: "Dashboard", icon: "gauge" },
  { href: "/screener", label: "Screener", icon: "grid" },
  { href: "/allocation", label: "Allocation", icon: "pie" },
  { href: "/stock", label: "Stock Lab", icon: "flask" },
  { href: "/plans", label: "My Plans", icon: "ledger" },
  { href: "/model", label: "The Model", icon: "cpu" },
] as const;

export function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-7 w-7 place-items-center rounded-[4px] border border-brass/50 bg-brass/10">
        <span className="h-2 w-2 rounded-[1px] bg-brass" />
      </span>
      <span className="font-display text-lg tracking-tight text-chalk">
        Market<span className="text-brass">Desk</span>
      </span>
    </Link>
  );
}

export function NavItems({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {NAV.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "group flex items-center gap-3 rounded-[var(--radius-panel)] px-3 py-2 text-sm transition-colors",
              active
                ? "bg-slate-2 text-chalk shadow-[inset_0_0_0_1px_var(--color-line)]"
                : "text-mute hover:bg-slate hover:text-chalk",
            )}
          >
            <span className={clsx(active ? "text-brass" : "text-faint group-hover:text-mute")}>
              <Icon name={item.icon} />
            </span>
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
