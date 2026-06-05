# THS-THM Production Deployment Checklist

## 1. Prerequisites

### Infrastructure
- [ ] **Domain & DNS**: Configure A/AAAA records pointing to server IP
- [ ] **SSL Certificate**: Provision via Let's Encrypt / cert-manager
- [ ] **PostgreSQL 16**: Provision database instance (managed: AWS RDS, GCP Cloud SQL, Railway, etc.)
- [ ] **Valkey/Redis 8**: Provision cache instance (managed: AWS ElastiCache, Upstash, etc.)
- [ ] **Object Storage**: S3-compatible storage (AWS S3, MinIO, Cloudflare R2, etc.)
- [ ] **Firebase**: Create Firebase project, download service account JSON
- [ ] **FCM**: Configure Firebase Cloud Messaging for push notifications
- [ ] **Docker host**: Linux VM with Docker + Docker Compose installed

### Environment Variables
```bash
# Core
NODE_ENV=production

# API
API_PORT=4000
JWT_SECRET=<generate-random-64-char-key>
JWT_EXPIRES_IN=1d

# Database
DATABASE_URL=postgresql://user:password@host:5432/ths_thm_db?schema=public

# Redis
REDIS_URL=redis://user:password@host:6379

# MinIO / S3
MINIO_ENDPOINT=<s3-endpoint>
MINIO_PORT=443
MINIO_ACCESS_KEY=<access-key>
MINIO_SECRET_KEY=<secret-key>
MINIO_BUCKET=ths-thm-docs
MINIO_USE_SSL=true

# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=/app/secrets/firebase-service-account.json
# OR inline JSON:
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Web-Admin (Next.js)
NEXT_PUBLIC_API_URL=https://api.ths-thm.example.com/api/v1
NEXT_PUBLIC_APP_NAME=THS-THM Admin
```

### Secrets Management
- [ ] Store secrets in environment variables (not in repository)
- [ ] Use Docker secrets or `.env` file (excluded from git)
- [ ] Rotate JWT_SECRET periodically
- [ ] Keep Firebase service account JSON secure

---

## 2. Build & Deploy

### API (`@ths-thm/api`)
```bash
# Build workspace packages first
pnpm --filter @ths-thm/shared build
pnpm --filter @ths-thm/templates build

# Build API
pnpm --filter @ths-thm/api build

# Output: apps/api/dist/
```

### Docker build
```bash
docker compose -f infra/docker/docker-compose.yml build
```

### Deployment Steps
- [ ] Run database migrations
  ```bash
  pnpm --filter @ths-thm/api exec prisma migrate deploy
  ```
- [ ] Seed initial data (admin user, roles, base organisasi)
  ```bash
  pnpm --filter @ths-thm/api exec tsx prisma/seed.ts
  ```
- [ ] Start services
  ```bash
  docker compose -f infra/docker/docker-compose.yml up -d
  ```
- [ ] Verify health endpoints
  ```bash
  curl https://api.ths-thm.example.com/api/v1/health
  ```
- [ ] Verify web-admin loads
  ```bash
  curl -I https://admin.ths-thm.example.com
  ```

---

## 3. Post-Deployment Verification

### API
- [ ] Health check returns `200 OK`
- [ ] Auth endpoints work (login, register)
- [ ] CRUD operations on all entities (anggota, iuran, surat, etc.)
- [ ] File upload/download via MinIO/S3
- [ ] Push notifications via Firebase/FCM
- [ ] Redis caching operational (rate limiting, blacklisted tokens)

### Web-Admin
- [ ] Login page loads and authenticates
- [ ] Dashboard displays correctly
- [ ] All data tables render with pagination
- [ ] CRUD forms submit correctly
- [ ] File upload works
- [ ] Dark mode toggle works
- [ ] Responsive on mobile

### Monitoring
- [ ] API logs streaming to stdout (Docker)
- [ ] Metrics endpoint accessible (if configured)
- [ ] Uptime monitoring configured (e.g., UptimeRobot, Better Stack)
- [ ] Error tracking (Sentry, etc.) configured

---

## 4. Staging Environment

### Running Staging
```bash
# Start with staging override
docker compose -f infra/docker/docker-compose.yml \
              -f infra/docker/docker-compose.staging.yml up -d

# First-time setup
bash infra/docker/scripts/staging-init.sh
```

### Staging URLs
| Service | URL |
|---------|-----|
| API | https://staging-api.ths-thm.example.com |
| Web-Admin | https://staging-admin.ths-thm.example.com |
| Storybook (Chromatic) | https://chromatic.com/library?appId=<id> |

---

## 5. Rollback Plan

### Quick rollback
```bash
# Revert to previous Docker image
docker compose -f infra/docker/docker-compose.yml down
docker compose -f infra/docker/docker-compose.yml up -d

# Database rollback (if needed)
pnpm --filter @ths-thm/api exec prisma migrate down
```

### Data backup
- [ ] PostgreSQL: automated daily backups (pg_dump)
- [ ] MinIO/S3: enable versioning on bucket
- [ ] Redis: RDB/AOF persistence enabled

---

## 6. Security Checklist

- [ ] HTTPS enforced (Nginx or reverse proxy terminates SSL)
- [ ] JWT tokens have short expiry (1h access token, 7d refresh token)
- [ ] Rate limiting configured (ThrottlerModule)
- [ ] CORS restricted to known origins
- [ ] Helmet.js security headers enabled
- [ ] Input validation on all API endpoints (class-validator)
- [ ] File upload size limits enforced
- [ ] Prisma query logging disabled in production
- [ ] No secrets in client-side code
- [ ] Firebase Admin SDK restricted to server-side only

---

## 7. Performance Checklist

- [ ] Redis caching for frequent queries (anggota, organisasi, iuran stats)
- [ ] Prisma connection pooling configured
- [ ] Next.js ISR/SSR optimized
- [ ] Image optimization enabled
- [ ] Compression enabled (compression middleware)
- [ ] Database indexes created (check Prisma schema)
- [ ] API response pagination enabled on all list endpoints

---

## 8. CI/CD Pipeline

- [ ] GitHub Actions: API tests pass (670+ unit + E2E)
- [ ] GitHub Actions: Web-admin tests pass (416+ vitest)
- [ ] GitHub Actions: Playwright E2E tests pass (151 E2E)
- [ ] GitHub Actions: Chromatic visual regression tests
- [ ] GitHub Actions: TypeScript typecheck (0 errors)
- [ ] SonarQube quality gate passed
- [ ] Docker images built and pushed to registry
