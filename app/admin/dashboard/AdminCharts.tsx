"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

interface AdminChartsProps {
  sportBreakdown: { sport: string; _count: { sport: number } }[];
  districtBreakdown: { district: string; _count: { district: number } }[];
}

export default function AdminCharts({ sportBreakdown, districtBreakdown }: AdminChartsProps) {
  const sportData = sportBreakdown.map((s) => ({
    name: s.sport.replace(/_/g, " "),
    athletes: s._count.sport,
  }));

  const districtData = districtBreakdown.map((d) => ({
    name: d.district.replace(/_/g, " ").slice(0, 12),
    value: d._count.district,
  }));

  const tooltipStyle = {
    backgroundColor: "#0f1629",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "#e2e8f0",
    fontSize: "12px",
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Sport Distribution */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-primary mb-6 text-sm">Athletes by Sport</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sportData} margin={{ left: -20 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="athletes" fill="#3b82f6" radius={[6, 6, 0, 0]}>
              {sportData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* District Distribution */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-primary mb-6 text-sm">Athletes by District</h2>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={districtData}
              cx="45%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {districtData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend
              formatter={(value) => (
                <span style={{ color: "#94a3b8", fontSize: "11px" }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
