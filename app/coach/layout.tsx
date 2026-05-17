import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Sidebar from "@/components/shared/Sidebar";
import {
  LayoutDashboard, Users, Calendar, ClipboardList, Activity,
} from "lucide-react";
import DashboardLayout from "@/components/shared/DashboardLayout";

const navItems = [
  { href: "/coach/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/coach/my-athletes", label: "My Athletes", icon: <Users className="w-4 h-4" /> },
  { href: "/coach/sessions", label: "Training Sessions", icon: <Calendar className="w-4 h-4" /> },
  { href: "/coach/performance", label: "Log Performance", icon: <Activity className="w-4 h-4" /> },
];

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "COACH") redirect("/unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      coach: { select: { fullName: true } },
      notifications: { where: { isRead: false }, select: { id: true } },
    },
  });

  if (!user) redirect("/login");

  return (
    <DashboardLayout
      role="COACH"
      navItems={navItems.map(item => ({ ...item, name: item.label }))}
      userName={user.coach?.fullName || "Coach"}
      userRole="Verified State Coach"
      userEmail={user.email}
    >
      {children}
    </DashboardLayout>
  );
}
