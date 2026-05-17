import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const SPORTS = ["FOOTBALL","CRICKET","KABADDI","VOLLEYBALL","BASKETBALL","ATHLETICS","SWIMMING","BOXING","WRESTLING","BADMINTON","TABLE_TENNIS","CYCLING","CHESS"];
const DISTRICTS = ["NORTH_GOA","SOUTH_GOA","PANAJI","MARGAO","VASCO","MAPUSA","PONDA","BICHOLIM","CANACONA","QUEPEM"];
const LEVELS = ["BEGINNER","INTERMEDIATE","ADVANCED","PROFESSIONAL"];
const GENDERS = ["MALE","FEMALE"];

const FIRST_NAMES_M = ["Rahul","Arjun","Kiran","Dev","Rohan","Amit","Sanjay","Vikram","Nikhil","Suresh","Prakash","Ravi","Ajay","Vishal","Deepak","Manoj","Sachin","Anil","Rajesh","Vinod","Prasad","Ganesh","Mohan","Naresh","Omkar","Paresh","Tushar","Yash","Gaurav","Akash"];
const FIRST_NAMES_F = ["Priya","Sneha","Meera","Anita","Kavita","Sunita","Pooja","Neha","Shreya","Aarti","Divya","Swati","Rekha","Manisha","Nisha","Pallavi","Sonal","Tanvi","Varsha","Anjali"];
const LAST_NAMES = ["Naik","Dessai","Gaonkar","Borkar","Shetye","Prabhu","Kamat","Fernandes","D'Souza","Gawas","Parab","Chari","Bhatikar","Shirodkar","Sinai","Rane","Verenkar","Phadte","Kerkar","Sawant"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min: number, max: number) { return Math.round((Math.random() * (max - min) + min) * 10) / 10; }
function randDate(startYear: number, endYear: number) {
  const s = new Date(startYear, 0, 1).getTime();
  const e = new Date(endYear, 11, 31).getTime();
  return new Date(s + Math.random() * (e - s));
}

async function main() {
  console.log("🌱 Seeding Sports Sync AI production database...");
  const hash = await bcrypt.hash("Athlete@123", 12);
  const adminHash = await bcrypt.hash("Admin@123", 12);
  const coachHash = await bcrypt.hash("Coach@123", 12);
  const govHash = await bcrypt.hash("Gov@123", 12);
  const venueHash = await bcrypt.hash("Venue@123", 12);
  const districtHash = await bcrypt.hash("District@123", 12);

  // ── Core Users ──
  const adminUser = await prisma.user.upsert({ where: { email: "admin@sportssync.goa.in" }, update: { passwordHash: adminHash }, create: { email: "admin@sportssync.goa.in", passwordHash: adminHash, role: "ADMIN" } });
  const govUser = await prisma.user.upsert({ where: { email: "gov@sportssync.goa.in" }, update: { passwordHash: govHash }, create: { email: "gov@sportssync.goa.in", passwordHash: govHash, role: "GOV_ADMIN" } });
  const venueUser = await prisma.user.upsert({ where: { email: "venue@sportssync.goa.in" }, update: { passwordHash: venueHash }, create: { email: "venue@sportssync.goa.in", passwordHash: venueHash, role: "VENUE_MANAGER" } });
  const districtUser = await prisma.user.upsert({ where: { email: "district@sportssync.goa.in" }, update: { passwordHash: districtHash }, create: { email: "district@sportssync.goa.in", passwordHash: districtHash, role: "DISTRICT_OFFICER" } });
  await prisma.districtOfficer.upsert({ where: { userId: districtUser.id }, update: {}, create: { userId: districtUser.id, fullName: "Anil Gawas", phone: "9822556677", district: "NORTH_GOA" } });
  
  const baseAthleteUser = await prisma.user.upsert({ where: { email: "athlete@sportssync.goa.in" }, update: { passwordHash: hash }, create: { email: "athlete@sportssync.goa.in", passwordHash: hash, role: "ATHLETE" } });
  const baseAthlete = await prisma.athlete.upsert({
    where: { userId: baseAthleteUser.id }, update: {}, create: { userId: baseAthleteUser.id, fullName: "Demo Athlete", dob: new Date(2005, 0, 1), gender: "MALE", phone: "9876543210", address: "Panaji", district: "PANAJI", sport: "FOOTBALL", experienceLevel: "ADVANCED", talentScore: 85 }
  });

  // ── Venue Manager & Venues ──
  const vm = await prisma.venueManager.upsert({ where: { userId: venueUser.id }, update: {}, create: { userId: venueUser.id, fullName: "Suresh Pai", phone: "9822334455" } });
  const venueData = [
    { id: "venue-fatorda", name: "Fatorda Municipal Stadium", location: "Fatorda, Margao", district: "SOUTH_GOA", capacity: 20000, venueType: "OUTDOOR", facilities: "Floodlights, Changing Rooms, Medical Room" },
    { id: "venue-campal", name: "Campal Indoor Stadium", location: "Campal, Panaji", district: "PANAJI", capacity: 3000, venueType: "INDOOR", facilities: "AC, Basketball Court, Badminton Courts" },
    { id: "venue-mapusa", name: "Mapusa Sports Complex", location: "Mapusa", district: "MAPUSA", capacity: 5000, venueType: "MULTI_PURPOSE", facilities: "Cricket Ground, Football Field, Pool" },
    { id: "venue-ponda", name: "Ponda Athletics Ground", location: "Ponda", district: "PONDA", capacity: 3000, venueType: "OUTDOOR", facilities: "Athletics Track, Gym" },
    { id: "venue-vasco", name: "Tilak Maidan Complex", location: "Vasco", district: "VASCO", capacity: 8000, venueType: "OUTDOOR", facilities: "Football Field, Cricket Nets" },
  ];
  for (const v of venueData) {
    await prisma.venue.upsert({ where: { id: v.id }, update: {}, create: { ...v, managerId: vm.id } });
  }

  // ── Academies ──
  const academyData = [
    { id: "acad-1", name: "Goa Football Academy", district: "PANAJI", sport: "FOOTBALL", address: "Campal, Panaji", capacity: 60, foundedYear: 2015, accreditationStatus: "ACCREDITED" },
    { id: "acad-2", name: "Sesa Sports Academy", district: "SOUTH_GOA", sport: "CRICKET", address: "Fatorda, Margao", capacity: 50, foundedYear: 2012, accreditationStatus: "ACCREDITED" },
    { id: "acad-3", name: "Goa Swimming Centre", district: "MAPUSA", sport: "SWIMMING", address: "Mapusa", capacity: 40, foundedYear: 2018, accreditationStatus: "ACCREDITED" },
    { id: "acad-4", name: "North Goa Athletics Hub", district: "NORTH_GOA", sport: "ATHLETICS", address: "Porvorim", capacity: 45, foundedYear: 2020, accreditationStatus: "PENDING" },
    { id: "acad-5", name: "Goa Badminton Academy", district: "PONDA", sport: "BADMINTON", address: "Ponda", capacity: 35, foundedYear: 2017, accreditationStatus: "ACCREDITED" },
    { id: "acad-6", name: "Coastal Boxing Club", district: "VASCO", sport: "BOXING", address: "Vasco", capacity: 30, foundedYear: 2019, accreditationStatus: "PENDING" },
  ];
  for (const a of academyData) {
    await prisma.academy.upsert({ where: { id: a.id }, update: {}, create: a });
  }

  // ── 15 Coaches ──
  const coachNames = [
    { name: "Maria Fernandes", spec: "FOOTBALL", exp: 12 }, { name: "Rajiv Naik", spec: "CRICKET", exp: 15 },
    { name: "Deepa Kamat", spec: "SWIMMING", exp: 8 }, { name: "Carlos D'Souza", spec: "ATHLETICS", exp: 10 },
    { name: "Sunita Gaonkar", spec: "BADMINTON", exp: 7 }, { name: "Vijay Borkar", spec: "KABADDI", exp: 14 },
    { name: "Prashant Shetye", spec: "BASKETBALL", exp: 9 }, { name: "Anand Prabhu", spec: "BOXING", exp: 11 },
    { name: "Rekha Sinai", spec: "VOLLEYBALL", exp: 6 }, { name: "Francis Fernandes", spec: "TABLE_TENNIS", exp: 8 },
    { name: "Gopal Rane", spec: "WRESTLING", exp: 13 }, { name: "Savita Dessai", spec: "CYCLING", exp: 5 },
    { name: "Michael D'Souza", spec: "CHESS", exp: 10 }, { name: "Nandini Parab", spec: "FOOTBALL", exp: 7 },
    { name: "Ashok Chari", spec: "CRICKET", exp: 16 },
  ];
  const coachIds: string[] = [];
  for (let i = 0; i < coachNames.length; i++) {
    const c = coachNames[i];
    const email = `coach${i + 1}@sportssync.goa.in`;
    const u = await prisma.user.upsert({ where: { email }, update: {}, create: { email, passwordHash: coachHash, role: "COACH" } });
    const coach = await prisma.coach.upsert({
      where: { userId: u.id }, update: {},
      create: { userId: u.id, fullName: c.name, phone: `98${randInt(10000000, 99999999)}`, specialization: c.spec, experienceYears: c.exp, rating: randFloat(3.5, 5.0), totalAthletesCoached: randInt(10, 80), academyId: i < 6 ? academyData[i].id : undefined },
    });
    coachIds.push(coach.id);
  }

  // ── 100 Athletes ──
  const athleteIds: string[] = [baseAthlete.id];
  for (let i = 0; i < 100; i++) {
    const isFemale = i % 3 === 0;
    const firstName = isFemale ? pick(FIRST_NAMES_F) : pick(FIRST_NAMES_M);
    const lastName = pick(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const email = `athlete.${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@sportssync.goa.in`;
    const sport = SPORTS[i % SPORTS.length];
    const district = DISTRICTS[i % DISTRICTS.length];
    const dob = randDate(1990, 2010);
    const ts = randFloat(15, 95);
    const schStatus = ts > 70 ? "ELIGIBLE" : ts > 50 ? "APPLIED" : undefined;

    const u = await prisma.user.upsert({ where: { email }, update: {}, create: { email, passwordHash: hash, role: "ATHLETE" } });
    const athlete = await prisma.athlete.upsert({
      where: { userId: u.id }, update: {},
      create: {
        userId: u.id, fullName, dob, gender: isFemale ? "FEMALE" : "MALE", phone: `98${randInt(10000000, 99999999)}`,
        address: `${randInt(1, 200)}, ${district}, Goa`, district, sport, experienceLevel: pick(LEVELS),
        talentScore: ts, ranking: ts > 60 ? randInt(1, 500) : undefined, stateRanking: ts > 75 ? randInt(1, 100) : undefined,
        bloodGroup: pick(["A+", "B+", "O+", "AB+", "A-", "O-"]), scholarshipStatus: schStatus,
        coachId: coachIds[i % coachIds.length], academyId: i < 36 ? academyData[i % academyData.length].id : undefined,
        category: sport === "ATHLETICS" ? pick(["100m Sprint", "200m", "Long Jump", "Shot Put"]) : undefined,
      },
    });
    athleteIds.push(athlete.id);

    // Performance records (5-10 per athlete)
    const perfCount = randInt(5, 10);
    const perfData = [];
    for (let p = 0; p < perfCount; p++) {
      perfData.push({
        athleteId: athlete.id,
        metric: pick(["sprint_100m", "endurance_test", "strength_score", "agility_test", "flexibility", "reaction_time"]),
        value: randFloat(10, 100), unit: pick(["seconds", "score", "kg", "cm", "ms"]),
        recordedAt: randDate(2024, 2025), recordedBy: coachIds[i % coachIds.length],
      });
    }
    await prisma.performanceRecord.createMany({ data: perfData });

    // Injury records (~20% of athletes)
    if (i % 5 === 0) {
      await prisma.injuryRecord.create({
        data: {
          athleteId: athlete.id, injuryType: pick(["Knee Sprain", "Hamstring Pull", "Ankle Twist", "Shoulder Strain", "Back Pain"]),
          severity: pick(["MILD", "MODERATE", "SEVERE"]),
          description: "Sports injury during training/competition",
          occurredAt: randDate(2024, 2025), isActive: Math.random() > 0.5,
        },
      });
    }
  }

  // ── 12 Tournaments ──
  const tourneys = [
    { id: "t-football-state", name: "Goa State Football Championship 2025", sport: "FOOTBALL", cat: "STATE", age: "Under 21", vid: "venue-fatorda", s: "2025-06-10", e: "2025-06-25", max: 64, status: "COMPLETED", level: "STATE" },
    { id: "t-badminton-open", name: "Goa Open Badminton 2025", sport: "BADMINTON", cat: "OPEN", age: "Open", vid: "venue-campal", s: "2025-07-05", e: "2025-07-10", max: 128, status: "COMPLETED", level: "STATE" },
    { id: "t-kabaddi-dist", name: "District Kabaddi League", sport: "KABADDI", cat: "DISTRICT", age: "Senior", vid: "venue-mapusa", s: "2025-08-01", e: "2025-08-15", max: 32, status: "COMPLETED", level: "DISTRICT" },
    { id: "t-cricket-u19", name: "Goa U-19 Cricket Trophy", sport: "CRICKET", cat: "STATE", age: "Under 19", vid: "venue-fatorda", s: "2025-04-10", e: "2025-04-25", max: 48, status: "COMPLETED", level: "STATE" },
    { id: "t-swimming-meet", name: "Goa State Swimming Meet 2025", sport: "SWIMMING", cat: "STATE", age: "Open", vid: "venue-mapusa", s: "2025-10-01", e: "2025-10-05", max: 80, status: "ONGOING", level: "STATE" },
    { id: "t-athletics-dist", name: "North Goa Athletics Championship", sport: "ATHLETICS", cat: "DISTRICT", age: "Open", vid: "venue-ponda", s: "2025-10-15", e: "2025-10-20", max: 100, status: "ONGOING", level: "DISTRICT" },
    { id: "t-boxing-state", name: "Goa State Boxing Championship", sport: "BOXING", cat: "STATE", age: "Senior", vid: "venue-vasco", s: "2025-11-01", e: "2025-11-10", max: 40, status: "PUBLISHED", level: "STATE" },
    { id: "t-volleyball-open", name: "Beach Volleyball Open Goa", sport: "VOLLEYBALL", cat: "OPEN", age: "Open", vid: "venue-vasco", s: "2025-11-15", e: "2025-11-20", max: 24, status: "PUBLISHED", level: "STATE" },
    { id: "t-chess-dist", name: "South Goa Chess Tournament", sport: "CHESS", cat: "DISTRICT", age: "Open", vid: "venue-campal", s: "2025-12-01", e: "2025-12-05", max: 64, status: "PUBLISHED", level: "DISTRICT" },
    { id: "t-basketball-u17", name: "Goa U-17 Basketball Cup", sport: "BASKETBALL", cat: "STATE", age: "Under 17", vid: "venue-campal", s: "2026-01-10", e: "2026-01-20", max: 32, status: "DRAFT", level: "STATE" },
    { id: "t-table-tennis", name: "Goa Table Tennis League 2026", sport: "TABLE_TENNIS", cat: "OPEN", age: "Open", vid: "venue-ponda", s: "2026-02-01", e: "2026-02-08", max: 48, status: "DRAFT", level: "STATE" },
    { id: "t-wrestling-nat", name: "National Wrestling Qualifier - Goa", sport: "WRESTLING", cat: "STATE", age: "Senior", vid: "venue-fatorda", s: "2026-03-01", e: "2026-03-10", max: 40, status: "DRAFT", level: "NATIONAL" },
  ];
  for (const t of tourneys) {
    await prisma.tournament.upsert({
      where: { id: t.id }, update: {},
      create: { id: t.id, name: t.name, sport: t.sport, category: t.cat, ageGroup: t.age, venueId: t.vid, startDate: new Date(t.s), endDate: new Date(t.e), maxParticipants: t.max, description: `Official ${t.name} organized by Government of Goa.`, requiredDocuments: "Aadhaar Card, Birth Certificate, Medical Fitness", status: t.status, level: t.level, budget: randFloat(100000, 2000000) },
    });
  }

  // ── Applications & Results for completed tournaments ──
  const completedIds = tourneys.filter(t => t.status === "COMPLETED").map(t => t.id);
  for (const tid of completedIds) {
    const t = tourneys.find(x => x.id === tid)!;
    const eligible = athleteIds.filter((_, i) => SPORTS[i % SPORTS.length] === t.sport || Math.random() > 0.8);
    const applicants = eligible.slice(0, Math.min(eligible.length, t.max));
    for (let a = 0; a < applicants.length; a++) {
      try {
        await prisma.application.create({ data: { athleteId: applicants[a], tournamentId: tid, status: "APPROVED", reviewedAt: new Date() } });
        const medals = ["GOLD", "SILVER", "BRONZE"];
        await prisma.result.create({
          data: { athleteId: applicants[a], tournamentId: tid, rank: a + 1, medal: a < 3 ? medals[a] : undefined, score: `${randInt(50, 100)}`, publishedAt: new Date() },
        });
        if (a < 5) {
          const certCount = await prisma.certificate.count();
          await prisma.certificate.create({
            data: { athleteId: applicants[a], tournamentId: tid, type: a < 3 ? "WINNER" : "PARTICIPATION", title: `${t.name} - ${a < 3 ? medals[a] + " Medal" : "Participation"}`, certificateNo: `GOA-SSAI-2025-${String(certCount + 1).padStart(5, "0")}` },
          });
        }
      } catch { /* skip duplicates */ }
    }
  }

  // ── Applications for ongoing/published tournaments ──
  for (const t of tourneys.filter(x => ["ONGOING", "PUBLISHED"].includes(x.status))) {
    const applicants = athleteIds.slice(0, randInt(5, 15));
    for (const aid of applicants) {
      try {
        await prisma.application.create({ data: { athleteId: aid, tournamentId: t.id, status: t.status === "ONGOING" ? "APPROVED" : "PENDING" } });
      } catch { /* skip */ }
    }
  }

  // ── Training Sessions ──
  for (let i = 0; i < 30; i++) {
    const session = await prisma.trainingSession.create({
      data: { coachId: coachIds[i % coachIds.length], title: `Training Session ${i + 1}`, sport: SPORTS[i % SPORTS.length], venue: venueData[i % venueData.length].name, scheduledAt: randDate(2025, 2025), durationMin: pick([60, 90, 120]), status: pick(["SCHEDULED", "COMPLETED", "COMPLETED"]) },
    });
    const attendees = athleteIds.slice(i * 3, i * 3 + randInt(3, 8));
    for (const aid of attendees) {
      try {
        await prisma.trainingSessionAttendance.create({ data: { sessionId: session.id, athleteId: aid, attended: Math.random() > 0.2 } });
      } catch { /* skip */ }
    }
  }

  // ── Budget Allocations ──
  const budgets = [
    { fy: "2025-26", sport: "FOOTBALL", amount: 5000000, spent: 3200000, cat: "TRAINING" },
    { fy: "2025-26", sport: "CRICKET", amount: 4500000, spent: 2800000, cat: "TRAINING" },
    { fy: "2025-26", sport: "SWIMMING", amount: 3000000, spent: 1500000, cat: "INFRASTRUCTURE" },
    { fy: "2025-26", sport: "ATHLETICS", amount: 2500000, spent: 1200000, cat: "EVENTS" },
    { fy: "2025-26", sport: "BADMINTON", amount: 2000000, spent: 900000, cat: "EQUIPMENT" },
    { fy: "2025-26", sport: "KABADDI", amount: 1800000, spent: 800000, cat: "TRAINING" },
    { fy: "2025-26", sport: "BOXING", amount: 1500000, spent: 600000, cat: "TRAINING" },
    { fy: "2025-26", district: "NORTH_GOA", amount: 8000000, spent: 5200000, cat: "GENERAL" },
    { fy: "2025-26", district: "SOUTH_GOA", amount: 7000000, spent: 4100000, cat: "GENERAL" },
    { fy: "2025-26", district: "PANAJI", amount: 6000000, spent: 3800000, cat: "INFRASTRUCTURE" },
    { fy: "2025-26", amount: 10000000, spent: 4000000, cat: "SCHOLARSHIPS", source: "KHELO_INDIA" },
    { fy: "2025-26", amount: 5000000, spent: 2000000, cat: "TRAINING", source: "SAI" },
    { fy: "2024-25", sport: "FOOTBALL", amount: 4000000, spent: 3900000, cat: "TRAINING" },
    { fy: "2024-25", sport: "CRICKET", amount: 3500000, spent: 3400000, cat: "TRAINING" },
    { fy: "2024-25", amount: 8000000, spent: 7500000, cat: "GENERAL" },
  ];
  for (const b of budgets) {
    await prisma.budgetAllocation.create({
      data: { fiscalYear: b.fy, sport: b.sport, district: b.district, amount: b.amount, spent: b.spent, category: b.cat, source: b.source || "STATE_FUND", status: b.spent >= b.amount ? "FULLY_SPENT" : "PARTIALLY_SPENT", approvedBy: govUser.id },
    });
  }

  // ── Scholarships ──
  const highScorers = athleteIds.slice(0, 20);
  const schemes = ["Khelo India", "SAI Scholarship", "Goa Sports Merit Award", "TOPS Support"];
  for (let i = 0; i < highScorers.length; i++) {
    await prisma.scholarship.create({
      data: { athleteId: highScorers[i], schemeName: schemes[i % schemes.length], amount: randFloat(50000, 500000), status: pick(["APPLIED", "UNDER_REVIEW", "APPROVED", "DISBURSED"]), fiscalYear: "2025-26", appliedAt: randDate(2025, 2025) },
    });
  }

  // ── Announcements ──
  const anns = [
    { id: "ann-1", title: "Sports Sync AI Platform Live", message: "The official digital platform for Goa state sports is now operational.", scope: "STATE", priority: "HIGH" },
    { id: "ann-2", title: "Khelo India Registration Open", message: "Athletes can now apply for Khelo India 2025-26 scholarships through this portal.", scope: "STATE", priority: "URGENT" },
    { id: "ann-3", title: "North Goa Athletics Championship", message: "Registration deadline extended to Oct 10, 2025.", scope: "DISTRICT", priority: "NORMAL", scopeValue: "NORTH_GOA" },
    { id: "ann-4", title: "New Swimming Facility at Mapusa", message: "A new Olympic-size pool is now operational at Mapusa Sports Complex.", scope: "STATE", priority: "NORMAL" },
    { id: "ann-5", title: "Annual Sports Budget Released", message: "The FY 2025-26 sports budget of ₹50 Crore has been approved.", scope: "STATE", priority: "HIGH" },
  ];
  for (const a of anns) {
    await prisma.announcement.upsert({ where: { id: a.id }, update: {}, create: { ...a, createdById: govUser.id } });
  }

  // ── Notifications ──
  for (let i = 0; i < 10; i++) {
    const uid = i < 5 ? athleteIds[i] : coachIds[i - 5];
    // Get user id from athlete/coach
    const targetUser = i < 5
      ? await prisma.athlete.findUnique({ where: { id: uid }, select: { userId: true } })
      : await prisma.coach.findUnique({ where: { id: uid }, select: { userId: true } });
    if (targetUser) {
      await prisma.notification.create({ data: { userId: targetUser.userId, title: pick(["Application Approved", "New Tournament", "Training Update", "Score Published"]), message: "Check your dashboard for details.", type: pick(["INFO", "SUCCESS"]) } });
    }
  }

  // ── System Config ──
  await prisma.systemConfig.upsert({ where: { key: "retention_policy" }, update: {}, create: { key: "retention_policy", value: JSON.stringify({ archiveEventsAfterDays: 90, cleanupNotificationsAfterDays: 30, cleanupActivityLogsAfterDays: 180, cleanupChatSessionsAfterDays: 90, purgeArchivesAfterDays: 730 }), category: "RETENTION" } });
  await prisma.systemConfig.upsert({ where: { key: "platform_version" }, update: {}, create: { key: "platform_version", value: "2.0.0", category: "GENERAL" } });

  console.log("✅ Seed complete! 100 athletes, 15 coaches, 12 tournaments, budgets, scholarships loaded.");
  console.log("   Admin   → admin@sportssync.goa.in / Admin@123");
  console.log("   Govt    → gov@sportssync.goa.in / Admin@123");
  console.log("   Coach   → coach1@sportssync.goa.in / Coach@123");
  console.log("   Venue   → venue@sportssync.goa.in / Athlete@123");
  console.log("   District→ district@sportssync.goa.in / Athlete@123");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
