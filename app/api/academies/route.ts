// app/api/academies/route.ts — Academy Management API
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// GET /api/academies — list all academies with stats
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const district = searchParams.get("district") || undefined;
  const sport = searchParams.get("sport") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where: any = {};
  if (district) where.district = district;
  if (sport) where.sport = sport;

  const [academies, total] = await Promise.all([
    prisma.academy.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { athletes: true, coaches: true } },
      },
    }),
    prisma.academy.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      academies: academies.map((a) => ({
        ...a,
        athleteCount: a._count.athletes,
        coachCount: a._count.coaches,
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

const createSchema = z.object({
  name: z.string().min(3),
  district: z.string().min(1),
  sport: z.string().min(1),
  address: z.string().min(5),
  capacity: z.number().min(5).default(50),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  foundedYear: z.number().optional(),
  website: z.string().url().optional(),
});

// POST /api/academies — register new academy (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user.role;
  if (!["ADMIN", "GOV_ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const academy = await prisma.academy.create({ data: parsed.data });
  return NextResponse.json({ success: true, data: academy }, { status: 201 });
}
