import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/stats — aggregated KPIs for the admin dashboard
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "GOV_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalAthletes,
    pendingApps,
    activeTournaments,
    activeVenues,
    totalCoaches,
    totalAcademies,
    medalTally,
    avgTalentScore,
    sportBreakdown,
    districtBreakdown,
    recentAuditLogs,
    aiReportCount,
    districtHeatmap,
    budgetStats
  ] = await Promise.all([
    prisma.athlete.count(),
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.tournament.count({ where: { status: { in: ["PUBLISHED", "ONGOING"] } } }),
    prisma.venue.count({ where: { isActive: true } }),
    prisma.coach.count(),
    prisma.academy.count({ where: { isActive: true } }),
    prisma.result.groupBy({
      by: ["medal"],
      _count: { medal: true },
      where: { medal: { not: null } },
    }),
    prisma.athlete.aggregate({ _avg: { talentScore: true } }),
    prisma.athlete.groupBy({
      by: ["sport"],
      _count: { sport: true },
      orderBy: { _count: { sport: "desc" } },
      take: 8,
    }),
    prisma.athlete.groupBy({
      by: ["district"],
      _count: { district: true },
      orderBy: { _count: { district: "desc" } },
    }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { email: true, role: true } } },
    }),
    prisma.aIReport.count(),
    
    // New enhancements
    prisma.athlete.groupBy({
      by: ["district"],
      _avg: { talentScore: true },
    }),
    prisma.budgetAllocation.aggregate({
      _sum: { amount: true, spent: true },
      where: { fiscalYear: "2025-26" },
    })
  ]);

  // Calculate monthly athlete growth for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const athletesLast6Months = await prisma.athlete.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true }
  });

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const growthMap = new Map<string, number>();
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    growthMap.set(`${monthNames[d.getMonth()]} ${d.getFullYear()}`, 0);
  }

  for (const athlete of athletesLast6Months) {
    const key = `${monthNames[athlete.createdAt.getMonth()]} ${athlete.createdAt.getFullYear()}`;
    if (growthMap.has(key)) {
      growthMap.set(key, growthMap.get(key)! + 1);
    }
  }

  const athleteGrowth = Array.from(growthMap.entries()).map(([month, count]) => ({
    month,
    registrations: count
  }));

  const medalMap = medalTally.reduce((acc, m) => {
    if (m.medal) acc[m.medal] = m._count.medal;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    kpis: {
      totalAthletes,
      pendingApps,
      activeTournaments,
      activeVenues,
      totalCoaches,
      totalAcademies,
      avgTalentScore: avgTalentScore._avg.talentScore ?? 0,
      aiReportCount,
      goldMedals: medalMap["GOLD"] || 0,
      silverMedals: medalMap["SILVER"] || 0,
      bronzeMedals: medalMap["BRONZE"] || 0,
    },
    budget: {
      totalAllocated: budgetStats._sum.amount || 0,
      totalSpent: budgetStats._sum.spent || 0,
      utilizationPercent: budgetStats._sum.amount ? Math.round(((budgetStats._sum.spent || 0) / budgetStats._sum.amount) * 100) : 0,
    },
    sportBreakdown: sportBreakdown.map((s) => ({
      name: s.sport.replace(/_/g, " "),
      value: s._count.sport,
    })),
    districtBreakdown: districtBreakdown.map((d) => ({
      name: d.district.replace(/_/g, " "),
      value: d._count.district,
      avgTalentScore: districtHeatmap.find(h => h.district === d.district)?._avg.talentScore || 0
    })),
    athleteGrowth,
    recentActivity: recentAuditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      actor: log.actor.email,
      role: log.actor.role,
      targetType: log.targetType,
      details: log.details,
      createdAt: log.createdAt,
    })),
  });
}
