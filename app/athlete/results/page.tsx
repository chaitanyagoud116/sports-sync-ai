import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Medal, Trophy, Star, Activity, Award } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ResultsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;

  const athlete = await prisma.athlete.findUnique({ where: { userId } });
  if (!athlete) redirect("/login");

  const results = await prisma.result.findMany({
    where: { athleteId: athlete.id },
    include: {
      tournament: true,
    },
    orderBy: { publishedAt: "desc" }
  });

  // Calculate some basic stats
  const gold = results.filter(r => r.medal === "GOLD").length;
  const silver = results.filter(r => r.medal === "SILVER").length;
  const bronze = results.filter(r => r.medal === "BRONZE").length;
  const totalTournaments = results.length;

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="text-base font-semibold text-primary">Performance & Results</h1>
          <p className="text-xs" style={{ color: "#64748b" }}>Your historical tournament outcomes and rankings</p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ background: "rgba(234,179,8,0.1)" }}>
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="text-sm" style={{ color: "#94a3b8" }}>Talent Score</span>
            </div>
            <div className="text-2xl font-bold text-primary">{athlete.talentScore.toFixed(1)}</div>
          </div>
          
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ background: "rgba(59,130,246,0.1)" }}>
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm" style={{ color: "#94a3b8" }}>Tournaments</span>
            </div>
            <div className="text-2xl font-bold text-primary">{totalTournaments}</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ background: "rgba(250,204,21,0.1)" }}>
                <Medal className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-sm" style={{ color: "#94a3b8" }}>Gold Medals</span>
            </div>
            <div className="text-2xl font-bold text-primary">{gold}</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ background: "rgba(148,163,184,0.1)" }}>
                <Award className="w-5 h-5 text-slate-400" />
              </div>
              <span className="text-sm" style={{ color: "#94a3b8" }}>Total Podiums</span>
            </div>
            <div className="text-2xl font-bold text-primary">{gold + silver + bronze}</div>
          </div>
        </div>

        {/* Results List */}
        <h2 className="text-sm font-semibold text-primary mb-4">Tournament History</h2>
        
        {results.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Star className="w-12 h-12 mx-auto mb-4" style={{ color: "#3b82f6" }} />
            <h3 className="text-primary font-semibold mb-2">No Results Yet</h3>
            <p style={{ color: "#475569" }} className="text-sm">
              Complete tournaments to see your performance metrics and medals here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => {
              const t = result.tournament;
              
              // Determine medal colors
              let medalColor = "text-gray-400";
              let medalBg = "rgba(156,163,175,0.1)";
              if (result.medal === "GOLD") {
                medalColor = "text-yellow-400";
                medalBg = "rgba(250,204,21,0.1)";
              } else if (result.medal === "SILVER") {
                medalColor = "text-slate-300";
                medalBg = "rgba(203,213,225,0.1)";
              } else if (result.medal === "BRONZE") {
                medalColor = "text-amber-600";
                medalBg = "rgba(217,119,6,0.1)";
              }

              return (
                <div key={result.id} className="glass-card p-5 hover:border-surface-200 transition-all flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-xl flex-shrink-0" style={{ background: medalBg }}>
                      {result.medal ? (
                        <Medal className={`w-8 h-8 ${medalColor}`} />
                      ) : (
                        <Star className="w-8 h-8 text-blue-400" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge badge-info text-[10px]">{t.category}</span>
                        <span className="text-xs" style={{ color: "#64748b" }}>{formatDate(result.publishedAt)}</span>
                      </div>
                      <h3 className="text-base font-semibold text-primary">{t.name}</h3>
                      <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{result.notes || "Participant"}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 w-full md:w-auto">
                    {result.rank && (
                      <div className="p-3 rounded-lg flex-1 md:flex-none text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <div className="text-xs mb-1" style={{ color: "#64748b" }}>Rank</div>
                        <div className="font-bold text-primary text-lg">#{result.rank}</div>
                      </div>
                    )}
                    
                    {result.score && (
                      <div className="p-3 rounded-lg flex-1 md:flex-none text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <div className="text-xs mb-1" style={{ color: "#64748b" }}>Score</div>
                        <div className="font-bold text-blue-400 text-lg">{result.score}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
