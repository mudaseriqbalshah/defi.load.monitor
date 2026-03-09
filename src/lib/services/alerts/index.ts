import { prisma } from "@/lib/db";
import type { AlertType, Prisma } from "@prisma/client";

export async function createAlertHistory(
  userId: string,
  type: AlertType,
  title: string,
  message: string,
  metadata?: Prisma.InputJsonValue
) {
  return prisma.alertHistory.create({
    data: { userId, type, title, message, metadata },
  });
}

export async function sendTelegramAlert(chatId: string, message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    }),
  });
}

export async function sendEmailAlert(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "DeFi Monitor <alerts@defiloadmonitor.com>",
      to,
      subject,
      html,
    }),
  });
}
