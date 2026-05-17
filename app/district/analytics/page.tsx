import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getDistrictAnalytics } from "@/lib/analytics";

export default async function DistrictAnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const officer = await prisma.districtOfficer.findUnique({
    where: { userId: (session.user as { id: string }).id },
  });

  const district = officer?.district ?? "PANAJI";
  const stats = await getDistrictAnalytics(district);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-primary">
        {district.replace(/_/g, " ")} Analytics
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-sm text-slate-400">Athletes</p>
          <p className="text-3xl font-bold text-primary mt-1">{stats.athleteCount}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-slate-400">Avg Talent Score</p>
          <p className="text-3xl font-bold text-primary mt-1">
            {stats.avgTalentScore.toFixed(1)}
          </p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-slate-400">Medals</p>
          <p className="text-3xl font-bold text-primary mt-1">{stats.medalCount}</p>
        </div>
      </div>
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Sport breakdown</h2>
        <ul className="space-y-2">
          {stats.sportBreakdown.map((s) => (
            <li key={s.sport} className="flex justify-between text-sm">
              <span className="text-slate-300">{s.sport.replace(/_/g, " ")}</span>
              <span className="text-primary font-medium">{s.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
