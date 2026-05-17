"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
  hover?: boolean;
  delay?: number;
}

export default function GlassCard({
  children,
  className = "",
  highlight = false,
  hover = true,
  delay = 0,
}: GlassCardProps) {
  const baseClasses = highlight
    ? "glass-card-highlight"
    : "glass-card";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      className={`${baseClasses} ${className} ${!hover ? "!hover:transform-none" : ""}`}
    >
      {children}
    </motion.div>
  );
}
