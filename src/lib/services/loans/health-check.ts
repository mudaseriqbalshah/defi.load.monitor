import { prisma } from "@/lib/db";
import {
  createAlertHistory,
  sendTelegramAlert,
  sendEmailAlert,
} from "@/lib/services/alerts";
import { fetchAllLoanPositions } from ".";
import { formatUsd } from "@/lib/utils";

/**
 * Check health factors for all active wallets and trigger alerts.
 * Designed to run as a cron job / background worker.
 */
export async function checkHealthFactors() {
  // Get all users with active wallets and health factor alerts
  const users = await prisma.user.findMany({
    where: {
      wallets: { some: { isActive: true } },
    },
    include: {
      wallets: { where: { isActive: true, chain: { in: ["ETHEREUM", "ARBITRUM", "BASE"] } } },
      preferences: true,
      alerts: {
        where: { type: "HEALTH_FACTOR", isActive: true },
      },
    },
  });

  for (const user of users) {
    const threshold = user.preferences?.healthFactorThreshold ?? 1.5;

    for (const wallet of user.wallets) {
      try {
        const data = await fetchAllLoanPositions(wallet.address, [
          wallet.chain as "ETHEREUM" | "ARBITRUM" | "BASE",
        ]);

        // Check if any position has HF below threshold
        const riskyPositions = data.positions.filter(
          (p) => p.healthFactor > 0 && p.healthFactor < threshold
        );

        if (riskyPositions.length === 0) continue;

        const lowestHf = Math.min(...riskyPositions.map((p) => p.healthFactor));
        const title = `Health Factor Alert: ${lowestHf.toFixed(2)}`;
        const message = buildAlertMessage(
          wallet.address,
          lowestHf,
          threshold,
          data.totalCollateralUsd,
          data.totalDebtUsd
        );

        // Save in-app alert
        await createAlertHistory(user.id, "HEALTH_FACTOR", title, message, {
          walletAddress: wallet.address,
          chain: wallet.chain,
          healthFactor: lowestHf,
          totalCollateral: data.totalCollateralUsd,
          totalDebt: data.totalDebtUsd,
        });

        // Send Telegram notification
        if (
          user.preferences?.telegramNotifications &&
          user.preferences.telegramChatId
        ) {
          await sendTelegramAlert(
            user.preferences.telegramChatId,
            `⚠️ *Health Factor Alert*\n\n` +
              `Wallet: \`${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}\`\n` +
              `Health Factor: *${lowestHf.toFixed(2)}* (threshold: ${threshold})\n` +
              `Collateral: ${formatUsd(data.totalCollateralUsd)}\n` +
              `Debt: ${formatUsd(data.totalDebtUsd)}\n\n` +
              `_Add collateral or repay debt to avoid liquidation._`
          );
        }

        // Send email notification
        if (user.preferences?.emailNotifications && user.email) {
          await sendEmailAlert(
            user.email,
            `⚠️ Health Factor ${lowestHf.toFixed(2)} — Action Required`,
            `<h2>Health Factor Alert</h2>
            <p>Your wallet <code>${wallet.address}</code> on ${wallet.chain} has a health factor of <strong>${lowestHf.toFixed(2)}</strong>.</p>
            <p>Threshold: ${threshold}</p>
            <p>Collateral: ${formatUsd(data.totalCollateralUsd)}</p>
            <p>Debt: ${formatUsd(data.totalDebtUsd)}</p>
            <p><strong>Add collateral or repay debt to avoid liquidation.</strong></p>`
          );
        }
      } catch (error) {
        console.error(
          `Health check failed for wallet ${wallet.address}:`,
          error
        );
      }
    }
  }
}

function buildAlertMessage(
  address: string,
  healthFactor: number,
  threshold: number,
  collateral: number,
  debt: number
): string {
  return (
    `Wallet ${address.slice(0, 6)}...${address.slice(-4)} health factor ` +
    `dropped to ${healthFactor.toFixed(2)} (below threshold ${threshold}). ` +
    `Collateral: ${formatUsd(collateral)}, Debt: ${formatUsd(debt)}. ` +
    `Add collateral or repay debt to avoid liquidation.`
  );
}
