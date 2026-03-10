import { prisma } from "@/lib/db";
import { randomBytes, createHash } from "crypto";

// ─── Generate API key ───────────────────────────────────────────

function generateKey(): { raw: string; hashed: string } {
  const raw = `dlm_${randomBytes(32).toString("hex")}`;
  const hashed = hashKey(raw);
  return { raw, hashed };
}

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

// ─── CRUD ───────────────────────────────────────────────────────

export async function createApiKey(
  userId: string,
  name: string,
  expiresInDays?: number
) {
  // Limit: max 5 keys per user
  const count = await prisma.apiKey.count({ where: { userId } });
  if (count >= 5) {
    throw new Error("Maximum of 5 API keys allowed");
  }

  const { raw, hashed } = generateKey();

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      key: hashed,
      name,
      expiresAt,
    },
  });

  // Return the raw key only once (on creation)
  return { id: apiKey.id, name: apiKey.name, key: raw, expiresAt };
}

export async function listApiKeys(userId: string) {
  const keys = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      lastUsed: true,
      createdAt: true,
      expiresAt: true,
    },
  });
  return keys;
}

export async function revokeApiKey(userId: string, keyId: string) {
  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, userId },
  });
  if (!key) throw new Error("API key not found");

  await prisma.apiKey.delete({ where: { id: keyId } });
}

// ─── Validate API key (for middleware) ──────────────────────────

export async function validateApiKey(
  rawKey: string
): Promise<{ userId: string; tier: string } | null> {
  const hashed = hashKey(rawKey);

  const apiKey = await prisma.apiKey.findUnique({
    where: { key: hashed },
    include: {
      user: {
        include: {
          subscription: { select: { tier: true } },
        },
      },
    },
  });

  if (!apiKey) return null;

  // Check expiration
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null;
  }

  // Update lastUsed
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsed: new Date() },
  });

  return {
    userId: apiKey.userId,
    tier: apiKey.user.subscription?.tier ?? "FREE",
  };
}
