// Typed client for the MarketDesk API.
//
// Base URL resolution order: localStorage override (set in the UI) →
// NEXT_PUBLIC_API_BASE_URL → the built-in same-origin proxy ("/backend").
// Resolving at call time (not import time) lets the user re-point the UI live.
//
// The default "/backend" base is a relative path served by this app's Next.js
// rewrite (see next.config.ts), which proxies to the real API server-side and
// avoids browser CORS. Set NEXT_PUBLIC_API_BASE_URL to an absolute URL only if
// you want the browser to hit a backend directly (that backend must allow CORS).

const DEFAULT_BASE = "/backend";
const LS_KEY = "marketdesk.apiBase";

// True when the base is the same-origin proxy rather than a direct API URL.
export function isProxyBase(base: string): boolean {
  return base.startsWith("/");
}

export function defaultApiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE;
}

export function getApiBase(): string {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(LS_KEY);
    if (stored) return stored;
  }
  return defaultApiBase();
}

export function setApiBase(base: string): void {
  if (typeof window === "undefined") return;
  const trimmed = base.trim().replace(/\/+$/, "");
  if (trimmed) window.localStorage.setItem(LS_KEY, trimmed);
  else window.localStorage.removeItem(LS_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
  base?: string,
): Promise<T> {
  const root = (base ?? getApiBase()).replace(/\/+$/, "");
  let res: Response;
  try {
    res = await fetch(`${root}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError(
      "Can't reach the API. Check the backend is running and the base URL is right.",
      0,
    );
  }
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = typeof body.detail === "string" ? body.detail : detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(detail, res.status);
  }
  return res.json() as Promise<T>;
}

// SWR fetcher (string key = path)
export const fetcher = <T>(path: string): Promise<T> => request<T>(path);

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// Build a screener query string from params.
export function screenerQuery(p: {
  profile: string;
  adaptive: boolean;
  use_ml: boolean;
  sector?: string;
  signal?: string;
  min_score?: number;
  search?: string;
  limit?: number;
}): string {
  const q = new URLSearchParams();
  q.set("profile", p.profile);
  q.set("adaptive", String(p.adaptive));
  q.set("use_ml", String(p.use_ml));
  if (p.sector) q.set("sector", p.sector);
  if (p.signal) q.set("signal", p.signal);
  if (p.min_score) q.set("min_score", String(p.min_score));
  if (p.search) q.set("search", p.search);
  q.set("limit", String(p.limit ?? 500));
  return `/screener?${q.toString()}`;
}
