import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { tournamentSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || (role !== "ADMIN" && role !== "GOV_ADMIN" && role !== "TOURNAMENT_ORGANIZER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = tournamentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const data = parsed.data;

    const tournament = await prisma.tournament.create({
      data: {
        name: data.name,
        sport: data.sport,
        category: data.category,
        ageGroup: data.ageGroup,
        venueId: data.venueId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        maxParticipants: Number(data.maxParticipants),
        description: data.description,
        requiredDocuments: data.requiredDocuments,
        status: "PUBLISHED",
      },
    });

    // Create booking
    await prisma.booking.create({
      data: {
        venueId: data.venueId,
        tournamentId: tournament.id,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: "PENDING",
      },
    });

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "TOURNAMENT_CREATED",
        targetType: "Tournament",
        targetId: tournament.id,
        details: `Created tournament: ${data.name}`,
        ipAddress: ip,
      },
    });

    return NextResponse.json({ success: true, tournamentId: tournament.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create tournament" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const skip = (page - 1) * limit;

  const tournaments = await prisma.tournament.findMany({
    skip,
    take: limit,
    include: {
      venue: true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.tournament.count();

  return NextResponse.json({
    data: tournaments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
