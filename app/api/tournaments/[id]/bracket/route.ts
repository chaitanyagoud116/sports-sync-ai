import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import { generateSingleEliminationBracket } from "@/lib/brackets";
import { apiError, apiSuccess, forbidden, unauthorized } from "@/lib/api-response";
import { isGovUser } from "@/lib/rbac";

// POST /api/tournaments/[id]/bracket — generate bracket from approved athletes
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const role = (session.user as { role?: string }).role;
  if (!isGovUser(role) && role !== "TOURNAMENT_ORGANIZER") {
    return forbidden();
  }

  const { id: tournamentId } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      applications: {
        where: { status: "APPROVED" },
        include: { athlete: { select: { id: true, fullName: true } } },
      },
    },
  });

  if (!tournament) {
    return apiError("NOT_FOUND", "Tournament not found", 404);
  }

  const participants = tournament.applications.map((app) => ({
    id: app.athlete.id,
    label: app.athlete.fullName,
  }));

  if (participants.length < 2) {
    return apiError(
      "VALIDATION_ERROR",
      "At least 2 approved athletes required to generate a bracket",
      400
    );
  }

  const bracket = generateSingleEliminationBracket(participants);

  await prisma.match.deleteMany({ where: { tournamentId } });

  await prisma.match.createMany({
    data: bracket.matches.map((m) => ({
      tournamentId,
      round: m.round,
      matchNumber: m.matchNumber,
      homeLabel: m.homeLabel,
      awayLabel: m.awayLabel,
      homeAthleteId: m.homeAthleteId,
      awayAthleteId: m.awayAthleteId,
      status: "SCHEDULED",
    })),
  });

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { bracketData: JSON.stringify(bracket) },
  });

  return apiSuccess({ bracket, matchCount: bracket.matches.length });
}

// GET /api/tournaments/[id]/bracket
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { id: tournamentId } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { bracketData: true, name: true },
  });

  if (!tournament) {
    return apiError("NOT_FOUND", "Tournament not found", 404);
  }

  const matches = await prisma.match.findMany({
    where: { tournamentId },
    orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
  });

  const bracket = tournament.bracketData
    ? JSON.parse(tournament.bracketData)
    : null;

  return apiSuccess({ bracket, matches, tournamentName: tournament.name });
}
