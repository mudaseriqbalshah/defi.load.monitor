"use client";

import { useQuery } from "@tanstack/react-query";
import type { LoanPosition, ApiResponse } from "@/types";

export function useLoans(address: string | undefined, chain: string = "ETHEREUM") {
  return useQuery<LoanPosition[]>({
    queryKey: ["loans", address, chain],
    queryFn: async () => {
      const res = await fetch(`/api/loans?address=${address}&chain=${chain}`);
      const json = (await res.json()) as ApiResponse<LoanPosition[]>;
      if (json.error) throw new Error(json.error);
      return json.data ?? [];
    },
    enabled: !!address,
    staleTime: 60 * 1000,
  });
}
