"use client";

import { useQuery } from "@tanstack/react-query";

export interface DashboardData {
  tier: string;
  stats: {
    totalTrades: number;
    openTrades: number;
    totalPnl: number;
    whaleAlerts24h: number;
    mevEvents24h: number;
    mevProfit24h: number;
    activeAlerts: number;
  };
  recentTrades: {
    id: string;
    tokenIn: string;
    tokenOut: string;
    tradeType: string;
    pnl: number | null;
    pnlPercent: number | null;
    openedAt: string;
    closedAt: string | null;
  }[];
  recentWhales: {
    id: string;
    chain: string;
    asset: string;
    valueUsd: number;
    fromLabel: string | null;
    toLabel: string | null;
    timestamp: string;
  }[];
  topProtocols: {
    protocol: string;
    chain: string;
    tvlUsd: number;
    change24h: number | null;
  }[];
}

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Failed to fetch dashboard");
  const json = await res.json();
  return json.data;
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
