import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Trophy, Calendar, MapPin, Users, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";
import ApplyButton from "./ApplyButton";
import AIBanner from "@/components/AIBanner";

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sport?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;

  const athlete = await prisma.athlete.findUnique({ where: { userId } });
  if (!athlete) redirect("/login");

  const appliedIds = (await prisma.application.findMany({
    where: { athleteId: athlete.id },
    select: { tournamentId: true },
  })).map((a) => a.tournamentId);

  const tournaments = await prisma.tournament.findMany({
    where: {
      status: "PUBLISHED",
      ...(resolvedSearchParams.sport ? { sport: resolvedSearchParams.sport as any } : {}),
      ...(resolvedSearchParams.q ? { name: { contains: resolvedSearchParams.q } } : {}),
    },
    include: {
      venue: true,
      _count: { select: { applications: true } },
    },
    orderBy: { startDate: "asc" },
  });

  const categoryColors: Record<string, string> = {
    DISTRICT: "badge-info",
    STATE: "badge-purple",
    NATIONAL: "badge-approved",
    INTER_SCHOOL: "badge-pending",
    INTER_COLLEGE: "badge-pending",
    OPEN: "badge-info",
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="text-base font-semibold text-primary">Tournaments</h1>
          <p className="text-xs" style={{ color: "#64748b" }}>Browse and apply for available tournaments</p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Search & Filter */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
            <form method="GET">
              <input
                name="q"
                defaultValue={resolvedSearchParams.q}
                className="form-input pl-9"
                placeholder="Search tournaments..."
              />
            </form>
          </div>
          <form method="GET" className="flex gap-2">
            <select name="sport" defaultValue={resolvedSearchParams.sport} className="form-input w-40 text-sm">
              <option value="">All Sports</option>
              {["FOOTBALL", "CRICKET", "KABADDI", "VOLLEYBALL", "BASKETBALL", "ATHLETICS", "SWIMMING", "BADMINTON"].map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
            <button type="submit" className="btn-secondary text-sm px-3">Filter</button>
          </form>
        </div>

        {/* AI Matchmaker Integration */}
        <AIBanner athleteSport={athlete.sport} athleteScore={athlete.talentScore ?? 0} />

        {tournaments.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4" style={{ color: "#1e3a8a" }} />
            <h3 className="text-primary font-semibold mb-2">No tournaments found</h3>
            <p style={{ color: "#475569" }} className="text-sm">Check back later for upcoming tournaments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 stagger">
            {tournaments.map((t) => {
              const hasApplied = appliedIds.includes(t.id);
              const spotsLeft = t.maxParticipants - t._count.applications;
              const fillPercent = (t._count.applications / t.maxParticipants) * 100;

              return (
                <div key={t.id} className="glass-card p-6 hover:border-white/15 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <span className={`badge ${categoryColors[t.category] || "badge-info"} mb-2`}>
                        {t.category.replace(/_/g, " ")}
                      </span>
                      <h3 className="font-semibold text-primary">{t.name}</h3>
                    </div>
                    <div className="text-3xl ml-4">
                      {t.sport === "FOOTBALL" ? "⚽" : t.sport === "CRICKET" ? "🏏" : t.sport === "BADMINTON" ? "🏸" : t.sport === "SWIMMING" ? "🏊" : t.sport === "KABADDI" ? "🤼" : "🏆"}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm" style={{ color: "#94a3b8" }}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />
                      {t.venue.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-emerald-700" />
                      {formatDate(t.startDate)} — {formatDate(t.endDate)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 flex-shrink-0 text-secondary" />
                      {spotsLeft} spots left of {t.maxParticipants}
                    </div>
                  </div>

                  {/* Fill progress */}
                  <div className="progress-bar mb-4">
                    <div className="progress-fill" style={{ width: `${fillPercent}%` }} />
                  </div>

                  <p className="text-xs mb-4 line-clamp-2" style={{ color: "#64748b" }}>{t.description}</p>

                  <ApplyButton
                    tournamentId={t.id}
                    athleteId={athlete.id}
                    hasApplied={hasApplied}
                    isFull={spotsLeft <= 0}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
