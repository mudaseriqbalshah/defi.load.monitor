"use client";

import { formatUsd, formatPercent } from "@/lib/utils";
import type { YieldStats } from "@/lib/services/yields/defillama";

const protocolLabels: Record<string, string> = {
  "aave-v3": "Aave V3",
  "compound-v3": "Compound V3",
  "yearn-finance": "Yearn",
  "curve-dex": "Curve",
  lido: "Lido",
  "rocket-pool": "Rocket Pool",
  "convex-finance": "Convex",
  morpho: "Morpho",
  spark: "Spark",
};

export function YieldStatsBar({ stats }: { stats: YieldStats }) {
  const items = [
    { label: "Total Pools", value: stats.totalPools.toString() },
    { label: "Avg APY", value: formatPercent(stats.avgApy) },
    { label: "Median APY", value: formatPercent(stats.medianApy) },
    { label: "Total TVL", value: formatUsd(stats.totalTvl) },
    { label: "Top Protocol", value: protocolLabels[stats.topProject] ?? stats.topProject },
    { label: "Top Chain", value: stats.topChain },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-lg font-semibold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
