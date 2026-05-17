import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Trophy, Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default async function StatusPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const athlete = await prisma.athlete.findUnique({
    where: { userId: (session.user as any).id },
    include: {
      applications: {
        include: {
          tournament: { include: { venue: true } },
        },
        orderBy: { appliedAt: "desc" },
      },
    },
  });

  if (!athlete) redirect("/login");

  const statusIcon: Record<string, React.ReactNode> = {
    APPROVED: <CheckCircle className="w-5 h-5 text-emerald-700" />,
    PENDING: <Clock className="w-5 h-5 text-secondary" />,
    REJECTED: <XCircle className="w-5 h-5 text-red-400" />,
    WAITLISTED: <AlertCircle className="w-5 h-5 text-blue-400" />,
  };

  const statusClass: Record<string, string> = {
    APPROVED: "badge-approved",
    PENDING: "badge-pending",
    REJECTED: "badge-rejected",
    WAITLISTED: "badge-info",
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="text-base font-semibold text-primary">Application Status</h1>
          <p className="text-xs" style={{ color: "#64748b" }}>Track all your tournament applications</p>
        </div>
        <div className="flex gap-3 text-xs" style={{ color: "#64748b" }}>
          <span>Total: <strong className="text-primary">{athlete.applications.length}</strong></span>
          <span>Approved: <strong className="text-emerald-700">{athlete.applications.filter(a => a.status === "APPROVED").length}</strong></span>
          <span>Pending: <strong className="text-secondary">{athlete.applications.filter(a => a.status === "PENDING").length}</strong></span>
        </div>
      </div>

      <div className="dashboard-content">
        {athlete.applications.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4" style={{ color: "#1e3a8a" }} />
            <h3 className="font-semibold text-primary mb-2">No Applications Yet</h3>
            <p className="text-sm mb-4" style={{ color: "#475569" }}>Start by browsing available tournaments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {athlete.applications.map((app) => (
              <div key={app.id} className="glass-card p-6">
                <div className="flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.05)" }}>
                      {statusIcon[app.status]}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-primary">{app.tournament.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: "#64748b" }}>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {app.tournament.venue.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(app.tournament.startDate)} — {formatDate(app.tournament.endDate)}
                          </span>
                        </div>
                      </div>
                      <span className={`badge ${statusClass[app.status]} flex-shrink-0`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-xs mb-1" style={{ color: "#475569" }}>Applied On</div>
                        <div style={{ color: "#94a3b8" }}>{formatDate(app.appliedAt)}</div>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: "#475569" }}>Sport</div>
                        <div style={{ color: "#94a3b8" }}>{app.tournament.sport.replace(/_/g, " ")}</div>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: "#475569" }}>Category</div>
                        <div style={{ color: "#94a3b8" }}>{app.tournament.category.replace(/_/g, " ")}</div>
                      </div>
                    </div>

                    {app.adminNote && (
                      <div className="mt-3 p-3 rounded-lg text-sm"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <span style={{ color: "#64748b" }}>Admin note: </span>
                        <span style={{ color: "#94a3b8" }}>{app.adminNote}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
