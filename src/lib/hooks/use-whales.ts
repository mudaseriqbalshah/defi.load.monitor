"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@/types";
import type { WhaleTransactionWithLabels } from "@/lib/services/analytics/whales";
import type { Chain } from "@prisma/client";

interface WhaleFeedResponse {
  transactions: WhaleTransactionWithLabels[];
  total: number;
}

interface WhaleStatsResponse {
  totalCount: number;
  totalValueUsd: number;
  avgValueUsd: number;
  largestValueUsd: number;
  chainBreakdown: Record<string, { count: number; valueUsd: number }>;
  topAssets: Array<{ asset: string; count: number }>;
}

export function useWhaleFeed(filters?: {
  chains?: Chain[];
  minValueUsd?: number;
  asset?: string;
  limit?: number;
}) {
  return useQuery<WhaleFeedResponse>({
    queryKey: ["whales", "feed", filters],
    queryFn: async () => {
      const params = new URLSearchParams({ view: "feed" });
      if (filters?.chains?.length)
        params.set("chains", filters.chains.join(","));
      if (filters?.minValueUsd)
        params.set("minValueUsd", filters.minValueUsd.toString());
      if (filters?.asset) params.set("asset", filters.asset);
      if (filters?.limit) params.set("limit", filters.limit.toString());

      const res = await fetch(`/api/analytics/whales?${params}`);
      const json = (await res.json()) as ApiResponse<WhaleFeedResponse>;
      if (json.error) throw new Error(json.error);
      return json.data!;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // auto-refresh every minute
  });
}

export function useWhaleStats(hours: number = 24) {
  return useQuery<WhaleStatsResponse>({
    queryKey: ["whales", "stats", hours],
    queryFn: async () => {
      const res = await fetch(
        `/api/analytics/whales?view=stats&hours=${hours}`
      );
      const json = (await res.json()) as ApiResponse<WhaleStatsResponse>;
      if (json.error) throw new Error(json.error);
      return json.data!;
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
