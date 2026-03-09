"use client";

import { formatUsd } from "@/lib/utils";

interface AccountSummaryProps {
  totalCollateralUsd: number;
  totalDebtUsd: number;
  netWorthUsd: number;
  positionCount: number;
}

export function AccountSummary({
  totalCollateralUsd,
  totalDebtUsd,
  netWorthUsd,
  positionCount,
}: AccountSummaryProps) {
  const stats = [
    { label: "Total Collateral", value: formatUsd(totalCollateralUsd) },
    { label: "Total Debt", value: formatUsd(totalDebtUsd) },
    {
      label: "Net Worth",
      value: formatUsd(netWorthUsd),
      highlight: netWorthUsd >= 0,
    },
    { label: "Active Positions", value: positionCount.toString() },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">{stat.label}</p>
          <p
            className={`mt-1 text-2xl font-bold ${
              stat.highlight !== undefined
                ? stat.highlight
                  ? "text-emerald-500"
                  : "text-red-500"
                : ""
            }`}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
