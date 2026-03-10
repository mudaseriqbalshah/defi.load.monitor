import { prisma } from "@/lib/db";
import { cached } from "@/lib/db/redis";
import type { Chain } from "@prisma/client";
import { FLASHBOTS_API } from "@/lib/constants/protocols";

// ─── Types ──────────────────────────────────────────────────────

export interface MevEventData {
  chain: Chain;
  txHash: string;
  type: string;
  profitUsd: number;
  victimAddress?: string;
  botAddress?: string;
  blockNumber: number;
  timestamp: Date;
}

export interface MevFilters {
  chain?: Chain;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface MevStats {
  totalEvents: number;
  totalProfit: number;
  avgProfit: number;
  byType: { type: string; count: number; totalProfit: number }[];
  byChain: { chain: string; count: number; totalProfit: number }[];
  last24hCount: number;
  last24hProfit: number;
}

// ─── Store MEV event ────────────────────────────────────────────

export async function storeMevEvent(data: MevEventData) {
  return prisma.mevEvent.upsert({
    where: { txHash: data.txHash },
    create: data,
    update: {},
  });
}

// ─── Query MEV events ───────────────────────────────────────────

export async function getMevFeed(filters: MevFilters = {}) {
  const where: Record<string, unknown> = {};
  if (filters.chain) where.chain = filters.chain;
  if (filters.type) where.type = filters.type;

  const [events, total] = await Promise.all([
    prisma.mevEvent.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: filters.limit ?? 50,
      skip: filters.offset ?? 0,
    }),
    prisma.mevEvent.count({ where }),
  ]);

  return { events, total };
}

// ─── MEV stats ──────────────────────────────────────────────────

export async function getMevStats(): Promise<MevStats> {
  const now = new Date();
  const day = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const allEvents = await prisma.mevEvent.findMany({
    select: { type: true, chain: true, profitUsd: true, timestamp: true },
  });

  const last24h = allEvents.filter((e) => e.timestamp >= day);
  const totalProfit = allEvents.reduce((s, e) => s + e.profitUsd, 0);

  // Group by type
  const typeMap = new Map<string, { count: number; totalProfit: number }>();
  for (const e of allEvents) {
    const entry = typeMap.get(e.type) ?? { count: 0, totalProfit: 0 };
    entry.count++;
    entry.totalProfit += e.profitUsd;
    typeMap.set(e.type, entry);
  }

  // Group by chain
  const chainMap = new Map<string, { count: number; totalProfit: number }>();
  for (const e of allEvents) {
    const entry = chainMap.get(e.chain) ?? { count: 0, totalProfit: 0 };
    entry.count++;
    entry.totalProfit += e.profitUsd;
    chainMap.set(e.chain, entry);
  }

  return {
    totalEvents: allEvents.length,
    totalProfit,
    avgProfit: allEvents.length > 0 ? totalProfit / allEvents.length : 0,
    byType: Array.from(typeMap.entries()).map(([type, d]) => ({ type, ...d })),
    byChain: Array.from(chainMap.entries()).map(([chain, d]) => ({
      chain,
      ...d,
    })),
    last24hCount: last24h.length,
    last24hProfit: last24h.reduce((s, e) => s + e.profitUsd, 0),
  };
}

// ─── Fetch from Flashbots API ───────────────────────────────────

interface FlashbotsBlock {
  block_number: number;
  transactions: {
    transaction_hash: string;
    bundle_type: string;
    eoa_address: string;
    to_address: string;
    total_miner_reward: string;
    gas_used: number;
  }[];
}

export async function fetchRecentMevBlocks(): Promise<MevEventData[]> {
  const events: MevEventData[] = [];

  try {
    const res = await fetch(`${FLASHBOTS_API}/blocks?limit=10`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!res.ok) return events;

    const data = await res.json();
    const blocks: FlashbotsBlock[] = data.blocks ?? [];

    for (const block of blocks) {
      for (const tx of block.transactions ?? []) {
        const reward = parseFloat(tx.total_miner_reward ?? "0");
        if (reward <= 0) continue;

        // Estimate USD value (rough ETH price approximation)
        const ethPrice = 3000; // Fallback; in production use live price
        const profitUsd = (reward / 1e18) * ethPrice;

        if (profitUsd < 10) continue; // Skip dust

        const type = classifyMevType(tx.bundle_type);

        events.push({
          chain: "ETHEREUM",
          txHash: tx.transaction_hash,
          type,
          profitUsd,
          botAddress: tx.eoa_address,
          victimAddress: tx.to_address,
          blockNumber: block.block_number,
          timestamp: new Date(),
        });
      }
    }
  } catch (error) {
    console.error("Flashbots fetch error:", error);
  }

  return events;
}

function classifyMevType(bundleType: string): string {
  const lower = bundleType?.toLowerCase() ?? "";
  if (lower.includes("sandwich")) return "sandwich";
  if (lower.includes("liquidation")) return "liquidation";
  if (lower.includes("arb") || lower.includes("backrun")) return "arbitrage";
  return "arbitrage"; // Default Flashbots bundles are usually arb
}

// ─── Sync MEV data (call periodically) ──────────────────────────

export async function syncMevEvents(): Promise<number> {
  const events = await fetchRecentMevBlocks();
  let stored = 0;
  for (const event of events) {
    try {
      await storeMevEvent(event);
      stored++;
    } catch {
      // Duplicate txHash, skip
    }
  }
  return stored;
}

// ─── Cached MEV stats ───────────────────────────────────────────

export async function getCachedMevStats(): Promise<MevStats> {
  return cached("mev:stats", getMevStats, 120);
}
