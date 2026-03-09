"use client";

import { getHealthFactorLevel } from "@/lib/utils";

interface HealthFactorGaugeProps {
  value: number;
}

const colorMap = {
  safe: "#10b981",
  warning: "#eab308",
  danger: "#f97316",
  critical: "#ef4444",
};

export function HealthFactorGauge({ value }: HealthFactorGaugeProps) {
  const level = getHealthFactorLevel(value);
  const color = colorMap[level];

  // Clamp gauge percentage between 0 and 100
  // HF of 0 = 0%, HF of 3+ = 100%
  const clampedValue = Math.min(Math.max(value, 0), 3);
  const percent = (clampedValue / 3) * 100;

  const displayValue =
    value === Infinity || value > 100 ? "∞" : value.toFixed(2);

  const labels: Record<string, string> = {
    safe: "Healthy",
    warning: "Caution",
    danger: "At Risk",
    critical: "Liquidation Risk",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-3xl font-bold" style={{ color }}>
            {displayValue}
          </span>
          <span className="ml-2 text-sm text-muted-foreground">
            Health Factor
          </span>
        </div>
        <span className="text-sm font-medium" style={{ color }}>
          {labels[level]}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Liquidation (1.0)</span>
        <span>Warning (1.5)</span>
        <span>Safe (2.0+)</span>
      </div>
    </div>
  );
}
