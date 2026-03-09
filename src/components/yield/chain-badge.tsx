"use client";

import { cn } from "@/lib/utils";

const chainColors: Record<string, string> = {
  Ethereum: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Arbitrum: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  Base: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  BSC: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Solana: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

export function ChainBadge({ chain }: { chain: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        chainColors[chain] ?? "bg-muted text-muted-foreground border-border"
      )}
    >
      {chain}
    </span>
  );
}
