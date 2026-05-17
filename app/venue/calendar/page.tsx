import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import VenueCalendarClient from "./VenueCalendarClient";

export default async function VenueCalendarPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const manager = await prisma.venueManager.findUnique({
    where: { userId: (session.user as any).id },
  });

  if (!manager) redirect("/venue/dashboard");

  const bookings = await prisma.booking.findMany({
    where: { venue: { managerId: manager.id } },
    include: {
      venue: { select: { name: true } },
      tournament: { select: { name: true, sport: true } },
    },
  });

  const maintenance = await prisma.maintenanceSchedule.findMany({
    where: { venue: { managerId: manager.id } },
    include: { venue: { select: { name: true } } },
  });

  const events = [
    ...bookings.map((b) => ({
      id: b.id,
      title: b.tournament.name,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      type: "booking" as const,
      venue: b.venue.name,
      status: b.status,
      sport: b.tournament.sport,
    })),
    ...maintenance.map((m) => ({
      id: m.id,
      title: m.title,
      startDate: m.startDate.toISOString(),
      endDate: m.endDate.toISOString(),
      type: "maintenance" as const,
      venue: m.venue.name,
      status: m.status,
      sport: null,
    })),
  ];

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="text-base font-semibold text-primary">Venue Calendar</h1>
          <p className="text-xs" style={{ color: "#64748b" }}>Full view of bookings and maintenance</p>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: "#64748b" }}>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(59,130,246,0.6)" }} />
            Tournaments
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(251,191,36,0.6)" }} />
            Maintenance
          </div>
        </div>
      </div>
      <div className="dashboard-content">
        <VenueCalendarClient events={events} />
      </div>
    </div>
  );
}
