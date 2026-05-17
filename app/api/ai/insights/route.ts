import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { buildAIReportMetadata, generateAthleteInsight } from "@/lib/ai";
import { getAIModelName } from "@/lib/ai/provider";

// POST /api/ai/insights — generate athlete insight via Gemini
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { athleteId } = await req.json();
  if (!athleteId) return NextResponse.json({ error: "athleteId required" }, { status: 400 });

  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    include: {
      performanceRecords: { orderBy: { recordedAt: "desc" }, take: 20 },
      results: { include: { tournament: { select: { name: true } } }, orderBy: { publishedAt: "desc" }, take: 10 },
    },
  });

  if (!athlete) return NextResponse.json({ error: "Athlete not found" }, { status: 404 });

  const insight = await generateAthleteInsight({
    name: athlete.fullName,
    sport: athlete.sport,
    experienceLevel: athlete.experienceLevel,
    district: athlete.district,
    talentScore: athlete.talentScore,
    performanceRecords: athlete.performanceRecords.map((r) => ({
      metric: r.metric,
      value: r.value,
      unit: r.unit,
      recordedAt: r.recordedAt.toISOString(),
    })),
    results: athlete.results.map((r) => ({
      tournamentName: r.tournament.name,
      rank: r.rank,
      medal: r.medal,
      score: r.score,
    })),
  });

  // Store the report
  await prisma.aIReport.create({
    data: {
      type: "ATHLETE_INSIGHT",
      targetId: athleteId,
      title: `Athlete Insight: ${athlete.fullName}`,
      content: insight,
      metadata: buildAIReportMetadata({ model: getAIModelName(), athleteId }),
      generatedBy: session.user.id,
    },
  });

  return NextResponse.json({ insight, athleteName: athlete.fullName });
}
