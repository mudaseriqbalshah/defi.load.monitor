import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  createUsdcPaymentIntent,
  verifyAndActivateUsdcPayment,
} from "@/lib/services/payments/usdc";
import type { Chain, SubscriptionTier } from "@prisma/client";

// GET: Get USDC payment details (treasury address, amount, etc.)
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = request.nextUrl.searchParams.get("tier") as SubscriptionTier;
  const chain = (request.nextUrl.searchParams.get("chain") ?? "ETHEREUM") as Chain;

  if (!["PRO", "ANALYST", "WHALE"].includes(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  try {
    const intent = createUsdcPaymentIntent(
      tier as Exclude<SubscriptionTier, "FREE">,
      chain
    );
    return NextResponse.json({ data: intent });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// POST: Verify USDC tx hash and activate subscription
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { txHash, chain, tier } = body as {
    txHash: string;
    chain: Chain;
    tier: SubscriptionTier;
  };

  if (!txHash || !chain || !["PRO", "ANALYST", "WHALE"].includes(tier)) {
    return NextResponse.json(
      { error: "Missing txHash, chain, or valid tier" },
      { status: 400 }
    );
  }

  try {
    const result = await verifyAndActivateUsdcPayment(
      session.user.id,
      txHash,
      chain,
      tier as Exclude<SubscriptionTier, "FREE">
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("USDC payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
