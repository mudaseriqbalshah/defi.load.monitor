"use client";

import Link from "next/link";
import { formatUsd } from "@/lib/utils";
import type { DashboardData } from "@/lib/hooks/use-dashboard";

interface RecentWhalesProps {
  whales: DashboardData["recentWhales"];
}

function valueTierClass(usd: number): string {
  if (usd >= 10_000_000) return "text-red-500";
  if (usd >= 1_000_000) return "text-orange-500";
  return "text-yellow-500";
}

export function RecentWhales({ whales }: RecentWhalesProps) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Whale Activity</h3>
        <Link
          href="/analytics/whales"
          className="text-sm text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      {whales.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No whale transfers detected yet.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {whales.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  {tx.chain}
                </span>
                <span className="text-sm">
                  {tx.fromLabel ?? "Unknown"} → {tx.toLabel ?? "Unknown"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-mono font-medium ${valueTierClass(
                    tx.valueUsd
                  )}`}
                >
                  {formatUsd(tx.valueUsd)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {tx.asset}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
