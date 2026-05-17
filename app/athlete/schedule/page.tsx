import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Calendar as CalendarIcon, MapPin, Clock, Trophy } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function SchedulePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;

  const athlete = await prisma.athlete.findUnique({ where: { userId } });
  if (!athlete) redirect("/login");

  // Fetch approved applications to show schedule
  const applications = await prisma.application.findMany({
    where: { 
      athleteId: athlete.id,
      status: "APPROVED"
    },
    include: {
      tournament: {
        include: {
          venue: true,
        }
      }
    },
    orderBy: {
      tournament: { startDate: "asc" }
    }
  });

  const upcomingTournaments = applications.filter(a => new Date(a.tournament.endDate) >= new Date());
  const pastTournaments = applications.filter(a => new Date(a.tournament.endDate) < new Date());

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="text-base font-semibold text-primary">My Schedule</h1>
          <p className="text-xs" style={{ color: "#64748b" }}>Your upcoming approved tournaments and matches</p>
        </div>
      </div>

      <div className="dashboard-content">
        {upcomingTournaments.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4" style={{ color: "#3b82f6" }} />
            <h3 className="text-primary font-semibold mb-2">No Upcoming Events</h3>
            <p style={{ color: "#475569" }} className="text-sm">
              You don't have any approved tournaments scheduled. Check the tournaments page to apply!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              Upcoming Tournaments
            </h2>
            
            <div className="stagger">
              {upcomingTournaments.map((app) => {
                const t = app.tournament;
                return (
                  <div key={app.id} className="glass-card p-6 flex flex-col md:flex-row gap-6 items-start hover:border-surface-200 transition-all">
                    {/* Date Block */}
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 min-w-[120px]" style={{ background: "rgba(59,130,246,0.1)" }}>
                      <span className="text-sm font-semibold text-blue-400">
                        {new Date(t.startDate).toLocaleString('default', { month: 'short' }).toUpperCase()}
                      </span>
                      <span className="text-3xl font-bold text-primary my-1">
                        {new Date(t.startDate).getDate()}
                      </span>
                      <span className="text-xs" style={{ color: "#94a3b8" }}>
                        {new Date(t.startDate).getFullYear()}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="badge badge-info mb-2">{t.category}</span>
                          <h3 className="text-lg font-semibold text-primary">{t.name}</h3>
                        </div>
                        <div className="text-2xl">
                          {t.sport === "FOOTBALL" ? "⚽" : t.sport === "CRICKET" ? "🏏" : t.sport === "BADMINTON" ? "🏸" : "🏆"}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm" style={{ color: "#94a3b8" }}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-700" />
                          <span>{t.venue.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-secondary" />
                          <span>Ends: {formatDate(t.endDate)}</span>
                        </div>
                      </div>
                      
                      <div className="pt-3 mt-3 border-t border-white/5 text-xs flex items-center gap-2">
                        <Trophy className="w-3.5 h-3.5 text-blue-400" />
                        <span style={{ color: "#cbd5e1" }}>Admin Note: {app.adminNote || "Approved for participation"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Past Tournaments */}
        {pastTournaments.length > 0 && (
          <div className="mt-12 opacity-60">
            <h2 className="text-sm font-semibold text-primary mb-4">Past Tournaments</h2>
            <div className="space-y-3">
              {pastTournaments.map((app) => (
                <div key={app.id} className="glass-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-primary">{app.tournament.name}</h4>
                      <p className="text-xs text-gray-400">{formatDate(app.tournament.startDate)}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded border border-surface-200 text-gray-400">Completed</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
