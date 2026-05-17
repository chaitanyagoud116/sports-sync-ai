import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Sidebar from "@/components/shared/Sidebar";
import {
  LayoutDashboard, Trophy, Users, Building2, CheckSquare,
  BarChart3, Bell, Settings, Medal, GraduationCap, School, Brain
} from "lucide-react";
import DashboardLayout from "@/components/shared/DashboardLayout";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/admin/ai-insights", label: "AI Insights", icon: <Brain className="w-4 h-4" /> },
  { href: "/admin/tournaments", label: "Tournaments", icon: <Trophy className="w-4 h-4" /> },
  { href: "/admin/applications", label: "Applications", icon: <CheckSquare className="w-4 h-4" /> },
  { href: "/admin/athletes", label: "Athletes", icon: <Users className="w-4 h-4" /> },
  { href: "/admin/coaches", label: "Coaches", icon: <GraduationCap className="w-4 h-4" /> },
  { href: "/admin/academies", label: "Academies", icon: <School className="w-4 h-4" /> },
  { href: "/admin/venues", label: "Venues", icon: <Building2 className="w-4 h-4" /> },
  { href: "/admin/results", label: "Results", icon: <Medal className="w-4 h-4" /> },
  { href: "/admin/analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
  { href: "/admin/announcements", label: "Announcements", icon: <Bell className="w-4 h-4" /> },
  { href: "/admin/notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "GOV_ADMIN") redirect("/unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      notifications: { where: { isRead: false }, select: { id: true } },
    },
  });

  if (!user) redirect("/login");

  return (
    <DashboardLayout
      role={role === "GOV_ADMIN" ? "GOV_ADMIN" : "ADMIN"}
      navItems={navItems.map(item => ({ ...item, name: item.label }))}
      userName={role === "GOV_ADMIN" ? "Govt Official" : "Administrator"}
      userRole={role === "GOV_ADMIN" ? "Executive Desk" : "State Admin"}
      userEmail={user.email}
    >
      {children}
    </DashboardLayout>
  );
}
