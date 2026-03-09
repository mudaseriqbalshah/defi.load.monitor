import { NextRequest, NextResponse } from "next/server";
import { fetchYieldPools, type YieldFilters } from "@/lib/services/yields/defillama";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;

    const filters: YieldFilters = {};

    const chains = sp.get("chains");
    if (chains) filters.chains = chains.split(",");

    const projects = sp.get("projects");
    if (projects) filters.projects = projects.split(",");

    if (sp.get("stablecoinsOnly") === "true") filters.stablecoinsOnly = true;

    const minTvl = sp.get("minTvl");
    if (minTvl) filters.minTvl = parseFloat(minTvl);

    const minApy = sp.get("minApy");
    if (minApy) filters.minApy = parseFloat(minApy);

    const maxApy = sp.get("maxApy");
    if (maxApy) filters.maxApy = parseFloat(maxApy);

    const search = sp.get("search");
    if (search) filters.search = search;

    const sortBy = sp.get("sortBy") as YieldFilters["sortBy"];
    if (sortBy) filters.sortBy = sortBy;

    const sortOrder = sp.get("sortOrder") as YieldFilters["sortOrder"];
    if (sortOrder) filters.sortOrder = sortOrder;

    const data = await fetchYieldPools(
      Object.keys(filters).length > 0 ? filters : undefined
    );
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Yield API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch yield data" },
      { status: 500 }
    );
  }
}
