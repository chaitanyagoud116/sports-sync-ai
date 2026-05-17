# 🏆 SPORTS SYNC AI
### Goa State Government Sports Governance Platform

> A production-grade, multi-role sports management SaaS built for the Directorate of Sports & Youth Affairs, Government of Goa.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Setup (3 commands)

```bash
# 1. Install dependencies
npm install

# 2. Push database schema
npx prisma db push

# 3. Seed demo data
npx prisma db seed

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| 🏃 **Athlete** | athlete@sportssync.goa.in | Athlete@123 |
| 🏛️ **Admin / Govt.** | admin@sportssync.goa.in | Admin@123 |
| 🏟️ **Venue Manager** | venue@sportssync.goa.in | Venue@123 |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS v4, Custom Design System |
| Auth | NextAuth.js v5 (JWT, Role-based) |
| Database | Prisma ORM + SQLite (dev) / PostgreSQL (prod) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Uploads | Next.js API Routes + Local Storage |

---

## 📁 Project Structure

```
sports-sync-ai/
├── app/
│   ├── (landing)           # Homepage
│   ├── login/              # Unified login with role selector
│   ├── register/           # Multi-step athlete registration
│   ├── athlete/            # Athlete portal (protected)
│   │   ├── dashboard/
│   │   ├── tournaments/    # Browse & apply
│   │   ├── documents/      # Upload docs
│   │   ├── status/         # Application tracker
│   │   ├── schedule/
│   │   ├── results/
│   │   └── notifications/
│   ├── admin/              # Admin portal (protected)
│   │   ├── dashboard/      # Master KPI dashboard + charts
│   │   ├── tournaments/    # Create & manage
│   │   ├── applications/   # Approve/reject queue
│   │   ├── athletes/       # Full database + search
│   │   ├── venues/
│   │   ├── results/
│   │   └── analytics/      # Full analytics with Recharts
│   ├── venue/              # Venue Manager portal (protected)
│   │   ├── dashboard/
│   │   ├── bookings/       # Approve bookings
│   │   ├── maintenance/    # Schedule maintenance
│   │   ├── calendar/       # Full calendar view
│   │   └── availability/
│   └── api/                # REST API routes
├── components/
│   ├── shared/             # Sidebar, Topbar
│   └── ui/                 # Base components
├── lib/
│   ├── auth.ts             # NextAuth config
│   ├── db.ts               # Prisma client
│   ├── validations.ts      # Zod schemas
│   └── utils.ts            # Utilities
└── prisma/
    ├── schema.prisma        # Full DB schema
    └── seed.ts              # Demo data seed
```

---

## 🗃️ Database Schema

### Core Tables
- **Users** — Auth, role, email, passwordHash
- **Athletes** — Profile, sport, district, experience, talent score
- **Tournaments** — Name, sport, venue, dates, category, capacity
- **Applications** — Athlete ↔ Tournament with status tracking
- **Venues** — Location, capacity, type, facilities
- **Bookings** — Venue ↔ Tournament scheduling
- **Documents** — File uploads with verification status
- **Results** — Rankings, medals, scores
- **MaintenanceSchedules** — Venue downtime planning
- **Notifications** — Per-user notification feed
- **AuditLogs** — All admin actions recorded

---

## 🎭 User Roles

### 🏃 Athlete
- Register with full profile (name, DOB, sport, district, experience, Aadhaar)
- Apply for published tournaments
- Upload documents (PDF/JPG/PNG, max 5MB)
- Track application status with admin notes
- View AI tournament recommendations
- View talent score and performance history
- Receive real-time notifications

### 🏛️ Admin / Government
- Master dashboard with 6 KPI widgets
- Create tournaments with all metadata
- Approve/reject athlete applications with notes
- Searchable, filterable athletes database
- Blacklist duplicate/fraud accounts
- Publish tournament results
- Full analytics: sport distribution, district coverage, registration trends
- AI talent ranking (top athletes by score)
- Audit log of all actions

### 🏟️ Venue Manager
- Manage multiple venues
- View and approve booking requests
- Schedule maintenance (5 types)
- Interactive monthly calendar with booking + maintenance events
- Conflict detection (bookings vs. maintenance)

---

## 🤖 AI Features

1. **Tournament Recommendation Engine** — Suggests tournaments matching athlete's sport, age, and history
2. **Talent Score** — Calculated from participation, wins, experience level
3. **Smart Booking** — Prevents venue conflicts during scheduling
4. **Analytics Insights** — District trends, sport popularity, growth tracking

---

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT sessions (NextAuth.js)
- Role-based route guards in middleware
- API endpoint role verification
- File type and size validation
- Input validation with Zod
- Audit logging for all admin actions
- CSRF protection via NextAuth

---

## ☁️ Deployment

### Vercel (Recommended)
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# Set environment variables in Vercel dashboard:
# DATABASE_URL=postgresql://...
# NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
# NEXTAUTH_URL=https://your-domain.vercel.app
```

### Railway (with PostgreSQL)
1. Create Railway project
2. Add PostgreSQL plugin
3. Copy DATABASE_URL from Railway
4. Update schema.prisma: `provider = "postgresql"`
5. Run: `npx prisma migrate deploy`

### Local Production
```bash
npm run build
npm start
```

---

## 🌐 Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"              # SQLite (dev)
# DATABASE_URL="postgresql://..."        # PostgreSQL (prod)

# Auth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# File Upload (optional for production)
UPLOAD_DIR="./public/uploads"
```

---

## 📊 Sample Data Included

- 10 athletes from across Goa districts
- 3 realistic venues (Fatorda Stadium, Campal Indoor, Mapusa Complex)
- 3 tournaments (Football, Badminton, Kabaddi)
- Sample applications, results, notifications, maintenance schedules

---

## 🏅 About

**Sports Sync AI** is a state government SaaS platform designed to:
- Digitize athlete registrations statewide
- Streamline tournament governance
- Enable data-driven sports policy decisions
- Provide transparent, fair application processes

Built for the **Directorate of Sports & Youth Affairs, Government of Goa**.

---

*Made with ❤️ for Goa Sports | 2026*
