// app/api/admin/audit/route.ts — Audit Trail API
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getAuditTrail } from "@/lib/services/audit-service";

// GET /api/admin/audit?page=1&limit=50&action=xxx&targetType=xxx
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user.role;
  if (!["ADMIN", "GOV_ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const action = searchParams.get("action") || undefined;
  const targetType = searchParams.get("targetType") || undefined;
  const actorId = searchParams.get("actorId") || undefined;
  const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
  const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;

  const result = await getAuditTrail({ page, limit, action, targetType, actorId, startDate, endDate });

  return NextResponse.json({ success: true, data: result });
}
