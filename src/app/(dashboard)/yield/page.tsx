"use client";

import { useState, useMemo } from "react";
import { useYields } from "@/lib/hooks/use-yields";
import { YieldTable } from "@/components/yield/yield-table";
import { YieldFilters } from "@/components/yield/yield-filters";
import { YieldStatsBar } from "@/components/yield/yield-stats";
import type { YieldFilters as YieldFiltersType } from "@/lib/services/yields/defillama";

const ALL_CHAINS = ["Ethereum", "Arbitrum", "Base", "BSC", "Solana"];
const ALL_PROJECTS = [
  "aave-v3",
  "compound-v3",
  "yearn-finance",
  "curve-dex",
  "lido",
  "rocket-pool",
  "convex-finance",
  "morpho",
  "spark",
];

export default function YieldPage() {
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [stablecoinsOnly, setStablecoinsOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("apy");
  const [sortOrder, setSortOrder] = useState("desc");

  const filters = useMemo<YieldFiltersType>(() => {
    const f: YieldFiltersType = {};
    if (selectedChains.length) f.chains = selectedChains;
    if (selectedProjects.length) f.projects = selectedProjects;
    if (stablecoinsOnly) f.stablecoinsOnly = true;
    if (searchQuery) f.search = searchQuery;
    f.sortBy = sortBy as YieldFiltersType["sortBy"];
    f.sortOrder = sortOrder as YieldFiltersType["sortOrder"];
    return f;
  }, [selectedChains, selectedProjects, stablecoinsOnly, searchQuery, sortBy, sortOrder]);

  const { data, isLoading, error } = useYields(filters);

  const resetFilters = () => {
    setSelectedChains([]);
    setSelectedProjects([]);
    setStablecoinsOnly(false);
    setSearchQuery("");
    setSortBy("apy");
    setSortOrder("desc");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Yield Dashboard</h1>
        <p className="text-muted-foreground">
          Compare real-time APYs across Aave, Compound, Yearn, Curve, Lido, and
          more — filtered by chain, protocol, and risk level.
        </p>
      </div>

      {/* Stats bar */}
      {data?.stats && <YieldStatsBar stats={data.stats} />}

      {/* Loading stats skeleton */}
      {isLoading && !data && (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-lg border bg-muted"
            />
          ))}
        </div>
      )}

      {/* Filters */}
      <YieldFilters
        chains={ALL_CHAINS}
        projects={ALL_PROJECTS}
        selectedChains={selectedChains}
        selectedProjects={selectedProjects}
        stablecoinsOnly={stablecoinsOnly}
        searchQuery={searchQuery}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onChainsChange={setSelectedChains}
        onProjectsChange={setSelectedProjects}
        onStablecoinsOnlyChange={setStablecoinsOnly}
        onSearchChange={setSearchQuery}
        onSortChange={(sb, so) => {
          setSortBy(sb);
          setSortOrder(so);
        }}
        onReset={resetFilters}
      />

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          {error.message}
        </div>
      )}

      {/* Loading table skeleton */}
      {isLoading && !data && (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-lg border bg-muted"
            />
          ))}
        </div>
      )}

      {/* Results table */}
      {data && <YieldTable pools={data.pools} />}

      {/* Pool count */}
      {data && (
        <p className="text-xs text-muted-foreground">
          Showing {data.pools.length} pools · Data from DefiLlama · Updates
          every 5 minutes
        </p>
      )}
    </div>
  );
}
