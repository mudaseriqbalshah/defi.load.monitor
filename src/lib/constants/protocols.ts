export const SUBGRAPH_URLS = {
  AAVE_V3_ETHEREUM:
    "https://api.thegraph.com/subgraphs/name/aave/protocol-v3",
  AAVE_V3_ARBITRUM:
    "https://api.thegraph.com/subgraphs/name/aave/protocol-v3-arbitrum",
  AAVE_V3_BASE:
    "https://api.thegraph.com/subgraphs/name/aave/protocol-v3-base",
  COMPOUND_V3_ETHEREUM:
    "https://api.thegraph.com/subgraphs/name/messari/compound-v3-ethereum",
  COMPOUND_V3_ARBITRUM:
    "https://api.thegraph.com/subgraphs/name/messari/compound-v3-arbitrum",
} as const;

export const DEFILLAMA_API = "https://yields.llama.fi" as const;
export const COINGECKO_API = "https://api.coingecko.com/api/v3" as const;
export const FLASHBOTS_API = "https://blocks.flashbots.net/v1" as const;

export const STRIPE_PRICES = {
  PRO: process.env.STRIPE_PRICE_PRO ?? "",
  ANALYST: process.env.STRIPE_PRICE_ANALYST ?? "",
  WHALE: process.env.STRIPE_PRICE_WHALE ?? "",
} as const;
