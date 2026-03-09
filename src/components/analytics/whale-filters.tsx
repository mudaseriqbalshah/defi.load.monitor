"use client";

import type { Chain } from "@prisma/client";

interface WhaleFiltersProps {
  selectedChains: Chain[];
  minValueUsd: number;
  assetFilter: string;
  onChainsChange: (chains: Chain[]) => void;
  onMinValueChange: (val: number) => void;
  onAssetChange: (asset: string) => void;
  onReset: () => void;
}

const CHAINS: { value: Chain; label: string }[] = [
  { value: "ETHEREUM", label: "Ethereum" },
  { value: "ARBITRUM", label: "Arbitrum" },
  { value: "BASE", label: "Base" },
  { value: "BNB", label: "BNB Chain" },
];

const VALUE_PRESETS = [
  { label: "$100K+", value: 100_000 },
  { label: "$500K+", value: 500_000 },
  { label: "$1M+", value: 1_000_000 },
  { label: "$10M+", value: 10_000_000 },
];

export function WhaleFilters({
  selectedChains,
  minValueUsd,
  assetFilter,
  onChainsChange,
  onMinValueChange,
  onAssetChange,
  onReset,
}: WhaleFiltersProps) {
  const toggleChain = (chain: Chain) => {
    onChainsChange(
      selectedChains.includes(chain)
        ? selectedChains.filter((c) => c !== chain)
        : [...selectedChains, chain]
    );
  };

  const hasFilters =
    selectedChains.length > 0 || minValueUsd > 100_000 || assetFilter.length > 0;

  return (
    <div className="space-y-4 rounded-lg border bg-card p-5">
      <div className="flex flex-wrap items-center gap-4">
        {/* Chain toggles */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Chains:</span>
          {CHAINS.map((chain) => (
            <button
              key={chain.value}
              onClick={() => toggleChain(chain.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selectedChains.includes(chain.value)
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {chain.label}
            </button>
          ))}
        </div>

        {/* Value presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Min value:</span>
          {VALUE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onMinValueChange(preset.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                minValueUsd === preset.value
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Asset search */}
        <input
          type="text"
          placeholder="Filter by asset (ETH, USDC, ...)"
          value={assetFilter}
          onChange={(e) => onAssetChange(e.target.value)}
          className="w-48 rounded-md border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        {hasFilters && (
          <button
            onClick={onReset}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}
