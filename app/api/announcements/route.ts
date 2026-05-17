import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess, forbidden, unauthorized } from "@/lib/api-response";
import { isGovUser } from "@/lib/rbac";

const createSchema = z.object({
  title: z.string().min(3),
  message: z.string().min(5),
  scope: z.enum(["STATE", "DISTRICT", "SPORT"]).default("STATE"),
  scopeValue: z.string().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  expiresAt: z.string().datetime().optional(),
});

// GET /api/announcements — list active announcements
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const role = (session.user as { role?: string }).role;
  const { searchParams } = new URL(req.url);
  const district = searchParams.get("district");
  const sport = searchParams.get("sport");

  const announcements = await prisma.announcement.findMany({
    where: {
      OR: [
        { scope: "STATE" },
        ...(district ? [{ scope: "DISTRICT", scopeValue: district }] : []),
        ...(sport ? [{ scope: "SPORT", scopeValue: sport }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      createdBy: { select: { email: true, role: true } },
    },
  });

  return apiSuccess({ announcements, role });
}

// POST /api/announcements — government broadcast
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const role = (session.user as { role?: string }).role;
  if (!isGovUser(role) && role !== "DISTRICT_OFFICER") {
    return forbidden();
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", parsed.error.message, 400);
  }

  const userId = (session.user as { id: string }).id;
  let { scope, scopeValue, ...rest } = parsed.data;

  if (role === "DISTRICT_OFFICER") {
    const officer = await prisma.districtOfficer.findUnique({
      where: { userId },
    });
    if (!officer) return forbidden();
    scope = "DISTRICT";
    scopeValue = officer.district;
  }

  const announcement = await prisma.announcement.create({
    data: {
      ...rest,
      scope,
      scopeValue: scopeValue ?? null,
      createdById: userId,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: userId,
      action: "ANNOUNCEMENT_CREATE",
      targetType: "Announcement",
      targetId: announcement.id,
      details: JSON.stringify({ scope, scopeValue }),
    },
  });

  return apiSuccess({ announcement }, 201);
}
