import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createCheckoutSession } from "@/lib/services/payments/stripe";
import { prisma } from "@/lib/db";
import type { SubscriptionTier } from "@prisma/client";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const tier = body.tier as SubscriptionTier;

  if (!["PRO", "ANALYST", "WHALE"].includes(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const url = await createCheckoutSession(
      session.user.id,
      tier as Exclude<SubscriptionTier, "FREE">,
      user?.email,
      user?.address
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
