"use client";

import { formatUsd } from "@/lib/utils";

interface WhaleStatsProps {
  totalCount: number;
  totalValueUsd: number;
  avgValueUsd: number;
  largestValueUsd: number;
  chainBreakdown: Record<string, { count: number; valueUsd: number }>;
  topAssets: Array<{ asset: string; count: number }>;
}

const chainLabels: Record<string, string> = {
  ETHEREUM: "Ethereum",
  ARBITRUM: "Arbitrum",
  BASE: "Base",
  BNB: "BNB Chain",
};

export function WhaleStats({
  totalCount,
  totalValueUsd,
  avgValueUsd,
  largestValueUsd,
  chainBreakdown,
  topAssets,
}: WhaleStatsProps) {
  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-5">
          <p className="text-xs text-muted-foreground">Transfers (24h)</p>
          <p className="mt-1 text-2xl font-bold">{totalCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <p className="text-xs text-muted-foreground">Total Volume</p>
          <p className="mt-1 text-2xl font-bold">{formatUsd(totalValueUsd)}</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <p className="text-xs text-muted-foreground">Avg Transfer</p>
          <p className="mt-1 text-2xl font-bold">{formatUsd(avgValueUsd)}</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <p className="text-xs text-muted-foreground">Largest Transfer</p>
          <p className="mt-1 text-2xl font-bold">
            {formatUsd(largestValueUsd)}
          </p>
        </div>
      </div>

      {/* Chain breakdown + top assets */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">By Chain</h3>
          <div className="space-y-2">
            {Object.entries(chainBreakdown).map(([chain, data]) => (
              <div
                key={chain}
                className="flex items-center justify-between text-sm"
              >
                <span>{chainLabels[chain] ?? chain}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    {data.count} txns
                  </span>
                  <span className="font-medium">
                    {formatUsd(data.valueUsd)}
                  </span>
                </div>
              </div>
            ))}
            {Object.keys(chainBreakdown).length === 0 && (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Top Assets</h3>
          <div className="space-y-2">
            {topAssets.map(({ asset, count }) => (
              <div
                key={asset}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium">{asset}</span>
                <span className="text-muted-foreground">
                  {count} transfers
                </span>
              </div>
            ))}
            {topAssets.length === 0 && (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
