import { NextResponse } from "next/server";
import { fetchYieldPools } from "@/lib/services/yields/defillama";

export async function GET() {
  try {
    const pools = await fetchYieldPools();
    return NextResponse.json({ data: pools });
  } catch (error) {
    console.error("Yield API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch yield data" },
      { status: 500 }
    );
  }
}
