"use client";

import { formatUsd, shortenAddress } from "@/lib/utils";
import { ChainBadge } from "@/components/yield/chain-badge";
import { formatDistanceToNow } from "date-fns";

interface WhaleTransactionCardProps {
  txHash: string;
  chain: string;
  fromAddress: string;
  toAddress: string;
  fromLabel: string | null;
  toLabel: string | null;
  asset: string;
  amount: number;
  valueUsd: number;
  timestamp: Date | string;
}

function getExplorerUrl(chain: string, txHash: string): string {
  const explorers: Record<string, string> = {
    ETHEREUM: "https://etherscan.io/tx/",
    ARBITRUM: "https://arbiscan.io/tx/",
    BASE: "https://basescan.org/tx/",
    BNB: "https://bscscan.com/tx/",
  };
  return `${explorers[chain] ?? "https://etherscan.io/tx/"}${txHash}`;
}

function ValueBadge({ valueUsd }: { valueUsd: number }) {
  const tier =
    valueUsd >= 10_000_000
      ? "mega"
      : valueUsd >= 1_000_000
      ? "large"
      : "standard";

  const colors = {
    mega: "bg-red-500/15 text-red-400 border-red-500/30",
    large: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    standard: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${colors[tier]}`}
    >
      {formatUsd(valueUsd)}
    </span>
  );
}

export function WhaleTransactionCard(props: WhaleTransactionCardProps) {
  const {
    txHash,
    chain,
    fromAddress,
    toAddress,
    fromLabel,
    toLabel,
    asset,
    amount,
    valueUsd,
    timestamp,
  } = props;

  const timeAgo = formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
  });

  return (
    <div className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/50">
      {/* Top row: value + chain + time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ValueBadge valueUsd={valueUsd} />
          <ChainBadge chain={chain} />
        </div>
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
      </div>

      {/* Amount */}
      <p className="mt-3 text-lg font-semibold">
        {amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {asset}
      </p>

      {/* From → To */}
      <div className="mt-3 space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xs text-muted-foreground">From</span>
          <span className="font-medium">
            {fromLabel ?? shortenAddress(fromAddress)}
          </span>
          {fromLabel && (
            <span className="text-xs text-muted-foreground">
              ({shortenAddress(fromAddress)})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xs text-muted-foreground">To&nbsp;&nbsp;</span>
          <span className="font-medium">
            {toLabel ?? shortenAddress(toAddress)}
          </span>
          {toLabel && (
            <span className="text-xs text-muted-foreground">
              ({shortenAddress(toAddress)})
            </span>
          )}
        </div>
      </div>

      {/* Tx link */}
      <div className="mt-3">
        <a
          href={getExplorerUrl(chain, txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          View on Explorer →
        </a>
      </div>
    </div>
  );
}
