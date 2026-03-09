"use client";

import { useQuery } from "@tanstack/react-query";
import type { YieldPool, ApiResponse } from "@/types";
import type { YieldStats, YieldFilters } from "@/lib/services/yields/defillama";

interface YieldResponse {
  pools: YieldPool[];
  stats: YieldStats;
}

export function useYields(filters?: YieldFilters) {
  return useQuery<YieldResponse>({
    queryKey: ["yields", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.chains?.length)
        params.set("chains", filters.chains.join(","));
      if (filters?.projects?.length)
        params.set("projects", filters.projects.join(","));
      if (filters?.stablecoinsOnly)
        params.set("stablecoinsOnly", "true");
      if (filters?.minTvl !== undefined)
        params.set("minTvl", filters.minTvl.toString());
      if (filters?.minApy !== undefined)
        params.set("minApy", filters.minApy.toString());
      if (filters?.search) params.set("search", filters.search);
      if (filters?.sortBy) params.set("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.set("sortOrder", filters.sortOrder);

      const res = await fetch(`/api/yields?${params}`);
      const json = (await res.json()) as ApiResponse<YieldResponse>;
      if (json.error) throw new Error(json.error);
      return json.data!;
    },
    staleTime: 5 * 60 * 1000,
  });
}
