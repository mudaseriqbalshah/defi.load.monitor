"use client";

import { useState } from "react";
import type { SubscriptionTier } from "@prisma/client";
import { TIER_LIMITS } from "@/types";

const PLANS: {
  tier: Exclude<SubscriptionTier, "FREE">;
  name: string;
  price: number;
  description: string;
  highlight?: boolean;
}[] = [
  {
    tier: "PRO",
    name: "Pro",
    price: 29,
    description: "For active DeFi users",
  },
  {
    tier: "ANALYST",
    name: "Analyst",
    price: 59,
    description: "For serious researchers",
    highlight: true,
  },
  {
    tier: "WHALE",
    name: "Whale",
    price: 99,
    description: "For power users & funds",
  },
];

const FEATURE_LABELS: { key: keyof typeof TIER_LIMITS.FREE; label: string }[] =
  [
    { key: "realTimeData", label: "Real-time data" },
    { key: "yieldDashboard", label: "Yield dashboard" },
    { key: "tradingAnalytics", label: "Trading analytics" },
    { key: "onChainAnalytics", label: "On-chain analytics" },
    { key: "whaleTracking", label: "Whale tracking" },
    { key: "mevAnalyzer", label: "MEV analyzer" },
    { key: "apiAccess", label: "API access" },
  ];

interface PricingCardProps {
  currentTier: SubscriptionTier;
  onSelectStripe: (tier: Exclude<SubscriptionTier, "FREE">) => void;
  onSelectUsdc: (tier: Exclude<SubscriptionTier, "FREE">) => void;
  loading?: boolean;
}

export function PricingCards({
  currentTier,
  onSelectStripe,
  onSelectUsdc,
  loading,
}: PricingCardProps) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleStripe = async (tier: Exclude<SubscriptionTier, "FREE">) => {
    setLoadingTier(`stripe-${tier}`);
    onSelectStripe(tier);
  };

  const handleUsdc = (tier: Exclude<SubscriptionTier, "FREE">) => {
    setLoadingTier(`usdc-${tier}`);
    onSelectUsdc(tier);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {PLANS.map((plan) => {
        const limits = TIER_LIMITS[plan.tier];
        const isCurrent = currentTier === plan.tier;
        const isUpgrade =
          ["FREE", "PRO", "ANALYST", "WHALE"].indexOf(plan.tier) >
          ["FREE", "PRO", "ANALYST", "WHALE"].indexOf(currentTier);

        return (
          <div
            key={plan.tier}
            className={`relative rounded-lg border p-6 ${
              plan.highlight
                ? "border-primary shadow-lg ring-1 ring-primary"
                : "border-border"
            } ${isCurrent ? "bg-primary/5" : "bg-card"}`}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                Popular
              </span>
            )}
            {isCurrent && (
              <span className="absolute -top-3 right-4 rounded-full bg-green-600 px-3 py-0.5 text-xs font-semibold text-white">
                Current
              </span>
            )}

            <h3 className="text-lg font-bold">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {plan.description}
            </p>

            <div className="mt-4">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-muted-foreground">/mo</span>
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              Up to {limits.maxWallets === Infinity ? "unlimited" : limits.maxWallets} wallets
            </div>

            <ul className="mt-4 space-y-2">
              {FEATURE_LABELS.map(({ key, label }) => (
                <li key={key} className="flex items-center gap-2 text-sm">
                  {limits[key] ? (
                    <span className="text-green-500">&#10003;</span>
                  ) : (
                    <span className="text-muted-foreground/40">&#10005;</span>
                  )}
                  <span
                    className={
                      limits[key] ? "" : "text-muted-foreground/60"
                    }
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-2">
              <button
                onClick={() => handleStripe(plan.tier)}
                disabled={isCurrent || loading || !!loadingTier}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loadingTier === `stripe-${plan.tier}`
                  ? "Redirecting..."
                  : isCurrent
                  ? "Current Plan"
                  : isUpgrade
                  ? "Upgrade with Card"
                  : "Switch Plan"}
              </button>
              {!isCurrent && isUpgrade && (
                <button
                  onClick={() => handleUsdc(plan.tier)}
                  disabled={loading || !!loadingTier}
                  className="w-full rounded-md border border-primary/30 bg-transparent px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
                >
                  {loadingTier === `usdc-${plan.tier}`
                    ? "Loading..."
                    : "Pay with USDC"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
