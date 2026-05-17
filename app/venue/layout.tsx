import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Sidebar from "@/components/shared/Sidebar";
import {
  LayoutDashboard, Grid, CheckSquare, Wrench, CalendarDays, BarChart3,
} from "lucide-react";
import DashboardLayout from "@/components/shared/DashboardLayout";

const navItems = [
  { href: "/venue/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/venue/availability", label: "Ground Availability", icon: <Grid className="w-4 h-4" /> },
  { href: "/venue/bookings", label: "Approve Bookings", icon: <CheckSquare className="w-4 h-4" /> },
  { href: "/venue/maintenance", label: "Maintenance Schedule", icon: <Wrench className="w-4 h-4" /> },
  { href: "/venue/calendar", label: "Venue Calendar", icon: <CalendarDays className="w-4 h-4" /> },
  { href: "/venue/reports", label: "Venue Reports", icon: <BarChart3 className="w-4 h-4" /> },
];

export default async function VenueLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "VENUE_MANAGER") redirect("/unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      venueManager: true,
      notifications: { where: { isRead: false }, select: { id: true } },
    },
  });

  if (!user) redirect("/login");

  const userName = user.venueManager?.fullName || "Venue Manager";

  return (
    <DashboardLayout
      role="VENUE_MANAGER"
      navItems={navItems.map(item => ({ ...item, name: item.label }))}
      userName={userName}
      userRole="Verified Venue Official"
      userEmail={user.email}
    >
      {children}
    </DashboardLayout>
  );
}
