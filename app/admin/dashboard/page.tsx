import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

async function getAdminData() {
  const [
    totalAthletes,
    pendingApps,
    activeTournaments,
    totalVenues,
    totalCoaches,
    totalAcademies,
    activeDistricts,
    aiReportCount,
    sportBreakdown,
    districtBreakdown,
    recentApps,
    topAthletes,
    medalTally,
    avgTalentScore,
    recentActivity,
    latestReport,
  ] = await Promise.all([
    prisma.athlete.count(),
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.tournament.count({ where: { status: { in: ["PUBLISHED", "ONGOING"] } } }),
    prisma.venue.count({ where: { isActive: true } }),
    prisma.coach.count(),
    prisma.academy.count({ where: { isActive: true } }),
    prisma.athlete.groupBy({ by: ["district"] }).then((r) => r.length),
    prisma.aIReport.count(),
    prisma.athlete.groupBy({ by: ["sport"], _count: { sport: true }, orderBy: { _count: { sport: "desc" } }, take: 8 }),
    prisma.athlete.groupBy({ by: ["district"], _count: { district: true }, orderBy: { _count: { district: "desc" } } }),
    prisma.application.findMany({
      orderBy: { appliedAt: "desc" },
      take: 6,
      include: {
        athlete: { select: { fullName: true, sport: true } },
        tournament: { select: { name: true } },
      },
    }),
    prisma.athlete.findMany({
      take: 5,
      orderBy: { talentScore: "desc" },
      where: { isBlacklisted: false },
      select: { id: true, fullName: true, sport: true, district: true, talentScore: true },
    }),
    prisma.result.groupBy({
      by: ["medal"],
      _count: { medal: true },
      where: { medal: { not: null } },
    }),
    prisma.athlete.aggregate({ _avg: { talentScore: true } }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { email: true, role: true } } },
    }),
    prisma.aIReport.findFirst({
      where: { type: "STATE_SUMMARY" },
      orderBy: { createdAt: "desc" },
      select: { title: true, content: true, createdAt: true },
    }),
  ]);

  const medalMap = medalTally.reduce((acc, m) => {
    if (m.medal) acc[m.medal] = m._count.medal;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalAthletes,
    pendingApps,
    activeTournaments,
    totalVenues,
    totalCoaches,
    totalAcademies,
    activeDistricts,
    aiReportCount,
    sportBreakdown,
    districtBreakdown,
    recentApps,
    topAthletes,
    medalMap,
    avgTalentScore,
    recentActivity,
    latestReport,
  };
}

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await getAdminData();

  return <AdminDashboardClient data={data} />;
}
