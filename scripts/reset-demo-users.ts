/**
 * Resets all demo portal users with known passwords.
 * Run: npx ts-node --compiler-options {\"module\":\"CommonJS\"} scripts/reset-demo-users.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_USERS = [
  {
    email: "athlete@sportssync.goa.in",
    password: "Athlete@123",
    role: "ATHLETE",
  },
  {
    email: "coach1@sportssync.goa.in",
    password: "Coach@123",
    role: "COACH",
  },
  {
    email: "district@sportssync.goa.in",
    password: "District@123",
    role: "DISTRICT_OFFICER",
  },
  {
    email: "admin@sportssync.goa.in",
    password: "Admin@123",
    role: "ADMIN",
  },
  {
    email: "gov@sportssync.goa.in",
    password: "Gov@123",
    role: "GOV_ADMIN",
  },
  {
    email: "venue@sportssync.goa.in",
    password: "Venue@123",
    role: "VENUE_MANAGER",
  },
] as const;

async function main() {
  console.log("Resetting demo users...\n");

  for (const demo of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(demo.password, 12);

    const user = await prisma.user.upsert({
      where: { email: demo.email },
      update: { passwordHash, role: demo.role, isActive: true },
      create: {
        email: demo.email,
        passwordHash,
        role: demo.role,
        isActive: true,
      },
    });

    console.log(`  OK  ${demo.role.padEnd(18)} ${demo.email} / ${demo.password}`);

    if (demo.role === "ATHLETE") {
      await prisma.athlete.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          fullName: "Rohan Dessai",
          dob: new Date("2001-03-22"),
          gender: "MALE",
          phone: "9823456789",
          address: "Panaji, Goa",
          district: "PANAJI",
          sport: "FOOTBALL",
          experienceLevel: "ADVANCED",
          talentScore: 78.5,
        },
      });
    }

    if (demo.role === "COACH") {
      await prisma.coach.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          fullName: "Maria Fernandes",
          phone: "9822113344",
          specialization: "FOOTBALL",
          experienceYears: 12,
        },
      });
    }

    if (demo.role === "VENUE_MANAGER") {
      await prisma.venueManager.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          fullName: "Suresh Pai",
          phone: "9822334455",
        },
      });
    }

    if (demo.role === "DISTRICT_OFFICER") {
      await prisma.districtOfficer.upsert({
        where: { userId: user.id },
        update: { district: "NORTH_GOA" },
        create: {
          userId: user.id,
          fullName: "Anil Gawas",
          phone: "9822556677",
          district: "NORTH_GOA",
        },
      });
    }
  }

  console.log("\nDone. You can log in at http://localhost:3000/login");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
