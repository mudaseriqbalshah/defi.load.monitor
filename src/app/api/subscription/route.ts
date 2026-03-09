import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: {
      cryptoPayments: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!subscription) {
    return NextResponse.json({
      data: {
        tier: "FREE",
        status: "ACTIVE",
        paymentMethod: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        cryptoPayments: [],
      },
    });
  }

  return NextResponse.json({
    data: {
      tier: subscription.tier,
      status: subscription.status,
      paymentMethod: subscription.paymentMethod,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      hasStripe: !!subscription.stripeCustomerId,
      cryptoPayments: subscription.cryptoPayments.map((p) => ({
        chain: p.chain,
        txHash: p.txHash,
        amount: p.amount,
        periodStart: p.periodStart,
        periodEnd: p.periodEnd,
        createdAt: p.createdAt,
      })),
    },
  });
}
