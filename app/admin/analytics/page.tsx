import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import AnalyticsCharts from "./AnalyticsCharts";
import { 
  TrendingUp, Users, Trophy, Building2, 
  Medal, Brain, FileText, Download, 
  ArrowRight, Globe, Activity
} from "lucide-react";
import Link from "next/link";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [
    sportStats,
    districtStats,
    monthlyRegs,
    experienceStats,
    topAthletes,
    tournamentStats,
    coachCount,
    academyCount,
    avgTalentScore,
    aiReportCount,
    latestReports,
  ] = await Promise.all([
    prisma.athlete.groupBy({ by: ["sport"], _count: { sport: true }, orderBy: { _count: { sport: "desc" } } }),
    prisma.athlete.groupBy({ by: ["district"], _count: { district: true }, orderBy: { _count: { district: "desc" } } }),
    // Monthly registrations (last 6 months)
    prisma.user.findMany({
      where: {
        role: "ATHLETE",
        createdAt: { gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true },
    }),
    prisma.athlete.groupBy({ by: ["experienceLevel"], _count: { experienceLevel: true } }),
    prisma.athlete.findMany({
      orderBy: { talentScore: "desc" },
      take: 5,
      where: { isBlacklisted: false },
      select: { fullName: true, sport: true, district: true, talentScore: true },
    }),
    prisma.tournament.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.coach.count(),
    prisma.academy.count(),
    prisma.athlete.aggregate({ _avg: { talentScore: true } }),
    prisma.aIReport.count(),
    prisma.aIReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, title: true, createdAt: true, type: true }
    }),
  ]);

  // Process monthly data
  const monthMap: Record<string, number> = {};
  monthlyRegs.forEach((u) => {
    const month = u.createdAt.toLocaleString("en-IN", { month: "short", year: "2-digit" });
    monthMap[month] = (monthMap[month] || 0) + 1;
  });
  const monthlyData = Object.entries(monthMap).map(([month, count]) => ({ month, athletes: count }));

  const totalAthletes = await prisma.athlete.count();
  const totalTournaments = await prisma.tournament.count();
  const totalApplications = await prisma.application.count();
  const approvalRate = totalApplications > 0
    ? ((await prisma.application.count({ where: { status: "APPROVED" } })) / totalApplications * 100).toFixed(1)
    : "0";

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="text-base font-semibold text-primary">Advanced Sports Intelligence</h1>
          <p className="text-xs" style={{ color: "#64748b" }}>Goa State Sports Development Analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/ai-insights" className="btn-secondary text-sm gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            AI Insights Hub
          </Link>
          <button className="btn-primary text-sm gap-2">
            <Download className="w-4 h-4" />
            Export State Report
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Main KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
          {[
            { label: "Total Athletes", value: totalAthletes, icon: <Users className="w-5 h-5" />, color: "#3b82f6", trend: "+8.2%" },
            { label: "Avg Talent Score", value: (avgTalentScore._avg.talentScore || 0).toFixed(1), icon: <Activity className="w-5 h-5" />, color: "#8b5cf6", trend: "+2.4%" },
            { label: "Active Coaches", value: coachCount, icon: <Trophy className="w-5 h-5" />, color: "#10b981", trend: "Certified" },
            { label: "State Academies", value: academyCount, icon: <Building2 className="w-5 h-5" />, color: "#f59e0b", trend: "Active" },
          ].map((k) => (
            <div key={k.label} className="stat-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${k.color}18`, color: k.color }}>
                {k.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{k.value}</div>
                <div className="text-xs" style={{ color: "#64748b" }}>{k.label}</div>
                <div className="text-[10px] mt-0.5 text-emerald-700 font-bold uppercase tracking-widest">{k.trend}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Column */}
          <div className="lg:col-span-2 space-y-6">
            <AnalyticsCharts
              sportStats={sportStats}
              districtStats={districtStats}
              monthlyData={monthlyData}
              experienceStats={experienceStats}
              tournamentStats={tournamentStats}
            />
          </div>

          {/* Side Info Column */}
          <div className="space-y-6">
            {/* AI Reports Summary */}
            <div className="glass-card p-6 border-purple-500/10 bg-purple-500/[0.01]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" /> Recent AI Reports
                </h3>
                <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">
                  {aiReportCount} Total
                </span>
              </div>
              <div className="space-y-3">
                {latestReports.map(report => (
                  <Link key={report.id} href="/admin/ai-insights" className="block p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all group">
                    <div className="text-xs text-slate-500 mb-1">{new Date(report.createdAt).toLocaleDateString()}</div>
                    <div className="text-sm font-medium text-primary group-hover:text-purple-400 transition-colors">{report.title}</div>
                  </Link>
                ))}
                <Link href="/admin/ai-insights" className="block text-center py-2 text-xs text-slate-500 hover:text-primary transition-colors">
                  View Intelligence Hub →
                </Link>
              </div>
            </div>

            {/* Top Talent Leaderboard */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-widest">
                <Medal className="w-4 h-4 text-secondary" /> Talent Ranking
              </h3>
              <div className="space-y-4">
                {topAthletes.map((a, i) => (
                  <div key={a.fullName} className="flex items-center gap-3">
                    <div className="text-xs font-bold text-slate-600 w-4">#{i+1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-primary truncate">{a.fullName}</div>
                      <div className="text-[10px] text-slate-500">{a.sport}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-400">{a.talentScore.toFixed(0)}</div>
                      <div className="w-12 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${a.talentScore}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Infrastructure Summary */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-widest">State Assets</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-surface-50 border-surface-200 border border-surface-200">
                  <div className="text-xl font-bold text-primary">All</div>
                  <div className="text-[10px] text-slate-500 uppercase">Districts</div>
                </div>
                <div className="p-3 rounded-xl bg-surface-50 border-surface-200 border border-surface-200">
                  <div className="text-xl font-bold text-primary">100%</div>
                  <div className="text-[10px] text-slate-500 uppercase">Compliance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
