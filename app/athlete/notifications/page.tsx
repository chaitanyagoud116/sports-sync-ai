import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Bell, CheckCircle } from "lucide-react";

export default async function AthleteNotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notifs = await prisma.notification.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
  });

  const typeIcon: Record<string, string> = {
    SUCCESS: "✅",
    INFO: "ℹ️",
    WARNING: "⚠️",
    ERROR: "❌",
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="text-base font-semibold text-primary">Notifications</h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            {notifs.filter((n) => !n.isRead).length} unread
          </p>
        </div>
      </div>
      <div className="dashboard-content max-w-2xl">
        {notifs.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: "#1e3a8a" }} />
            <p style={{ color: "#475569" }}>No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifs.map((n) => (
              <div key={n.id} className="glass-card p-5"
                style={{ opacity: n.isRead ? 0.7 : 1 }}>
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{typeIcon[n.type] || "ℹ️"}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-primary text-sm">{n.title}</div>
                    <div className="text-sm mt-1" style={{ color: "#94a3b8" }}>{n.message}</div>
                    <div className="text-xs mt-2" style={{ color: "#475569" }}>{formatDate(n.createdAt)}</div>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: "#3b82f6" }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
