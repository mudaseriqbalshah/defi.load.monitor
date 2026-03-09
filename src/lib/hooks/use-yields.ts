"use client";

import { useQuery } from "@tanstack/react-query";
import type { YieldPool, ApiResponse } from "@/types";

export function useYields() {
  return useQuery<YieldPool[]>({
    queryKey: ["yields"],
    queryFn: async () => {
      const res = await fetch("/api/yields");
      const json = (await res.json()) as ApiResponse<YieldPool[]>;
      if (json.error) throw new Error(json.error);
      return json.data ?? [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
