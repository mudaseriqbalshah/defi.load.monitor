import type { Chain, Protocol, SubscriptionTier, AlertType } from "@prisma/client";

// Re-export Prisma enums for convenience
export type { Chain, Protocol, SubscriptionTier, AlertType };

// ─── API Response Types ──────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// ─── Yield Types ─────────────────────────────────────────────────

export interface YieldPool {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase: number;
  apyReward: number;
  apyPct1D: number | null;
  apyPct7D: number | null;
  apyPct30D: number | null;
  rewardTokens: string[];
  stablecoin: boolean;
  ilRisk: string;
  exposure: string;
  poolMeta: string | null;
}

// ─── Loan / Position Types ───────────────────────────────────────

export interface LoanPosition {
  protocol: Protocol;
  chain: Chain;
  asset: string;
  supplyAmount: number;
  borrowAmount: number;
  supplyValueUsd: number;
  borrowValueUsd: number;
  healthFactor: number;
  liquidationPrice: number | null;
  apy: number;
}

export interface HealthFactorStatus {
  value: number;
  level: "safe" | "warning" | "danger" | "critical";
}

// ─── Whale Types ─────────────────────────────────────────────────

export interface WhaleTransfer {
  txHash: string;
  chain: Chain;
  fromAddress: string;
  toAddress: string;
  fromLabel: string | null;
  toLabel: string | null;
  asset: string;
  amount: number;
  valueUsd: number;
  timestamp: Date;
}

// ─── Trading Types ───────────────────────────────────────────────

export interface TradeEntry {
  id: string;
  chain: Chain;
  protocol: string;
  tradeType: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  pnl: number | null;
  pnlPercent: number | null;
  openedAt: Date;
  closedAt: Date | null;
}

// ─── Subscription Limits ─────────────────────────────────────────

export interface TierLimits {
  maxWallets: number;
  realTimeData: boolean;
  yieldDashboard: boolean;
  tradingAnalytics: boolean;
  onChainAnalytics: boolean;
  whaleTracking: boolean;
  mevAnalyzer: boolean;
  apiAccess: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  FREE: {
    maxWallets: 1,
    realTimeData: false,
    yieldDashboard: true,
    tradingAnalytics: false,
    onChainAnalytics: false,
    whaleTracking: false,
    mevAnalyzer: false,
    apiAccess: false,
  },
  PRO: {
    maxWallets: 5,
    realTimeData: true,
    yieldDashboard: true,
    tradingAnalytics: true,
    onChainAnalytics: false,
    whaleTracking: false,
    mevAnalyzer: false,
    apiAccess: false,
  },
  ANALYST: {
    maxWallets: 20,
    realTimeData: true,
    yieldDashboard: true,
    tradingAnalytics: true,
    onChainAnalytics: true,
    whaleTracking: true,
    mevAnalyzer: false,
    apiAccess: false,
  },
  WHALE: {
    maxWallets: Infinity,
    realTimeData: true,
    yieldDashboard: true,
    tradingAnalytics: true,
    onChainAnalytics: true,
    whaleTracking: true,
    mevAnalyzer: true,
    apiAccess: true,
  },
};
