import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getMevFeed,
  getCachedMevStats,
  syncMevEvents,
} from "@/lib/services/analytics/mev";
import type { Chain } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const mode = params.get("mode");

  // Trigger sync (could be called by a cron)
  if (mode === "sync") {
    const count = await syncMevEvents();
    return NextResponse.json({ synced: count });
  }

  if (mode === "stats") {
    const stats = await getCachedMevStats();
    return NextResponse.json({ data: stats });
  }

  // Default: feed
  const filters = {
    chain: (params.get("chain") as Chain) || undefined,
    type: params.get("type") || undefined,
    limit: params.get("limit") ? parseInt(params.get("limit")!) : undefined,
    offset: params.get("offset") ? parseInt(params.get("offset")!) : undefined,
  };

  const result = await getMevFeed(filters);
  return NextResponse.json({ data: result });
}
