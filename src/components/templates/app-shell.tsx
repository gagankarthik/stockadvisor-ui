"use client";

// Template · AppShell — the persistent chrome (left rail, mobile bar, regime
// tape) that wraps every page. Pure layout: it composes nav, status, and theme
// organisms into responsive zones and renders page content as children.

import { useState } from "react";
import { usePathname } from "next/navigation";
import { clsx } from "@/lib/clsx";
import { Providers } from "@/components/providers";
import { ThemeToggle } from "@/components/molecules";
import { RegimeTape, ApiSettings, Wordmark, NavItems } from "@/components/organisms";

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showBackend, setShowBackend] = useState(false);
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
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowBackend((v) => !v)}
              aria-expanded={showBackend}
              className="group inline-flex items-center gap-1.5 rounded-[var(--radius-panel)] px-1.5 py-1 text-faint transition-colors hover:text-mute"
            >
              <CogIcon />
              <span className="eyebrow leading-none">Backend</span>
              <ChevronIcon open={showBackend} />
            </button>
            <ThemeToggle />
          </div>
          {showBackend && <ApiSettings />}
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

function CogIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={clsx("transition-transform", open && "rotate-180")}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
