# Sports Sync AI - Rollback Procedures

## Overview
This document outlines the rollback procedures for Sports Sync AI deployments. Rollbacks should be executed when a deployment causes critical issues that cannot be quickly fixed.

## When to Rollback

### Critical Issues Requiring Immediate Rollback
- Application is completely down
- Database corruption or data loss
- Security vulnerabilities exposed
- Critical functionality broken
- Performance degradation affecting all users

### Issues That May Not Require Rollback
- Minor UI bugs
- Non-critical feature failures
- Performance issues affecting few users
- Configuration errors that can be hot-fixed

## Rollback Methods

### Method 1: GitHub Actions Rollback (Recommended)

#### Steps
1. Navigate to GitHub repository
2. Go to Actions tab
3. Select "Emergency Rollback" workflow
4. Click "Run workflow"
5. Select environment: `production` or `staging`
6. Click "Run workflow" button
7. Wait for workflow completion
8. Verify health check passes

#### What It Does
- Automatically identifies previous stable commit
- Checks out that commit
- Rebuilds application
- Deploys to Vercel
- Runs health check
- Notifies on completion

### Method 2: Manual Git Rollback

#### Steps
1. Identify stable commit hash:
   ```bash
   git log --before="1 hour" --pretty=format:%H -n 1
   ```

2. Create rollback branch:
   ```bash
   git checkout -b rollback-$(date +%Y%m%d-%H%M%S) <commit-hash>
   ```

3. Push to GitHub:
   ```bash
   git push origin rollback-$(date +%Y%m%d-%H%M%S)
   ```

4. Trigger deployment via GitHub Actions or platform console

### Method 3: Vercel Rollback

#### Steps
1. Navigate to Vercel dashboard
2. Select Sports Sync AI project
3. Go to Deployments tab
4. Find previous successful deployment
5. Click "..." menu
6. Select "Promote to Production"
7. Confirm promotion
8. Wait for deployment completion

### Method 4: Railway Rollback

#### Steps
1. Navigate to Railway dashboard
2. Select Sports Sync AI project
3. Go to Deployments tab
4. Find previous successful deployment
5. Click "Redeploy"
6. Wait for deployment completion
7. Verify health check

## Database Rollback

### Prisma Migrations

#### Rollback Last Migration
```bash
npx prisma migrate resolve --rolled-back <migration-name>
```

#### Reset Database (DANGER - Data Loss)
```bash
npx prisma migrate reset
```

#### View Migration History
```bash
npx prisma migrate status
```

### Database Backup Restoration

#### From Railway
1. Navigate to Railway dashboard
2. Select PostgreSQL service
3. Go to Backups tab
4. Select backup to restore
5. Click "Restore"
6. Wait for restoration completion

#### Manual Backup Restoration
```bash
# Download backup
# Restore to local database
pg_restore -d sportssync backup.dump

# Or use Railway CLI
railway db restore <backup-file>
```

## Post-Rollback Verification

### Health Checks
1. Application health endpoint: `/api/health`
2. Database connectivity
3. Authentication flow
4. Critical user workflows
5. API endpoints

### Monitoring
1. Check Sentry for errors
2. Review application logs
3. Monitor performance metrics
4. Check user-reported issues

## Communication

### Internal Team
- Notify development team immediately
- Document rollback reason
- Schedule post-incident review
- Update incident tracking system

### Stakeholders
- Notify affected stakeholders
- Provide estimated resolution time
- Communicate impact assessment
- Share prevention measures

### Users (if applicable)
- Post maintenance notice
- Explain issue and resolution
- Provide support contact information

## Prevention Measures

### Pre-Deployment Checks
- Run full test suite
- Perform staging deployment
- Conduct smoke tests
- Review database migrations
- Verify environment variables

### Deployment Best Practices
- Use feature flags for risky changes
- Deploy during low-traffic periods
- Have rollback plan ready
- Monitor deployment closely
- Have team available during deployment

### Database Safety
- Always backup before migrations
- Test migrations on staging
- Use transaction-based migrations
- Have rollback migration ready
- Monitor database performance

## Incident Documentation

### Rollback Report Template
```
Date: [YYYY-MM-DD HH:MM]
Time: [Timezone]
Environment: [Production/Staging]
Triggered By: [Name/Role]
Reason for Rollback: [Description]
Rollback Method: [Method used]
Previous Commit: [Commit hash]
Current Commit: [Commit hash]
Impact Assessment: [Description]
Resolution Time: [Duration]
Post-Rollback Status: [Status]
Follow-up Actions: [List]
```

### Post-Incident Review
1. What happened?
2. Why did it happen?
3. What was the impact?
4. How was it resolved?
5. How can we prevent this?
6. What did we learn?

## Emergency Contacts

### Development Team
- Lead Developer: [Contact]
- DevOps Engineer: [Contact]
- Database Administrator: [Contact]

### Platform Support
- Vercel Support: [Contact]
- Railway Support: [Contact]
- Sentry Support: [Contact]

### Management
- Project Manager: [Contact]
- Technical Director: [Contact]

## Training

### Rollback Drills
- Conduct quarterly rollback drills
- Test all rollback methods
- Verify team familiarity
- Update documentation based on findings

### Onboarding
- Include rollback procedures in onboarding
- Provide hands-on training
- Require certification before production access
