"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface SportCardProps {
  name: string;
  icon: LucideIcon;
  count: number;
  delay?: number;
  color?: "cyan" | "green" | "orange" | "purple";
}

const colorClasses = {
  cyan: {
    bg: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/30",
    text: "text-cyan-700",
    glow: "hover:shadow-cyan-500/25",
  },
  green: {
    bg: "from-green-500/20 to-green-500/5",
    border: "border-green-500/30",
    text: "text-green-400",
    glow: "hover:shadow-green-500/25",
  },
  orange: {
    bg: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/30",
    text: "text-orange-400",
    glow: "hover:shadow-orange-500/25",
  },
  purple: {
    bg: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/30",
    text: "text-purple-400",
    glow: "hover:shadow-purple-500/25",
  },
};

export default function SportCard({
  name,
  icon: Icon,
  count,
  delay = 0,
  color = "cyan",
}: SportCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative group p-6 rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} backdrop-blur-xl transition-all duration-300 ${colors.glow} hover:shadow-2xl cursor-pointer overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className={`p-3 rounded-xl bg-surface-50 border-surface-200 mb-4 inline-block ${colors.text}`}>
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-primary mb-2">{name}</h3>
        <p className={`text-sm ${colors.text} font-medium`}>
          {count} Active Athletes
        </p>
      </div>
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${colors.bg} blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-300`} />
    </motion.div>
  );
}
