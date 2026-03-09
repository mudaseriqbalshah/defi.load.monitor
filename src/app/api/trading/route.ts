import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createTrade, getTrades, getTradeStats } from "@/lib/services/trading";
import type { Chain, TradeType } from "@prisma/client";

// GET: List trades or get stats
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const mode = params.get("mode"); // "stats" or default "list"

  if (mode === "stats") {
    const chain = params.get("chain") as Chain | undefined;
    const stats = await getTradeStats(session.user.id, chain || undefined);
    return NextResponse.json({ data: stats });
  }

  const filters = {
    chain: (params.get("chain") as Chain) || undefined,
    tradeType: (params.get("tradeType") as TradeType) || undefined,
    status: (params.get("status") as "open" | "closed" | "all") || undefined,
    tokenSearch: params.get("tokenSearch") || undefined,
    sortBy:
      (params.get("sortBy") as
        | "openedAt"
        | "closedAt"
        | "pnl"
        | "pnlPercent"
        | "amountIn") || undefined,
    sortDir: (params.get("sortDir") as "asc" | "desc") || undefined,
    limit: params.get("limit") ? parseInt(params.get("limit")!) : undefined,
    offset: params.get("offset") ? parseInt(params.get("offset")!) : undefined,
  };

  const result = await getTrades(session.user.id, filters);
  return NextResponse.json({ data: result });
}

// POST: Create a new trade
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      chain,
      protocol,
      tradeType,
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      priceAtEntry,
      txHash,
      notes,
      tags,
    } = body;

    if (
      !chain ||
      !protocol ||
      !tradeType ||
      !tokenIn ||
      !tokenOut ||
      amountIn == null ||
      amountOut == null ||
      priceAtEntry == null
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const trade = await createTrade(session.user.id, {
      chain,
      protocol,
      tradeType,
      tokenIn,
      tokenOut,
      amountIn: Number(amountIn),
      amountOut: Number(amountOut),
      priceAtEntry: Number(priceAtEntry),
      txHash,
      notes,
      tags,
    });

    return NextResponse.json({ data: trade }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
