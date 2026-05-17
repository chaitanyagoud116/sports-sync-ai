// app/api/certificates/route.ts — Digital Certificate Management
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAction } from "@/lib/services/audit-service";
import { z } from "zod";

// GET /api/certificates?athleteId=xxx&tournamentId=xxx
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const athleteId = searchParams.get("athleteId");
  const tournamentId = searchParams.get("tournamentId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where: any = {};
  if (athleteId) where.athleteId = athleteId;
  if (tournamentId) where.tournamentId = tournamentId;

  // Athletes can only see their own
  const role = session.user.role;
  if (role === "ATHLETE") {
    const athlete = await prisma.athlete.findFirst({
      where: { userId: session.user.id },
    });
    if (!athlete) return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    where.athleteId = athlete.id;
  }

  const [certificates, total] = await Promise.all([
    prisma.certificate.findMany({
      where,
      orderBy: { issuedAt: "desc" },
      skip,
      take: limit,
      include: {
        athlete: { select: { fullName: true, sport: true } },
        tournament: { select: { name: true, sport: true } },
      },
    }),
    prisma.certificate.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: { certificates, total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
  });
}

const issueSchema = z.object({
  athleteId: z.string().min(1),
  tournamentId: z.string().min(1),
  type: z.enum(["PARTICIPATION", "MERIT", "WINNER", "SPECIAL"]).default("PARTICIPATION"),
  title: z.string().min(1),
  description: z.string().optional(),
});

// POST /api/certificates — issue a certificate (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user.role;
  if (!["ADMIN", "GOV_ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = issueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Generate unique certificate number
  const count = await prisma.certificate.count();
  const certificateNo = `GOA-SSAI-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

  const certificate = await prisma.certificate.create({
    data: {
      ...parsed.data,
      certificateNo,
      issuedBy: session.user.id,
    },
  });

  await logAction(
    session.user.id,
    "CERTIFICATE_ISSUED",
    "Certificate",
    certificate.id,
    `Certificate ${certificateNo} issued`
  );

  return NextResponse.json({ success: true, data: certificate }, { status: 201 });
}
