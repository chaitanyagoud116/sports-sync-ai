import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createCoachSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  phone: z.string().min(8),
  specialization: z.string().min(1),
  experienceYears: z.number().int().min(0).default(0),
  certifications: z.string().optional(),
  bio: z.string().optional(),
  academyId: z.string().optional(),
});

// GET /api/coaches — list all coaches (admin only)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "GOV_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const sport = searchParams.get("sport") || "";

  const coaches = await prisma.coach.findMany({
    where: {
      AND: [
        search ? { fullName: { contains: search } } : {},
        sport ? { specialization: sport } : {},
      ],
    },
    include: {
      user: { select: { email: true, isActive: true } },
      academy: { select: { name: true, district: true } },
      _count: { select: { athletes: true, trainingSessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ coaches });
}

// POST /api/coaches — create coach (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "GOV_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createCoachSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, fullName, phone, specialization, experienceYears, certifications, bio, academyId } = parsed.data;

  // Check email uniqueness
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await prisma.$transaction([
    prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "COACH",
        coach: {
          create: {
            fullName,
            phone,
            specialization,
            experienceYears,
            certifications: certifications || null,
            bio: bio || null,
            academyId: academyId || null,
          },
        },
      },
      include: { coach: true },
    }),
  ]);

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "CREATE_COACH",
      targetType: "Coach",
      targetId: (user as any).coach?.id,
      details: `Created coach: ${fullName}`,
    },
  });

  return NextResponse.json({ success: true, message: "Coach created successfully" }, { status: 201 });
}
