import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Sidebar from "@/components/shared/Sidebar";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Megaphone,
  BarChart3,
} from "lucide-react";
import DashboardLayout from "@/components/shared/DashboardLayout";

const navItems = [
  { href: "/district/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/district/athletes", label: "District Athletes", icon: <Users className="w-4 h-4" /> },
  { href: "/district/tournaments", label: "Tournaments", icon: <Trophy className="w-4 h-4" /> },
  { href: "/district/announcements", label: "Announcements", icon: <Megaphone className="w-4 h-4" /> },
  { href: "/district/analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
];

export default async function DistrictLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (
    role !== "DISTRICT_OFFICER" &&
    role !== "ADMIN" &&
    role !== "GOV_ADMIN"
  ) {
    redirect("/unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as { id: string }).id },
    include: {
      districtOfficer: { select: { fullName: true, district: true } },
      notifications: { where: { isRead: false }, select: { id: true } },
    },
  });

  if (!user) redirect("/login");

  const district = user.districtOfficer?.district ?? "Statewide";
  const name =
    user.districtOfficer?.fullName ??
    (role === "GOV_ADMIN" ? "Government Official" : "Administrator");

  return (
    <DashboardLayout
      role="DISTRICT_OFFICER"
      navItems={navItems.map(item => ({ ...item, name: item.label }))}
      userName={name}
      userRole={`${district.replace(/_/g, " ")} Officer`}
      userEmail={user.email}
    >
      {children}
    </DashboardLayout>
  );
}
