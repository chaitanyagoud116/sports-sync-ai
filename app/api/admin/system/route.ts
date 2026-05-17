// app/api/admin/system/route.ts — System Health & Configuration API
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getStorageStats } from "@/lib/services/archive-manager";
import { getRetentionPolicy, updateRetentionPolicy } from "@/lib/services/archive-manager";
import { prisma } from "@/lib/db";
import { cacheStats } from "@/lib/middleware/api-cache";

// GET /api/admin/system — system health dashboard data
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user.role;
  if (!["ADMIN", "GOV_ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section"); // "stats" | "config" | "cache"

  if (section === "config") {
    const policy = await getRetentionPolicy();
    const configs = await prisma.systemConfig.findMany({
      orderBy: { category: "asc" },
    });
    return NextResponse.json({ success: true, data: { policy, configs } });
  }

  if (section === "cache") {
    return NextResponse.json({ success: true, data: cacheStats() });
  }

  // Default: full system stats
  const [storageStats, userCounts, recentAudit] = await Promise.all([
    getStorageStats(),
    prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
      where: { isActive: true },
    }),
    prisma.auditLog.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      storageStats,
      usersByRole: userCounts.map((u) => ({ role: u.role, count: u._count.role })),
      last24hActions: recentAudit,
      serverTime: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    },
  });
}

// PUT /api/admin/system — update system configuration
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user.role;
  if (role !== "GOV_ADMIN") {
    return NextResponse.json({ error: "Forbidden — GOV_ADMIN only" }, { status: 403 });
  }

  const body = await req.json();

  if (body.retentionPolicy) {
    const updated = await updateRetentionPolicy(body.retentionPolicy);
    return NextResponse.json({ success: true, data: { retentionPolicy: updated } });
  }

  if (body.key && body.value !== undefined) {
    const config = await prisma.systemConfig.upsert({
      where: { key: body.key },
      update: { value: typeof body.value === "string" ? body.value : JSON.stringify(body.value) },
      create: {
        key: body.key,
        value: typeof body.value === "string" ? body.value : JSON.stringify(body.value),
        category: body.category || "GENERAL",
      },
    });
    return NextResponse.json({ success: true, data: config });
  }

  return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
}
