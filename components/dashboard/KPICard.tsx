"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  suffix?: string;
  delay?: number;
}

export default function KPICard({ label, value, icon, color, change, trend = "neutral", suffix = "", delay = 0 }: KPICardProps) {
  const [displayed, setDisplayed] = useState(typeof value === "number" ? 0 : value);

  useEffect(() => {
    if (typeof value !== "number") { setDisplayed(value); return; }
    const start = Date.now();
    const duration = 1200;
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayed(Math.round(eased * (value as number)));
      if (progress < 1) requestAnimationFrame(step);
    };
    const timer = setTimeout(() => requestAnimationFrame(step), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "#34d399" : trend === "down" ? "#f87171" : "#64748b";

  return (
    <div
      className="stat-card flex items-start gap-4 group"
      style={{ animationDelay: `${delay}ms`, "--gradient": `linear-gradient(90deg, ${color}, transparent)` } as React.CSSProperties}
    >
      {/* Top accent bar on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, color }}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold text-primary tracking-tight">
          {displayed}{suffix}
        </div>
        <div className="text-xs mt-0.5 font-medium" style={{ color: "#94a3b8" }}>{label}</div>
        {change && (
          <div className="flex items-center gap-1 mt-1.5">
            <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
            <span className="text-xs font-medium" style={{ color: trendColor }}>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}
