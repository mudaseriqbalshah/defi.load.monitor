import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { revokeApiKey } from "@/lib/services/api-keys";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE: Revoke an API key
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await revokeApiKey(session.user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
