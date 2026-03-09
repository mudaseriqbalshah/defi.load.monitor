import { prisma } from "@/lib/db";
import type { Chain, SubscriptionTier } from "@prisma/client";

// ─── USDC contract addresses ────────────────────────────────────

export const USDC_ADDRESSES: Record<string, string> = {
  ETHEREUM: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  ARBITRUM: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  BASE: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

// Treasury wallet that receives USDC payments
const TREASURY_ADDRESS = process.env.USDC_TREASURY_ADDRESS ?? "";

// Monthly prices in USDC (same as USD pricing)
export const USDC_PRICES: Record<Exclude<SubscriptionTier, "FREE">, number> = {
  PRO: 29,
  ANALYST: 59,
  WHALE: 99,
};

// ─── Payment intent ─────────────────────────────────────────────

export interface UsdcPaymentIntent {
  tier: Exclude<SubscriptionTier, "FREE">;
  amount: number;
  treasuryAddress: string;
  chain: Chain;
  usdcAddress: string;
  periodStart: Date;
  periodEnd: Date;
}

export function createUsdcPaymentIntent(
  tier: Exclude<SubscriptionTier, "FREE">,
  chain: Chain
): UsdcPaymentIntent {
  const amount = USDC_PRICES[tier];
  const usdcAddress = USDC_ADDRESSES[chain];

  if (!usdcAddress) {
    throw new Error(`USDC not supported on ${chain}`);
  }

  if (!TREASURY_ADDRESS) {
    throw new Error("Treasury address not configured");
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  return {
    tier,
    amount,
    treasuryAddress: TREASURY_ADDRESS,
    chain,
    usdcAddress,
    periodStart: now,
    periodEnd,
  };
}

// ─── Verify and activate ────────────────────────────────────────

export async function verifyAndActivateUsdcPayment(
  userId: string,
  txHash: string,
  chain: Chain,
  tier: Exclude<SubscriptionTier, "FREE">
): Promise<{ success: boolean; error?: string }> {
  // Check if tx already used
  const existing = await prisma.cryptoPayment.findUnique({
    where: { txHash },
  });
  if (existing) {
    return { success: false, error: "Transaction already used" };
  }

  // Verify the transaction on-chain via Alchemy
  const verified = await verifyUsdcTransfer(txHash, chain, tier);
  if (!verified.valid) {
    return { success: false, error: verified.error };
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  // Get or create subscription
  const subscription = await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      tier,
      status: "ACTIVE",
      paymentMethod: "USDC_ONCHAIN",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
    update: {
      tier,
      status: "ACTIVE",
      paymentMethod: "USDC_ONCHAIN",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  });

  // Record the crypto payment
  await prisma.cryptoPayment.create({
    data: {
      subscriptionId: subscription.id,
      chain,
      txHash,
      fromAddress: verified.fromAddress!,
      amount: USDC_PRICES[tier],
      periodStart: now,
      periodEnd,
      verified: true,
    },
  });

  return { success: true };
}

// ─── On-chain verification ──────────────────────────────────────

interface VerificationResult {
  valid: boolean;
  error?: string;
  fromAddress?: string;
}

async function verifyUsdcTransfer(
  txHash: string,
  chain: Chain,
  tier: Exclude<SubscriptionTier, "FREE">
): Promise<VerificationResult> {
  const alchemyKey = process.env.ALCHEMY_API_KEY;
  if (!alchemyKey) {
    // In development, skip verification
    if (process.env.NODE_ENV === "development") {
      return { valid: true, fromAddress: "0x0000000000000000000000000000000000000000" };
    }
    return { valid: false, error: "Alchemy API key not configured" };
  }

  const rpcUrls: Record<string, string> = {
    ETHEREUM: `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    ARBITRUM: `https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    BASE: `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`,
  };

  const rpcUrl = rpcUrls[chain];
  if (!rpcUrl) {
    return { valid: false, error: `Chain ${chain} not supported for USDC payments` };
  }

  try {
    // Fetch transaction receipt
    const receiptRes = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionReceipt",
        params: [txHash],
      }),
    });

    const receipt = await receiptRes.json();
    if (!receipt.result) {
      return { valid: false, error: "Transaction not found or not confirmed" };
    }

    if (receipt.result.status !== "0x1") {
      return { valid: false, error: "Transaction failed" };
    }

    // Parse ERC-20 Transfer logs
    // Transfer(address,address,uint256) = 0xddf252ad...
    const transferTopic =
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    const usdcAddress = USDC_ADDRESSES[chain]?.toLowerCase();
    const treasuryLower = TREASURY_ADDRESS.toLowerCase();
    const expectedAmount = USDC_PRICES[tier];

    const transferLog = receipt.result.logs.find(
      (log: { address: string; topics: string[] }) =>
        log.address.toLowerCase() === usdcAddress &&
        log.topics[0] === transferTopic &&
        log.topics[2] &&
        log.topics[2].slice(26).toLowerCase() === treasuryLower.slice(2)
    );

    if (!transferLog) {
      return {
        valid: false,
        error: "No USDC transfer to treasury found in transaction",
      };
    }

    // Parse amount (USDC has 6 decimals)
    const rawAmount = parseInt(transferLog.data, 16);
    const amount = rawAmount / 1e6;

    if (amount < expectedAmount) {
      return {
        valid: false,
        error: `Insufficient amount: sent ${amount} USDC, required ${expectedAmount} USDC`,
      };
    }

    // Extract sender from topics[1]
    const fromAddress = "0x" + transferLog.topics[1].slice(26);

    return { valid: true, fromAddress };
  } catch (error) {
    console.error("USDC verification error:", error);
    return { valid: false, error: "Failed to verify transaction" };
  }
}

// ─── Check for expired USDC subscriptions ───────────────────────

export async function checkExpiredUsdcSubscriptions() {
  const expired = await prisma.subscription.findMany({
    where: {
      paymentMethod: "USDC_ONCHAIN",
      status: "ACTIVE",
      currentPeriodEnd: { lt: new Date() },
    },
  });

  for (const sub of expired) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { tier: "FREE", status: "CANCELED" },
    });
  }

  return expired.length;
}
