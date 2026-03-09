"use client";

interface YieldFiltersProps {
  chains: string[];
  projects: string[];
  selectedChains: string[];
  selectedProjects: string[];
  stablecoinsOnly: boolean;
  searchQuery: string;
  sortBy: string;
  sortOrder: string;
  onChainsChange: (chains: string[]) => void;
  onProjectsChange: (projects: string[]) => void;
  onStablecoinsOnlyChange: (val: boolean) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onReset: () => void;
}

const protocolLabels: Record<string, string> = {
  "aave-v3": "Aave V3",
  "compound-v3": "Compound V3",
  "yearn-finance": "Yearn",
  "curve-dex": "Curve",
  lido: "Lido",
  "rocket-pool": "Rocket Pool",
  "convex-finance": "Convex",
  morpho: "Morpho",
  spark: "Spark",
};

export function YieldFilters({
  chains,
  projects,
  selectedChains,
  selectedProjects,
  stablecoinsOnly,
  searchQuery,
  sortBy,
  sortOrder,
  onChainsChange,
  onProjectsChange,
  onStablecoinsOnlyChange,
  onSearchChange,
  onSortChange,
  onReset,
}: YieldFiltersProps) {
  const toggleChain = (chain: string) => {
    onChainsChange(
      selectedChains.includes(chain)
        ? selectedChains.filter((c) => c !== chain)
        : [...selectedChains, chain]
    );
  };

  const toggleProject = (project: string) => {
    onProjectsChange(
      selectedProjects.includes(project)
        ? selectedProjects.filter((p) => p !== project)
        : [...selectedProjects, project]
    );
  };

  const hasFilters =
    selectedChains.length > 0 ||
    selectedProjects.length > 0 ||
    stablecoinsOnly ||
    searchQuery.length > 0;

  return (
    <div className="space-y-4 rounded-lg border bg-card p-5">
      {/* Search */}
      <input
        type="text"
        placeholder="Search by token, protocol, or chain..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full rounded-md border bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {/* Chain filter */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Chains</p>
        <div className="flex flex-wrap gap-2">
          {chains.map((chain) => (
            <button
              key={chain}
              onClick={() => toggleChain(chain)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selectedChains.includes(chain)
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {chain}
            </button>
          ))}
        </div>
      </div>

      {/* Protocol filter */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Protocols
        </p>
        <div className="flex flex-wrap gap-2">
          {projects.map((project) => (
            <button
              key={project}
              onClick={() => toggleProject(project)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selectedProjects.includes(project)
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {protocolLabels[project] ?? project}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom row: stablecoins toggle, sort, reset */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={stablecoinsOnly}
            onChange={(e) => onStablecoinsOnlyChange(e.target.checked)}
            className="rounded border"
          />
          Stablecoins only
        </label>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort by:</span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split("-");
              onSortChange(sb, so);
            }}
            className="rounded-md border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="apy-desc">APY (High to Low)</option>
            <option value="apy-asc">APY (Low to High)</option>
            <option value="tvl-desc">TVL (High to Low)</option>
            <option value="tvl-asc">TVL (Low to High)</option>
            <option value="apyBase-desc">Base APY (High to Low)</option>
            <option value="apyReward-desc">Reward APY (High to Low)</option>
          </select>
        </div>

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
