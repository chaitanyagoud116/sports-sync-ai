import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Users, Calendar, Activity, Trophy, 
  ArrowRight, Plus, Clock, CheckCircle,
  Brain
} from "lucide-react";
import KPICard from "@/components/dashboard/KPICard";
import { formatDate } from "@/lib/utils";

export default async function CoachDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const coach = await prisma.coach.findUnique({
    where: { userId: (session.user as any).id },
    include: {
      athletes: {
        select: {
          id: true,
          fullName: true,
          sport: true,
          talentScore: true,
        },
        take: 10,
      },
      trainingSessions: {
        where: { scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: "asc" },
        take: 3
      },
      _count: {
        select: {
          athletes: true,
          trainingSessions: true,
        }
      }
    }
  });

  if (!coach) redirect("/unauthorized");

  const athletesList = coach.athletes;
  
  const stats = [
    { label: "My Athletes", value: coach._count.athletes, icon: <Users />, color: "#3b82f6" },
    { label: "Pending Sessions", value: coach.trainingSessions.length, icon: <Calendar />, color: "#10b981" },
    { label: "Avg. Talent Score", value: athletesList.length ? (athletesList.reduce((acc, a) => acc + a.talentScore, 0) / athletesList.length).toFixed(1) : "0", icon: <Brain />, color: "#8b5cf6" },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Coach Dashboard</h1>
          <p className="text-sm text-slate-400">Welcome back, {coach.fullName}</p>
        </div>
        <Link href="/coach/performance" className="btn-primary">
          <Plus className="w-4 h-4" />
          Log Performance
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((s, i) => (
          <KPICard 
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            color={s.color}
            delay={i * 100}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-primary">Upcoming Sessions</h2>
            <Link href="/coach/sessions" className="text-sm text-blue-400 hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {coach.trainingSessions.length > 0 ? (
              coach.trainingSessions.map(session => (
                <div key={session.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 border-surface-200 border border-surface-200">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/20 text-emerald-700 flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-primary">{session.title}</h3>
                    <p className="text-xs text-slate-400">{formatDate(session.scheduledAt)} • {session.sport}</p>
                  </div>
                  <div className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">
                    {session.status}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No upcoming sessions scheduled.</p>
            )}
          </div>
        </div>

        {/* My Athletes Shortlist */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-primary">Top Athletes</h2>
            <Link href="/coach/my-athletes" className="text-sm text-blue-400 hover:underline">Manage All</Link>
          </div>
          <div className="space-y-4">
            {athletesList.length > 0 ? (
              athletesList.sort((a, b) => b.talentScore - a.talentScore).slice(0, 5).map(athlete => (
                <div key={athlete.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 border-surface-200 border border-surface-200">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    {athlete.fullName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-primary">{athlete.fullName}</h3>
                    <p className="text-xs text-slate-400">{athlete.sport}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-700">{athlete.talentScore.toFixed(0)}</div>
                    <div className="text-[10px] text-slate-500 uppercase">Score</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No athletes assigned yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
