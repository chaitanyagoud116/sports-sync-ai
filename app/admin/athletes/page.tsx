import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Users, Search, Filter, Trophy, TrendingUp } from "lucide-react";
import BlacklistButton from "./BlacklistButton";

export default async function AthletesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sport?: string; district?: string; status?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const athletes = await prisma.athlete.findMany({
    where: {
      AND: [
        resolvedSearchParams.q
          ? {
              OR: [
                { fullName: { contains: resolvedSearchParams.q } },
                { user: { email: { contains: resolvedSearchParams.q } } },
              ],
            }
          : {},
        resolvedSearchParams.sport ? { sport: resolvedSearchParams.sport as any } : {},
        resolvedSearchParams.district ? { district: resolvedSearchParams.district as any } : {},
        resolvedSearchParams.status === "blacklisted" ? { isBlacklisted: true } : {},
      ],
    },
    include: {
      user: { select: { email: true, createdAt: true } },
      applications: { select: { status: true } },
      results: { select: { medal: true } },
      _count: { select: { applications: true, results: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="text-base font-semibold text-primary">Athletes Database</h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            {athletes.length} athletes registered
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
          <Users className="w-4 h-4" />
          Total: <strong className="text-primary">{athletes.length}</strong>
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
                placeholder="Search by name or email..."
              />
            </div>
            <select name="sport" defaultValue={resolvedSearchParams.sport} className="form-input w-40 text-sm">
              <option value="">All Sports</option>
              {["FOOTBALL","CRICKET","KABADDI","VOLLEYBALL","BASKETBALL","ATHLETICS","SWIMMING","BADMINTON"].map(s => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
            <select name="district" defaultValue={resolvedSearchParams.district} className="form-input w-40 text-sm">
              <option value="">All Districts</option>
              {["NORTH_GOA","SOUTH_GOA","PANAJI","MARGAO","VASCO","MAPUSA","PONDA","BICHOLIM"].map(d => (
                <option key={d} value={d}>{d.replace(/_/g, " ")}</option>
              ))}
            </select>
            <button type="submit" className="btn-primary text-sm">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Athlete</th>
                <th>Sport</th>
                <th>District</th>
                <th>Experience</th>
                <th>Applications</th>
                <th>Talent Score</th>
                <th>Registered</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {athletes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <Users className="w-10 h-10 mx-auto mb-2" style={{ color: "#1e3a8a" }} />
                    <p style={{ color: "#475569" }}>No athletes found</p>
                  </td>
                </tr>
              ) : athletes.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
                        {a.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-primary text-sm">{a.fullName}</div>
                        <div className="text-xs" style={{ color: "#475569" }}>{a.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">{a.sport.replace(/_/g, " ")}</span>
                  </td>
                  <td className="text-sm" style={{ color: "#94a3b8" }}>
                    {a.district.replace(/_/g, " ")}
                  </td>
                  <td>
                    <span className="badge badge-purple text-xs">{a.experienceLevel}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-sm" style={{ color: "#94a3b8" }}>
                      <Trophy className="w-3.5 h-3.5 text-blue-400" />
                      {a._count.applications}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-secondary" />
                      <span className="text-sm font-medium text-primary">
                        {(a.talentScore ?? 0).toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="text-sm" style={{ color: "#64748b" }}>
                    {formatDate(a.user.createdAt)}
                  </td>
                  <td>
                    {a.isBlacklisted ? (
                      <span className="badge badge-rejected">Blacklisted</span>
                    ) : (
                      <span className="badge badge-approved">Active</span>
                    )}
                  </td>
                  <td>
                    <BlacklistButton
                      athleteId={a.id}
                      isBlacklisted={a.isBlacklisted}
                      fullName={a.fullName}
                    />
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
