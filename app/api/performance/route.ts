import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createRecordSchema = z.object({
  athleteId: z.string(),
  metric: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  recordedAt: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/performance?athleteId=xxx — get athlete performance history
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const athleteId = searchParams.get("athleteId");
  const metric = searchParams.get("metric") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const skip = (page - 1) * limit;

  if (!athleteId) {
    return NextResponse.json({ error: "athleteId required" }, { status: 400 });
  }

  const role = session.user.role;
  const userId = session.user.id;

  // Athletes can only view their own records
  if (role === "ATHLETE") {
    const athlete = await prisma.athlete.findFirst({ where: { userId } });
    if (!athlete || athlete.id !== athleteId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const whereCondition = { athleteId, ...(metric ? { metric } : {}) };

  const [records, total] = await Promise.all([
    prisma.performanceRecord.findMany({
      where: whereCondition,
      orderBy: { recordedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.performanceRecord.count({ where: whereCondition }),
  ]);

  // Group by metric for chart data (useful for frontend)
  const byMetric: Record<string, { date: string; value: number }[]> = {};
  for (const r of records) {
    if (!byMetric[r.metric]) byMetric[r.metric] = [];
    byMetric[r.metric].push({
      date: r.recordedAt.toISOString().split("T")[0],
      value: r.value,
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      records,
      byMetric,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/performance — log a performance record (coach or admin)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user.role;
  if (!["ADMIN", "GOV_ADMIN", "COACH"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createRecordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const record = await prisma.performanceRecord.create({
    data: {
      ...parsed.data,
      recordedAt: parsed.data.recordedAt ? new Date(parsed.data.recordedAt) : new Date(),
      recordedBy: session.user.id,
    },
  });

  return NextResponse.json({ success: true, record }, { status: 201 });
}
