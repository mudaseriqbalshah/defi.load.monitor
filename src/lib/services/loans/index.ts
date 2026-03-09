import {
  fetchAavePositions,
  type AaveAccountSummary,
} from "./aave";
import {
  fetchCompoundPositions,
  type CompoundAccountSummary,
} from "./compound";
import type { LoanPosition } from "@/types";

export interface AggregatedLoanData {
  totalCollateralUsd: number;
  totalDebtUsd: number;
  netWorthUsd: number;
  overallHealthFactor: number;
  positions: LoanPosition[];
  byProtocol: {
    aave: AaveAccountSummary;
    compound: CompoundAccountSummary;
  };
}

export async function fetchAllLoanPositions(
  walletAddress: string,
  chains: Array<"ETHEREUM" | "ARBITRUM" | "BASE"> = ["ETHEREUM", "ARBITRUM"]
): Promise<AggregatedLoanData> {
  // Fetch from all protocols and chains in parallel
  const aavePromises = chains.map((chain) =>
    fetchAavePositions(walletAddress, chain).catch(() => ({
      totalCollateralUsd: 0,
      totalDebtUsd: 0,
      availableBorrowsUsd: 0,
      healthFactor: 0,
      positions: [] as LoanPosition[],
    }))
  );

  const compoundChains = chains.filter(
    (c): c is "ETHEREUM" | "ARBITRUM" => c === "ETHEREUM" || c === "ARBITRUM"
  );
  const compoundPromises = compoundChains.map((chain) =>
    fetchCompoundPositions(walletAddress, chain).catch(() => ({
      totalCollateralUsd: 0,
      totalDebtUsd: 0,
      healthFactor: 0,
      positions: [] as LoanPosition[],
    }))
  );

  const [aaveResults, compoundResults] = await Promise.all([
    Promise.all(aavePromises),
    Promise.all(compoundPromises),
  ]);

  // Merge Aave results
  const aaveMerged: AaveAccountSummary = {
    totalCollateralUsd: aaveResults.reduce(
      (sum, r) => sum + r.totalCollateralUsd,
      0
    ),
    totalDebtUsd: aaveResults.reduce((sum, r) => sum + r.totalDebtUsd, 0),
    availableBorrowsUsd: aaveResults.reduce(
      (sum, r) => sum + r.availableBorrowsUsd,
      0
    ),
    healthFactor: weightedHealthFactor(aaveResults),
    positions: aaveResults.flatMap((r) => r.positions),
  };

  // Merge Compound results
  const compoundMerged: CompoundAccountSummary = {
    totalCollateralUsd: compoundResults.reduce(
      (sum, r) => sum + r.totalCollateralUsd,
      0
    ),
    totalDebtUsd: compoundResults.reduce(
      (sum, r) => sum + r.totalDebtUsd,
      0
    ),
    healthFactor: weightedHealthFactor(compoundResults),
    positions: compoundResults.flatMap((r) => r.positions),
  };

  const allPositions = [
    ...aaveMerged.positions,
    ...compoundMerged.positions,
  ];

  const totalCollateralUsd =
    aaveMerged.totalCollateralUsd + compoundMerged.totalCollateralUsd;
  const totalDebtUsd =
    aaveMerged.totalDebtUsd + compoundMerged.totalDebtUsd;

  return {
    totalCollateralUsd,
    totalDebtUsd,
    netWorthUsd: totalCollateralUsd - totalDebtUsd,
    overallHealthFactor:
      totalDebtUsd > 0 ? totalCollateralUsd / totalDebtUsd : Infinity,
    positions: allPositions,
    byProtocol: {
      aave: aaveMerged,
      compound: compoundMerged,
    },
  };
}

/** Compute debt-weighted average health factor across results */
function weightedHealthFactor(
  results: Array<{ totalDebtUsd: number; healthFactor: number }>
): number {
  const totalDebt = results.reduce((sum, r) => sum + r.totalDebtUsd, 0);
  if (totalDebt === 0) return 0;
  return results.reduce(
    (sum, r) => sum + r.healthFactor * (r.totalDebtUsd / totalDebt),
    0
  );
}
