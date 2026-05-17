"use client";
import { Activity, User, Trophy, Building2, Brain } from "lucide-react";

interface ActivityItem {
  id: string;
  action: string;
  actor: string;
  role: string;
  targetType: string;
  details?: string | null;
  createdAt: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  CREATE_COACH: <User className="w-3.5 h-3.5" />,
  CREATE_ACADEMY: <Building2 className="w-3.5 h-3.5" />,
  "APPROVE_APPLICATION": <Trophy className="w-3.5 h-3.5" />,
  "CREATE_TOURNAMENT": <Trophy className="w-3.5 h-3.5" />,
};

const ACTION_COLORS: Record<string, string> = {
  CREATE_COACH: "#60a5fa",
  CREATE_ACADEMY: "#34d399",
  APPROVE_APPLICATION: "#fbbf24",
  CREATE_TOURNAMENT: "#a78bfa",
  REJECT_APPLICATION: "#f87171",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatAction(action: string): string {
  return action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (!items.length) {
    return (
      <div className="text-center py-8" style={{ color: "#64748b" }}>
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const color = ACTION_COLORS[item.action] || "#60a5fa";
        const icon = ACTION_ICONS[item.action] || <Activity className="w-3.5 h-3.5" />;
        return (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-xl transition-colors"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            {/* Icon dot */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: `${color}18`, color }}
            >
              {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-primary truncate">
                  {formatAction(item.action)}
                </span>
                <span className="text-xs flex-shrink-0" style={{ color: "#475569" }}>
                  {timeAgo(item.createdAt)}
                </span>
              </div>
              <div className="text-xs mt-0.5 truncate" style={{ color: "#64748b" }}>
                {item.details || `By ${item.actor}`}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
