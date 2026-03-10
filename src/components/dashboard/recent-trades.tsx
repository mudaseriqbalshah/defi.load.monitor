"use client";

import Link from "next/link";
import { formatUsd } from "@/lib/utils";
import type { DashboardData } from "@/lib/hooks/use-dashboard";

const TYPE_COLORS: Record<string, string> = {
  LONG: "text-green-500",
  SHORT: "text-red-500",
  SWAP: "text-blue-500",
  PROVIDE_LIQUIDITY: "text-purple-500",
  REMOVE_LIQUIDITY: "text-orange-500",
};

interface RecentTradesProps {
  trades: DashboardData["recentTrades"];
}

export function RecentTrades({ trades }: RecentTradesProps) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Recent Trades</h3>
        <Link
          href="/trading"
          className="text-sm text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      {trades.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No trades logged yet.{" "}
          <Link href="/trading" className="text-primary hover:underline">
            Log your first trade
          </Link>
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {trades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-medium ${
                    TYPE_COLORS[trade.tradeType] ?? ""
                  }`}
                >
                  {trade.tradeType}
                </span>
                <span className="text-sm font-medium">
                  {trade.tokenIn}/{trade.tokenOut}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {trade.pnl != null ? (
                  <span
                    className={`text-sm font-mono font-medium ${
                      trade.pnl >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {trade.pnl >= 0 ? "+" : ""}
                    {formatUsd(trade.pnl)}
                  </span>
                ) : (
                  <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-xs text-yellow-500">
                    Open
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(trade.openedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
