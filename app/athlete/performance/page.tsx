import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  Activity,
  TrendingUp,
  Award,
  Clock,
  ChevronRight,
  Brain,
  Zap,
  Target,
  Star,
} from "lucide-react";
import { PerformanceLineChart } from "@/components/charts/Charts";
import AIInsightPanel from "@/components/ai/AIInsightPanel";
import { formatDate } from "@/lib/utils";

export default async function AthletePerformance() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const athlete = await prisma.athlete.findUnique({
    where: { userId: (session.user as any).id },
    include: {
      performanceRecords: {
        orderBy: { recordedAt: "asc" }
      },
      results: {
        include: { tournament: true },
        orderBy: { publishedAt: "desc" }
      }
    }
  });

  if (!athlete) redirect("/login");

  // Group performance records by metric for charts
  const metrics = Array.from(new Set(athlete.performanceRecords.map(r => r.metric)));
  const chartData = metrics.map(metric => ({
    metric,
    data: athlete.performanceRecords
      .filter(r => r.metric === metric)
      .map(r => ({
        date: r.recordedAt.toISOString().split("T")[0],
        value: r.value
      }))
  }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Performance Analytics</h1>
          <p className="text-sm text-slate-400">Track your progress and AI-driven growth</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-bold text-blue-400">Score: {athlete.talentScore.toFixed(1)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Charts Column */}
        <div className="lg:col-span-2 space-y-8">
          {chartData.length > 0 ? (
            chartData.map((chart, i) => (
              <div key={chart.metric} className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-primary capitalize">{chart.metric.replace(/_/g, " ")}</h3>
                    <p className="text-xs text-slate-500">History of your {chart.metric.replace(/_/g, " ")} performance</p>
                  </div>
                  <Activity className="w-5 h-5 text-slate-600" />
                </div>
                <PerformanceLineChart 
                  data={chart.data} 
                  metricLabel={chart.metric}
                  color={i === 0 ? "#3b82f6" : i === 1 ? "#10b981" : "#8b5cf6"}
                />
              </div>
            ))
          ) : (
            <div className="glass-card p-12 text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 text-slate-700" />
              <h3 className="text-primary font-medium mb-1">No Performance Data Yet</h3>
              <p className="text-sm text-slate-500">Your coach will log your performance metrics during training sessions.</p>
            </div>
          )}

          {/* Achievement Badges */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-primary mb-6">Achievements & Milestones</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {athlete.results.some(r => r.medal === "GOLD") && (
                <div className="flex flex-col items-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 text-secondary flex items-center justify-center mb-2">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-secondary">Gold Medalist</span>
                </div>
              )}
              {athlete.talentScore >= 80 && (
                <div className="flex flex-col items-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-blue-400">Elite Talent</span>
                </div>
              )}
              <div className="flex flex-col items-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-700 flex items-center justify-center mb-2">
                  <Target className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-emerald-700">Active Competitor</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center opacity-50">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
                  <Star className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-purple-400">State Representative</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI & History Column */}
        <div className="space-y-6">
          <AIInsightPanel 
            athleteId={athlete.id} 
            athleteName={athlete.fullName}
          />

          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">Tournament History</h3>
            <div className="space-y-4">
              {athlete.results.length > 0 ? (
                athlete.results.map(result => (
                  <div key={result.id} className="relative pl-6 pb-4 border-l border-surface-200 last:pb-0">
                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <div className="text-xs text-slate-500 mb-1">{formatDate(result.publishedAt)}</div>
                    <div className="text-sm font-medium text-primary">{result.tournament.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {result.medal && (
                        <span className="badge badge-pending text-[10px] py-0.5">
                          {result.medal}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">Rank: {result.rank || "N/A"}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No tournament results recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
