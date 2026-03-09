"use client";

import { cn } from "@/lib/utils";
import { getHealthFactorLevel } from "@/lib/utils";

interface HealthFactorBadgeProps {
  value: number;
  size?: "sm" | "md" | "lg";
}

const colorMap = {
  safe: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  warning: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  danger: "bg-orange-500/15 text-orange-500 border-orange-500/30",
  critical: "bg-red-500/15 text-red-500 border-red-500/30",
};

const sizeMap = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

export function HealthFactorBadge({
  value,
  size = "md",
}: HealthFactorBadgeProps) {
  const level = getHealthFactorLevel(value);
  const displayValue =
    value === Infinity || value > 100 ? "Safe" : value.toFixed(2);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        colorMap[level],
        sizeMap[size]
      )}
    >
      {displayValue}
    </span>
  );
}
