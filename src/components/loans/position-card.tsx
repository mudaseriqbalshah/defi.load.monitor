"use client";

import type { LoanPosition } from "@/types";
import { formatUsd, formatPercent } from "@/lib/utils";
import { HealthFactorBadge } from "./health-factor-badge";

interface PositionCardProps {
  position: LoanPosition;
}

const protocolLabels: Record<string, string> = {
  AAVE_V3: "Aave V3",
  COMPOUND_V3: "Compound V3",
};

const chainLabels: Record<string, string> = {
  ETHEREUM: "Ethereum",
  ARBITRUM: "Arbitrum",
  BASE: "Base",
};

export function PositionCard({ position }: PositionCardProps) {
  const {
    protocol,
    chain,
    asset,
    supplyAmount,
    borrowAmount,
    supplyValueUsd,
    borrowValueUsd,
    healthFactor,
    liquidationPrice,
    apy,
  } = position;

  return (
    <div className="rounded-lg border bg-card p-5 transition-colors hover:border-primary/50">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{asset}</h3>
          <p className="text-xs text-muted-foreground">
            {protocolLabels[protocol] ?? protocol} · {chainLabels[chain] ?? chain}
          </p>
        </div>
        <HealthFactorBadge value={healthFactor} size="sm" />
      </div>

      {/* Stats grid */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Supplied</p>
          <p className="text-sm font-medium">
            {supplyAmount.toFixed(4)} {asset}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatUsd(supplyValueUsd)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Borrowed</p>
          <p className="text-sm font-medium">
            {borrowAmount.toFixed(4)} {asset}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatUsd(borrowValueUsd)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Borrow APY</p>
          <p className="text-sm font-medium">{formatPercent(apy)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Liquidation Price</p>
          <p className="text-sm font-medium">
            {liquidationPrice ? formatUsd(liquidationPrice) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
