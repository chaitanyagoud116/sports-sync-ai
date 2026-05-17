import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { buildAIReportMetadata, generateStateReport } from "@/lib/ai";
import { isGovUser } from "@/lib/rbac";

// POST /api/ai/report — generate state-level AI summary report
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "GOV_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Aggregate state stats
  const [totalAthletes, totalTournaments, totalCoaches, sportBreak, districtBreak, medalTally, avgScore, topAthletes] =
    await Promise.all([
      prisma.athlete.count(),
      prisma.tournament.count({ where: { status: { in: ["ONGOING", "COMPLETED"] } } }),
      prisma.coach.count(),
      prisma.athlete.groupBy({ by: ["sport"], _count: { sport: true }, orderBy: { _count: { sport: "desc" } }, take: 8 }),
      prisma.athlete.groupBy({ by: ["district"], _count: { district: true }, orderBy: { _count: { district: "desc" } } }),
      prisma.result.aggregate({
        _count: true,
        where: { medal: { not: null } },
      }),
      prisma.athlete.aggregate({ _avg: { talentScore: true } }),
      prisma.athlete.findMany({
        take: 10,
        orderBy: { talentScore: "desc" },
        select: { fullName: true, sport: true, talentScore: true },
      }),
    ]);

  const medals = await prisma.result.groupBy({
    by: ["medal"],
    _count: { medal: true },
    where: { medal: { not: null } },
  });

  const medalMap = medals.reduce((acc, m) => {
    if (m.medal) acc[m.medal] = m._count.medal;
    return acc;
  }, {} as Record<string, number>);

  const reportContent = await generateStateReport({
    totalAthletes,
    totalTournaments,
    totalCoaches,
    sportBreakdown: sportBreak.map((s) => ({ sport: s.sport, count: s._count.sport })),
    districtBreakdown: districtBreak.map((d) => ({ district: d.district, count: d._count.district })),
    medalTally: {
      gold: medalMap["GOLD"] || 0,
      silver: medalMap["SILVER"] || 0,
      bronze: medalMap["BRONZE"] || 0,
    },
    avgTalentScore: avgScore._avg.talentScore || 0,
    topAthletes: topAthletes.map((a) => ({
      name: a.fullName,
      sport: a.sport,
      talentScore: a.talentScore,
    })),
  });

  const report = await prisma.aIReport.create({
    data: {
      type: "STATE_SUMMARY",
      title: `Goa State Sports Report — ${new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`,
      content: reportContent,
      metadata: buildAIReportMetadata({ totalAthletes, totalTournaments }),
      generatedBy: session.user.id,
    },
  });

  return NextResponse.json({ report });
}

// GET /api/ai/report — list past AI reports
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reports = await prisma.aIReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      type: true,
      title: true,
      createdAt: true,
      content: true,
    },
  });

  return NextResponse.json({ reports });
}
