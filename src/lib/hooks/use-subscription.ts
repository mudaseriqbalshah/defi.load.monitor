"use client";

import { useQuery } from "@tanstack/react-query";
import type { SubscriptionTier } from "@prisma/client";

export interface SubscriptionData {
  tier: SubscriptionTier;
  status: string;
  paymentMethod: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasStripe: boolean;
  cryptoPayments: {
    chain: string;
    txHash: string;
    amount: number;
    periodStart: string;
    periodEnd: string;
    createdAt: string;
  }[];
}

async function fetchSubscription(): Promise<SubscriptionData> {
  const res = await fetch("/api/subscription");
  if (!res.ok) throw new Error("Failed to fetch subscription");
  const json = await res.json();
  return json.data;
}

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscription,
    staleTime: 30_000,
  });
}
