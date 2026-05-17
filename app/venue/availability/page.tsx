import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Calendar, AlertTriangle, Building2, CheckCircle, Bell, Plus } from "lucide-react";
import Link from "next/link";
import NeonButton from "@/components/ui/NeonButton";
import GlassCard from "@/components/ui/GlassCard";

export default async function VenueAvailabilityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const manager = await prisma.venueManager.findUnique({
    where: { userId: (session.user as any).id },
    include: {
      venues: {
        include: {
          bookings: {
            where: { startDate: { gte: new Date() } },
            orderBy: { startDate: "asc" },
            take: 10,
          },
          maintenance: {
            where: { endDate: { gte: new Date() } },
            orderBy: { startDate: "asc" },
          }
        }
      }
    }
  });

  if (!manager) redirect("/unauthorized");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Ground Availability</h1>
          <p className="text-surface-600">Live status and slot management for your facilities</p>
        </div>
        <div className="flex gap-3">
          <Link href="/venue/maintenance/new">
            <NeonButton variant="secondary" icon={<AlertTriangle className="w-4 h-4" />}>
              Block for Maintenance
            </NeonButton>
          </Link>
          <Link href="/venue/bookings/new">
            <NeonButton variant="primary" icon={<Plus className="w-4 h-4" />}>
              Manual Booking
            </NeonButton>
          </Link>
        </div>
      </div>

      <div className="space-y-12">
        {manager.venues.map((v) => (
          <div key={v.id} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-700 border border-cyan-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-primary">{v.name}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upcoming Occupancy */}
              <div className="lg:col-span-2">
                <GlassCard className="p-6">
                  <h3 className="text-lg font-bold text-primary mb-6">Upcoming Occupancy</h3>
                  <div className="space-y-4">
                    {v.bookings.length === 0 && v.maintenance.length === 0 ? (
                      <p className="text-surface-400 text-center py-8">No scheduled occupancy for this venue.</p>
                    ) : (
                      <>
                        {v.maintenance.map(m => (
                          <div key={m.id} className="flex items-center gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                              <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-bold text-primary">{m.title}</div>
                              <div className="text-xs text-surface-500">{new Date(m.startDate).toLocaleDateString()} - {new Date(m.endDate).toLocaleDateString()}</div>
                            </div>
                            <span className="text-[10px] font-bold uppercase text-red-400 bg-red-500/10 px-2 py-1 rounded">Maintenance</span>
                          </div>
                        ))}
                        {v.bookings.map(b => (
                          <div key={b.id} className="flex items-center gap-4 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-700">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-bold text-primary">Tournament Booking</div>
                              <div className="text-xs text-surface-500">{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</div>
                            </div>
                            <span className="text-[10px] font-bold uppercase text-cyan-700 bg-cyan-500/10 px-2 py-1 rounded">Booked</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </GlassCard>
              </div>

              {/* Status & Quick Stats */}
              <div className="space-y-6">
                <GlassCard className="p-6">
                  <h3 className="text-lg font-bold text-primary mb-4">Venue Status</h3>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-6">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-primary">Currently Open</div>
                      <div className="text-xs text-green-400 font-medium">Available for booking</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-500">Total Capacity</span>
                      <span className="text-primary font-bold">{v.capacity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-500">Next Event</span>
                      <span className="text-cyan-700 font-bold">{v.bookings[0] ? new Date(v.bookings[0].startDate).toLocaleDateString() : "None"}</span>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard highlight className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-5 h-5 text-secondary" />
                    <h3 className="text-lg font-bold text-primary">Notice</h3>
                  </div>
                  <p className="text-xs text-surface-600 leading-relaxed">
                    Venues must be inspected 24 hours before any state-level tournament. Ensure maintenance logs are updated.
                  </p>
                </GlassCard>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
