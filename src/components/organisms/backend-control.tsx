"use client";

// Organism · Backend control — the sidebar "Backend" popover: live connection /
// snapshot status, plus an override to re-point the UI at another backend.

import { useState } from "react";
import { clsx } from "@/lib/clsx";
import { useApiBase } from "@/components/providers";
import { useHealth } from "@/lib/hooks";
import { defaultApiBase, isProxyBase } from "@/lib/api";

export function ApiSettings() {
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
