"use client";

import { useState } from "react";
import { useLoans } from "@/lib/hooks/use-loans";
import { WalletInput } from "@/components/loans/wallet-input";
import { AccountSummary } from "@/components/loans/account-summary";
import { HealthFactorGauge } from "@/components/loans/health-factor-gauge";
import { PositionCard } from "@/components/loans/position-card";

export default function LoansPage() {
  const [walletAddress, setWalletAddress] = useState<string>();
  const { data, isLoading, error } = useLoans(walletAddress);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Loan Health Monitor</h1>
        <p className="text-muted-foreground">
          Track borrow positions and liquidation risk across Aave V3 and
          Compound V3 on Ethereum and Arbitrum.
        </p>
      </div>

      {/* Wallet input */}
      <WalletInput
        onSubmit={setWalletAddress}
        defaultValue={walletAddress}
        isLoading={isLoading}
      />

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          {error.message}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg border bg-muted"
              />
            ))}
          </div>
          <div className="h-20 animate-pulse rounded-lg border bg-muted" />
        </div>
      )}

      {/* Results */}
      {data && !isLoading && (
        <>
          {/* Account summary cards */}
          <AccountSummary
            totalCollateralUsd={data.totalCollateralUsd}
            totalDebtUsd={data.totalDebtUsd}
            netWorthUsd={data.netWorthUsd}
            positionCount={data.positions.length}
          />

          {/* Health factor gauge */}
          {data.overallHealthFactor > 0 && (
            <div className="rounded-lg border bg-card p-6">
              <HealthFactorGauge value={data.overallHealthFactor} />
            </div>
          )}

          {/* Position cards */}
          {data.positions.length > 0 ? (
            <div>
              <h2 className="mb-4 text-xl font-semibold">
                Active Positions ({data.positions.length})
              </h2>

              {/* Protocol tags */}
              <div className="mb-4 flex gap-2">
                {data.byProtocol.aave.positions.length > 0 && (
                  <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-500">
                    Aave V3: {data.byProtocol.aave.positions.length} positions
                  </span>
                )}
                {data.byProtocol.compound.positions.length > 0 && (
                  <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-500">
                    Compound V3: {data.byProtocol.compound.positions.length}{" "}
                    positions
                  </span>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.positions.map((position, i) => (
                  <PositionCard
                    key={`${position.protocol}-${position.chain}-${position.asset}-${i}`}
                    position={position}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                No active borrow positions found for this wallet.
              </p>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!walletAddress && !isLoading && (
        <div className="rounded-lg border bg-card p-8 text-center">
          <h3 className="text-lg font-semibold">Get Started</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter a wallet address above to monitor loan health across Aave V3
            and Compound V3. You&apos;ll see health factors, liquidation prices,
            and can set up alerts.
          </p>
          <div className="mt-4 grid gap-3 text-left text-sm md:grid-cols-3">
            <div className="rounded-md bg-muted p-3">
              <p className="font-medium">Multi-Protocol</p>
              <p className="text-muted-foreground">
                Aave V3 + Compound V3 positions in one view
              </p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="font-medium">Multi-Chain</p>
              <p className="text-muted-foreground">
                Ethereum and Arbitrum support
              </p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="font-medium">Alerts</p>
              <p className="text-muted-foreground">
                Telegram + email when health factor drops
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
