"use client";

import { useState } from "react";
import { MevStats } from "@/components/analytics/mev-stats";
import { MevFeed } from "@/components/analytics/mev-feed";
import type { Chain } from "@prisma/client";

const CHAINS = [
  { value: "", label: "All Chains" },
  { value: "ETHEREUM", label: "Ethereum" },
  { value: "ARBITRUM", label: "Arbitrum" },
  { value: "BASE", label: "Base" },
];

const MEV_TYPES = [
  { value: "", label: "All Types" },
  { value: "sandwich", label: "Sandwich" },
  { value: "arbitrage", label: "Arbitrage" },
  { value: "liquidation", label: "Liquidation" },
];

export default function MevPage() {
  const [chain, setChain] = useState("");
  const [type, setType] = useState("");
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch("/api/analytics/mev?mode=sync");
      window.location.reload();
    } catch {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">MEV Analyzer</h1>
          <p className="text-muted-foreground">
            Track sandwich attacks, arbitrage, and liquidation MEV on Ethereum.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync MEV Data"}
        </button>
      </div>

      <MevStats />

      <div className="flex flex-wrap gap-3">
        <select
          value={chain}
          onChange={(e) => setChain(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          {CHAINS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          {MEV_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <MevFeed
        chain={(chain || undefined) as Chain | undefined}
        type={type || undefined}
      />
    </div>
  );
}
