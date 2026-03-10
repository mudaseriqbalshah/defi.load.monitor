import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [
    subscription,
    tradeStats,
    recentTrades,
    whaleCount,
    recentWhales,
    tvlSnapshots,
    mevEvents,
    alerts,
  ] = await Promise.all([
    // Subscription tier
    prisma.subscription.findUnique({
      where: { userId },
      select: { tier: true, status: true },
    }),

    // Trade stats
    prisma.tradingJournal.aggregate({
      where: { userId },
      _count: true,
      _sum: { pnl: true },
    }),

    // Recent trades (last 5)
    prisma.tradingJournal.findMany({
      where: { userId },
      orderBy: { openedAt: "desc" },
      take: 5,
      select: {
        id: true,
        tokenIn: true,
        tokenOut: true,
        tradeType: true,
        pnl: true,
        pnlPercent: true,
        openedAt: true,
        closedAt: true,
      },
    }),

    // Whale transactions (24h count)
    prisma.whaleTransaction.count({
      where: {
        timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),

    // Recent whales (last 5)
    prisma.whaleTransaction.findMany({
      orderBy: { timestamp: "desc" },
      take: 5,
      select: {
        id: true,
        chain: true,
        asset: true,
        valueUsd: true,
        fromLabel: true,
        toLabel: true,
        timestamp: true,
      },
    }),

    // Latest TVL snapshots (top 5 protocols)
    prisma.tvlSnapshot.findMany({
      orderBy: { timestamp: "desc" },
      distinct: ["protocol"],
      take: 5,
      select: {
        protocol: true,
        chain: true,
        tvlUsd: true,
        change24h: true,
      },
    }),

    // MEV events (24h)
    prisma.mevEvent.aggregate({
      where: {
        timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      _count: true,
      _sum: { profitUsd: true },
    }),

    // Active alerts
    prisma.alert.count({
      where: { userId, isActive: true },
    }),
  ]);

  const openTrades = await prisma.tradingJournal.count({
    where: { userId, closedAt: null },
  });

  return NextResponse.json({
    data: {
      tier: subscription?.tier ?? "FREE",
      stats: {
        totalTrades: tradeStats._count,
        openTrades,
        totalPnl: tradeStats._sum.pnl ?? 0,
        whaleAlerts24h: whaleCount,
        mevEvents24h: mevEvents._count,
        mevProfit24h: mevEvents._sum.profitUsd ?? 0,
        activeAlerts: alerts,
      },
      recentTrades,
      recentWhales,
      topProtocols: tvlSnapshots,
    },
  });
}
