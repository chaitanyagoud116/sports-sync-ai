import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import AthleteDashboardClient from "./AthleteDashboardClient";

async function getAthleteData(userId: string) {
  const athlete = await prisma.athlete.findUnique({
    where: { userId },
    include: {
      applications: {
        include: { tournament: { include: { venue: true } } },
        orderBy: { appliedAt: "desc" },
        take: 5,
      },
      results: {
        include: { tournament: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
      },
    },
  });

  if (!athlete) return null;

  const recommended = await prisma.tournament.findMany({
    where: {
      status: "PUBLISHED",
      sport: athlete.sport,
      id: { notIn: athlete.applications.map((a) => a.tournamentId) },
    },
    include: { venue: true },
    take: 3,
  });

  return { athlete, recommended };
}

export default async function AthleteDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;

  const data = await getAthleteData(userId);
  if (!data) redirect("/login");

  return <AthleteDashboardClient athlete={data.athlete} recommended={data.recommended} />;
}
