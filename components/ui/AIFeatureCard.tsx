"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AIFeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  delay?: number;
  color?: "cyan" | "green" | "orange" | "purple";
}

const colorClasses = {
  cyan: {
    bg: "from-cyan-500/10 to-cyan-500/5",
    border: "border-cyan-500/20",
    icon: "text-cyan-700",
    glow: "hover:shadow-cyan-500/20",
  },
  green: {
    bg: "from-green-500/10 to-green-500/5",
    border: "border-green-500/20",
    icon: "text-green-400",
    glow: "hover:shadow-green-500/20",
  },
  orange: {
    bg: "from-orange-500/10 to-orange-500/5",
    border: "border-orange-500/20",
    icon: "text-orange-400",
    glow: "hover:shadow-orange-500/20",
  },
  purple: {
    bg: "from-purple-500/10 to-purple-500/5",
    border: "border-purple-500/20",
    icon: "text-purple-400",
    glow: "hover:shadow-purple-500/20",
  },
};

export default function AIFeatureCard({
  title,
  description,
  icon: Icon,
  delay = 0,
  color = "cyan",
}: AIFeatureCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative group p-8 rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} backdrop-blur-xl transition-all duration-300 ${colors.glow} hover:shadow-2xl overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className={`p-4 rounded-xl bg-surface-50 border-surface-200 mb-6 inline-block ${colors.icon}`}>
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-primary mb-3">{title}</h3>
        <p className="text-surface-600 leading-relaxed">{description}</p>
      </div>
      <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full ${colors.bg} blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-300`} />
    </motion.div>
  );
}
