"use client";

import { useMevStats } from "@/lib/hooks/use-analytics";
import { formatUsd } from "@/lib/utils";

const TYPE_COLORS: Record<string, string> = {
  sandwich: "bg-red-500/10 text-red-500",
  arbitrage: "bg-blue-500/10 text-blue-500",
  liquidation: "bg-orange-500/10 text-orange-500",
};

export function MevStats() {
  const { data: stats, isLoading } = useMevStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total MEV Events</p>
          <p className="mt-1 text-2xl font-bold">{stats.totalEvents}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total MEV Profit</p>
          <p className="mt-1 text-2xl font-bold text-red-500">
            {formatUsd(stats.totalProfit)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Last 24h Events</p>
          <p className="mt-1 text-2xl font-bold">{stats.last24hCount}</p>
          <p className="text-xs text-muted-foreground">
            {formatUsd(stats.last24hProfit)} extracted
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Avg Profit / Event</p>
          <p className="mt-1 text-2xl font-bold">{formatUsd(stats.avgProfit)}</p>
        </div>
      </div>

      {stats.byType.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stats.byType.map((t) => (
            <span
              key={t.type}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                TYPE_COLORS[t.type] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {t.type}: {t.count} events ({formatUsd(t.totalProfit)})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
