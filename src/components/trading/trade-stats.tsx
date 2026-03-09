"use client";

import { useTradeStats } from "@/lib/hooks/use-trades";
import { formatUsd, formatPercent } from "@/lib/utils";

export function TradeStats() {
  const { data: stats, isLoading } = useTradeStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: "Total Trades",
      value: stats.totalTrades.toString(),
      sub: `${stats.openTrades} open, ${stats.closedTrades} closed`,
    },
    {
      label: "Total PnL",
      value: formatUsd(stats.totalPnl),
      sub: stats.totalPnl >= 0 ? "profit" : "loss",
      color: stats.totalPnl >= 0 ? "text-green-500" : "text-red-500",
    },
    {
      label: "Win Rate",
      value: formatPercent(stats.winRate),
      sub: `of ${stats.closedTrades} closed trades`,
    },
    {
      label: "Avg PnL %",
      value: formatPercent(stats.avgPnlPercent),
      sub: "per closed trade",
      color: stats.avgPnlPercent >= 0 ? "text-green-500" : "text-red-500",
    },
    {
      label: "Best Trade",
      value: formatUsd(stats.bestTrade),
      color: "text-green-500",
    },
    {
      label: "Worst Trade",
      value: formatUsd(stats.worstTrade),
      color: "text-red-500",
    },
    {
      label: "Total Volume",
      value: formatUsd(stats.totalVolumeIn),
      sub: "amount invested",
    },
    {
      label: "Profit Factor",
      value:
        stats.profitFactor === Infinity
          ? "∞"
          : stats.profitFactor.toFixed(2),
      sub: "> 1.0 is profitable",
      color: stats.profitFactor >= 1 ? "text-green-500" : "text-red-500",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border bg-card p-4">
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
