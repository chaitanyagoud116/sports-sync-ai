import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Wrench, Plus, Calendar } from "lucide-react";
import AddMaintenanceForm from "./AddMaintenanceForm";

export default async function MaintenancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const manager = await prisma.venueManager.findUnique({
    where: { userId: (session.user as any).id },
    include: { venues: { select: { id: true, name: true } } },
  });

  if (!manager) redirect("/venue/dashboard");

  const schedules = await prisma.maintenanceSchedule.findMany({
    where: { venue: { managerId: manager.id } },
    include: { venue: { select: { name: true } } },
    orderBy: { startDate: "asc" },
  });

  const statusClass: Record<string, string> = {
    SCHEDULED: "badge-pending",
    IN_PROGRESS: "badge-purple",
    COMPLETED: "badge-approved",
    CANCELLED: "badge-rejected",
  };

  const typeClass: Record<string, string> = {
    ROUTINE: "badge-info",
    REPAIR: "badge-pending",
    RENOVATION: "badge-purple",
    INSPECTION: "badge-info",
    EMERGENCY: "badge-rejected",
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="text-base font-semibold text-primary">Maintenance Schedule</h1>
          <p className="text-xs" style={{ color: "#64748b" }}>Plan and track venue maintenance activities</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="grid grid-cols-3 gap-6">
          {/* Add Maintenance */}
          <div className="glass-card p-6">
            <h2 className="font-semibold text-primary mb-5 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-700" /> Schedule Maintenance
            </h2>
            <AddMaintenanceForm venues={manager.venues} />
          </div>

          {/* Schedule Table */}
          <div className="col-span-2 glass-card overflow-hidden">
            <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <h2 className="font-semibold text-primary">All Schedules</h2>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Venue</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10">
                      <Wrench className="w-8 h-8 mx-auto mb-2" style={{ color: "#1e3a8a" }} />
                      <p style={{ color: "#475569" }}>No maintenance scheduled.</p>
                    </td>
                  </tr>
                ) : schedules.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="font-medium text-primary text-sm">{s.title}</div>
                      {s.notes && (
                        <div className="text-xs mt-0.5" style={{ color: "#475569" }}>{s.notes}</div>
                      )}
                    </td>
                    <td style={{ color: "#94a3b8" }}>{s.venue.name}</td>
                    <td>
                      <span className={`badge ${typeClass[s.type]}`}>{s.type}</span>
                    </td>
                    <td className="text-xs" style={{ color: "#94a3b8" }}>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(s.startDate)} — {formatDate(s.endDate)}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${statusClass[s.status]}`}>
                        {s.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
