import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { buildAIReportMetadata, generateTalentReport } from "@/lib/ai";
import { isGovUser } from "@/lib/rbac";
import { computeTalentScore, computeTrend, computeConsistency } from "@/lib/analytics";

// GET /api/ai/talent — get talent leaderboard + AI analysis
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const sport = searchParams.get("sport") || undefined;
  const district = searchParams.get("district") || undefined;

  const athletes = await prisma.athlete.findMany({
    where: {
      isBlacklisted: false,
      ...(sport ? { sport } : {}),
      ...(district ? { district } : {}),
    },
    include: {
      results: { select: { rank: true, medal: true } },
      performanceRecords: { select: { value: true, metric: true, recordedAt: true }, orderBy: { recordedAt: "asc" } },
    },
    take: 100,
  });

  // Recompute talent scores
  const scored = athletes.map((a) => {
    const results = a.results;
    const records = a.performanceRecords;

    const wins = results.filter((r) => r.rank === 1).length;
    const winRate = results.length > 0 ? wins / results.length : 0;

    const values = records.map((r) => r.value);
    const trend = values.length > 1 ? Math.max(0, Math.min(1, (computeTrend(values) + 1) / 2)) : 0.5;
    const consistency = computeConsistency(values);
    const participationRate = Math.min(results.length / 10, 1);
    const medalCount = results.filter((r) => r.medal).length;

    const score = computeTalentScore({
      winRate,
      performanceTrend: trend,
      consistencyScore: consistency,
      participationRate,
      medalCount,
      resultsCount: results.length,
    });

    return {
      id: a.id,
      name: a.fullName,
      sport: a.sport,
      district: a.district,
      talentScore: score,
      resultsCount: results.length,
      medalCount,
      performanceCount: records.length,
    };
  });

  // Sort by talent score
  scored.sort((a, b) => b.talentScore - a.talentScore);

  // Update DB talent scores in background (fire and forget)
  Promise.all(
    scored.map((a) =>
      prisma.athlete.update({ where: { id: a.id }, data: { talentScore: a.talentScore } })
    )
  ).catch(console.error);

  return NextResponse.json({ athletes: scored.slice(0, 50) });
}

// POST /api/ai/talent — generate AI talent identification report
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user.role;
  if (!isGovUser(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const athletes = await prisma.athlete.findMany({
    where: { isBlacklisted: false },
    orderBy: { talentScore: "desc" },
    take: 20,
    include: {
      results: { select: { medal: true, rank: true } },
      performanceRecords: { select: { value: true } },
    },
  });

  const candidates = athletes.map((a) => ({
    name: a.fullName,
    sport: a.sport,
    district: a.district,
    talentScore: a.talentScore,
    resultsCount: a.results.length,
    medalCount: a.results.filter((r) => r.medal).length,
    performanceCount: a.performanceRecords.length,
  }));

  const report = await generateTalentReport(candidates);

  await prisma.aIReport.create({
    data: {
      type: "TALENT_ID",
      title: `Talent Identification Report — ${new Date().toLocaleDateString("en-IN")}`,
      content: report,
      metadata: buildAIReportMetadata({ candidateCount: candidates.length }),
      generatedBy: session.user.id,
    },
  });

  return NextResponse.json({ report, candidateCount: candidates.length });
}
