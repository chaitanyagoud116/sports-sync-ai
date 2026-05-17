import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check duplicate email
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: "ATHLETE",
      },
    });

    await prisma.athlete.create({
      data: {
        userId: user.id,
        fullName: data.fullName,
        dob: new Date(data.dob),
        gender: data.gender,
        phone: data.phone,
        address: data.address,
        district: data.district as any,
        sport: data.sport as any,
        experienceLevel: data.experienceLevel,
        aadhaarLastFour: data.aadhaar ? data.aadhaar.slice(-4) : null,
      },
    });

    // Welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to Sports Sync AI!",
        message: `Hello ${data.fullName}! Your athlete account has been created successfully. Browse available tournaments and apply now.`,
        type: "SUCCESS",
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "ATHLETE_REGISTERED",
        targetType: "User",
        targetId: user.id,
        details: `New athlete registered: ${data.fullName} (${data.email})`,
      },
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
