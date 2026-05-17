import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { MapPin, Building2, Users, Search, Filter, Plus, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import NeonButton from "@/components/ui/NeonButton";

export default async function AdminVenuesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; district?: string; type?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const venues = await prisma.venue.findMany({
    where: {
      AND: [
        resolvedSearchParams.q ? { name: { contains: resolvedSearchParams.q } } : {},
        resolvedSearchParams.district ? { district: resolvedSearchParams.district as any } : {},
        resolvedSearchParams.type ? { venueType: resolvedSearchParams.type as any } : {},
      ],
    },
    include: {
      _count: { select: { tournaments: true, bookings: true } },
      manager: { select: { fullName: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="text-base font-semibold text-primary">Venues Management</h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            {venues.length} active facilities registered
          </p>
        </div>
        <Link href="/admin/venues/create">
          <NeonButton variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
            Register Venue
          </NeonButton>
        </Link>
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
                placeholder="Search venues by name..."
              />
            </div>
            <select name="district" defaultValue={resolvedSearchParams.district} className="form-input w-40 text-sm">
              <option value="">All Districts</option>
              {["NORTH_GOA","SOUTH_GOA","PANAJI","MARGAO","VASCO","MAPUSA","PONDA","BICHOLIM"].map(d => (
                <option key={d} value={d}>{d.replace(/_/g, " ")}</option>
              ))}
            </select>
            <select name="type" defaultValue={resolvedSearchParams.type} className="form-input w-40 text-sm">
              <option value="">All Types</option>
              {["STADIUM","INDOOR_HALL","GROUND","COMPLEX","SWIMMING_POOL","ACADEMY"].map(t => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
            <button type="submit" className="btn-secondary text-sm">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
          </form>
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {venues.length === 0 ? (
            <div className="col-span-full py-20 text-center glass-card">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-surface-500">No venues found matching your filters.</p>
            </div>
          ) : (
            venues.map((v) => (
              <div key={v.id} className="glass-card group hover:border-cyan-500/30 transition-all p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-700">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    v.isActive ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}>
                    {v.isActive ? "Active" : "Inactive"}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-primary mb-1 group-hover:text-cyan-700 transition-colors">{v.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-surface-500 mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  {v.location}, {v.district.replace(/_/g, " ")}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface-50 border-surface-200 rounded-xl p-3">
                    <div className="text-[10px] text-surface-500 uppercase font-bold mb-1">Capacity</div>
                    <div className="text-sm font-bold text-primary flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-700" />
                      {v.capacity.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-surface-50 border-surface-200 rounded-xl p-3">
                    <div className="text-[10px] text-surface-500 uppercase font-bold mb-1">Tournaments</div>
                    <div className="text-sm font-bold text-primary">
                      {v._count.tournaments}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-surface-200">
                  <div className="text-xs">
                    <span className="text-surface-500">Manager:</span>{" "}
                    <span className="text-primary/80 font-medium">{v.manager?.fullName || "Unassigned"}</span>
                  </div>
                  <Link href={`/admin/venues/${v.id}`} className="text-xs font-bold text-cyan-700 hover:text-cyan-300">
                    Manage →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
