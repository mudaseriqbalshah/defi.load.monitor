"use client";

import { useTvlOverview } from "@/lib/hooks/use-analytics";
import { formatUsd, formatPercent } from "@/lib/utils";

export function TvlOverview() {
  const { data, isLoading } = useTvlOverview();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total TVL</p>
          <p className="mt-1 text-2xl font-bold">{formatUsd(data.totalTvl)}</p>
          <p
            className={`text-xs ${
              data.change24h >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {data.change24h >= 0 ? "+" : ""}
            {formatPercent(data.change24h)} (24h)
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Protocols Tracked</p>
          <p className="mt-1 text-2xl font-bold">{data.protocolCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Chains</p>
          <p className="mt-1 text-2xl font-bold">{data.byChain.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Top Protocol</p>
          {data.topProtocols[0] && (
            <>
              <p className="mt-1 text-lg font-bold">
                {data.topProtocols[0].protocol}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatUsd(data.topProtocols[0].tvlUsd)}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Chain breakdown */}
      {data.byChain.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 font-semibold">TVL by Chain</h3>
          <div className="space-y-2">
            {data.byChain.map((c) => {
              const pct = data.totalTvl > 0 ? (c.tvlUsd / data.totalTvl) * 100 : 0;
              return (
                <div key={c.chain}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.chain}</span>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs ${
                          c.change24h >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {c.change24h >= 0 ? "+" : ""}
                        {formatPercent(c.change24h)}
                      </span>
                      <span className="font-mono">{formatUsd(c.tvlUsd)}</span>
                    </div>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
