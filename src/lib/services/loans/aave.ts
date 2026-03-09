import { SUBGRAPH_URLS } from "@/lib/constants/protocols";
import { cached } from "@/lib/db/redis";
import type { LoanPosition } from "@/types";

// ─── Price fetching ──────────────────────────────────────────────

const AAVE_PRICE_ORACLE_QUERY = `
  query GetPriceOracle {
    priceOracles(first: 1) {
      usdPriceEth
      tokens {
        id
        lastPriceUSD
      }
    }
  }
`;

interface PriceOracleResponse {
  data: {
    priceOracles: Array<{
      usdPriceEth: string;
      tokens: Array<{
        id: string;
        lastPriceUSD: string;
      }>;
    }>;
  };
}

async function fetchTokenPrices(
  url: string
): Promise<Map<string, number>> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: AAVE_PRICE_ORACLE_QUERY }),
  });

  if (!res.ok) return new Map();

  const json = (await res.json()) as PriceOracleResponse;
  const priceMap = new Map<string, number>();

  const oracle = json.data.priceOracles[0];
  if (oracle) {
    for (const token of oracle.tokens) {
      priceMap.set(token.id.toLowerCase(), parseFloat(token.lastPriceUSD));
    }
  }

  return priceMap;
}

// ─── User positions ─────────────────────────────────────────────

const USER_POSITIONS_QUERY = `
  query GetUserPositions($user: String!) {
    userReserves(where: { user: $user }) {
      reserve {
        symbol
        underlyingAsset
        decimals
        liquidityRate
        variableBorrowRate
        reserveLiquidationThreshold
        price {
          priceInEth
        }
      }
      currentATokenBalance
      currentVariableDebt
      currentStableDebt
    }
    user(id: $user) {
      healthFactor
      totalCollateralUSD
      totalDebtUSD
      availableBorrowsUSD
    }
  }
`;

interface SubgraphResponse {
  data: {
    userReserves: Array<{
      reserve: {
        symbol: string;
        underlyingAsset: string;
        decimals: number;
        liquidityRate: string;
        variableBorrowRate: string;
        reserveLiquidationThreshold: string;
        price: { priceInEth: string };
      };
      currentATokenBalance: string;
      currentVariableDebt: string;
      currentStableDebt: string;
    }>;
    user: {
      healthFactor: string;
      totalCollateralUSD: string;
      totalDebtUSD: string;
      availableBorrowsUSD: string;
    } | null;
  };
}

export interface AaveAccountSummary {
  totalCollateralUsd: number;
  totalDebtUsd: number;
  availableBorrowsUsd: number;
  healthFactor: number;
  positions: LoanPosition[];
}

export async function fetchAavePositions(
  walletAddress: string,
  chain: "ETHEREUM" | "ARBITRUM" | "BASE"
): Promise<AaveAccountSummary> {
  const urlKey = `AAVE_V3_${chain}` as keyof typeof SUBGRAPH_URLS;
  const url = SUBGRAPH_URLS[urlKey];
  if (!url) return emptyAaveSummary();

  const cacheKey = `aave:${chain}:${walletAddress.toLowerCase()}`;

  return cached(
    cacheKey,
    async () => {
      const [positionsRes, priceMap] = await Promise.all([
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: USER_POSITIONS_QUERY,
            variables: { user: walletAddress.toLowerCase() },
          }),
        }),
        fetchTokenPrices(url),
      ]);

      if (!positionsRes.ok)
        throw new Error(`Aave subgraph error: ${positionsRes.status}`);

      const json = (await positionsRes.json()) as SubgraphResponse;

      const userData = json.data.user;
      const healthFactor = userData
        ? parseFloat(userData.healthFactor) / 1e18
        : 0;
      const totalCollateralUsd = userData
        ? parseFloat(userData.totalCollateralUSD) / 1e8
        : 0;
      const totalDebtUsd = userData
        ? parseFloat(userData.totalDebtUSD) / 1e8
        : 0;
      const availableBorrowsUsd = userData
        ? parseFloat(userData.availableBorrowsUSD) / 1e8
        : 0;

      const positions: LoanPosition[] = json.data.userReserves
        .filter(
          (r) =>
            parseFloat(r.currentATokenBalance) > 0 ||
            parseFloat(r.currentVariableDebt) > 0 ||
            parseFloat(r.currentStableDebt) > 0
        )
        .map((r) => {
          const decimals = r.reserve.decimals || 18;
          const divisor = Math.pow(10, decimals);

          const supplyAmount = parseFloat(r.currentATokenBalance) / divisor;
          const borrowAmount =
            (parseFloat(r.currentVariableDebt) +
              parseFloat(r.currentStableDebt)) /
            divisor;

          const priceUsd =
            priceMap.get(r.reserve.underlyingAsset.toLowerCase()) ?? 0;
          const supplyValueUsd = supplyAmount * priceUsd;
          const borrowValueUsd = borrowAmount * priceUsd;

          // Liquidation price: price at which health factor = 1
          // HF = (collateral * liq_threshold) / debt
          // When HF = 1: price_liq = current_price / health_factor (simplified for single-asset)
          const liqThreshold =
            parseFloat(r.reserve.reserveLiquidationThreshold) / 10000;
          let liquidationPrice: number | null = null;
          if (borrowAmount > 0 && healthFactor > 0 && supplyAmount > 0) {
            liquidationPrice =
              (borrowValueUsd / (supplyAmount * liqThreshold));
          }

          return {
            protocol: "AAVE_V3" as const,
            chain,
            asset: r.reserve.symbol,
            supplyAmount,
            borrowAmount,
            supplyValueUsd,
            borrowValueUsd,
            healthFactor,
            liquidationPrice,
            apy: parseFloat(r.reserve.variableBorrowRate) / 1e25,
          };
        });

      return {
        totalCollateralUsd,
        totalDebtUsd,
        availableBorrowsUsd,
        healthFactor,
        positions,
      };
    },
    60 // 1 min cache
  );
}

function emptyAaveSummary(): AaveAccountSummary {
  return {
    totalCollateralUsd: 0,
    totalDebtUsd: 0,
    availableBorrowsUsd: 0,
    healthFactor: 0,
    positions: [],
  };
}
