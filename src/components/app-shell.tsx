"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { clsx } from "@/lib/clsx";
import { Providers, useApiBase } from "./providers";
import { RegimeTape } from "./regime-tape";
import { useHealth } from "@/lib/hooks";
import { defaultApiBase, isProxyBase } from "@/lib/api";
import { ThemeToggle } from "./theme";

const NAV = [
  { href: "/", label: "Dashboard", icon: "gauge" },
  { href: "/screener", label: "Screener", icon: "grid" },
  { href: "/allocation", label: "Allocation", icon: "pie" },
  { href: "/stock", label: "Stock Lab", icon: "flask" },
  { href: "/plans", label: "My Plans", icon: "ledger" },
  { href: "/model", label: "The Model", icon: "cpu" },
] as const;

function Icon({ name, className }: { name: string; className?: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, React.ReactNode> = {
    gauge: <><path {...p} d="M3 13a9 9 0 0 1 18 0" /><path {...p} d="M12 13l4-3" /><circle cx="12" cy="13" r="1.3" fill="currentColor" stroke="none" /></>,
    grid: <><rect {...p} x="3" y="3" width="7" height="7" rx="1" /><rect {...p} x="14" y="3" width="7" height="7" rx="1" /><rect {...p} x="3" y="14" width="7" height="7" rx="1" /><rect {...p} x="14" y="14" width="7" height="7" rx="1" /></>,
    pie: <><path {...p} d="M12 3v9l7 4" /><circle {...p} cx="12" cy="12" r="9" /></>,
    flask: <><path {...p} d="M9 3h6M10 3v6l-5 9a1.5 1.5 0 0 0 1.3 2.3h11.4A1.5 1.5 0 0 0 19 18l-5-9V3" /><path {...p} d="M7.5 14h9" /></>,
    ledger: <><rect {...p} x="4" y="3" width="16" height="18" rx="1.5" /><path {...p} d="M8 8h8M8 12h8M8 16h5" /></>,
    cpu: <><rect {...p} x="6" y="6" width="12" height="12" rx="1.5" /><path {...p} d="M10 10h4v4h-4z" /><path {...p} d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" className={className} aria-hidden>
      {paths[name]}
    </svg>
  );
}

function Wordmark() {
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

function NavItems({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
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

function ApiSettings() {
  const { apiBase, updateApiBase } = useApiBase();
  const { data: health, error } = useHealth();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const status = error ? "down" : health?.snapshot_available ? "ok" : "warn";
  const dot = status === "down" ? "bg-down" : status === "warn" ? "bg-brass" : "bg-up";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setDraft(apiBase);
          setOpen((v) => !v);
        }}
        className="flex w-full items-center gap-2 rounded-[var(--radius-panel)] border border-line px-3 py-2 text-left hover:border-line-2"
      >
        <span className={clsx("h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
        <span className="min-w-0 flex-1">
          <span className="eyebrow block leading-none">Backend</span>
          <span className="block truncate font-mono text-xs text-mute">
            {!apiBase ? "—" : isProxyBase(apiBase) ? "live · via proxy" : apiBase.replace(/^https?:\/\//, "")}
          </span>
        </span>
        <span className="font-mono text-xs text-faint">{health?.version ? `v${health.version}` : ""}</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-30 mb-2 w-72 rounded-[var(--radius-panel)] border border-line-2 bg-slate p-3 shadow-2xl shadow-black/50">
          <div className="eyebrow mb-1.5">API base URL</div>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={defaultApiBase()}
            spellCheck={false}
            className="w-full rounded border border-line bg-ink px-2.5 py-1.5 font-mono text-xs text-chalk outline-none focus:border-brass"
          />
          <p className="mt-1.5 text-[0.7rem] leading-snug text-faint">
            Leave blank to use the built-in proxy (no CORS). Or enter a backend
            URL to hit it directly — that host must allow CORS.
          </p>
          <div className="mt-2.5 flex justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="rounded border border-line px-2.5 py-1 font-mono text-xs text-mute hover:text-chalk"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                updateApiBase(draft);
                setOpen(false);
              }}
              className="rounded border border-brass/60 bg-brass/10 px-2.5 py-1 font-mono text-xs text-brass hover:bg-brass/20"
            >
              Connect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen">
      {/* Left rail */}
      <aside className="sticky top-0 hidden h-screen w-[15rem] shrink-0 flex-col border-r border-line bg-slate/40 lg:flex">
        <div className="border-b border-line px-5 py-4">
          <Wordmark />
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          <NavItems pathname={pathname} />
        </nav>
        <div className="space-y-2 border-t border-line p-3">
          <div className="flex items-stretch gap-2">
            <div className="min-w-0 flex-1">
              <ApiSettings />
            </div>
            <ThemeToggle className="h-auto self-stretch" />
          </div>
          <p className="px-1 text-[0.66rem] leading-snug text-faint">
            Educational tool, not financial advice. Quotes may be delayed.
          </p>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-ink/95 px-4 py-3 backdrop-blur lg:hidden">
          <Wordmark />
          <ThemeToggle />
        </div>
        <RegimeTape />
        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-line px-2 py-1.5 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <NavItems pathname={pathname} />
        </nav>

        <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Shell>{children}</Shell>
    </Providers>
  );
}
