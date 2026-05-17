import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { blacklist } = await req.json();

  await prisma.athlete.update({
    where: { id },
    data: { isBlacklisted: blacklist },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: blacklist ? "ATHLETE_BLACKLISTED" : "ATHLETE_RESTORED",
      targetType: "Athlete",
      targetId: id,
    },
  });

  return NextResponse.json({ success: true });
}
