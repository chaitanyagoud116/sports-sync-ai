# Sports Sync AI - Production Deployment Guide

## Overview
Sports Sync AI is a government-grade sports management platform deployed with a modern CI/CD pipeline. This guide covers the complete deployment architecture and procedures.

## Architecture

### Frontend
- **Platform**: Vercel
- **Framework**: Next.js 16.2.6 with standalone output
- **Region**: Singapore (sin1)
- **Configuration**: `vercel.json`

### Backend
- **Platform**: Railway
- **Runtime**: Node.js 20 Alpine
- **Database**: PostgreSQL 16 (managed by Railway)
- **Configuration**: `railway.json`

### CI/CD
- **Platform**: GitHub Actions
- **Workflows**: `.github/workflows/`
  - `deploy-production.yml` - Production deployment
  - `deploy-staging.yml` - Staging deployment
  - `prisma-migrate.yml` - Database migrations
  - `build-verify.yml` - Build verification
  - `health-check.yml` - Health monitoring
  - `rollback.yml` - Emergency rollback

### Monitoring
- **Error Tracking**: Sentry
- **Configuration**: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`

### File Storage
- **Platform**: Cloudinary
- **Utility**: `lib/cloudinary.ts`

## Environment Variables

### Required Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

# Authentication
AUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://your-production-domain.com
AUTH_TRUST_HOST=true

# AI Provider
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_FOLDER=sports-sync-ai

# Monitoring
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=production

# Rate Limiting
RATE_LIMIT_LOGIN_PER_MIN=5
RATE_LIMIT_REGISTER_PER_HOUR=3
RATE_LIMIT_AI_PER_MIN=10

# Node Environment
NODE_ENV=production
```

## Deployment Workflow

### Automatic Deployment
```
Git Push → GitHub Actions → Build → Test → Migration → Deploy → Health Check → Live
```

### Manual Deployment
1. Push to `main` branch for production
2. Push to `develop` branch for staging
3. Use GitHub Actions workflow dispatch for manual triggers

### Rollback Procedure
1. Go to GitHub Actions
2. Run `Emergency Rollback` workflow
3. Select environment (production/staging)
4. Workflow automatically reverts to previous stable commit

## Database Migrations

### Automatic Migrations
- Migrations run automatically on schema changes
- Triggered by changes to `prisma/schema.prisma`
- Safe rollback support included

### Manual Migrations
```bash
npx prisma migrate dev --name migration-name
npx prisma db push
```

## Security Measures

### Implemented
- Security headers (HSTS, CSP, X-Frame-Options)
- CSRF protection
- Rate limiting (login, register, AI endpoints)
- Input validation (Zod schemas)
- File upload validation
- Environment variable isolation
- Secret management via platform secrets

### Security Utilities
- `lib/security.ts` - Input sanitization and validation
- `lib/middleware/security.ts` - CSRF protection
- `lib/middleware/rate-limit.ts` - Rate limiting

## Health Checks

### Endpoints
- `/api/health` - Application health check
- Automated checks run every 5 minutes via GitHub Actions

### Monitoring
- Sentry error tracking
- GitHub Actions health check workflow
- Railway health checks

## Scaling

### Horizontal Scaling
- Vercel automatically scales frontend
- Railway automatically scales backend
- Database connection pooling configured

### Vertical Scaling
- Adjust Railway plan for more resources
- Vercel Pro plan for enhanced features

## Backup Strategy

### Database Backups
- Railway provides automatic daily backups
- Point-in-time recovery available
- Backup retention: 7 days (default)

### File Storage Backups
- Cloudinary provides redundancy
- Automatic disaster recovery

## Troubleshooting

### Build Failures
1. Check GitHub Actions logs
2. Verify environment variables
3. Check TypeScript errors
4. Verify Prisma schema

### Deployment Failures
1. Check Vercel/Railway logs
2. Verify database connectivity
3. Check health endpoint
4. Use rollback workflow if needed

### Performance Issues
1. Check Sentry performance monitoring
2. Review database query performance
3. Check rate limiting configuration
4. Review CDN caching

## Maintenance

### Regular Tasks
- Review Sentry error reports
- Update dependencies monthly
- Review and rotate secrets quarterly
- Audit access controls
- Review rate limiting metrics

### Emergency Procedures
1. Use rollback workflow for immediate issues
2. Enable maintenance mode if needed
3. Notify stakeholders of incidents
4. Document post-incident reviews

## Support

### Documentation
- This deployment guide
- GitHub repository README
- API documentation (if available)

### Contacts
- DevOps team
- Platform support (Vercel, Railway, Sentry, Cloudinary)

## Future Enhancements

- Add automated testing in CI/CD
- Implement blue-green deployments
- Add performance monitoring dashboards
- Implement automated security scanning
- Add database backup to external storage
- Implement multi-region deployment
