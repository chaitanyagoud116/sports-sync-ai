import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDate, formatRelative } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, User, Trophy, Search } from "lucide-react";
import ApproveButton from "./ApproveButton";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const filterStatus = (resolvedSearchParams.status as any) || undefined;

  const applications = await prisma.application.findMany({
    where: {
      ...(filterStatus ? { status: filterStatus } : {}),
      ...(resolvedSearchParams.q
        ? { athlete: { fullName: { contains: resolvedSearchParams.q } } }
        : {}),
    },
    include: {
      athlete: {
        include: {
          user: { select: { email: true } },
          documents: { select: { id: true, isVerified: true } },
        },
      },
      tournament: { include: { venue: true } },
    },
    orderBy: { appliedAt: "desc" },
  });

  const pending = applications.filter((a) => a.status === "PENDING").length;
  const approved = applications.filter((a) => a.status === "APPROVED").length;
  const rejected = applications.filter((a) => a.status === "REJECTED").length;

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="text-base font-semibold text-primary">Application Reviews</h1>
          <p className="text-xs" style={{ color: "#64748b" }}>Approve or reject athlete tournament applications</p>
        </div>
        <div className="flex gap-4 text-xs" style={{ color: "#64748b" }}>
          <span className="text-secondary font-semibold">{pending} Pending</span>
          <span className="text-emerald-700 font-semibold">{approved} Approved</span>
          <span className="text-red-400 font-semibold">{rejected} Rejected</span>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <form method="GET" className="flex gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
              <input name="q" defaultValue={resolvedSearchParams.q} className="form-input pl-9 text-sm" placeholder="Search athlete name..." />
            </div>
            <div className="flex gap-2">
              {[undefined, "PENDING", "APPROVED", "REJECTED", "WAITLISTED"].map((s) => (
                <a
                  key={s ?? "all"}
                  href={s ? `?status=${s}` : "?"}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: filterStatus === s ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${filterStatus === s ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.07)"}`,
                    color: filterStatus === s ? "#60a5fa" : "#64748b",
                  }}
                >
                  {s ?? "All"}
                </a>
              ))}
            </div>
          </form>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "#1e3a8a" }} />
            <h3 className="font-semibold text-primary">All caught up!</h3>
            <p className="text-sm mt-2" style={{ color: "#475569" }}>No applications match your filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="glass-card p-6">
                <div className="flex items-start gap-6">
                  {/* Athlete Info */}
                  <div className="flex items-center gap-3 w-64 flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
                      {app.athlete.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium text-primary text-sm">{app.athlete.fullName}</div>
                      <div className="text-xs" style={{ color: "#64748b" }}>
                        {app.athlete.sport.replace(/_/g, " ")} · {app.athlete.experienceLevel}
                      </div>
                    </div>
                  </div>

                  {/* Tournament Info */}
                  <div className="flex-1">
                    <div className="font-medium text-primary text-sm">{app.tournament.name}</div>
                    <div className="text-xs mt-1" style={{ color: "#64748b" }}>
                      {app.tournament.venue.name} · {formatDate(app.tournament.startDate)}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs" style={{ color: "#475569" }}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        Applied {formatRelative(app.appliedAt)}
                      </span>
                      <span className="text-xs" style={{ color: "#475569" }}>
                        Docs: {app.athlete.documents.length} uploaded /
                        {app.athlete.documents.filter((d) => d.isVerified).length} verified
                      </span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span className={`badge ${
                      app.status === "PENDING" ? "badge-pending" :
                      app.status === "APPROVED" ? "badge-approved" :
                      app.status === "REJECTED" ? "badge-rejected" : "badge-info"
                    }`}>
                      {app.status}
                    </span>

                    {app.status === "PENDING" && (
                      <div className="flex gap-2">
                        <ApproveButton
                          applicationId={app.id}
                          action="APPROVED"
                          athleteUserId={app.athlete.userId}
                          tournamentName={app.tournament.name}
                        />
                        <ApproveButton
                          applicationId={app.id}
                          action="REJECTED"
                          athleteUserId={app.athlete.userId}
                          tournamentName={app.tournament.name}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {app.adminNote && (
                  <div className="mt-3 pt-3 text-xs border-t" style={{ borderColor: "rgba(255,255,255,0.05)", color: "#64748b" }}>
                    Admin note: {app.adminNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
