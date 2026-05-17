import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess, forbidden, unauthorized } from "@/lib/api-response";
import { isGovUser } from "@/lib/rbac";

const updateSchema = z.object({
  status: z.enum(["SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"]).optional(),
  homeScore: z.number().int().min(0).optional(),
  awayScore: z.number().int().min(0).optional(),
  homeLabel: z.string().optional(),
  awayLabel: z.string().optional(),
  winnerLabel: z.string().optional(),
  notes: z.string().optional(),
});

// PATCH /api/matches/[id] — update score / status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const role = (session.user as { role?: string }).role;
  if (!isGovUser(role) && role !== "TOURNAMENT_ORGANIZER") {
    return forbidden();
  }

  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", parsed.error.message, 400);
  }

  const match = await prisma.match.update({
    where: { id },
    data: parsed.data,
  });

  return apiSuccess({ match });
}
