"use client";

import { useMevFeed } from "@/lib/hooks/use-analytics";
import { formatUsd, shortenAddress } from "@/lib/utils";
import type { Chain } from "@prisma/client";

const TYPE_BADGES: Record<string, { label: string; class: string }> = {
  sandwich: { label: "Sandwich", class: "bg-red-500/10 text-red-500" },
  arbitrage: { label: "Arbitrage", class: "bg-blue-500/10 text-blue-500" },
  liquidation: {
    label: "Liquidation",
    class: "bg-orange-500/10 text-orange-500",
  },
};

interface MevFeedProps {
  chain?: Chain;
  type?: string;
}

export function MevFeed({ chain, type }: MevFeedProps) {
  const { data, isLoading } = useMevFeed({ chain, type, limit: 50 });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!data?.events.length) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        No MEV events recorded yet. Sync data to populate this feed.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Chain</th>
              <th className="px-4 py-3 text-right">Profit</th>
              <th className="px-4 py-3">Bot</th>
              <th className="px-4 py-3">Victim</th>
              <th className="px-4 py-3">Block</th>
              <th className="px-4 py-3">Tx</th>
            </tr>
          </thead>
          <tbody>
            {data.events.map((event) => {
              const badge = TYPE_BADGES[event.type] ?? {
                label: event.type,
                class: "bg-muted text-muted-foreground",
              };
              return (
                <tr key={event.id} className="border-b last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${badge.class}`}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">{event.chain}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-red-500">
                    {formatUsd(event.profitUsd)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {event.botAddress
                      ? shortenAddress(event.botAddress)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {event.victimAddress
                      ? shortenAddress(event.victimAddress)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {event.blockNumber.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {shortenAddress(event.txHash)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {data.total > data.events.length && (
        <div className="border-t px-4 py-3 text-center text-sm text-muted-foreground">
          Showing {data.events.length} of {data.total} events
        </div>
      )}
    </div>
  );
}
