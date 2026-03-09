import { NextRequest, NextResponse } from "next/server";
import { fetchAllLoanPositions } from "@/lib/services/loans";
import { fetchAavePositions } from "@/lib/services/loans/aave";
import { fetchCompoundPositions } from "@/lib/services/loans/compound";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  const chain = request.nextUrl.searchParams.get("chain");
  const protocol = request.nextUrl.searchParams.get("protocol");

  if (!address) {
    return NextResponse.json(
      { error: "Wallet address is required" },
      { status: 400 }
    );
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: "Invalid Ethereum address format" },
      { status: 400 }
    );
  }

  try {
    // If specific protocol + chain requested, return focused data
    if (protocol && chain) {
      if (protocol === "aave") {
        const validChains = ["ETHEREUM", "ARBITRUM", "BASE"] as const;
        const c = validChains.includes(chain as (typeof validChains)[number])
          ? (chain as (typeof validChains)[number])
          : "ETHEREUM";
        const data = await fetchAavePositions(address, c);
        return NextResponse.json({ data });
      }

      if (protocol === "compound") {
        const validChains = ["ETHEREUM", "ARBITRUM"] as const;
        const c = validChains.includes(chain as (typeof validChains)[number])
          ? (chain as (typeof validChains)[number])
          : "ETHEREUM";
        const data = await fetchCompoundPositions(address, c);
        return NextResponse.json({ data });
      }
    }

    // Default: aggregate all protocols across all chains
    const chains = chain
      ? ([chain.toUpperCase()] as Array<"ETHEREUM" | "ARBITRUM" | "BASE">)
      : (["ETHEREUM", "ARBITRUM"] as Array<"ETHEREUM" | "ARBITRUM" | "BASE">);

    const data = await fetchAllLoanPositions(address, chains);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Loans API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch loan positions" },
      { status: 500 }
    );
  }
}
