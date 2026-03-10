import type { SubscriptionTier } from "@prisma/client";

// ─── In-memory rate limiter ─────────────────────────────────────
// For production, use Redis-based rate limiting.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Requests per minute by tier
const RATE_LIMITS: Record<SubscriptionTier, number> = {
  FREE: 20,
  PRO: 60,
  ANALYST: 120,
  WHALE: 300,
};

const WINDOW_MS = 60_000; // 1 minute

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  identifier: string,
  tier: SubscriptionTier = "FREE"
): RateLimitResult {
  const now = Date.now();
  const limit = RATE_LIMITS[tier];
  const key = `rl:${identifier}`;

  let entry = store.get(key);

  // Reset expired windows
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(key, entry);
  }

  entry.count++;

  const allowed = entry.count <= limit;
  const remaining = Math.max(0, limit - entry.count);

  return { allowed, limit, remaining, resetAt: entry.resetAt };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of Array.from(store.entries())) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}, 60_000);
