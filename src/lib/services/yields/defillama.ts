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
  rewardTokens: string[] | null;
  stablecoin: boolean;
  ilRisk: string;
  exposure: string;
  poolMeta: string | null;
}

const TARGET_PROJECTS = ["aave-v3", "compound-v3", "yearn-finance", "curve-dex"];
const TARGET_CHAINS = ["Ethereum", "Arbitrum", "Base", "BSC", "Solana"];

export async function fetchYieldPools(): Promise<YieldPool[]> {
  return cached("yields:pools", async () => {
    const res = await fetch(`${DEFILLAMA_API}/pools`);
    if (!res.ok) throw new Error(`DefiLlama API error: ${res.status}`);

    const json = (await res.json()) as { data: DefiLlamaPool[] };

    return json.data
      .filter(
        (p) =>
          TARGET_PROJECTS.includes(p.project) &&
          TARGET_CHAINS.includes(p.chain)
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
        rewardTokens: p.rewardTokens ?? [],
        stablecoin: p.stablecoin,
        ilRisk: p.ilRisk,
        exposure: p.exposure,
        poolMeta: p.poolMeta,
      }))
      .sort((a, b) => b.apy - a.apy);
  }, 300); // 5 min cache
}
