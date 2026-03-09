import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createPortalSession } from "@/lib/services/payments/stripe";

export async function POST() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = await createPortalSession(session.user.id);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
