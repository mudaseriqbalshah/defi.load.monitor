"use client";

import Link from "next/link";
import { formatUsd, formatPercent } from "@/lib/utils";
import type { DashboardData } from "@/lib/hooks/use-dashboard";

interface TopProtocolsProps {
  protocols: DashboardData["topProtocols"];
}

export function TopProtocols({ protocols }: TopProtocolsProps) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Top Protocols by TVL</h3>
        <Link
          href="/analytics/tvl"
          className="text-sm text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      {protocols.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No TVL data yet.{" "}
          <Link href="/analytics/tvl" className="text-primary hover:underline">
            Sync TVL data
          </Link>
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {protocols.map((p, i) => (
            <div
              key={`${p.protocol}-${p.chain}`}
              className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-center text-xs text-muted-foreground">
                  {i + 1}
                </span>
                <span className="text-sm font-medium">{p.protocol}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  {p.chain}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono">{formatUsd(p.tvlUsd)}</span>
                {p.change24h != null && (
                  <span
                    className={`text-xs ${
                      p.change24h >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {formatPercent(p.change24h)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
