"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];

interface AnalyticsChartsProps {
  sportStats: { sport: string; _count: { sport: number } }[];
  districtStats: { district: string; _count: { district: number } }[];
  monthlyData: { month: string; athletes: number }[];
  experienceStats: { experienceLevel: string; _count: { experienceLevel: number } }[];
  tournamentStats: { status: string; _count: { status: number } }[];
}

const tooltipStyle = {
  backgroundColor: "#0f1629",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  color: "#e2e8f0",
  fontSize: "12px",
};

export default function AnalyticsCharts({
  sportStats, districtStats, monthlyData, experienceStats, tournamentStats,
}: AnalyticsChartsProps) {
  const sportData = sportStats.map((s) => ({
    name: s.sport.replace(/_/g, " ").split(" ")[0],
    count: s._count.sport,
  }));

  const districtData = districtStats.map((d) => ({
    name: d.district.replace(/_/g, " ").replace(" GOA", "").replace("GOA", "Goa"),
    value: d._count.district,
  }));

  const expData = experienceStats.map((e) => ({
    name: e.experienceLevel.charAt(0) + e.experienceLevel.slice(1).toLowerCase(),
    value: e._count.experienceLevel,
  }));

  const tourneyData = tournamentStats.map((t) => ({
    name: t.status,
    value: t._count.status,
  }));

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Monthly Registrations */}
      <div className="col-span-2 glass-card p-6">
        <h2 className="font-semibold text-primary mb-6 text-sm">Athlete Registration Trend (Last 6 Months)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthlyData.length > 0 ? monthlyData : [{ month: "Jan", athletes: 0 }]}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="athletes" stroke="#3b82f6" fill="url(#grad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sport Distribution */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-primary mb-5 text-sm">Sport Popularity</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sportData} margin={{ left: -20 }}>
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {sportData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* District Distribution */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-primary mb-5 text-sm">Athletes by District</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={districtData} cx="45%" cy="50%" outerRadius={75} paddingAngle={3} dataKey="value">
              {districtData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: "10px" }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Experience Level */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-primary mb-5 text-sm">Experience Distribution</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={expData} cx="45%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
              {expData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: "10px" }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Tournament Status */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-primary mb-5 text-sm">Tournament Status Overview</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={tourneyData} margin={{ left: -20 }}>
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {tourneyData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
