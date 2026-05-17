"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: number;
  suffix?: string;
  delay?: number;
  color?: "cyan" | "green" | "orange" | "purple";
}

const colorClasses = {
  cyan: "text-cyan-700",
  green: "text-green-400",
  orange: "text-orange-400",
  purple: "text-purple-400",
};

const bgClasses = {
  cyan: "bg-cyan-500/10",
  green: "bg-green-500/10",
  orange: "bg-orange-500/10",
  purple: "bg-purple-500/10",
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  suffix = "",
  delay = 0,
  color = "cyan",
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgClasses[color]}`}>
          <Icon className={`w-6 h-6 ${colorClasses[color]}`} />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {trend >= 0 ? "↑" : "↓"}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-surface-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-primary">
        <AnimatedCounter value={value} suffix={suffix} />
      </p>
    </motion.div>
  );
}
