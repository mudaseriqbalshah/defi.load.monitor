"use client";

import { useQuery } from "@tanstack/react-query";
import type { MevStats, MevFilters } from "@/lib/services/analytics/mev";
import type { TvlOverview, TvlData, TvlFilters } from "@/lib/services/analytics/tvl";

// ─── MEV hooks ──────────────────────────────────────────────────

interface MevEvent {
  id: string;
  chain: string;
  txHash: string;
  type: string;
  profitUsd: number;
  victimAddress: string | null;
  botAddress: string | null;
  blockNumber: number;
  timestamp: string;
}

async function fetchMevFeed(
  filters: MevFilters
): Promise<{ events: MevEvent[]; total: number }> {
  const params = new URLSearchParams();
  if (filters.chain) params.set("chain", filters.chain);
  if (filters.type) params.set("type", filters.type);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.offset) params.set("offset", String(filters.offset));

  const res = await fetch(`/api/analytics/mev?${params}`);
  if (!res.ok) throw new Error("Failed to fetch MEV feed");
  const json = await res.json();
  return json.data;
}

async function fetchMevStats(): Promise<MevStats> {
  const res = await fetch("/api/analytics/mev?mode=stats");
  if (!res.ok) throw new Error("Failed to fetch MEV stats");
  const json = await res.json();
  return json.data;
}

export function useMevFeed(filters: MevFilters = {}) {
  return useQuery({
    queryKey: ["mev-feed", filters],
    queryFn: () => fetchMevFeed(filters),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useMevStats() {
  return useQuery({
    queryKey: ["mev-stats"],
    queryFn: fetchMevStats,
    staleTime: 60_000,
  });
}

// ─── TVL hooks ──────────────────────────────────────────────────

async function fetchTvlOverview(): Promise<TvlOverview> {
  const res = await fetch("/api/analytics/tvl?mode=overview");
  if (!res.ok) throw new Error("Failed to fetch TVL overview");
  const json = await res.json();
  return json.data;
}

async function fetchLatestTvl(filters: TvlFilters): Promise<TvlData[]> {
  const params = new URLSearchParams();
  if (filters.chain) params.set("chain", filters.chain);
  if (filters.protocol) params.set("protocol", filters.protocol);
  if (filters.limit) params.set("limit", String(filters.limit));

  const res = await fetch(`/api/analytics/tvl?${params}`);
  if (!res.ok) throw new Error("Failed to fetch TVL");
  const json = await res.json();
  return json.data;
}

export function useTvlOverview() {
  return useQuery({
    queryKey: ["tvl-overview"],
    queryFn: fetchTvlOverview,
    staleTime: 5 * 60_000,
  });
}

export function useLatestTvl(filters: TvlFilters = {}) {
  return useQuery({
    queryKey: ["tvl-latest", filters],
    queryFn: () => fetchLatestTvl(filters),
    staleTime: 5 * 60_000,
  });
}
