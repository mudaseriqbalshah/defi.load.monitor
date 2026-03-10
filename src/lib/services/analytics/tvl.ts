import { prisma } from "@/lib/db";
import { cached } from "@/lib/db/redis";
import type { Chain } from "@prisma/client";

// ─── Types ──────────────────────────────────────────────────────

export interface TvlData {
  protocol: string;
  chain: Chain;
  tvlUsd: number;
  change24h: number | null;
}

export interface TvlFilters {
  chain?: Chain;
  protocol?: string;
  limit?: number;
}

export interface TvlOverview {
  totalTvl: number;
  change24h: number;
  byChain: { chain: string; tvlUsd: number; change24h: number }[];
  topProtocols: TvlData[];
  protocolCount: number;
}

// ─── Supported protocols for TVL tracking ───────────────────────

const TRACKED_PROTOCOLS: { slug: string; name: string; chains: Chain[] }[] = [
  { slug: "aave-v3", name: "Aave V3", chains: ["ETHEREUM", "ARBITRUM", "BASE"] },
  { slug: "compound-v3", name: "Compound V3", chains: ["ETHEREUM", "ARBITRUM"] },
  { slug: "lido", name: "Lido", chains: ["ETHEREUM"] },
  { slug: "uniswap-v3", name: "Uniswap V3", chains: ["ETHEREUM", "ARBITRUM", "BASE", "BNB"] },
  { slug: "curve-dex", name: "Curve", chains: ["ETHEREUM", "ARBITRUM"] },
  { slug: "maker", name: "MakerDAO", chains: ["ETHEREUM"] },
  { slug: "rocket-pool", name: "Rocket Pool", chains: ["ETHEREUM"] },
  { slug: "convex-finance", name: "Convex", chains: ["ETHEREUM"] },
  { slug: "morpho", name: "Morpho", chains: ["ETHEREUM", "BASE"] },
  { slug: "gmx-v2", name: "GMX V2", chains: ["ARBITRUM"] },
  { slug: "aerodrome", name: "Aerodrome", chains: ["BASE"] },
  { slug: "pancakeswap", name: "PancakeSwap", chains: ["BNB", "ARBITRUM"] },
];

// DefiLlama chain name mapping
const CHAIN_SLUGS: Record<string, string> = {
  ETHEREUM: "Ethereum",
  ARBITRUM: "Arbitrum",
  BASE: "Base",
  BNB: "BSC",
  SOLANA: "Solana",
};

// ─── Fetch TVL from DefiLlama ───────────────────────────────────

interface LlamaProtocol {
  name: string;
  slug: string;
  tvl: number;
  change_1d: number | null;
  chains: string[];
  chainTvls: Record<string, number>;
}

export async function fetchProtocolTvl(): Promise<TvlData[]> {
  const results: TvlData[] = [];

  try {
    const res = await fetch("https://api.llama.fi/protocols", {
      next: { revalidate: 300 },
    });
    if (!res.ok) return results;

    const protocols: LlamaProtocol[] = await res.json();

    for (const tracked of TRACKED_PROTOCOLS) {
      const proto = protocols.find(
        (p) => p.slug === tracked.slug || p.name.toLowerCase() === tracked.slug
      );
      if (!proto) continue;

      for (const chain of tracked.chains) {
        const chainSlug = CHAIN_SLUGS[chain];
        if (!chainSlug) continue;

        const tvlUsd = proto.chainTvls?.[chainSlug] ?? 0;
        if (tvlUsd <= 0) continue;

        results.push({
          protocol: tracked.name,
          chain,
          tvlUsd,
          change24h: proto.change_1d ?? null,
        });
      }
    }
  } catch (error) {
    console.error("DefiLlama TVL fetch error:", error);
  }

  return results;
}

// ─── Store TVL snapshots ────────────────────────────────────────

export async function syncTvlSnapshots(): Promise<number> {
  const data = await fetchProtocolTvl();
  let stored = 0;

  for (const entry of data) {
    await prisma.tvlSnapshot.create({
      data: {
        protocol: entry.protocol,
        chain: entry.chain,
        tvlUsd: entry.tvlUsd,
        change24h: entry.change24h,
      },
    });
    stored++;
  }

  return stored;
}

// ─── Query TVL data ─────────────────────────────────────────────

export async function getLatestTvl(filters: TvlFilters = {}): Promise<TvlData[]> {
  const where: Record<string, unknown> = {};
  if (filters.chain) where.chain = filters.chain;
  if (filters.protocol) {
    where.protocol = { contains: filters.protocol, mode: "insensitive" };
  }

  // Get the latest snapshot per protocol+chain
  const snapshots = await prisma.tvlSnapshot.findMany({
    where,
    orderBy: { timestamp: "desc" },
    distinct: ["protocol", "chain"],
    take: filters.limit ?? 100,
  });

  return snapshots.map((s) => ({
    protocol: s.protocol,
    chain: s.chain,
    tvlUsd: s.tvlUsd,
    change24h: s.change24h,
  }));
}

// ─── TVL overview stats ─────────────────────────────────────────

export async function getTvlOverview(): Promise<TvlOverview> {
  const latest = await getLatestTvl();

  const totalTvl = latest.reduce((s, d) => s + d.tvlUsd, 0);

  // Weighted average 24h change
  const weightedChange = latest.reduce(
    (s, d) => s + (d.change24h ?? 0) * d.tvlUsd,
    0
  );
  const change24h = totalTvl > 0 ? weightedChange / totalTvl : 0;

  // Group by chain
  const chainMap = new Map<string, { tvlUsd: number; weighted: number }>();
  for (const d of latest) {
    const entry = chainMap.get(d.chain) ?? { tvlUsd: 0, weighted: 0 };
    entry.tvlUsd += d.tvlUsd;
    entry.weighted += (d.change24h ?? 0) * d.tvlUsd;
    chainMap.set(d.chain, entry);
  }

  const byChain = Array.from(chainMap.entries()).map(([chain, v]) => ({
    chain,
    tvlUsd: v.tvlUsd,
    change24h: v.tvlUsd > 0 ? v.weighted / v.tvlUsd : 0,
  }));
  byChain.sort((a, b) => b.tvlUsd - a.tvlUsd);

  // Top protocols (aggregated across chains)
  const protoMap = new Map<string, { tvlUsd: number; change24h: number | null }>();
  for (const d of latest) {
    const entry = protoMap.get(d.protocol) ?? { tvlUsd: 0, change24h: d.change24h };
    entry.tvlUsd += d.tvlUsd;
    protoMap.set(d.protocol, entry);
  }

  const topProtocols = Array.from(protoMap.entries())
    .map(([protocol, v]) => ({
      protocol,
      chain: "ETHEREUM" as Chain, // Aggregate
      tvlUsd: v.tvlUsd,
      change24h: v.change24h,
    }))
    .sort((a, b) => b.tvlUsd - a.tvlUsd)
    .slice(0, 10);

  return {
    totalTvl,
    change24h,
    byChain,
    topProtocols,
    protocolCount: protoMap.size,
  };
}

// ─── Cached overview ────────────────────────────────────────────

export async function getCachedTvlOverview(): Promise<TvlOverview> {
  return cached("tvl:overview", getTvlOverview, 300);
}

export async function getCachedLatestTvl(filters: TvlFilters = {}): Promise<TvlData[]> {
  const key = `tvl:latest:${filters.chain ?? "all"}:${filters.protocol ?? "all"}`;
  return cached(key, () => getLatestTvl(filters), 300);
}
