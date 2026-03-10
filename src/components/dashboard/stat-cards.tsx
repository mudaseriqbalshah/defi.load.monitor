"use client";

import { formatUsd } from "@/lib/utils";
import type { DashboardData } from "@/lib/hooks/use-dashboard";

interface StatCardsProps {
  stats: DashboardData["stats"];
  tier: string;
}

export function StatCards({ stats, tier }: StatCardsProps) {
  const cards = [
    {
      label: "Trading PnL",
      value: formatUsd(stats.totalPnl),
      sub: `${stats.totalTrades} trades (${stats.openTrades} open)`,
      color: stats.totalPnl >= 0 ? "text-green-500" : "text-red-500",
    },
    {
      label: "Whale Alerts (24h)",
      value: stats.whaleAlerts24h.toString(),
      sub: "large transfers detected",
    },
    {
      label: "MEV Activity (24h)",
      value: stats.mevEvents24h.toString(),
      sub: `${formatUsd(stats.mevProfit24h)} extracted`,
      color: "text-orange-500",
    },
    {
      label: "Active Alerts",
      value: stats.activeAlerts.toString(),
      sub: `Plan: ${tier}`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <p className={`mt-1 text-2xl font-bold ${card.color ?? ""}`}>
            {card.value}
          </p>
          {card.sub && (
            <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}
