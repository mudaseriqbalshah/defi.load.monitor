import { prisma } from "@/lib/db";
import type { Chain } from "@prisma/client";
import { formatUsd } from "@/lib/utils";
import {
  createAlertHistory,
  sendTelegramAlert,
} from "@/lib/services/alerts";

// ─── Types ───────────────────────────────────────────────────────

export interface WhaleTransactionInput {
  chain: Chain;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  asset: string;
  amount: number;
  valueUsd: number;
  blockNumber: number;
  timestamp: Date;
}

export interface WhaleTransactionWithLabels {
  id: string;
  chain: Chain;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  fromLabel: string | null;
  toLabel: string | null;
  asset: string;
  amount: number;
  valueUsd: number;
  blockNumber: number;
  timestamp: Date;
}

export interface WhaleFeedFilters {
  chains?: Chain[];
  minValueUsd?: number;
  asset?: string;
  limit?: number;
  offset?: number;
}

// ─── Store transaction ──────────────────────────────────────────

export async function storeWhaleTransaction(
  tx: WhaleTransactionInput
): Promise<WhaleTransactionWithLabels> {
  // Look up labels for from/to addresses
  const [fromLabel, toLabel] = await Promise.all([
    prisma.walletLabel
      .findUnique({
        where: { address_chain: { address: tx.fromAddress.toLowerCase(), chain: tx.chain } },
      })
      .then((l) => l?.label ?? null),
    prisma.walletLabel
      .findUnique({
        where: { address_chain: { address: tx.toAddress.toLowerCase(), chain: tx.chain } },
      })
      .then((l) => l?.label ?? null),
  ]);

  const stored = await prisma.whaleTransaction.upsert({
    where: { txHash: tx.txHash },
    create: {
      chain: tx.chain,
      txHash: tx.txHash,
      fromAddress: tx.fromAddress.toLowerCase(),
      toAddress: tx.toAddress.toLowerCase(),
      fromLabel,
      toLabel,
      asset: tx.asset,
      amount: tx.amount,
      valueUsd: tx.valueUsd,
      blockNumber: tx.blockNumber,
      timestamp: tx.timestamp,
    },
    update: {},
  });

  return { ...stored, fromLabel, toLabel };
}

// ─── Query feed ─────────────────────────────────────────────────

export async function getWhaleFeed(
  filters?: WhaleFeedFilters
): Promise<{ transactions: WhaleTransactionWithLabels[]; total: number }> {
  const where: Record<string, unknown> = {};

  if (filters?.chains?.length) {
    where.chain = { in: filters.chains };
  }
  if (filters?.minValueUsd) {
    where.valueUsd = { gte: filters.minValueUsd };
  }
  if (filters?.asset) {
    where.asset = { equals: filters.asset, mode: "insensitive" };
  }

  const [transactions, total] = await Promise.all([
    prisma.whaleTransaction.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: filters?.limit ?? 50,
      skip: filters?.offset ?? 0,
    }),
    prisma.whaleTransaction.count({ where }),
  ]);

  return {
    transactions: transactions as WhaleTransactionWithLabels[],
    total,
  };
}

// ─── Stats ──────────────────────────────────────────────────────

export async function getWhaleStats(hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const [totalCount, transactions] = await Promise.all([
    prisma.whaleTransaction.count({
      where: { timestamp: { gte: since } },
    }),
    prisma.whaleTransaction.findMany({
      where: { timestamp: { gte: since } },
      select: { valueUsd: true, chain: true, asset: true },
    }),
  ]);

  const totalValueUsd = transactions.reduce((sum, t) => sum + t.valueUsd, 0);

  // Chain breakdown
  const chainBreakdown: Record<string, { count: number; valueUsd: number }> = {};
  for (const t of transactions) {
    if (!chainBreakdown[t.chain]) {
      chainBreakdown[t.chain] = { count: 0, valueUsd: 0 };
    }
    chainBreakdown[t.chain].count++;
    chainBreakdown[t.chain].valueUsd += t.valueUsd;
  }

  // Top assets
  const assetCounts: Record<string, number> = {};
  for (const t of transactions) {
    assetCounts[t.asset] = (assetCounts[t.asset] ?? 0) + 1;
  }
  const topAssets = Object.entries(assetCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([asset, count]) => ({ asset, count }));

  // Largest transaction
  const largest = transactions.length
    ? transactions.reduce((max, t) => (t.valueUsd > max.valueUsd ? t : max))
    : null;

  return {
    totalCount,
    totalValueUsd,
    avgValueUsd: totalCount > 0 ? totalValueUsd / totalCount : 0,
    largestValueUsd: largest?.valueUsd ?? 0,
    chainBreakdown,
    topAssets,
  };
}

// ─── Alert on whale movement ────────────────────────────────────

export async function notifyWhaleMovement(
  tx: WhaleTransactionWithLabels
) {
  // Find users who have whale alerts enabled with threshold below this value
  const users = await prisma.user.findMany({
    where: {
      preferences: {
        telegramNotifications: true,
        telegramChatId: { not: null },
        largeTransferMinUsd: { lte: tx.valueUsd },
      },
      subscription: {
        tier: { in: ["ANALYST", "WHALE"] },
      },
    },
    include: { preferences: true },
  });

  const fromLabel = tx.fromLabel ?? `${tx.fromAddress.slice(0, 6)}...${tx.fromAddress.slice(-4)}`;
  const toLabel = tx.toLabel ?? `${tx.toAddress.slice(0, 6)}...${tx.toAddress.slice(-4)}`;

  const message =
    `🐋 *Whale Alert*\n\n` +
    `*${tx.amount.toLocaleString()} ${tx.asset}* (${formatUsd(tx.valueUsd)})\n` +
    `From: \`${fromLabel}\`\n` +
    `To: \`${toLabel}\`\n` +
    `Chain: ${tx.chain}\n` +
    `Tx: \`${tx.txHash.slice(0, 10)}...\``;

  for (const user of users) {
    if (user.preferences?.telegramChatId) {
      await sendTelegramAlert(user.preferences.telegramChatId, message);
    }

    await createAlertHistory(
      user.id,
      "WHALE_MOVEMENT",
      `Whale: ${formatUsd(tx.valueUsd)} ${tx.asset} transfer`,
      `${tx.amount.toLocaleString()} ${tx.asset} moved from ${fromLabel} to ${toLabel} on ${tx.chain}`,
      {
        txHash: tx.txHash,
        chain: tx.chain,
        asset: tx.asset,
        valueUsd: tx.valueUsd,
        fromAddress: tx.fromAddress,
        toAddress: tx.toAddress,
      }
    );
  }
}
