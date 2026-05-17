// app/api/admin/archive/route.ts — Archive Management API
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { archiveCompletedEvents, getStorageStats, runCleanupJob } from "@/lib/services/archive-manager";
import { logAction } from "@/lib/services/audit-service";
import { prisma } from "@/lib/db";

// GET /api/admin/archive — list archived events + storage stats
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user.role;
  if (!["ADMIN", "GOV_ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const [archives, total, storageStats] = await Promise.all([
    prisma.eventArchive.findMany({
      orderBy: { archivedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.eventArchive.count(),
    getStorageStats(),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      archives,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
      storageStats,
    },
  });
}

// POST /api/admin/archive — trigger archival or full cleanup
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user.role;
  if (!["ADMIN", "GOV_ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const action = body.action || "archive"; // "archive" | "cleanup"
  const olderThanDays = body.olderThanDays || 90;

  let result;
  if (action === "cleanup") {
    result = await runCleanupJob();
    await logAction(
      session.user.id,
      "SYSTEM_CLEANUP",
      "System",
      undefined,
      JSON.stringify(result)
    );
  } else {
    const count = await archiveCompletedEvents(olderThanDays);
    result = { archivedEvents: count };
    await logAction(
      session.user.id,
      "EVENT_ARCHIVE",
      "Tournament",
      undefined,
      `Archived ${count} events older than ${olderThanDays} days`
    );
  }

  return NextResponse.json({ success: true, data: result });
}
