import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Trophy, Medal, TrendingUp, Megaphone, ArrowRight } from "lucide-react";
import KPICard from "@/components/dashboard/KPICard";

export default async function DistrictDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const role = (session.user as { role?: string }).role;

  const officer = await prisma.districtOfficer.findUnique({
    where: { userId },
  });

  const districtFilter =
    officer?.district ??
    (role === "GOV_ADMIN" || role === "ADMIN" ? undefined : "PANAJI");

  const where = districtFilter ? { district: districtFilter } : {};

  const [
    athleteCount,
    tournamentCount,
    pendingApps,
    medalResults,
    topAthletes,
    announcements,
  ] = await Promise.all([
    prisma.athlete.count({ where }),
    prisma.tournament.count({
      where: districtFilter
        ? { venue: { district: districtFilter } }
        : undefined,
    }),
    prisma.application.count({
      where: { status: "PENDING", athlete: where },
    }),
    prisma.result.findMany({
      where: { medal: { not: null }, athlete: where },
      select: { medal: true },
    }),
    prisma.athlete.findMany({
      where: { ...where, isBlacklisted: false },
      orderBy: { talentScore: "desc" },
      take: 5,
      select: { id: true, fullName: true, sport: true, talentScore: true },
    }),
    prisma.announcement.findMany({
      where: {
        OR: [
          { scope: "STATE" },
          ...(districtFilter
            ? [{ scope: "DISTRICT", scopeValue: districtFilter }]
            : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const medals = {
    gold: medalResults.filter((m) => m.medal === "GOLD").length,
    silver: medalResults.filter((m) => m.medal === "SILVER").length,
    bronze: medalResults.filter((m) => m.medal === "BRONZE").length,
  };

  const districtLabel = (districtFilter ?? "Goa State").replace(/_/g, " ");

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm font-medium" style={{ color: "#10b981" }}>
            District Sports Command
          </p>
          <h1 className="text-3xl font-bold text-primary mt-1">
            {districtLabel} Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            Athlete pipeline, events, and district-level insights
          </p>
        </div>
        <Link
          href="/district/announcements"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Megaphone className="w-4 h-4" />
          Post Announcement
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="Registered Athletes"
          value={athleteCount}
          icon={<Users className="w-5 h-5" />}
          color="#3b82f6"
          change="+12% YoY"
          trend="up"
        />
        <KPICard
          label="Active Tournaments"
          value={tournamentCount}
          icon={<Trophy className="w-5 h-5" />}
          color="#8b5cf6"
        />
        <KPICard
          label="Pending Applications"
          value={pendingApps}
          icon={<TrendingUp className="w-5 h-5" />}
          color="#f59e0b"
        />
        <KPICard
          label="Medals Won"
          value={`${medals.gold}G ${medals.silver}S ${medals.bronze}B`}
          icon={<Medal className="w-5 h-5" />}
          color="#10b981"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Top Talent</h2>
            <Link
              href="/district/athletes"
              className="text-xs flex items-center gap-1"
              style={{ color: "#3b82f6" }}
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topAthletes.map((a, i) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      background: "rgba(59,130,246,0.15)",
                      color: "#3b82f6",
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-primary">{a.fullName}</p>
                    <p className="text-xs" style={{ color: "#64748b" }}>
                      {a.sport.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "#10b981" }}
                >
                  {a.talentScore.toFixed(1)}
                </span>
              </div>
            ))}
            {topAthletes.length === 0 && (
              <p className="text-sm" style={{ color: "#64748b" }}>
                No athletes registered in this district yet.
              </p>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">
            Recent Announcements
          </h2>
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-3 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p className="text-sm font-medium text-primary">{ann.title}</p>
                <p
                  className="text-xs mt-1 line-clamp-2"
                  style={{ color: "#94a3b8" }}
                >
                  {ann.message}
                </p>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-sm" style={{ color: "#64748b" }}>
                No announcements yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
