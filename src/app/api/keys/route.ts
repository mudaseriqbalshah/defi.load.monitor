import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createApiKey, listApiKeys } from "@/lib/services/api-keys";

// GET: List user's API keys
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await listApiKeys(session.user.id);
  return NextResponse.json({ data: keys });
}

// POST: Create a new API key
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, expiresInDays } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const key = await createApiKey(
      session.user.id,
      name,
      expiresInDays ? Number(expiresInDays) : undefined
    );

    return NextResponse.json({ data: key }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
