"use client";

import useSWR from "swr";
import { screenerQuery } from "./api";
import type {
  Dashboard,
  Health,
  ModelCard,
  ModelHistoryEntry,
  PlanRow,
  Screener,
  StockDetail,
} from "./types";

export function useHealth() {
  // poll connection/snapshot freshness every 30s
  return useSWR<Health>("/health", { refreshInterval: 30000 });
}

export function useDashboard() {
  return useSWR<Dashboard>("/dashboard", { refreshInterval: 60000 });
}

export function useScreener(params: Parameters<typeof screenerQuery>[0]) {
  return useSWR<Screener>(screenerQuery(params));
}

export function useStock(ticker: string | null) {
  return useSWR<StockDetail>(ticker ? `/stocks/${ticker}` : null);
}

export function useModelCard() {
  return useSWR<ModelCard>("/model");
}

export function useModelHistory() {
  return useSWR<ModelHistoryEntry[]>("/model/history");
}

export function usePlans() {
  return useSWR<{ plans: PlanRow[] }>("/plans");
}
