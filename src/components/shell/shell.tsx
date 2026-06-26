"use client";

// App shell: the persistent chrome (left rail, mobile bar, regime tape) that
// wraps every page. Pure layout — it composes nav, status, and theme controls.

import { usePathname } from "next/navigation";
import { Providers } from "@/components/providers";
import { RegimeTape } from "@/components/regime-tape";
import { ThemeToggle } from "@/components/theme";
import { Wordmark, NavItems } from "./nav";
import { ApiSettings } from "./api-settings";

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
