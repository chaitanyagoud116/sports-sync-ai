import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status, adminNote, athleteUserId, tournamentName } = await req.json();

  const application = await prisma.application.update({
    where: { id },
    data: {
      status,
      adminNote,
      reviewedAt: new Date(),
    },
  });

  // Send notification to athlete
  if (athleteUserId) {
    await prisma.notification.create({
      data: {
        userId: athleteUserId,
        title: status === "APPROVED" ? "Application Approved! 🎉" : "Application Update",
        message:
          status === "APPROVED"
            ? `Congratulations! Your application for "${tournamentName}" has been approved.`
            : `Your application for "${tournamentName}" was not approved. Contact the sports department for details.`,
        type: status === "APPROVED" ? "SUCCESS" : "WARNING",
      },
    });
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: `APPLICATION_${status}`,
      targetType: "Application",
      targetId: application.id,
      details: `Application ${status} by admin`,
    },
  });

  return NextResponse.json({ success: true });
}
