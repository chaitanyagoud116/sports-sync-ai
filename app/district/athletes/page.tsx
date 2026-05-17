import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DistrictAthletesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const officer = await prisma.districtOfficer.findUnique({
    where: { userId: (session.user as { id: string }).id },
  });

  const district = officer?.district;
  const athletes = await prisma.athlete.findMany({
    where: district ? { district } : {},
    orderBy: { talentScore: "desc" },
    take: 100,
    select: {
      id: true,
      fullName: true,
      sport: true,
      district: true,
      talentScore: true,
      experienceLevel: true,
    },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">District Athletes</h1>
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <th className="text-left p-4 text-slate-400 font-medium">Name</th>
              <th className="text-left p-4 text-slate-400 font-medium">Sport</th>
              <th className="text-left p-4 text-slate-400 font-medium">District</th>
              <th className="text-left p-4 text-slate-400 font-medium">Level</th>
              <th className="text-right p-4 text-slate-400 font-medium">Talent</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map((a) => (
              <tr
                key={a.id}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <td className="p-4 text-primary">{a.fullName}</td>
                <td className="p-4 text-slate-300">{a.sport.replace(/_/g, " ")}</td>
                <td className="p-4 text-slate-300">{a.district.replace(/_/g, " ")}</td>
                <td className="p-4 text-slate-300">{a.experienceLevel}</td>
                <td className="p-4 text-right font-semibold" style={{ color: "#10b981" }}>
                  {a.talentScore.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
