import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Trophy, Search, Filter, Medal, Calendar, Award, Star } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function AdminResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; medal?: string; sport?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const results = await prisma.result.findMany({
    where: {
      AND: [
        resolvedSearchParams.q ? { athlete: { fullName: { contains: resolvedSearchParams.q } } } : {},
        resolvedSearchParams.medal ? { medal: resolvedSearchParams.medal as any } : {},
        resolvedSearchParams.sport ? { tournament: { sport: resolvedSearchParams.sport as any } } : {},
      ],
    },
    include: {
      athlete: { select: { fullName: true, sport: true, talentScore: true } },
      tournament: { select: { name: true, sport: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="text-base font-semibold text-primary">Global Results Dashboard</h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            {results.length} competition records verified
          </p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Search & Filter */}
        <div className="glass-card p-4 mb-6 flex gap-3 flex-wrap">
          <form method="GET" className="flex gap-3 flex-1 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
              <input
                name="q"
                defaultValue={resolvedSearchParams.q}
                className="form-input pl-9 text-sm"
                placeholder="Search by athlete name..."
              />
            </div>
            <select name="medal" defaultValue={resolvedSearchParams.medal} className="form-input w-40 text-sm">
              <option value="">All Medals</option>
              <option value="GOLD">Gold</option>
              <option value="SILVER">Silver</option>
              <option value="BRONZE">Bronze</option>
            </select>
            <select name="sport" defaultValue={resolvedSearchParams.sport} className="form-input w-40 text-sm">
              <option value="">All Sports</option>
              {["FOOTBALL","CRICKET","ATHLETICS","SWIMMING","BADMINTON"].map(s => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
            <button type="submit" className="btn-secondary text-sm">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
          </form>
        </div>

        {/* Results Table */}
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Athlete</th>
                <th>Tournament</th>
                <th>Rank</th>
                <th>Medal</th>
                <th>Performance</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Medal className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-surface-500">No results found</p>
                  </td>
                </tr>
              ) : results.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-50 border-surface-200 flex items-center justify-center">
                        <Star className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-primary">{r.athlete.fullName}</div>
                        <div className="text-xs text-surface-500">{r.athlete.sport.replace(/_/g, " ")}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-primary/70 max-w-[200px] truncate">
                      {r.tournament.name}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm font-bold text-primary">#{r.rank}</div>
                  </td>
                  <td>
                    {r.medal ? (
                      <span className={`badge ${
                        r.medal === "GOLD" ? "bg-amber-500/20 text-secondary" :
                        r.medal === "SILVER" ? "bg-slate-400/20 text-slate-300" :
                        "bg-orange-700/20 text-orange-400"
                      } text-xs font-bold`}>
                        {r.medal}
                      </span>
                    ) : (
                      <span className="text-surface-400">—</span>
                    )}
                  </td>
                  <td>
                    <div className="text-sm text-primary/70">
                      {r.score || <span className="text-surface-400 italic">No score</span>}
                    </div>
                  </td>
                  <td>
                    <div className="text-xs text-surface-500">
                      {formatDate(r.publishedAt)}
                    </div>
                  </td>
                  <td>
                    <Link href={`/admin/results/${r.id}`} className="text-xs font-bold text-cyan-700 hover:text-cyan-300">
                      Audit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
