import type { Chain } from "@prisma/client";

export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  defiLlamaSlug: string;
}

export const CHAIN_CONFIG: Record<Exclude<Chain, "SOLANA">, ChainConfig> = {
  ETHEREUM: {
    id: 1,
    name: "Ethereum",
    rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    explorerUrl: "https://etherscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    defiLlamaSlug: "ethereum",
  },
  ARBITRUM: {
    id: 42161,
    name: "Arbitrum One",
    rpcUrl: `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    explorerUrl: "https://arbiscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    defiLlamaSlug: "arbitrum",
  },
  BASE: {
    id: 8453,
    name: "Base",
    rpcUrl: `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    explorerUrl: "https://basescan.org",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    defiLlamaSlug: "base",
  },
  BNB: {
    id: 56,
    name: "BNB Chain",
    rpcUrl: "https://bsc-dataseed1.binance.org",
    explorerUrl: "https://bscscan.com",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    defiLlamaSlug: "bsc",
  },
};

export const SOLANA_CONFIG = {
  name: "Solana",
  rpcUrl: `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
  explorerUrl: "https://solscan.io",
  defiLlamaSlug: "solana",
};
