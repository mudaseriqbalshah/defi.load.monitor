import { SUBGRAPH_URLS } from "@/lib/constants/protocols";
import { cached } from "@/lib/db/redis";
import type { LoanPosition } from "@/types";

const COMPOUND_POSITIONS_QUERY = `
  query GetUserPositions($user: String!) {
    accounts(where: { id: $user }) {
      id
      health
      totalBorrowValueInUSD
      totalCollateralValueInUSD
      positions {
        market {
          name
          inputToken {
            symbol
            decimals
          }
          liquidationThreshold
          rates {
            rate
            side
          }
        }
        balance
        side
        depositCount
        withdrawCount
        borrowCount
        repayCount
      }
    }
  }
`;

interface CompoundSubgraphResponse {
  data: {
    accounts: Array<{
      id: string;
      health: string | null;
      totalBorrowValueInUSD: string;
      totalCollateralValueInUSD: string;
      positions: Array<{
        market: {
          name: string;
          inputToken: {
            symbol: string;
            decimals: number;
          };
          liquidationThreshold: string;
          rates: Array<{
            rate: string;
            side: string;
          }>;
        };
        balance: string;
        side: string;
        depositCount: number;
        withdrawCount: number;
        borrowCount: number;
        repayCount: number;
      }>;
    }>;
  };
}

export interface CompoundAccountSummary {
  totalCollateralUsd: number;
  totalDebtUsd: number;
  healthFactor: number;
  positions: LoanPosition[];
}

export async function fetchCompoundPositions(
  walletAddress: string,
  chain: "ETHEREUM" | "ARBITRUM"
): Promise<CompoundAccountSummary> {
  const urlKey = `COMPOUND_V3_${chain}` as keyof typeof SUBGRAPH_URLS;
  const url = SUBGRAPH_URLS[urlKey];
  if (!url) return emptyCompoundSummary();

  const cacheKey = `compound:${chain}:${walletAddress.toLowerCase()}`;

  return cached(
    cacheKey,
    async () => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: COMPOUND_POSITIONS_QUERY,
          variables: { user: walletAddress.toLowerCase() },
        }),
      });

      if (!res.ok) throw new Error(`Compound subgraph error: ${res.status}`);

      const json = (await res.json()) as CompoundSubgraphResponse;
      const account = json.data.accounts[0];

      if (!account) return emptyCompoundSummary();

      const totalCollateralUsd = parseFloat(
        account.totalCollateralValueInUSD
      );
      const totalDebtUsd = parseFloat(account.totalBorrowValueInUSD);
      const healthFactor = account.health
        ? parseFloat(account.health)
        : totalDebtUsd > 0
        ? totalCollateralUsd / totalDebtUsd
        : Infinity;

      const positions: LoanPosition[] = account.positions
        .filter((p) => parseFloat(p.balance) !== 0)
        .map((p) => {
          const decimals = p.market.inputToken.decimals || 18;
          const balance = parseFloat(p.balance) / Math.pow(10, decimals);
          const isSupply = p.side === "COLLATERAL" || p.side === "LENDER";

          const borrowRate = p.market.rates.find(
            (r) => r.side === "BORROWER"
          );
          const apy = borrowRate ? parseFloat(borrowRate.rate) : 0;

          return {
            protocol: "COMPOUND_V3" as const,
            chain,
            asset: p.market.inputToken.symbol,
            supplyAmount: isSupply ? Math.abs(balance) : 0,
            borrowAmount: isSupply ? 0 : Math.abs(balance),
            supplyValueUsd: 0, // computed from market data
            borrowValueUsd: 0,
            healthFactor,
            liquidationPrice: null,
            apy,
          };
        });

      return {
        totalCollateralUsd,
        totalDebtUsd,
        healthFactor,
        positions,
      };
    },
    60
  );
}

function emptyCompoundSummary(): CompoundAccountSummary {
  return {
    totalCollateralUsd: 0,
    totalDebtUsd: 0,
    healthFactor: 0,
    positions: [],
  };
}
