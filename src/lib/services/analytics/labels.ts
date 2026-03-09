import { prisma } from "@/lib/db";
import type { Chain } from "@prisma/client";

export interface WalletLabelData {
  address: string;
  chain: Chain;
  label: string;
  category: string;
  source: string;
}

/** Upsert a wallet label */
export async function upsertWalletLabel(data: WalletLabelData) {
  return prisma.walletLabel.upsert({
    where: {
      address_chain: {
        address: data.address.toLowerCase(),
        chain: data.chain,
      },
    },
    create: {
      address: data.address.toLowerCase(),
      chain: data.chain,
      label: data.label,
      category: data.category,
      source: data.source,
    },
    update: {
      label: data.label,
      category: data.category,
      source: data.source,
    },
  });
}

/** Look up a label for an address */
export async function getWalletLabel(address: string, chain: Chain) {
  return prisma.walletLabel.findUnique({
    where: {
      address_chain: {
        address: address.toLowerCase(),
        chain,
      },
    },
  });
}

/** Search labels by name or address */
export async function searchWalletLabels(
  query: string,
  options?: { category?: string; chain?: Chain; limit?: number }
) {
  const where: Record<string, unknown> = {
    OR: [
      { label: { contains: query, mode: "insensitive" } },
      { address: { contains: query.toLowerCase() } },
    ],
  };

  if (options?.category) where.category = options.category;
  if (options?.chain) where.chain = options.chain;

  return prisma.walletLabel.findMany({
    where,
    take: options?.limit ?? 20,
    orderBy: { label: "asc" },
  });
}

/** Seed well-known wallet labels */
export const KNOWN_LABELS: WalletLabelData[] = [
  // Exchanges
  { address: "0x28c6c06298d514db089934071355e5743bf21d60", chain: "ETHEREUM", label: "Binance 14", category: "exchange", source: "manual" },
  { address: "0x21a31ee1afc51d94c2efccaa2092ad1028285549", chain: "ETHEREUM", label: "Binance 7", category: "exchange", source: "manual" },
  { address: "0xdfd5293d8e347dfe59e90efd55b2956a1343963d", chain: "ETHEREUM", label: "Coinbase 2", category: "exchange", source: "manual" },
  { address: "0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43", chain: "ETHEREUM", label: "Coinbase 10", category: "exchange", source: "manual" },
  { address: "0x56eddb7aa87536c09ccc2793473599fd21a8b17f", chain: "ETHEREUM", label: "Kraken 13", category: "exchange", source: "manual" },
  { address: "0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2", chain: "ETHEREUM", label: "FTX Exchange", category: "exchange", source: "manual" },
  // Protocols
  { address: "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503", chain: "ETHEREUM", label: "Maker: PSM", category: "protocol", source: "manual" },
  { address: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84", chain: "ETHEREUM", label: "Lido: stETH", category: "protocol", source: "manual" },
  { address: "0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf", chain: "ETHEREUM", label: "Polygon Bridge", category: "protocol", source: "manual" },
  // Whales / Funds
  { address: "0x8103683202aa8da10536036edef04cdd865c225e", chain: "ETHEREUM", label: "Jump Trading", category: "fund", source: "manual" },
  { address: "0x1b3cb81e51011b549d78bf720b0d924ac763a7c2", chain: "ETHEREUM", label: "Wintermute", category: "fund", source: "manual" },
];

export async function seedKnownLabels() {
  for (const label of KNOWN_LABELS) {
    await upsertWalletLabel(label);
  }
}
