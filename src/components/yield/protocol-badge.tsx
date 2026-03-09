"use client";

import { cn } from "@/lib/utils";

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

const protocolColors: Record<string, string> = {
  "aave-v3": "bg-violet-500/15 text-violet-400",
  "compound-v3": "bg-green-500/15 text-green-400",
  "yearn-finance": "bg-blue-500/15 text-blue-400",
  "curve-dex": "bg-red-500/15 text-red-400",
  lido: "bg-cyan-500/15 text-cyan-400",
  "rocket-pool": "bg-orange-500/15 text-orange-400",
  "convex-finance": "bg-yellow-500/15 text-yellow-400",
  morpho: "bg-teal-500/15 text-teal-400",
  spark: "bg-amber-500/15 text-amber-400",
};

export function ProtocolBadge({ project }: { project: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        protocolColors[project] ?? "bg-muted text-muted-foreground"
      )}
    >
      {protocolLabels[project] ?? project}
    </span>
  );
}
