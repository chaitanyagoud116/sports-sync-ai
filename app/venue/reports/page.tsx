import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { BarChart3, TrendingUp, Users, Download, Brain, Calendar } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import GlassCard from "@/components/ui/GlassCard";

export default async function VenueReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const manager = await prisma.venueManager.findUnique({
    where: { userId: (session.user as any).id },
    include: {
      venues: {
        include: {
          _count: { select: { bookings: true, tournaments: true, maintenance: true } },
        }
      }
    }
  });

  if (!manager || manager.venues.length === 0) redirect("/unauthorized");

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Venue Analytics & Reports</h1>
          <p className="text-surface-600">Utilization metrics and facility performance data</p>
        </div>
        <NeonButton variant="secondary" icon={<Download className="w-4 h-4" />}>
          Export PDF Report
        </NeonButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4 text-cyan-700">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Avg. Utilization</span>
          </div>
          <div className="text-4xl font-bold text-primary mb-2">64%</div>
          <p className="text-xs text-surface-500">Across all managed facilities</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4 text-purple-400">
            <Users className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Total Footfall</span>
          </div>
          <div className="text-4xl font-bold text-primary mb-2">12,450</div>
          <p className="text-xs text-surface-500">Registered athlete entries this month</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4 text-green-400">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Bookings</span>
          </div>
          <div className="text-4xl font-bold text-primary mb-2">
            {manager.venues.reduce((acc, v) => acc + v._count.bookings, 0)}
          </div>
          <p className="text-xs text-surface-500">Active and upcoming reservations</p>
        </GlassCard>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-primary">Facility Breakdown</h2>
        <div className="grid grid-cols-1 gap-6">
          {manager.venues.map((v) => (
            <GlassCard key={v.id} className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary mb-2">{v.name}</h3>
                  <div className="text-sm text-surface-500 mb-6">{v.location} · {v.venueType.replace(/_/g, " ")}</div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-surface-50 border-surface-200 rounded-2xl">
                      <div className="text-2xl font-bold text-primary">{v._count.tournaments}</div>
                      <div className="text-[10px] text-surface-500 uppercase font-bold">Tournaments</div>
                    </div>
                    <div className="text-center p-4 bg-surface-50 border-surface-200 rounded-2xl">
                      <div className="text-2xl font-bold text-primary">{v._count.bookings}</div>
                      <div className="text-[10px] text-surface-500 uppercase font-bold">Bookings</div>
                    </div>
                    <div className="text-center p-4 bg-surface-50 border-surface-200 rounded-2xl">
                      <div className="text-2xl font-bold text-primary">{v._count.maintenance}</div>
                      <div className="text-[10px] text-surface-500 uppercase font-bold">Maintenance</div>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-80 space-y-6">
                  <GlassCard highlight className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-bold text-primary">AI Utilization Forecast</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-surface-500">Next Month Est.</span>
                        <span className="text-green-400 font-bold">+12%</span>
                      </div>
                      <div className="h-1.5 bg-surface-50 border-surface-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 w-[78%]" />
                      </div>
                      <p className="text-[10px] text-surface-500 italic">
                        High demand expected due to upcoming inter-district athletics meet.
                      </p>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
