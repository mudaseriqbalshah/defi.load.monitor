import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getTradeById,
  closeTrade,
  updateTradeNotes,
  deleteTrade,
} from "@/lib/services/trading";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Single trade
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const trade = await getTradeById(session.user.id, id);
  if (!trade) {
    return NextResponse.json({ error: "Trade not found" }, { status: 404 });
  }

  return NextResponse.json({ data: trade });
}

// PATCH: Close trade or update notes
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "close") {
      const { priceAtExit, pnl, pnlPercent } = body;
      if (priceAtExit == null || pnl == null || pnlPercent == null) {
        return NextResponse.json(
          { error: "priceAtExit, pnl, and pnlPercent are required" },
          { status: 400 }
        );
      }

      const trade = await closeTrade(session.user.id, id, {
        priceAtExit: Number(priceAtExit),
        pnl: Number(pnl),
        pnlPercent: Number(pnlPercent),
      });
      return NextResponse.json({ data: trade });
    }

    if (action === "notes") {
      const { notes, tags } = body;
      const trade = await updateTradeNotes(
        session.user.id,
        id,
        notes ?? "",
        tags
      );
      return NextResponse.json({ data: trade });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE: Remove trade
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteTrade(session.user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
