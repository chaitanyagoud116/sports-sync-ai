import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Calendar, Clock, MapPin, Users, Plus, Clock3 } from "lucide-react";
import Link from "next/link";
import NeonButton from "@/components/ui/NeonButton";
import GlassCard from "@/components/ui/GlassCard";

export default async function CoachSessionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const coach = await prisma.coach.findUnique({
    where: { userId: (session.user as any).id },
    include: {
      trainingSessions: {
        orderBy: { scheduledAt: "desc" },
        include: { _count: { select: { attendance: true } } },
      },
    },
  });

  if (!coach) redirect("/unauthorized");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Training Sessions</h1>
          <p className="text-surface-600">Schedule and manage your sessions with athletes</p>
        </div>
        <Link href="/coach/sessions/new">
          <NeonButton variant="primary" icon={<Plus className="w-5 h-5" />}>
            New Session
          </NeonButton>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {coach.trainingSessions.length === 0 ? (
          <GlassCard className="p-20 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20 text-cyan-700" />
            <h3 className="text-xl font-bold text-primary mb-2">No Sessions Scheduled</h3>
            <p className="text-surface-500 mb-8">Start by creating your first training session for your athletes.</p>
            <Link href="/coach/sessions/new">
              <NeonButton variant="secondary">Create Session</NeonButton>
            </Link>
          </GlassCard>
        ) : (
          coach.trainingSessions.map((s) => (
            <GlassCard key={s.id} className="p-6 group hover:border-cyan-500/30 transition-all">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex flex-col items-center justify-center text-cyan-700 border border-cyan-500/20">
                  <span className="text-xs font-bold uppercase">{new Date(s.scheduledAt).toLocaleString('en-us', { month: 'short' })}</span>
                  <span className="text-xl font-black">{new Date(s.scheduledAt).getDate()}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-primary group-hover:text-cyan-700 transition-colors">{s.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      s.status === "COMPLETED" ? "bg-green-500/20 text-green-400" : "bg-cyan-500/20 text-cyan-700"
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-surface-500">
                    <div className="flex items-center gap-1.5">
                      <Clock3 className="w-4 h-4 text-cyan-700/50" />
                      {new Date(s.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({s.durationMin} min)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-cyan-700/50" />
                      {s.venue || "TBD"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-cyan-700/50" />
                      {s._count.attendance} Athletes Attending
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href={`/coach/sessions/${s.id}/attendance`}>
                    <NeonButton variant="secondary" size="sm">Attendance</NeonButton>
                  </Link>
                  <Link href={`/coach/sessions/${s.id}`}>
                    <NeonButton variant="neon" size="sm">Details</NeonButton>
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
