"use client";
import { DistrictChart, SportPieChart } from "@/components/charts/Charts";

export default function AdminDashboardCharts({
  sportData,
  districtData,
}: {
  sportData: { name: string; value: number }[];
  districtData: { name: string; value: number }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* District Heatmap */}
      <div className="glass-card p-5">
        <h2 className="font-semibold text-primary text-sm mb-1">Athletes by District</h2>
        <p className="text-xs mb-4" style={{ color: "#64748b" }}>
          Geographic distribution across Goa
        </p>
        <DistrictChart data={districtData} />
      </div>

      {/* Sport Breakdown */}
      <div className="glass-card p-5">
        <h2 className="font-semibold text-primary text-sm mb-1">Sport Distribution</h2>
        <p className="text-xs mb-4" style={{ color: "#64748b" }}>
          Athletes registered per sport category
        </p>
        <SportPieChart data={sportData} />
      </div>
    </div>
  );
}
