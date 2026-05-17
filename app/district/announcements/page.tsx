import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import AnnouncementForm from "@/components/announcements/AnnouncementForm";

export default async function DistrictAnnouncementsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const officer = await prisma.districtOfficer.findUnique({
    where: { userId: (session.user as { id: string }).id },
  });

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { createdBy: { select: { email: true, role: true } } },
  });

  return (
    
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-primary">Announcements</h1>

      <AnnouncementForm
        defaultScope="DISTRICT"
        defaultScopeValue={officer?.district ?? ""}
        lockScope={!!officer?.district}
      />

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="glass-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium text-primary">{a.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{a.message}</p>
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {a.scope}
                {a.scopeValue ? ` - ${a.scopeValue}` : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
