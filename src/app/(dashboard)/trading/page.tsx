"use client";

import { useMemo, useState } from "react";
import { useTrades } from "@/lib/hooks/use-trades";
import { TradeForm } from "@/components/trading/trade-form";
import { TradeTable } from "@/components/trading/trade-table";
import { TradeStats } from "@/components/trading/trade-stats";
import { TradeFilters } from "@/components/trading/trade-filters";
import type { TradeFilters as TradeFiltersType } from "@/lib/services/trading";
import type { Chain, TradeType } from "@prisma/client";

export default function TradingPage() {
  const [chain, setChain] = useState("");
  const [status, setStatus] = useState("all");
  const [tradeType, setTradeType] = useState("");
  const [tokenSearch, setTokenSearch] = useState("");

  const filters: TradeFiltersType = useMemo(
    () => ({
      chain: (chain || undefined) as Chain | undefined,
      tradeType: (tradeType || undefined) as TradeType | undefined,
      status: status as "open" | "closed" | "all",
      tokenSearch: tokenSearch || undefined,
      limit: 50,
    }),
    [chain, status, tradeType, tokenSearch]
  );

  const { data, isLoading } = useTrades(filters);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trading Analytics</h1>
          <p className="text-muted-foreground">
            Track your trades, analyze PnL, and improve your strategy.
          </p>
        </div>
        <TradeForm />
      </div>

      {/* Performance Stats */}
      <TradeStats />

      {/* Filters */}
      <TradeFilters
        chain={chain}
        status={status}
        tradeType={tradeType}
        tokenSearch={tokenSearch}
        onChainChange={setChain}
        onStatusChange={setStatus}
        onTradeTypeChange={setTradeType}
        onTokenSearchChange={setTokenSearch}
      />

      {/* Trade History */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <TradeTable
          trades={data?.trades ?? []}
          total={data?.total ?? 0}
        />
      )}
    </div>
  );
}
