import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENUE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  await prisma.maintenanceSchedule.create({
    data: {
      venueId: data.venueId,
      title: data.title,
      type: data.type,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      notes: data.notes || null,
      status: "SCHEDULED",
    },
  });

  return NextResponse.json({ success: true });
}
