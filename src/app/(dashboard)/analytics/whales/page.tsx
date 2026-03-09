"use client";

import { useState } from "react";
import { useWhaleFeed, useWhaleStats } from "@/lib/hooks/use-whales";
import { WhaleTransactionCard } from "@/components/analytics/whale-transaction-card";
import { WhaleStats } from "@/components/analytics/whale-stats";
import { WhaleFilters } from "@/components/analytics/whale-filters";
import type { Chain } from "@prisma/client";

export default function WhaleTrackerPage() {
  const [selectedChains, setSelectedChains] = useState<Chain[]>([]);
  const [minValueUsd, setMinValueUsd] = useState(100_000);
  const [assetFilter, setAssetFilter] = useState("");

  const {
    data: feedData,
    isLoading: feedLoading,
    error: feedError,
  } = useWhaleFeed({
    chains: selectedChains.length > 0 ? selectedChains : undefined,
    minValueUsd,
    asset: assetFilter || undefined,
    limit: 50,
  });

  const { data: statsData, isLoading: statsLoading } = useWhaleStats(24);

  const resetFilters = () => {
    setSelectedChains([]);
    setMinValueUsd(100_000);
    setAssetFilter("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Whale Tracker</h1>
        <p className="text-muted-foreground">
          Monitor large transfers (&gt;$100K) across Ethereum and Arbitrum in
          real-time. Powered by Alchemy webhooks with labeled addresses.
        </p>
      </div>

      {/* Stats */}
      {statsLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[76px] animate-pulse rounded-lg border bg-muted"
            />
          ))}
        </div>
      )}
      {statsData && <WhaleStats {...statsData} />}

      {/* Filters */}
      <WhaleFilters
        selectedChains={selectedChains}
        minValueUsd={minValueUsd}
        assetFilter={assetFilter}
        onChainsChange={setSelectedChains}
        onMinValueChange={setMinValueUsd}
        onAssetChange={setAssetFilter}
        onReset={resetFilters}
      />

      {/* Error */}
      {feedError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          {feedError.message}
        </div>
      )}

      {/* Feed */}
      {feedLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-lg border bg-muted"
            />
          ))}
        </div>
      )}

      {feedData && feedData.transactions.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Live Feed ({feedData.total} total)
            </h2>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Auto-refreshing
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {feedData.transactions.map((tx) => (
              <WhaleTransactionCard
                key={tx.txHash}
                txHash={tx.txHash}
                chain={tx.chain}
                fromAddress={tx.fromAddress}
                toAddress={tx.toAddress}
                fromLabel={tx.fromLabel}
                toLabel={tx.toLabel}
                asset={tx.asset}
                amount={tx.amount}
                valueUsd={tx.valueUsd}
                timestamp={tx.timestamp}
              />
            ))}
          </div>
        </div>
      )}

      {feedData && feedData.transactions.length === 0 && !feedLoading && (
        <div className="rounded-lg border bg-card p-8 text-center">
          <h3 className="text-lg font-semibold">No Whale Transactions Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Whale transactions will appear here once the Alchemy webhook is
            configured. Transfers over $100K on Ethereum and Arbitrum are
            automatically tracked.
          </p>
          <div className="mt-4 grid gap-3 text-left text-sm md:grid-cols-3">
            <div className="rounded-md bg-muted p-3">
              <p className="font-medium">1. Configure Webhook</p>
              <p className="text-muted-foreground">
                Set up an Alchemy Address Activity webhook pointing to
                /api/webhooks/alchemy
              </p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="font-medium">2. Auto-Tracking</p>
              <p className="text-muted-foreground">
                Transfers &gt;$100K are stored with labeled addresses
              </p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="font-medium">3. Telegram Alerts</p>
              <p className="text-muted-foreground">
                Get notified instantly via Telegram for whale movements
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
