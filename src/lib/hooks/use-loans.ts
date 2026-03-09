"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@/types";
import type { AggregatedLoanData } from "@/lib/services/loans";

export function useLoans(
  address: string | undefined,
  chains?: string[]
) {
  return useQuery<AggregatedLoanData>({
    queryKey: ["loans", address, chains],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (address) params.set("address", address);
      if (chains?.length === 1) params.set("chain", chains[0]);

      const res = await fetch(`/api/loans?${params}`);
      const json = (await res.json()) as ApiResponse<AggregatedLoanData>;
      if (json.error) throw new Error(json.error);
      return json.data!;
    },
    enabled: !!address && /^0x[a-fA-F0-9]{40}$/.test(address),
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
