import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getCachedLatestTvl,
  getCachedTvlOverview,
  syncTvlSnapshots,
} from "@/lib/services/analytics/tvl";
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
    const count = await syncTvlSnapshots();
    return NextResponse.json({ synced: count });
  }

  if (mode === "overview") {
    const overview = await getCachedTvlOverview();
    return NextResponse.json({ data: overview });
  }

  // Default: latest TVL per protocol+chain
  const filters = {
    chain: (params.get("chain") as Chain) || undefined,
    protocol: params.get("protocol") || undefined,
    limit: params.get("limit") ? parseInt(params.get("limit")!) : undefined,
  };

  const data = await getCachedLatestTvl(filters);
  return NextResponse.json({ data });
}
