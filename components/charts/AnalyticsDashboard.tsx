"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import PerformanceChart from "./PerformanceChart";
import { TrendingUp, Target, Award, Zap } from "lucide-react";

interface AnalyticsDashboardProps {
  sportData: Array<{ name: string; value: number }>;
  districtData: Array<{ name: string; value: number }>;
  performanceData?: Array<{ month: string; value: number }>;
}

export default function AnalyticsDashboard({
  sportData,
  districtData,
  performanceData = [
    { month: "Jan", value: 65 },
    { month: "Feb", value: 78 },
    { month: "Mar", value: 82 },
    { month: "Apr", value: 91 },
    { month: "May", value: 88 },
    { month: "Jun", value: 95 },
  ],
}: AnalyticsDashboardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Sport Distribution */}
      <GlassCard delay={0.1} className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-cyan-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary">Sport Distribution</h3>
            <p className="text-sm text-surface-500">Athletes by sport category</p>
          </div>
        </div>
        <PerformanceChart data={sportData} type="bar" height={300} delay={0.2} />
      </GlassCard>

      {/* District Coverage */}
      <GlassCard delay={0.3} className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Award className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary">District Coverage</h3>
            <p className="text-sm text-surface-500">Athletes across Goa districts</p>
          </div>
        </div>
        <PerformanceChart data={districtData} type="area" color="#39FF14" height={300} delay={0.4} />
      </GlassCard>

      {/* Performance Trends */}
      <GlassCard delay={0.5} className="p-6 lg:col-span-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary">Performance Trends</h3>
            <p className="text-sm text-surface-500">Overall athlete performance over time</p>
          </div>
        </div>
        <PerformanceChart data={performanceData} type="line" color="#FF6B35" height={300} delay={0.6} />
      </GlassCard>
    </div>
  );
}
