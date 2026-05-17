import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess, forbidden, unauthorized } from "@/lib/api-response";
import { isGovUser } from "@/lib/rbac";

const createMatchSchema = z.object({
  tournamentId: z.string(),
  round: z.string(),
  matchNumber: z.number().int().positive().optional(),
  homeLabel: z.string().optional(),
  awayLabel: z.string().optional(),
  homeAthleteId: z.string().optional(),
  awayAthleteId: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  venue: z.string().optional(),
});

// GET /api/matches?tournamentId=
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const tournamentId = new URL(req.url).searchParams.get("tournamentId");
  if (!tournamentId) {
    return apiError("VALIDATION_ERROR", "tournamentId is required", 400);
  }

  const matches = await prisma.match.findMany({
    where: { tournamentId },
    orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
    include: {
      homeAthlete: { select: { id: true, fullName: true } },
      awayAthlete: { select: { id: true, fullName: true } },
    },
  });

  return apiSuccess({ matches });
}

// POST /api/matches — create match fixture
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const role = (session.user as { role?: string }).role;
  if (!isGovUser(role) && role !== "TOURNAMENT_ORGANIZER") {
    return forbidden();
  }

  const parsed = createMatchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", parsed.error.message, 400);
  }

  const { scheduledAt, ...data } = parsed.data;

  const match = await prisma.match.create({
    data: {
      ...data,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    },
  });

  return apiSuccess({ match }, 201);
}
