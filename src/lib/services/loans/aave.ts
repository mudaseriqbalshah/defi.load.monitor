import { SUBGRAPH_URLS } from "@/lib/constants/protocols";
import type { LoanPosition } from "@/types";

const USER_POSITIONS_QUERY = `
  query GetUserPositions($user: String!) {
    userReserves(where: { user: $user }) {
      reserve {
        symbol
        underlyingAsset
        liquidityRate
        variableBorrowRate
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
    }
  }
`;

interface SubgraphResponse {
  data: {
    userReserves: Array<{
      reserve: {
        symbol: string;
        underlyingAsset: string;
        liquidityRate: string;
        variableBorrowRate: string;
        price: { priceInEth: string };
      };
      currentATokenBalance: string;
      currentVariableDebt: string;
      currentStableDebt: string;
    }>;
    user: { healthFactor: string } | null;
  };
}

export async function fetchAavePositions(
  walletAddress: string,
  chain: "ETHEREUM" | "ARBITRUM" | "BASE"
): Promise<LoanPosition[]> {
  const urlKey = `AAVE_V3_${chain}` as keyof typeof SUBGRAPH_URLS;
  const url = SUBGRAPH_URLS[urlKey];
  if (!url) return [];

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: USER_POSITIONS_QUERY,
      variables: { user: walletAddress.toLowerCase() },
    }),
  });

  if (!res.ok) throw new Error(`Aave subgraph error: ${res.status}`);

  const json = (await res.json()) as SubgraphResponse;
  const healthFactor = json.data.user
    ? parseFloat(json.data.user.healthFactor) / 1e18
    : 0;

  return json.data.userReserves
    .filter(
      (r) =>
        parseFloat(r.currentATokenBalance) > 0 ||
        parseFloat(r.currentVariableDebt) > 0
    )
    .map((r) => ({
      protocol: "AAVE_V3" as const,
      chain,
      asset: r.reserve.symbol,
      supplyAmount: parseFloat(r.currentATokenBalance) / 1e18,
      borrowAmount:
        (parseFloat(r.currentVariableDebt) +
          parseFloat(r.currentStableDebt)) /
        1e18,
      supplyValueUsd: 0, // computed with price oracle
      borrowValueUsd: 0,
      healthFactor,
      liquidationPrice: null,
      apy: parseFloat(r.reserve.variableBorrowRate) / 1e25,
    }));
}
