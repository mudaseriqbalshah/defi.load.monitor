"use client";

import { useState } from "react";
import { useCreateTrade } from "@/lib/hooks/use-trades";

const CHAINS = ["ETHEREUM", "ARBITRUM", "BASE", "SOLANA", "BNB"] as const;
const TRADE_TYPES = [
  { value: "LONG", label: "Long" },
  { value: "SHORT", label: "Short" },
  { value: "SWAP", label: "Swap" },
  { value: "PROVIDE_LIQUIDITY", label: "Add Liquidity" },
  { value: "REMOVE_LIQUIDITY", label: "Remove Liquidity" },
] as const;

interface TradeFormProps {
  onSuccess?: () => void;
}

export function TradeForm({ onSuccess }: TradeFormProps) {
  const [open, setOpen] = useState(false);
  const createTrade = useCreateTrade();

  const [form, setForm] = useState({
    chain: "ETHEREUM",
    protocol: "",
    tradeType: "SWAP",
    tokenIn: "",
    tokenOut: "",
    amountIn: "",
    amountOut: "",
    priceAtEntry: "",
    txHash: "",
    notes: "",
    tags: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTrade.mutateAsync({
        chain: form.chain,
        protocol: form.protocol,
        tradeType: form.tradeType,
        tokenIn: form.tokenIn.toUpperCase(),
        tokenOut: form.tokenOut.toUpperCase(),
        amountIn: parseFloat(form.amountIn),
        amountOut: parseFloat(form.amountOut),
        priceAtEntry: parseFloat(form.priceAtEntry),
        txHash: form.txHash || undefined,
        notes: form.notes || undefined,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim())
          : undefined,
      });
      setForm({
        chain: "ETHEREUM",
        protocol: "",
        tradeType: "SWAP",
        tokenIn: "",
        tokenOut: "",
        amountIn: "",
        amountOut: "",
        priceAtEntry: "",
        txHash: "",
        notes: "",
        tags: "",
      });
      setOpen(false);
      onSuccess?.();
    } catch {
      // error is shown via mutation state
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        + New Trade
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border bg-card p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Log New Trade</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          &#10005;
        </button>
      </div>

      {createTrade.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {createTrade.error.message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Chain */}
        <div>
          <label className="mb-1 block text-sm font-medium">Chain</label>
          <select
            value={form.chain}
            onChange={(e) => setForm({ ...form, chain: e.target.value })}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {CHAINS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Protocol */}
        <div>
          <label className="mb-1 block text-sm font-medium">Protocol</label>
          <input
            type="text"
            value={form.protocol}
            onChange={(e) => setForm({ ...form, protocol: e.target.value })}
            placeholder="e.g. Uniswap V3"
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Trade Type */}
        <div>
          <label className="mb-1 block text-sm font-medium">Type</label>
          <select
            value={form.tradeType}
            onChange={(e) => setForm({ ...form, tradeType: e.target.value })}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {TRADE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Token In */}
        <div>
          <label className="mb-1 block text-sm font-medium">Token In</label>
          <input
            type="text"
            value={form.tokenIn}
            onChange={(e) => setForm({ ...form, tokenIn: e.target.value })}
            placeholder="ETH"
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Token Out */}
        <div>
          <label className="mb-1 block text-sm font-medium">Token Out</label>
          <input
            type="text"
            value={form.tokenOut}
            onChange={(e) => setForm({ ...form, tokenOut: e.target.value })}
            placeholder="USDC"
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Amount In */}
        <div>
          <label className="mb-1 block text-sm font-medium">Amount In</label>
          <input
            type="number"
            step="any"
            value={form.amountIn}
            onChange={(e) => setForm({ ...form, amountIn: e.target.value })}
            placeholder="1.0"
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Amount Out */}
        <div>
          <label className="mb-1 block text-sm font-medium">Amount Out</label>
          <input
            type="number"
            step="any"
            value={form.amountOut}
            onChange={(e) => setForm({ ...form, amountOut: e.target.value })}
            placeholder="3200.00"
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Price at Entry */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Entry Price ($)
          </label>
          <input
            type="number"
            step="any"
            value={form.priceAtEntry}
            onChange={(e) =>
              setForm({ ...form, priceAtEntry: e.target.value })
            }
            placeholder="3200.00"
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Tx Hash */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Tx Hash (optional)
          </label>
          <input
            type="text"
            value={form.txHash}
            onChange={(e) => setForm({ ...form, txHash: e.target.value })}
            placeholder="0x..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Notes (optional)
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
          placeholder="Trade rationale, setup..."
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Tags (comma-separated, optional)
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          placeholder="breakout, high-conviction"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createTrade.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {createTrade.isPending ? "Saving..." : "Save Trade"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
