"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TradeFilters, TradeStats } from "@/lib/services/trading";

interface TradingJournalEntry {
  id: string;
  chain: string;
  protocol: string;
  tradeType: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  priceAtEntry: number;
  priceAtExit: number | null;
  pnl: number | null;
  pnlPercent: number | null;
  txHash: string | null;
  notes: string | null;
  tags: string[];
  openedAt: string;
  closedAt: string | null;
}

function buildQuery(filters: TradeFilters): string {
  const params = new URLSearchParams();
  if (filters.chain) params.set("chain", filters.chain);
  if (filters.tradeType) params.set("tradeType", filters.tradeType);
  if (filters.status) params.set("status", filters.status);
  if (filters.tokenSearch) params.set("tokenSearch", filters.tokenSearch);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortDir) params.set("sortDir", filters.sortDir);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.offset) params.set("offset", String(filters.offset));
  return params.toString();
}

async function fetchTrades(
  filters: TradeFilters
): Promise<{ trades: TradingJournalEntry[]; total: number }> {
  const qs = buildQuery(filters);
  const res = await fetch(`/api/trading?${qs}`);
  if (!res.ok) throw new Error("Failed to fetch trades");
  const json = await res.json();
  return json.data;
}

async function fetchTradeStats(chain?: string): Promise<TradeStats> {
  const qs = chain ? `mode=stats&chain=${chain}` : "mode=stats";
  const res = await fetch(`/api/trading?${qs}`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  const json = await res.json();
  return json.data;
}

export function useTrades(filters: TradeFilters = {}) {
  return useQuery({
    queryKey: ["trades", filters],
    queryFn: () => fetchTrades(filters),
    staleTime: 30_000,
  });
}

export function useTradeStats(chain?: string) {
  return useQuery({
    queryKey: ["trade-stats", chain],
    queryFn: () => fetchTradeStats(chain),
    staleTime: 60_000,
  });
}

export function useCreateTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const res = await fetch("/api/trading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to create trade");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trades"] });
      qc.invalidateQueries({ queryKey: ["trade-stats"] });
    },
  });
}

export function useCloseTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: {
      id: string;
      priceAtExit: number;
      pnl: number;
      pnlPercent: number;
    }) => {
      const res = await fetch(`/api/trading/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close", ...input }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to close trade");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trades"] });
      qc.invalidateQueries({ queryKey: ["trade-stats"] });
    },
  });
}

export function useDeleteTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/trading/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to delete trade");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trades"] });
      qc.invalidateQueries({ queryKey: ["trade-stats"] });
    },
  });
}
