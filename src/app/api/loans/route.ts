import { NextRequest, NextResponse } from "next/server";
import { fetchAavePositions } from "@/lib/services/loans/aave";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  const chain = request.nextUrl.searchParams.get("chain") ?? "ETHEREUM";

  if (!address) {
    return NextResponse.json(
      { error: "Wallet address is required" },
      { status: 400 }
    );
  }

  try {
    const validChains = ["ETHEREUM", "ARBITRUM", "BASE"] as const;
    const chainParam = validChains.includes(chain as typeof validChains[number])
      ? (chain as typeof validChains[number])
      : "ETHEREUM";

    const positions = await fetchAavePositions(address, chainParam);
    return NextResponse.json({ data: positions });
  } catch (error) {
    console.error("Loans API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch loan positions" },
      { status: 500 }
    );
  }
}
