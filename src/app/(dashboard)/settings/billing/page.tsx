"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/lib/hooks/use-subscription";
import { PricingCards } from "@/components/billing/pricing-card";
import { UsdcPaymentModal } from "@/components/billing/usdc-payment-modal";
import type { SubscriptionTier } from "@prisma/client";

const TIER_NAMES: Record<SubscriptionTier, string> = {
  FREE: "Free",
  PRO: "Pro",
  ANALYST: "Analyst",
  WHALE: "Whale",
};

export default function BillingPage() {
  const router = useRouter();
  const { data: subscription, isLoading, refetch } = useSubscription();
  const [usdcTier, setUsdcTier] =
    useState<Exclude<SubscriptionTier, "FREE"> | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleStripeCheckout = async (
    tier: Exclude<SubscriptionTier, "FREE">
  ) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      }
    } catch {
      setActionLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/payments/portal", { method: "POST" });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      }
    } catch {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="text-muted-foreground">
            Manage your subscription and payment method.
          </p>
        </div>
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  const tier = subscription?.tier ?? "FREE";
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const showSuccess = searchParams.get("success") === "true";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and payment method.
        </p>
      </div>

      {showSuccess && (
        <div className="rounded-md bg-green-600/10 border border-green-600/30 p-4 text-sm text-green-600">
          Payment successful! Your subscription is now active.
        </div>
      )}

      {/* Current Plan */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">Current Plan</h2>
        <div className="mt-3 flex items-center gap-4">
          <span className="text-2xl font-bold">{TIER_NAMES[tier]}</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              subscription?.status === "ACTIVE"
                ? "bg-green-600/10 text-green-600"
                : subscription?.status === "PAST_DUE"
                ? "bg-yellow-600/10 text-yellow-600"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {subscription?.status ?? "ACTIVE"}
          </span>
          {subscription?.paymentMethod && (
            <span className="text-xs text-muted-foreground">
              via{" "}
              {subscription.paymentMethod === "STRIPE"
                ? "Credit Card"
                : "USDC On-chain"}
            </span>
          )}
        </div>

        {subscription?.currentPeriodEnd && (
          <p className="mt-2 text-sm text-muted-foreground">
            {subscription.cancelAtPeriodEnd
              ? "Cancels"
              : "Renews"}{" "}
            on{" "}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString(
              "en-US",
              { month: "long", day: "numeric", year: "numeric" }
            )}
          </p>
        )}

        {subscription?.hasStripe && (
          <button
            onClick={handleManageBilling}
            disabled={actionLoading}
            className="mt-4 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            {actionLoading ? "Loading..." : "Manage Stripe Billing"}
          </button>
        )}
      </div>

      {/* USDC Payment History */}
      {subscription?.cryptoPayments &&
        subscription.cryptoPayments.length > 0 && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold">USDC Payment History</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Chain</th>
                    <th className="pb-2 pr-4">Amount</th>
                    <th className="pb-2 pr-4">Tx Hash</th>
                    <th className="pb-2">Period</th>
                  </tr>
                </thead>
                <tbody>
                  {subscription.cryptoPayments.map((p) => (
                    <tr key={p.txHash} className="border-b last:border-0">
                      <td className="py-2 pr-4">{p.chain}</td>
                      <td className="py-2 pr-4">{p.amount} USDC</td>
                      <td className="py-2 pr-4 font-mono text-xs">
                        {p.txHash.slice(0, 10)}...{p.txHash.slice(-6)}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {new Date(p.periodStart).toLocaleDateString()} -{" "}
                        {new Date(p.periodEnd).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Pricing Cards */}
      <div>
        <h2 className="text-lg font-semibold">
          {tier === "FREE" ? "Choose a Plan" : "Change Plan"}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Pay with credit card via Stripe or with USDC on Ethereum, Arbitrum, or
          Base.
        </p>
        <PricingCards
          currentTier={tier}
          onSelectStripe={handleStripeCheckout}
          onSelectUsdc={(t) => setUsdcTier(t)}
          loading={actionLoading}
        />
      </div>

      {/* USDC Payment Modal */}
      {usdcTier && (
        <UsdcPaymentModal
          tier={usdcTier}
          onClose={() => setUsdcTier(null)}
          onSuccess={() => {
            setUsdcTier(null);
            refetch();
            router.replace("/settings/billing?success=true");
          }}
        />
      )}
    </div>
  );
}
