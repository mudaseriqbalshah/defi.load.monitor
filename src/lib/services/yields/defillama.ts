import { DEFILLAMA_API } from "@/lib/constants/protocols";
import { cached } from "@/lib/db/redis";
import type { YieldPool } from "@/types";

interface DefiLlamaPool {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase: number | null;
  apyReward: number | null;
  apyPct1D: number | null;
  apyPct7D: number | null;
  apyPct30D: number | null;
  rewardTokens: string[] | null;
  stablecoin: boolean;
  ilRisk: string;
  exposure: string;
  poolMeta: string | null;
}

const TARGET_PROJECTS = [
  "aave-v3",
  "compound-v3",
  "yearn-finance",
  "curve-dex",
  "lido",
  "rocket-pool",
  "convex-finance",
  "morpho",
  "spark",
];

const TARGET_CHAINS = ["Ethereum", "Arbitrum", "Base", "BSC", "Solana"];

export interface YieldFilters {
  chains?: string[];
  projects?: string[];
  stablecoinsOnly?: boolean;
  minTvl?: number;
  minApy?: number;
  maxApy?: number;
  search?: string;
  sortBy?: "apy" | "tvl" | "apyBase" | "apyReward";
  sortOrder?: "asc" | "desc";
}

export interface YieldStats {
  totalPools: number;
  avgApy: number;
  medianApy: number;
  totalTvl: number;
  topProject: string;
  topChain: string;
}

export async function fetchYieldPools(
  filters?: YieldFilters
): Promise<{ pools: YieldPool[]; stats: YieldStats }> {
  const allPools = await cached<YieldPool[]>(
    "yields:pools:all",
    async () => {
      const res = await fetch(`${DEFILLAMA_API}/pools`);
      if (!res.ok) throw new Error(`DefiLlama API error: ${res.status}`);

      const json = (await res.json()) as { data: DefiLlamaPool[] };

      return json.data
        .filter(
          (p) =>
            TARGET_PROJECTS.includes(p.project) &&
            TARGET_CHAINS.includes(p.chain) &&
            p.tvlUsd > 0
        )
        .map((p) => ({
          pool: p.pool,
          chain: p.chain,
          project: p.project,
          symbol: p.symbol,
          tvlUsd: p.tvlUsd,
          apy: p.apy ?? 0,
          apyBase: p.apyBase ?? 0,
          apyReward: p.apyReward ?? 0,
          apyPct1D: p.apyPct1D ?? null,
          apyPct7D: p.apyPct7D ?? null,
          apyPct30D: p.apyPct30D ?? null,
          rewardTokens: p.rewardTokens ?? [],
          stablecoin: p.stablecoin,
          ilRisk: p.ilRisk,
          exposure: p.exposure,
          poolMeta: p.poolMeta,
        }));
    },
    300 // 5 min cache
  );

  // Apply filters
  let filtered = [...allPools];

  if (filters) {
    if (filters.chains?.length) {
      filtered = filtered.filter((p) => filters.chains!.includes(p.chain));
    }
    if (filters.projects?.length) {
      filtered = filtered.filter((p) => filters.projects!.includes(p.project));
    }
    if (filters.stablecoinsOnly) {
      filtered = filtered.filter((p) => p.stablecoin);
    }
    if (filters.minTvl !== undefined) {
      filtered = filtered.filter((p) => p.tvlUsd >= filters.minTvl!);
    }
    if (filters.minApy !== undefined) {
      filtered = filtered.filter((p) => p.apy >= filters.minApy!);
    }
    if (filters.maxApy !== undefined) {
      filtered = filtered.filter((p) => p.apy <= filters.maxApy!);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.symbol.toLowerCase().includes(q) ||
          p.project.toLowerCase().includes(q) ||
          p.chain.toLowerCase().includes(q)
      );
    }

    // Sort
    const sortBy = filters.sortBy ?? "apy";
    const sortOrder = filters.sortOrder ?? "desc";
    const sortKeyMap: Record<string, keyof YieldPool> = {
      apy: "apy",
      tvl: "tvlUsd",
      apyBase: "apyBase",
      apyReward: "apyReward",
    };
    const key = sortKeyMap[sortBy] ?? "apy";
    filtered.sort((a, b) => {
      const aVal = a[key] as number;
      const bVal = b[key] as number;
      return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
    });
  } else {
    filtered.sort((a, b) => b.apy - a.apy);
  }

  // Compute stats
  const stats = computeStats(filtered);

  return { pools: filtered, stats };
}

function computeStats(pools: YieldPool[]): YieldStats {
  if (pools.length === 0) {
    return {
      totalPools: 0,
      avgApy: 0,
      medianApy: 0,
      totalTvl: 0,
      topProject: "—",
      topChain: "—",
    };
  }

  const apys = pools.map((p) => p.apy).sort((a, b) => a - b);
  const totalTvl = pools.reduce((sum, p) => sum + p.tvlUsd, 0);
  const avgApy = apys.reduce((sum, a) => sum + a, 0) / apys.length;
  const medianApy =
    apys.length % 2 === 0
      ? (apys[apys.length / 2 - 1] + apys[apys.length / 2]) / 2
      : apys[Math.floor(apys.length / 2)];

  // Most common project/chain
  const projectCounts = new Map<string, number>();
  const chainCounts = new Map<string, number>();
  for (const p of pools) {
    projectCounts.set(p.project, (projectCounts.get(p.project) ?? 0) + 1);
    chainCounts.set(p.chain, (chainCounts.get(p.chain) ?? 0) + 1);
  }
  const topProject = Array.from(projectCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0][0];
  const topChain = Array.from(chainCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  return { totalPools: pools.length, avgApy, medianApy, totalTvl, topProject, topChain };
}

/** Fetch available filter options from the data */
export async function fetchYieldFilterOptions(): Promise<{
  chains: string[];
  projects: string[];
}> {
  const { pools } = await fetchYieldPools();
  const chains = Array.from(new Set(pools.map((p) => p.chain))).sort();
  const projects = Array.from(new Set(pools.map((p) => p.project))).sort();
  return { chains, projects };
}
