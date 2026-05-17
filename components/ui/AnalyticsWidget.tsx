"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import GlassCard from "./GlassCard";

interface AnalyticsWidgetProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export default function AnalyticsWidget({
  title,
  icon: Icon,
  children,
  delay = 0,
  className = "",
}: AnalyticsWidgetProps) {
  return (
    <GlassCard delay={delay} className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <Icon className="w-5 h-5 text-cyan-700" />
          </div>
          <h3 className="text-lg font-semibold text-primary">{title}</h3>
        </div>
      </div>
      {children}
    </GlassCard>
  );
}
