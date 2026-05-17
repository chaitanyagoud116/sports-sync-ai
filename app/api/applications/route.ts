import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tournamentId } = await req.json();
  const userId = session.user.id;

  const athlete = await prisma.athlete.findUnique({ where: { userId } });
  if (!athlete) return NextResponse.json({ error: "Athlete not found" }, { status: 404 });

  const existing = await prisma.application.findUnique({
    where: { athleteId_tournamentId: { athleteId: athlete.id, tournamentId } },
  });
  if (existing) return NextResponse.json({ error: "Already applied" }, { status: 409 });

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { _count: { select: { applications: true } } },
  });
  if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  if (tournament._count.applications >= tournament.maxParticipants) {
    return NextResponse.json({ error: "Tournament is full" }, { status: 400 });
  }

  const application = await prisma.application.create({
    data: { athleteId: athlete.id, tournamentId },
  });

  await prisma.notification.create({
    data: {
      userId,
      title: "Application Submitted",
      message: `Your application for "${tournament.name}" has been submitted and is under review.`,
      type: "INFO",
    },
  });

  return NextResponse.json({ success: true, applicationId: application.id });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const athlete = await prisma.athlete.findUnique({ where: { userId } });
  if (!athlete) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const applications = await prisma.application.findMany({
    where: { athleteId: athlete.id },
    include: { tournament: { include: { venue: true } } },
    orderBy: { appliedAt: "desc" },
  });

  return NextResponse.json(applications);
}
