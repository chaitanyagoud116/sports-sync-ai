// app/api/divi/sessions/route.ts — DIVI Chat Session Management API
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { createChatSession, getUserSessions } from "@/lib/services/divi-chatbot";

// GET /api/divi/sessions — list user's chat sessions
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const sessions = await getUserSessions(userId);
  return NextResponse.json({ sessions });
}

// POST /api/divi/sessions — create new session
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const sessionId = await createChatSession(userId);
  return NextResponse.json({ sessionId }, { status: 201 });
}
