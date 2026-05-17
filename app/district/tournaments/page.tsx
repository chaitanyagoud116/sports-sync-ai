import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function DistrictTournamentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const officer = await prisma.districtOfficer.findUnique({
    where: { userId: (session.user as { id: string }).id },
  });

  const tournaments = await prisma.tournament.findMany({
    where: officer?.district
      ? { venue: { district: officer.district } }
      : {},
    include: { venue: { select: { name: true, district: true } }, _count: { select: { matches: true } } },
    orderBy: { startDate: "desc" },
    take: 50,
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">District Tournaments</h1>
      <div className="space-y-4">
        {tournaments.map((t) => (
          <div key={t.id} className="glass-card p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-primary">{t.name}</h2>
              <p className="text-sm text-slate-400 mt-1">
                {t.venue.name} · {formatDate(t.startDate)} – {formatDate(t.endDate)}
              </p>
              <p className="text-xs mt-2">
                <span className="badge badge-blue">{t.status}</span>
                <span className="ml-2 text-slate-500">{t._count.matches} matches</span>
              </p>
            </div>
            <Link
              href={`/admin/tournaments/${t.id}/bracket`}
              className="btn-secondary text-sm"
            >
              View Bracket
            </Link>
          </div>
        ))}
        {tournaments.length === 0 && (
          <p className="text-slate-400">No tournaments in this district.</p>
        )}
      </div>
    </div>
  );
}
