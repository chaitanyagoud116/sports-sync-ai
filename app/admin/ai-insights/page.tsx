import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Brain, Trophy, Star, ArrowRight, Zap, Target, AlertTriangle, TrendingUp } from "lucide-react";
import AIInsightsClient from "./AIInsightsClient";

export default async function AIInsightsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [topAthletes, latestReports, stateStats] = await Promise.all([
    prisma.athlete.findMany({
      where: { isBlacklisted: false },
      orderBy: { talentScore: "desc" },
      take: 20,
      include: {
        results: { select: { medal: true, rank: true } },
        performanceRecords: { select: { recordedAt: true }, orderBy: { recordedAt: "desc" }, take: 1 },
        coach: { select: { fullName: true } },
      },
    }),
    prisma.aIReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, type: true, title: true, content: true, createdAt: true },
    }),
    prisma.athlete.aggregate({ _avg: { talentScore: true }, _count: true }),
  ]);

  const riskAthletes = topAthletes.filter(
    (a) => a.talentScore < 30 && a.results.length > 0
  );

  const medaledAthletes = topAthletes.filter(
    (a) => a.results.some((r) => r.medal)
  );

  const athletesWithData = topAthletes.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    sport: a.sport,
    district: a.district,
    talentScore: a.talentScore,
    medalCount: a.results.filter((r) => r.medal).length,
    resultsCount: a.results.length,
    coachName: a.coach?.fullName || null,
    lastActivity: a.performanceRecords[0]?.recordedAt?.toISOString() || null,
  }));

  const reportItems = latestReports.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    preview: r.content.slice(0, 150).replace(/[#*]/g, ""),
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <h1 className="text-base font-semibold text-primary">AI Insights Hub</h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            Gemini-powered talent intelligence & performance analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge badge-purple">
            <Brain className="w-3 h-3" />
            Gemini AI Active
          </span>
        </div>
      </div>

      <div className="dashboard-content">

        {/* ── Stats Row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4 mb-6 stagger">
          {[
            { label: "Athletes Analyzed", value: stateStats._count, color: "#3b82f6", icon: <Brain className="w-5 h-5" /> },
            { label: "Avg Talent Score", value: `${(stateStats._avg.talentScore || 0).toFixed(1)}/100`, color: "#10b981", icon: <Star className="w-5 h-5" /> },
            { label: "Medal Winners", value: medaledAthletes.length, color: "#fbbf24", icon: <Trophy className="w-5 h-5" /> },
            { label: "Risk Alerts", value: riskAthletes.length, color: "#f87171", icon: <AlertTriangle className="w-5 h-5" /> },
          ].map((s) => (
            <div key={s.label} className="stat-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18`, color: s.color }}>
                {s.icon}
              </div>
              <div>
                <div className="text-xl font-bold text-primary">{s.value}</div>
                <div className="text-xs" style={{ color: "#64748b" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <AIInsightsClient
          athletes={athletesWithData}
          reports={reportItems}
          riskCount={riskAthletes.length}
        />
      </div>
    </div>
  );
}
