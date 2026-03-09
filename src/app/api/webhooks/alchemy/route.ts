import { NextRequest, NextResponse } from "next/server";
import { storeWhaleTransaction, notifyWhaleMovement } from "@/lib/services/analytics/whales";
import type { Chain } from "@prisma/client";
import crypto from "crypto";

// Minimum transfer value to track (USD)
const MIN_WHALE_VALUE_USD = 100_000;

// Simple token price estimates for webhook processing
// In production, these would come from a price oracle
const TOKEN_PRICES: Record<string, number> = {
  ETH: 3000,
  WETH: 3000,
  USDC: 1,
  USDT: 1,
  DAI: 1,
  WBTC: 60000,
  stETH: 3000,
  rETH: 3300,
  cbETH: 3100,
  ARB: 1.5,
  LINK: 15,
  UNI: 8,
};

interface AlchemyWebhookEvent {
  webhookId: string;
  id: string;
  createdAt: string;
  type: string;
  event: {
    network: string;
    activity: Array<{
      fromAddress: string;
      toAddress: string;
      blockNum: string;
      hash: string;
      value: number;
      asset: string;
      category: string;
      rawContract: {
        rawValue: string;
        address: string;
        decimals: number;
      };
    }>;
  };
}

function networkToChain(network: string): Chain | null {
  const map: Record<string, Chain> = {
    ETH_MAINNET: "ETHEREUM",
    ARB_MAINNET: "ARBITRUM",
    BASE_MAINNET: "BASE",
    BNB_MAINNET: "BNB",
  };
  return map[network] ?? null;
}

function verifyAlchemySignature(
  body: string,
  signature: string | null
): boolean {
  const signingKey = process.env.ALCHEMY_WEBHOOK_SIGNING_KEY;
  if (!signingKey || !signature) return false;

  const hmac = crypto.createHmac("sha256", signingKey);
  hmac.update(body);
  const expectedSig = hmac.digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  );
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Verify webhook signature
  const signature = request.headers.get("x-alchemy-signature");
  if (process.env.ALCHEMY_WEBHOOK_SIGNING_KEY) {
    if (!verifyAlchemySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: AlchemyWebhookEvent;
  try {
    payload = JSON.parse(rawBody) as AlchemyWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const chain = networkToChain(payload.event.network);
  if (!chain) {
    return NextResponse.json({ ok: true, skipped: "unsupported network" });
  }

  let processed = 0;

  for (const activity of payload.event.activity) {
    const asset = activity.asset || "ETH";
    const priceUsd = TOKEN_PRICES[asset.toUpperCase()] ?? 0;
    const valueUsd = activity.value * priceUsd;

    // Skip small transfers
    if (valueUsd < MIN_WHALE_VALUE_USD) continue;

    try {
      const tx = await storeWhaleTransaction({
        chain,
        txHash: activity.hash,
        fromAddress: activity.fromAddress,
        toAddress: activity.toAddress,
        asset,
        amount: activity.value,
        valueUsd,
        blockNumber: parseInt(activity.blockNum, 16),
        timestamp: new Date(payload.createdAt),
      });

      // Fire notifications asynchronously
      notifyWhaleMovement(tx).catch((err) =>
        console.error("Whale notification error:", err)
      );

      processed++;
    } catch (error) {
      console.error(`Failed to store whale tx ${activity.hash}:`, error);
    }
  }

  return NextResponse.json({ ok: true, processed });
}
