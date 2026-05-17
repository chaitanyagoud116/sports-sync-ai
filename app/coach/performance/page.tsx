import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { CheckCircle, Users, Trophy, Brain, Zap } from "lucide-react";
import Link from "next/link";
import NeonButton from "@/components/ui/NeonButton";
import GlassCard from "@/components/ui/GlassCard";

export default async function CoachPerformancePage() {
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
          _count: { select: { performanceRecords: true } },
        },
      },
    },
  });

  if (!coach) redirect("/unauthorized");

  return (
    <div className="space-y-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Performance Evaluation Portal</h1>
        <p className="text-surface-600">Select an athlete to log biometric data and update AI talent scores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coach.athletes.length === 0 ? (
          <GlassCard className="col-span-full p-20 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-20 text-cyan-700" />
            <h3 className="text-xl font-bold text-primary mb-2">No Athletes Assigned</h3>
            <p className="text-surface-500">You need athletes assigned to your profile to log performance.</p>
          </GlassCard>
        ) : (
          coach.athletes.map((a) => (
            <GlassCard key={a.id} className="p-6 flex flex-col group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-primary font-bold text-lg">
                  {a.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-primary group-hover:text-cyan-700 transition-colors">{a.fullName}</h3>
                  <p className="text-xs text-surface-500">{a.sport.replace(/_/g, " ")}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500 uppercase font-bold tracking-widest">AI Talent Score</span>
                  <span className="text-sm font-bold text-cyan-700">{a.talentScore.toFixed(1)}/100</span>
                </div>
                <div className="h-1.5 bg-surface-50 border-surface-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" 
                    style={{ width: `${a.talentScore}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-surface-500">Total Records</span>
                  <span className="text-primary/80">{a._count.performanceRecords}</span>
                </div>
              </div>

              <Link href={`/coach/performance/log?athleteId=${a.id}`}>
                <NeonButton variant="primary" className="w-full justify-center" icon={<Zap className="w-4 h-4" />}>
                  Log Evaluation
                </NeonButton>
              </Link>
            </GlassCard>
          ))
        )}
      </div>

      <GlassCard highlight className="mt-12 p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] -mr-32 -mt-32" />
        <div className="flex items-start gap-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">AI-Driven Talent Scouting</h2>
            <p className="text-surface-600 max-w-2xl leading-relaxed">
              Every performance record you log is processed by our machine learning models. 
              Consistent data entry improves the accuracy of talent identification for state and national team selection.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
