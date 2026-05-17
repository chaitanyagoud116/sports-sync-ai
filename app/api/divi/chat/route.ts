// app/api/divi/chat/route.ts — DIVI AI Chatbot API
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { handleDiviChat, getChatHistory, deleteChatSession } from "@/lib/services/divi-chatbot";
import { z } from "zod";

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().min(1),
});

// POST /api/divi/chat — send message to DIVI
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const userRole = session.user.role || "ATHLETE";

  try {
    const response = await handleDiviChat(
      parsed.data.message,
      userRole,
      parsed.data.sessionId
    );

    return NextResponse.json({ success: true, ...response });
  } catch (error) {
    console.error("[DIVI] Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

// GET /api/divi/chat?sessionId=xxx — get chat history
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const userId = session.user.id;
  const chatSession = await getChatHistory(sessionId, userId);

  if (!chatSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ session: chatSession });
}

// DELETE /api/divi/chat?sessionId=xxx — delete session
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const userId = session.user.id;
  const deleted = await deleteChatSession(sessionId, userId);

  if (!deleted) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
