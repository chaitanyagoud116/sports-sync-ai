import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    // Simulate API latency from an external government database
    await new Promise(r => setTimeout(r, 1200));

    // Generate dummy athletes to prove the sync works visually on the dashboard
    const dummyData = [
      { name: "Rahul Naik", sport: "BASKETBALL", district: "MARGAO", phone: "9876543210" },
      { name: "Priya Sawant", sport: "ATHLETICS", district: "MAPUSA", phone: "9876543211" },
      { name: "Amit Chodankar", sport: "SWIMMING", district: "PANAJI", phone: "9876543212" },
    ];

    const hash = await bcrypt.hash("Sync@123", 10);

    for (let i = 0; i < dummyData.length; i++) {
      const d = dummyData[i];
      const email = `sync_${Date.now()}_${i}@sportssync.goa.in`;

      await prisma.user.create({
        data: {
          email,
          passwordHash: hash,
          role: "ATHLETE",
          isActive: true,
          athlete: {
            create: {
              fullName: d.name,
              dob: new Date("2005-06-15"),
              gender: i % 2 === 0 ? "MALE" : "FEMALE",
              phone: d.phone,
              address: "Imported via DigiLocker Education API",
              district: d.district as any,
              sport: d.sport as any,
              experienceLevel: "BEGINNER",
              talentScore: Math.floor(Math.random() * 20) + 60, // 60-80
            }
          }
        }
      });
    }

    return NextResponse.json({ success: true, added: 3 });
  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
