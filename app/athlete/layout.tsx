import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Sidebar from "@/components/shared/Sidebar";
import {
  LayoutDashboard, Trophy, FileText, Upload, Clock, Calendar,
  Medal, Bell, Activity, Target
} from "lucide-react";
import DashboardLayout from "@/components/shared/DashboardLayout";

const navItems = [
  { href: "/athlete/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/athlete/performance", label: "Performance", icon: <Activity className="w-4 h-4" /> },
  { href: "/athlete/tournaments", label: "Tournaments", icon: <Trophy className="w-4 h-4" /> },
  { href: "/athlete/status", label: "My Applications", icon: <Clock className="w-4 h-4" /> },
  { href: "/athlete/schedule", label: "Training Schedule", icon: <Calendar className="w-4 h-4" /> },
  { href: "/athlete/results", label: "Results", icon: <Medal className="w-4 h-4" /> },
  { href: "/athlete/documents", label: "Documents", icon: <Upload className="w-4 h-4" /> },
  { href: "/athlete/notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
];

export default async function AthleteLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "ATHLETE") redirect("/unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      athlete: true,
      notifications: { where: { isRead: false }, select: { id: true } },
    },
  });

  if (!user) redirect("/login");

  const userName = user.athlete?.fullName || user.email.split("@")[0];
  const notifCount = user.notifications.length;

  return (
    <DashboardLayout
      role="ATHLETE"
      navItems={navItems.map(item => ({ ...item, name: item.label }))}
      userName={userName}
      userRole="Verified National Athlete"
      userEmail={user.email}
    >
      {children}
    </DashboardLayout>
  );
}
