import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import BookingActionButton from "./BookingActionButton";
import { Building2 } from "lucide-react";

export default async function BookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const manager = await prisma.venueManager.findUnique({
    where: { userId: (session.user as any).id },
  });

  if (!manager) redirect("/venue/dashboard");

  const bookings = await prisma.booking.findMany({
    where: { venue: { managerId: manager.id } },
    include: {
      venue: true,
      tournament: { include: { _count: { select: { applications: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="text-base font-semibold text-primary">Booking Requests</h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            {pending} pending approval{pending !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="dashboard-content">
        {bookings.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4" style={{ color: "#1e3a8a" }} />
            <h3 className="font-semibold text-primary">No booking requests</h3>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tournament</th>
                  <th>Venue</th>
                  <th>Dates</th>
                  <th>Sport</th>
                  <th>Applicants</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div className="font-medium text-primary text-sm">{b.tournament.name}</div>
                    </td>
                    <td style={{ color: "#94a3b8" }}>{b.venue.name}</td>
                    <td style={{ color: "#94a3b8" }} className="text-xs">
                      {formatDate(b.startDate)} — {formatDate(b.endDate)}
                    </td>
                    <td>
                      <span className="badge badge-info">{b.tournament.sport.replace(/_/g, " ")}</span>
                    </td>
                    <td style={{ color: "#94a3b8" }}>{b.tournament._count.applications}</td>
                    <td>
                      <span className={`badge ${
                        b.status === "APPROVED" ? "badge-approved" :
                        b.status === "PENDING" ? "badge-pending" :
                        b.status === "REJECTED" ? "badge-rejected" : "badge-info"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.status === "PENDING" && (
                        <div className="flex gap-2">
                          <BookingActionButton bookingId={b.id} action="APPROVED" />
                          <BookingActionButton bookingId={b.id} action="REJECTED" />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
