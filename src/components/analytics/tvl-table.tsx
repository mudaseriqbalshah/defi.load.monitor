"use client";

import { useLatestTvl } from "@/lib/hooks/use-analytics";
import { formatUsd, formatPercent } from "@/lib/utils";
import type { Chain } from "@prisma/client";

interface TvlTableProps {
  chain?: Chain;
  protocol?: string;
}

export function TvlTable({ chain, protocol }: TvlTableProps) {
  const { data, isLoading } = useLatestTvl({ chain, protocol });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        No TVL data yet. Sync data to populate this table.
      </div>
    );
  }

  // Sort by TVL descending
  const sorted = [...data].sort((a, b) => b.tvlUsd - a.tvlUsd);

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Protocol</th>
              <th className="px-4 py-3">Chain</th>
              <th className="px-4 py-3 text-right">TVL</th>
              <th className="px-4 py-3 text-right">24h Change</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={`${row.protocol}-${row.chain}`}
                className="border-b last:border-0"
              >
                <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{row.protocol}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-muted px-2 py-0.5 text-xs">
                    {row.chain}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatUsd(row.tvlUsd)}
                </td>
                <td className="px-4 py-3 text-right">
                  {row.change24h != null ? (
                    <span
                      className={
                        row.change24h >= 0 ? "text-green-500" : "text-red-500"
                      }
                    >
                      {row.change24h >= 0 ? "+" : ""}
                      {formatPercent(row.change24h)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
