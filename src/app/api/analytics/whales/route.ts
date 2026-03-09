import { NextRequest, NextResponse } from "next/server";
import { getWhaleFeed, getWhaleStats } from "@/lib/services/analytics/whales";
import type { Chain } from "@prisma/client";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const view = sp.get("view"); // "feed" or "stats"

  try {
    if (view === "stats") {
      const hours = parseInt(sp.get("hours") ?? "24", 10);
      const stats = await getWhaleStats(hours);
      return NextResponse.json({ data: stats });
    }

    // Default: feed
    const chains = sp.get("chains")?.split(",") as Chain[] | undefined;
    const minValueUsd = sp.get("minValueUsd")
      ? parseFloat(sp.get("minValueUsd")!)
      : undefined;
    const asset = sp.get("asset") ?? undefined;
    const limit = parseInt(sp.get("limit") ?? "50", 10);
    const offset = parseInt(sp.get("offset") ?? "0", 10);

    const data = await getWhaleFeed({
      chains,
      minValueUsd,
      asset,
      limit,
      offset,
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Whale API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch whale data" },
      { status: 500 }
    );
  }
}
