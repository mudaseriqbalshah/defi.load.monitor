import { prisma } from "@/lib/db";
import type { Chain, TradeType } from "@prisma/client";

// ─── Types ──────────────────────────────────────────────────────

export interface CreateTradeInput {
  chain: Chain;
  protocol: string;
  tradeType: TradeType;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  priceAtEntry: number;
  txHash?: string;
  notes?: string;
  tags?: string[];
  openedAt?: Date;
}

export interface CloseTradeInput {
  priceAtExit: number;
  pnl: number;
  pnlPercent: number;
  closedAt?: Date;
}

export interface TradeFilters {
  chain?: Chain;
  tradeType?: TradeType;
  status?: "open" | "closed" | "all";
  tokenSearch?: string;
  sortBy?: "openedAt" | "closedAt" | "pnl" | "pnlPercent" | "amountIn";
  sortDir?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface TradeStats {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  totalPnl: number;
  winRate: number;
  avgPnlPercent: number;
  bestTrade: number;
  worstTrade: number;
  totalVolumeIn: number;
  profitFactor: number;
}

// ─── CRUD ───────────────────────────────────────────────────────

export async function createTrade(userId: string, input: CreateTradeInput) {
  return prisma.tradingJournal.create({
    data: {
      userId,
      chain: input.chain,
      protocol: input.protocol,
      tradeType: input.tradeType,
      tokenIn: input.tokenIn,
      tokenOut: input.tokenOut,
      amountIn: input.amountIn,
      amountOut: input.amountOut,
      priceAtEntry: input.priceAtEntry,
      txHash: input.txHash,
      notes: input.notes,
      tags: input.tags ?? [],
      openedAt: input.openedAt ?? new Date(),
    },
  });
}

export async function closeTrade(
  userId: string,
  tradeId: string,
  input: CloseTradeInput
) {
  // Verify ownership
  const trade = await prisma.tradingJournal.findFirst({
    where: { id: tradeId, userId },
  });
  if (!trade) throw new Error("Trade not found");
  if (trade.closedAt) throw new Error("Trade already closed");

  return prisma.tradingJournal.update({
    where: { id: tradeId },
    data: {
      priceAtExit: input.priceAtExit,
      pnl: input.pnl,
      pnlPercent: input.pnlPercent,
      closedAt: input.closedAt ?? new Date(),
    },
  });
}

export async function updateTradeNotes(
  userId: string,
  tradeId: string,
  notes: string,
  tags?: string[]
) {
  const trade = await prisma.tradingJournal.findFirst({
    where: { id: tradeId, userId },
  });
  if (!trade) throw new Error("Trade not found");

  return prisma.tradingJournal.update({
    where: { id: tradeId },
    data: {
      notes,
      ...(tags !== undefined ? { tags } : {}),
    },
  });
}

export async function deleteTrade(userId: string, tradeId: string) {
  const trade = await prisma.tradingJournal.findFirst({
    where: { id: tradeId, userId },
  });
  if (!trade) throw new Error("Trade not found");

  return prisma.tradingJournal.delete({
    where: { id: tradeId },
  });
}

// ─── Queries ────────────────────────────────────────────────────

export async function getTrades(userId: string, filters: TradeFilters = {}) {
  const where: Record<string, unknown> = { userId };

  if (filters.chain) where.chain = filters.chain;
  if (filters.tradeType) where.tradeType = filters.tradeType;

  if (filters.status === "open") {
    where.closedAt = null;
  } else if (filters.status === "closed") {
    where.closedAt = { not: null };
  }

  if (filters.tokenSearch) {
    where.OR = [
      { tokenIn: { contains: filters.tokenSearch, mode: "insensitive" } },
      { tokenOut: { contains: filters.tokenSearch, mode: "insensitive" } },
    ];
  }

  const sortBy = filters.sortBy ?? "openedAt";
  const sortDir = filters.sortDir ?? "desc";

  const [trades, total] = await Promise.all([
    prisma.tradingJournal.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      take: filters.limit ?? 50,
      skip: filters.offset ?? 0,
    }),
    prisma.tradingJournal.count({ where }),
  ]);

  return { trades, total };
}

export async function getTradeById(userId: string, tradeId: string) {
  return prisma.tradingJournal.findFirst({
    where: { id: tradeId, userId },
  });
}

// ─── Performance stats ──────────────────────────────────────────

export async function getTradeStats(
  userId: string,
  chain?: Chain
): Promise<TradeStats> {
  const where: Record<string, unknown> = { userId };
  if (chain) where.chain = chain;

  const allTrades = await prisma.tradingJournal.findMany({
    where,
    select: {
      pnl: true,
      pnlPercent: true,
      closedAt: true,
      amountIn: true,
    },
  });

  const closedTrades = allTrades.filter((t) => t.closedAt !== null);
  const openTrades = allTrades.filter((t) => t.closedAt === null);

  const wins = closedTrades.filter((t) => (t.pnl ?? 0) > 0);
  const losses = closedTrades.filter((t) => (t.pnl ?? 0) < 0);

  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const totalVolumeIn = allTrades.reduce((sum, t) => sum + t.amountIn, 0);

  const pnlValues = closedTrades.map((t) => t.pnl ?? 0);
  const pnlPercentValues = closedTrades
    .map((t) => t.pnlPercent ?? 0)
    .filter((v) => v !== 0);

  const totalGross = wins.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const totalLoss = Math.abs(
    losses.reduce((sum, t) => sum + (t.pnl ?? 0), 0)
  );

  return {
    totalTrades: allTrades.length,
    openTrades: openTrades.length,
    closedTrades: closedTrades.length,
    totalPnl,
    winRate:
      closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0,
    avgPnlPercent:
      pnlPercentValues.length > 0
        ? pnlPercentValues.reduce((a, b) => a + b, 0) /
          pnlPercentValues.length
        : 0,
    bestTrade: pnlValues.length > 0 ? Math.max(...pnlValues) : 0,
    worstTrade: pnlValues.length > 0 ? Math.min(...pnlValues) : 0,
    totalVolumeIn,
    profitFactor: totalLoss > 0 ? totalGross / totalLoss : totalGross > 0 ? Infinity : 0,
  };
}
