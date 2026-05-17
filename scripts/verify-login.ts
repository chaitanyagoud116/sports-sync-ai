import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const tests = [
  { email: "athlete@sportssync.goa.in", password: "Athlete@123", role: "ATHLETE" },
  { email: "admin@sportssync.goa.in", password: "Admin@123", role: "ADMIN" },
  { email: "gov@sportssync.goa.in", password: "Gov@123", role: "GOV_ADMIN" },
  { email: "coach@sportssync.goa.in", password: "Coach@123", role: "COACH" },
  { email: "venue@sportssync.goa.in", password: "Venue@123", role: "VENUE_MANAGER" },
  { email: "district@sportssync.goa.in", password: "District@123", role: "DISTRICT_OFFICER" },
];

async function main() {
  let passed = 0;
  for (const t of tests) {
    const user = await prisma.user.findUnique({ where: { email: t.email } });
    if (!user) {
      console.log("FAIL", t.role, "- user missing");
      continue;
    }
    const valid = await bcrypt.compare(t.password, user.passwordHash);
    const roleOk = user.role === t.role;
    if (valid && roleOk) {
      console.log("PASS", t.role);
      passed++;
    } else {
      console.log("FAIL", t.role, { valid, roleOk, dbRole: user.role });
    }
  }
  console.log(`\n${passed}/${tests.length} accounts ready`);
  process.exit(passed === tests.length ? 0 : 1);
}

main()
  .finally(() => prisma.$disconnect());
