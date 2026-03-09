"use client";

import type { YieldPool } from "@/types";
import { formatUsd, formatPercent } from "@/lib/utils";
import { ChainBadge } from "./chain-badge";
import { ProtocolBadge } from "./protocol-badge";

interface YieldTableProps {
  pools: YieldPool[];
}

function ApyChange({ value }: { value: number | null }) {
  if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;
  const color =
    value > 0
      ? "text-emerald-500"
      : value < 0
      ? "text-red-500"
      : "text-muted-foreground";
  return <span className={color}>{formatPercent(value)}</span>;
}

function RiskIndicator({ ilRisk, exposure }: { ilRisk: string; exposure: string }) {
  const riskLevel =
    ilRisk === "no" && exposure === "single"
      ? "low"
      : ilRisk === "no"
      ? "medium"
      : "high";

  const colors = {
    low: "bg-emerald-500/15 text-emerald-500",
    medium: "bg-yellow-500/15 text-yellow-500",
    high: "bg-red-500/15 text-red-500",
  };

  const labels = {
    low: "Low",
    medium: "Med",
    high: "High",
  };

  return (
    <span
      className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium ${colors[riskLevel]}`}
    >
      {labels[riskLevel]}
    </span>
  );
}

export function YieldTable({ pools }: YieldTableProps) {
  if (pools.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          No pools match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Pool
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Protocol
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Chain
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              APY
            </th>
            <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground md:table-cell">
              Base
            </th>
            <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground md:table-cell">
              Reward
            </th>
            <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground lg:table-cell">
              1D
            </th>
            <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground lg:table-cell">
              7D
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              TVL
            </th>
            <th className="hidden px-4 py-3 text-center font-medium text-muted-foreground md:table-cell">
              Risk
            </th>
          </tr>
        </thead>
        <tbody>
          {pools.map((pool) => (
            <tr
              key={pool.pool}
              className="border-b transition-colors hover:bg-muted/30"
            >
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium">{pool.symbol}</p>
                  {pool.poolMeta && (
                    <p className="text-xs text-muted-foreground">
                      {pool.poolMeta}
                    </p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <ProtocolBadge project={pool.project} />
              </td>
              <td className="px-4 py-3">
                <ChainBadge chain={pool.chain} />
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-semibold text-emerald-500">
                  {formatPercent(pool.apy)}
                </span>
              </td>
              <td className="hidden px-4 py-3 text-right md:table-cell">
                {formatPercent(pool.apyBase)}
              </td>
              <td className="hidden px-4 py-3 text-right md:table-cell">
                {pool.apyReward > 0 ? (
                  <span className="text-violet-400">
                    {formatPercent(pool.apyReward)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="hidden px-4 py-3 text-right lg:table-cell">
                <ApyChange value={pool.apyPct1D} />
              </td>
              <td className="hidden px-4 py-3 text-right lg:table-cell">
                <ApyChange value={pool.apyPct7D} />
              </td>
              <td className="px-4 py-3 text-right">
                {formatUsd(pool.tvlUsd)}
              </td>
              <td className="hidden px-4 py-3 text-center md:table-cell">
                <RiskIndicator
                  ilRisk={pool.ilRisk}
                  exposure={pool.exposure}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
