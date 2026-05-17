import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import BracketPanel from "@/components/tournaments/BracketPanel";

export default async function TournamentBracketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!tournament) notFound();

  const matches = await prisma.match.findMany({
    where: { tournamentId: id },
    orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
    select: {
      id: true,
      round: true,
      matchNumber: true,
      homeLabel: true,
      awayLabel: true,
      homeScore: true,
      awayScore: true,
      status: true,
    },
  });

  return (
    <div className="p-8">
      <BracketPanel
        tournamentId={tournament.id}
        tournamentName={tournament.name}
        initialMatches={matches}
      />
    </div>
  );
}
