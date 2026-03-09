"use client";

const CHAINS = [
  { value: "", label: "All Chains" },
  { value: "ETHEREUM", label: "Ethereum" },
  { value: "ARBITRUM", label: "Arbitrum" },
  { value: "BASE", label: "Base" },
  { value: "SOLANA", label: "Solana" },
  { value: "BNB", label: "BNB" },
];

const STATUSES = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

const TRADE_TYPES = [
  { value: "", label: "All Types" },
  { value: "LONG", label: "Long" },
  { value: "SHORT", label: "Short" },
  { value: "SWAP", label: "Swap" },
  { value: "PROVIDE_LIQUIDITY", label: "Add LP" },
  { value: "REMOVE_LIQUIDITY", label: "Remove LP" },
];

interface TradeFiltersProps {
  chain: string;
  status: string;
  tradeType: string;
  tokenSearch: string;
  onChainChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onTradeTypeChange: (v: string) => void;
  onTokenSearchChange: (v: string) => void;
}

export function TradeFilters({
  chain,
  status,
  tradeType,
  tokenSearch,
  onChainChange,
  onStatusChange,
  onTradeTypeChange,
  onTokenSearchChange,
}: TradeFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={chain}
        onChange={(e) => onChainChange(e.target.value)}
        className="rounded-md border bg-background px-3 py-2 text-sm"
      >
        {CHAINS.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      <select
        value={tradeType}
        onChange={(e) => onTradeTypeChange(e.target.value)}
        className="rounded-md border bg-background px-3 py-2 text-sm"
      >
        {TRADE_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <div className="flex rounded-md border">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => onStatusChange(s.value)}
            className={`px-3 py-2 text-sm ${
              status === s.value
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={tokenSearch}
        onChange={(e) => onTokenSearchChange(e.target.value)}
        placeholder="Search tokens..."
        className="rounded-md border bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}
