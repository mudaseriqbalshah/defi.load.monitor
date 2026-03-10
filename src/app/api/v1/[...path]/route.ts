import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/services/api-keys";
import { checkRateLimit } from "@/lib/services/rate-limit";
import type { SubscriptionTier } from "@prisma/client";

// Public API gateway with API key auth and rate limiting.
// Proxies to internal API routes: /api/v1/yields → /api/yields, etc.

const ALLOWED_PATHS = [
  "yields",
  "trading",
  "analytics/whales",
  "analytics/tvl",
  "analytics/mev",
  "dashboard",
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // Extract API key from header
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing x-api-key header" },
      { status: 401 }
    );
  }

  // Validate key
  const keyData = await validateApiKey(apiKey);
  if (!keyData) {
    return NextResponse.json(
      { error: "Invalid or expired API key" },
      { status: 401 }
    );
  }

  // Rate limit
  const rl = checkRateLimit(keyData.userId, keyData.tier as SubscriptionTier);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000) },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(rl.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
        },
      }
    );
  }

  // Check tier access (API access requires WHALE tier)
  if (keyData.tier !== "WHALE") {
    return NextResponse.json(
      { error: "API access requires Whale tier" },
      { status: 403 }
    );
  }

  // Validate path
  const { path } = await params;
  const routePath = path.join("/");
  if (!ALLOWED_PATHS.includes(routePath)) {
    return NextResponse.json(
      { error: `Unknown endpoint: /api/v1/${routePath}` },
      { status: 404 }
    );
  }

  // Proxy to internal route
  const internalUrl = new URL(`/api/${routePath}`, request.nextUrl.origin);
  // Forward query params
  request.nextUrl.searchParams.forEach((value, key) => {
    internalUrl.searchParams.set(key, value);
  });

  try {
    const res = await fetch(internalUrl.toString(), {
      headers: {
        cookie: "", // Don't forward cookies
        "x-forwarded-user": keyData.userId,
      },
    });

    const data = await res.json();

    return NextResponse.json(data, {
      status: res.status,
      headers: {
        "X-RateLimit-Limit": String(rl.limit),
        "X-RateLimit-Remaining": String(rl.remaining),
        "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal proxy error" },
      { status: 502 }
    );
  }
}
