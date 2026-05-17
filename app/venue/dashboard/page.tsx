import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { 
  Building2, Calendar, CheckCircle, Wrench, 
  Clock, Users, ArrowRight, Thermometer, 
  Droplet, Sun, Activity, Zap, Shield, 
  MapPin, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import KPICard from "@/components/dashboard/KPICard";

export default async function VenueDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const manager = await prisma.venueManager.findUnique({
    where: { userId: (session.user as any).id },
    include: {
      venues: {
        include: {
          bookings: { where: { status: "PENDING" }, select: { id: true } },
          maintenance: { where: { status: "SCHEDULED" }, select: { id: true } },
          tournaments: { where: { status: { in: ["PUBLISHED", "ONGOING"] } }, select: { id: true } },
        },
      },
    },
  });

  const allVenues = manager?.venues || [];

  const totalPendingBookings = allVenues.reduce((s, v) => s + v.bookings.length, 0);
  const totalMaintenance = allVenues.reduce((s, v) => s + v.maintenance.length, 0);
  const activeTournaments = allVenues.reduce((s, v) => s + v.tournaments.length, 0);

  const recentBookings = await prisma.booking.findMany({
    where: {
      venue: { managerId: manager?.id },
    },
    include: {
      venue: { select: { name: true } },
      tournament: { select: { name: true, sport: true, startDate: true, endDate: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const upcomingMaint = await prisma.maintenanceSchedule.findMany({
    where: {
      venue: { managerId: manager?.id },
      status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      startDate: { gte: new Date() },
    },
    include: { venue: { select: { name: true } } },
    orderBy: { startDate: "asc" },
    take: 5,
  });

  const kpis = [
    { label: "Managed Venues", value: allVenues.length, icon: <Building2 className="w-5 h-5" />, color: "#10b981", change: "System Verified" },
    { label: "Pending Bookings", value: totalPendingBookings, icon: <Clock className="w-5 h-5" />, color: "#f59e0b", change: "Needs Action" },
    { label: "Active Events", value: activeTournaments, icon: <Calendar className="w-5 h-5" />, color: "#3b82f6", change: "Live Tournaments" },
    { label: "Maintenance", value: totalMaintenance, icon: <Wrench className="w-5 h-5" />, color: "#ef4444", change: "Scheduled" },
  ];

  return (
    <div>
      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <div className="topbar">
        <div>
          <h1 className="text-base font-semibold text-primary">
            Venue Management Command Center
          </h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            {manager?.fullName || "Venue Manager"} — Infrastructure Controller
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="badge badge-approved gap-1.5 py-1.5 px-3">
            <Shield className="w-3.5 h-3.5" />
            Ecosystem Active
          </div>
          <Link href="/venue/calendar" className="btn-secondary text-sm">
            Venue Calendar
          </Link>
          <Link href="/venue/bookings" className="btn-primary text-sm">
            Approve Bookings
          </Link>
        </div>
      </div>

      <div className="dashboard-content">
        
        {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4 mb-8 stagger">
          {kpis.map((k, i) => (
            <KPICard 
              key={k.label}
              label={k.label}
              value={k.value}
              icon={k.icon}
              color={k.color}
              change={k.change}
              delay={i * 100}
            />
          ))}
        </div>

        {/* ── Main Grid ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Venues Overview */}
          <div className="glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-primary flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                Your Venues
              </h2>
              <Link href="/venue/availability" className="text-xs text-emerald-700 hover:underline">Manage All</Link>
            </div>
            <div className="space-y-4 flex-1">
              {allVenues.length === 0 ? (
                <div className="text-center py-10 opacity-50">No venues assigned.</div>
              ) : allVenues.map((v) => (
                <div key={v.id} className="p-4 rounded-xl group transition-all hover:bg-surface-100 border border-surface-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-primary text-sm">{v.name}</div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {v.capacity.toLocaleString()} Capacity</span>
                    <span className="flex items-center gap-1 text-secondary"><Clock className="w-3 h-3" /> {v.bookings.length} Pending</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="glass-card p-6 flex flex-col lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-primary flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                Recent Bookings
              </h2>
              <Link href="/venue/bookings" className="text-xs text-blue-400 hover:underline">Full History</Link>
            </div>
            <div className="space-y-3 flex-1">
              {recentBookings.length === 0 ? (
                <div className="text-center py-10 opacity-50">No recent bookings.</div>
              ) : recentBookings.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-200">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-primary truncate">{b.tournament.name}</div>
                    <div className="text-xs text-slate-500">{b.venue.name} · {formatDate(b.startDate)}</div>
                  </div>
                  <div className={`text-[10px] px-2 py-1 rounded-lg font-bold uppercase ${
                    b.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" :
                    b.status === "PENDING" ? "bg-amber-500/10 text-secondary border border-amber-500/20" : "bg-red-500/10 text-red-400"
                  }`}>
                    {b.status}
                  </div>
                </div>
              ))}
            </div>
          </div>


          <div className="col-span-1 lg:col-span-3 glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-primary flex items-center gap-2">
                <Wrench className="w-4 h-4 text-red-400" />
                Upcoming Maintenance Operations
              </h2>
              <Link href="/venue/maintenance" className="btn-secondary text-xs">Manage Schedule</Link>
            </div>
            {upcomingMaint.length === 0 ? (
              <div className="text-center py-12 bg-surface-50 rounded-2xl border border-dashed border-surface-200">
                <CheckCircle className="w-10 h-10 mx-auto mb-3 text-emerald-700/50" />
                <p className="text-sm text-slate-500">All systems are currently operational. No maintenance scheduled.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-surface-200">
                      <th className="pb-4 px-2">Operation</th>
                      <th className="pb-4 px-2">Facility</th>
                      <th className="pb-4 px-2">Priority</th>
                      <th className="pb-4 px-2">Timeline</th>
                      <th className="pb-4 px-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200">
                    {upcomingMaint.map((m) => (
                      <tr key={m.id} className="group hover:bg-surface-100 transition-colors">
                        <td className="py-4 px-2 text-sm font-medium text-primary">{m.title}</td>
                        <td className="py-4 px-2 text-sm text-slate-400">{m.venue.name}</td>
                        <td className="py-4 px-2">
                          <span className="badge badge-info py-0.5 px-2 text-[10px]">{m.type}</span>
                        </td>
                        <td className="py-4 px-2 text-xs text-slate-500">
                          {formatDate(m.startDate)} — {formatDate(m.endDate)}
                        </td>
                        <td className="py-4 px-2 text-right">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${
                            m.status === "IN_PROGRESS" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-surface-200 text-slate-600 border border-surface-200"
                          }`}>
                            {m.status.replace(/_/g, " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
