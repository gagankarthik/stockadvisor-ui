"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { PageHeader, Panel } from "@/components/ui";

const QUICK = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "LLY", "XOM", "SPY", "QQQ"];

export default function StockLabIndex() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function go(sym: string) {
    const t = sym.trim().toUpperCase();
    if (t) router.push(`/stock/${encodeURIComponent(t)}`);
  }

  return (
    <>
      <PageHeader
        kicker="Stock Lab"
        title="Deep dive on any ticker"
        lead="Live quote with three-source validation, the model's read, price history, analyst consensus, and the latest news — for any symbol."
      />

      <Panel className="mx-auto max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            go(q);
          }}
          className="flex items-center gap-2"
        >
          <div className="flex flex-1 items-center rounded-[var(--radius-panel)] border border-line bg-ink px-3 focus-within:border-brass">
            <span className="font-mono text-faint">›</span>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Enter a ticker — e.g. NVDA"
              spellCheck={false}
              className="w-full bg-transparent px-2 py-3 font-mono text-lg uppercase text-chalk outline-none placeholder:normal-case placeholder:text-faint"
            />
          </div>
          <button
            type="submit"
            className="rounded-[var(--radius-panel)] border border-brass bg-brass/15 px-5 py-3 font-mono text-sm text-brass hover:bg-brass/25"
          >
            Open
          </button>
        </form>

        <div className="mt-5">
          <div className="eyebrow mb-2">Jump to</div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK.map((t) => (
              <Link
                key={t}
                href={`/stock/${t}`}
                className="rounded border border-line px-2.5 py-1 font-mono text-sm text-mute hover:border-brass hover:text-brass"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </Panel>
    </>
  );
}
