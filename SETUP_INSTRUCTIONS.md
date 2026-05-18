# Sports Sync AI - Setup Instructions

## Current Status
✅ Deployment configuration complete
✅ FREE architecture configured (Netlify + Supabase)
⏳ Ready for deployment

## Step 1: Set Up Supabase Database (FREE)

1. Go to [supabase.com](https://supabase.com) and sign up (FREE)
2. Click "New Project"
3. Enter project details:
   - Name: sports-sync-ai
   - Database Password: (generate a strong password, save it!)
   - Region: Choose nearest to you (e.g., Southeast Asia)
4. Click "Create new project"
5. Wait 2-3 minutes for project creation
6. Go to: Project Settings → Database
7. Find "Connection string" → Copy the URI format
8. Replace `[YOUR-PASSWORD]` with your actual database password
9. The URL should look like:
   `postgresql://postgres.xxx:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`

## Step 2: Update Your .env File

Open your `.env` file and replace the DATABASE_URL with your Supabase URL:

```bash
# OLD (localhost - remove this)
DATABASE_URL="postgresql://sportssync:sportssync_dev@localhost:5432/sportssync?schema=public"

# NEW (Supabase - use this)
DATABASE_URL="postgresql://postgres.xxx:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```

Keep the other variables as they are:
```bash
AUTH_SECRET="sports-sync-ai-goa-secret-2024-prod-secure-32bytes-min-len"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
RATE_LIMIT_LOGIN_PER_MIN="5"
RATE_LIMIT_REGISTER_PER_HOUR="3"
RATE_LIMIT_AI_PER_MIN="10"
```

## Step 3: Initialize Database

Run these commands in your terminal:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase database
npx prisma db push
```

This will create all tables in your Supabase database.

## Step 4: Deploy to Netlify (FREE)

### Option A: Via Netlify Website (Easiest)

1. Go to [netlify.com](https://netlify.com) and sign up/login (FREE)
2. Click "Add new site" → "Import an existing project"
3. Click "Import from GitHub"
4. Select your `sports-sync-ai` repository
5. Netlify will auto-detect Next.js
6. Click "Show advanced" → "New variable" and add:
   - `DATABASE_URL` = (your Supabase URL from Step 1)
   - `AUTH_SECRET` = `sports-sync-ai-goa-secret-2024-prod-secure-32bytes-min-len`
   - `NEXTAUTH_URL` = (leave empty for now, Netlify will set it)
   - `AUTH_TRUST_HOST` = `true`
   - `RATE_LIMIT_LOGIN_PER_MIN` = `5`
   - `RATE_LIMIT_REGISTER_PER_HOUR` = `3`
   - `RATE_LIMIT_AI_PER_MIN` = `10`
   - `NODE_ENV` = `production`
7. Click "Deploy site"
8. Wait 2-3 minutes for deployment
9. Netlify will give you a URL like: `https://sports-sync-ai.netlify.app`

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

## Step 5: Update NEXTAUTH_URL

After Netlify deployment:
1. Go to your Netlify project dashboard
2. Go to Site settings → Environment variables
3. Update `NEXTAUTH_URL` to your Netlify domain (e.g., `https://sports-sync-ai.netlify.app`)
4. Redeploy (Netlify will do this automatically)

## Step 6: Test Your Deployment

1. Visit your Netlify URL
2. Test the login page
3. Test registration
4. Test dashboard access
5. Check Supabase dashboard to see data

## Auto-Deploy is Now Enabled!

Every time you push to GitHub:
```bash
git add .
git commit -m "your changes"
git push origin main
```

Netlify will automatically:
- Build your application
- Deploy to production
- Run health checks
- Update your live site

## Total Cost: $0/month

- Netlify: FREE
- Supabase: FREE
- Auto-deploy: FREE
- **Total: $0/month** 🎉

## Need Help?

- Netlify Docs: [netlify.com/docs](https://netlify.com/docs)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Check DEPLOYMENT_GUIDE.md for more details
