# Sports Sync AI - FREE Deployment Guide

## 100% FREE Architecture

**Frontend + Backend**: Netlify (FREE tier)
**Database**: Supabase PostgreSQL (FREE tier)
**Auto-Deploy**: Netlify's built-in GitHub integration (FREE)

This combination provides:
- ✅ $0/month - Completely FREE
- ✅ Instant auto-deploy on git push
- ✅ Managed PostgreSQL with automatic backups
- ✅ Built-in SSL and security
- ✅ Easy scaling when needed

## Step 1: Set Up Supabase PostgreSQL Database (FREE)

1. Go to [supabase.com](https://supabase.com) and sign up (FREE)
2. Click "New Project"
3. Enter project details:
   - Name: sports-sync-ai
   - Database Password: (generate a strong password)
   - Region: Choose nearest to you
4. Click "Create new project"
5. Wait for project to be created (2-3 minutes)
6. Go to Project Settings → Database
7. Copy the `Connection string` (URI format)
8. Replace `[YOUR-PASSWORD]` with your database password
9. The URL should look like: `postgresql://postgres.xxx:xxx@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`

## Step 2: Configure Environment Variables Locally

Create a `.env` file in your project root:

```bash
# Database (from Supabase)
DATABASE_URL=postgresql://postgres.xxx:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres

# NextAuth
AUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# AI (optional)
AI_PROVIDER=openai
OPENAI_API_KEY=your-key-here
OPENAI_MODEL=gpt-4o-mini

# Cloud Storage (optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Monitoring (optional)
SENTRY_DSN=

# Rate Limiting
RATE_LIMIT_LOGIN_PER_MIN=5
RATE_LIMIT_REGISTER_PER_HOUR=3
RATE_LIMIT_AI_PER_MIN=10

NODE_ENV=development
```

## Step 3: Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase database
npx prisma db push
```

## Step 4: Deploy to Netlify

### Option A: Via Netlify Dashboard (Recommended)

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Import your GitHub repository
4. Netlify will auto-detect Next.js
5. Click "Show advanced" → "New variable" and add:
   - `DATABASE_URL` (from Supabase)
   - `AUTH_SECRET` (generate new one for production)
   - `NEXTAUTH_URL` (will be your Netlify domain)
   - `AUTH_TRUST_HOST` = `true`
   - `RATE_LIMIT_LOGIN_PER_MIN` = `5`
   - `RATE_LIMIT_REGISTER_PER_HOUR` = `3`
   - `RATE_LIMIT_AI_PER_MIN` = `10`
   - `NODE_ENV` = `production`
6. Click "Deploy site"
7. Wait 2-3 minutes for deployment
8. Netlify will give you a URL like: `https://sports-sync-ai.netlify.app`

### Option B: Via Netlify CLI

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

## Step 5: Enable Auto-Deploy

Netlify automatically enables auto-deploy when you connect your GitHub repository. Every time you push to your main branch, Netlify will:

1. Build your application
2. Run Prisma migrations
3. Deploy to production
4. Run health checks

## Step 6: Configure GitHub Actions (Optional)

For additional CI/CD, use the workflows I created in `.github/workflows/`:

- `deploy-production.yml` - Production deployment
- `deploy-staging.yml` - Staging deployment
- `health-check.yml` - Automated health monitoring

## Step 7: Verify Deployment

1. Check your Vercel dashboard for deployment status
2. Visit your Vercel URL
3. Test authentication flow
4. Test critical features
5. Check Railway database is connected

## Long-Term Auto-Deploy Setup

Once deployed, you get automatic deployment:

**Development Workflow:**
```bash
# Make changes
git add .
git commit -m "feature: new feature"
git push origin main
# → Vercel automatically deploys
```

**Staging Workflow:**
```bash
# Create staging branch
git checkout -b staging
# Make changes
git add .
git commit -m "feature: new feature"
git push origin staging
# → Vercel automatically deploys to preview
```

## Database Backups

Supabase provides (FREE):
- Automatic daily backups
- Point-in-time recovery
- 7-day backup retention
- Easy export functionality
- Real-time database replication

## Scaling

**When to Scale:**
- More users → Upgrade Vercel plan (starts at $20/month)
- More database load → Upgrade Supabase plan (starts at $25/month)
- More storage → Upgrade Supabase storage (starts at $25/month)

**Scaling is seamless:**
- No code changes needed
- Zero downtime
- Automatic failover

## Troubleshooting

**Database Connection Error:**
- Verify DATABASE_URL is correct
- Check Supabase database is running
- Ensure Prisma schema matches database

**Build Failures:**
- Check Netlify build logs
- Verify environment variables
- Check TypeScript errors

**Auto-Deploy Not Working:**
- Verify GitHub repository is connected to Netlify
- Check Netlify dashboard for webhook status
- Ensure branch is set to auto-deploy

## Cost Estimate (100% FREE)

- **Netlify**: FREE (100GB bandwidth, 300 minutes build time, unlimited deployments)
- **Supabase PostgreSQL**: FREE (500MB database, 1GB storage, 2GB bandwidth, unlimited API requests)
- **Total**: $0/month - Completely FREE!

**When You Need to Scale:**
- **Netlify Pro**: $19/month (when you exceed free limits)
- **Supabase Pro**: $25/month (when you need more database/storage)
- **Total**: ~$44/month for production scale

## Support

- Netlify: [netlify.com/docs](https://netlify.com/docs)
- Supabase: [supabase.com/docs](https://supabase.com/docs)
- Prisma: [prisma.io/docs](https://www.prisma.io/docs)

## Next Steps

1. Set up Supabase PostgreSQL (Step 1) - FREE
2. Configure .env file (Step 2)
3. Initialize database (Step 3)
4. Deploy to Netlify (Step 4) - FREE
5. Enjoy 100% FREE auto-deploy! 🚀
