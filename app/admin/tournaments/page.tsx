import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Trophy, Plus, Calendar, Users, MapPin, Edit } from "lucide-react";

export default async function TournamentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tournaments = await prisma.tournament.findMany({
    include: {
      venue: true,
      _count: { select: { applications: true, results: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusClass: Record<string, string> = {
    DRAFT: "badge-info",
    PUBLISHED: "badge-approved",
    ONGOING: "badge-purple",
    COMPLETED: "badge-info",
    CANCELLED: "badge-rejected",
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="text-base font-semibold text-primary">Tournaments</h1>
          <p className="text-xs" style={{ color: "#64748b" }}>{tournaments.length} tournaments total</p>
        </div>
        <Link href="/admin/tournaments/create" className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Create Tournament
        </Link>
      </div>

      <div className="dashboard-content">
        {tournaments.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4" style={{ color: "#1e3a8a" }} />
            <h3 className="font-semibold text-primary mb-2">No Tournaments Yet</h3>
            <Link href="/admin/tournaments/create" className="btn-primary mt-4 inline-flex">
              Create First Tournament
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 stagger">
            {tournaments.map((t) => (
              <div key={t.id} className="glass-card p-6 hover:border-white/15 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge ${statusClass[t.status]}`}>{t.status}</span>
                      <span className="badge badge-info">{t.category.replace(/_/g, " ")}</span>
                    </div>
                    <h3 className="font-semibold text-primary">{t.name}</h3>
                  </div>
                  <div className="text-2xl ml-3">
                    {t.sport === "FOOTBALL" ? "⚽" : t.sport === "CRICKET" ? "🏏" : t.sport === "BADMINTON" ? "🏸" : "🏆"}
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm" style={{ color: "#94a3b8" }}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    {t.venue.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    {formatDate(t.startDate)} — {formatDate(t.endDate)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-secondary" />
                    {t._count.applications} / {t.maxParticipants} applications
                  </div>
                </div>

                <div className="progress-bar mb-4">
                  <div className="progress-fill"
                    style={{ width: `${(t._count.applications / t.maxParticipants) * 100}%` }} />
                </div>

                <div className="flex gap-2">
                  <Link href={`/admin/tournaments/${t.id}`} className="btn-secondary flex-1 justify-center text-xs py-2">
                    <Edit className="w-3.5 h-3.5" /> Manage
                  </Link>
                  {t.status === "DRAFT" && (
                    <Link href={`/admin/tournaments/${t.id}/publish`} className="btn-primary flex-1 justify-center text-xs py-2">
                      Publish
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
