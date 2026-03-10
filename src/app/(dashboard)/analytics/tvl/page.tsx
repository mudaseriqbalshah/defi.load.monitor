"use client";

import { useState } from "react";
import { TvlOverview } from "@/components/analytics/tvl-overview";
import { TvlTable } from "@/components/analytics/tvl-table";
import type { Chain } from "@prisma/client";

const CHAINS = [
  { value: "", label: "All Chains" },
  { value: "ETHEREUM", label: "Ethereum" },
  { value: "ARBITRUM", label: "Arbitrum" },
  { value: "BASE", label: "Base" },
  { value: "BNB", label: "BNB" },
];

export default function TvlPage() {
  const [chain, setChain] = useState("");
  const [protocol, setProtocol] = useState("");
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch("/api/analytics/tvl?mode=sync");
      window.location.reload();
    } catch {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">TVL Flows</h1>
          <p className="text-muted-foreground">
            Track protocol TVL across chains with 24h change indicators.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync TVL Data"}
        </button>
      </div>

      <TvlOverview />

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
        <input
          type="text"
          value={protocol}
          onChange={(e) => setProtocol(e.target.value)}
          placeholder="Search protocol..."
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <TvlTable
        chain={(chain || undefined) as Chain | undefined}
        protocol={protocol || undefined}
      />
    </div>
  );
}
