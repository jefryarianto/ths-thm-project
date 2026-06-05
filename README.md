# THS-THM Management System

Sistem Manajemen Anggota untuk **Tunggal Hati Seminari - Tunggal Hati Maria (THS-THM)**.

## 🏗️ Architecture

```
ths-thm-management/
├── apps/
│   ├── api/          # NestJS Backend API
│   ├── web-admin/    # Next.js Admin Dashboard
│   └── mobile/       # Expo React Native Mobile App
├── packages/
│   ├── shared/       # Shared types, schemas, constants
│   ├── templates/    # JSX templates for documents
│   ├── ui/           # Shared UI components
│   └── config/       # Shared configs (eslint, tsconfig)
├── infra/
│   └── docker/       # Docker Compose configuration
├── seed/             # Seed scripts
└── docs/             # Documentation
```

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js 24 LTS |
| **Package Manager** | pnpm workspaces |
| **Backend** | NestJS + TypeScript |
| **Database** | PostgreSQL 18 + Prisma ORM |
| **Cache** | Valkey (Redis-compatible) |
| **File Storage** | MinIO (S3-compatible) |
| **Auth** | JWT + OTP + FCM |
| **Web Admin** | Next.js 16 + Tailwind CSS + shadcn/ui |
| **Mobile** | Expo React Native |
| **Charts** | Recharts |
| **PDF/PNG** | Playwright (Chromium) |
| **API Docs** | OpenAPI/Swagger |

## ⚡ Quick Start

### Prerequisites

- **Node.js** >= 22.0.0
- **pnpm** >= 10.0.0
- **Docker** & **Docker Compose**

### 1. Clone & Install

```bash
git clone <repo-url> ths-thm-management
cd ths-thm-management
pnpm install
```

### 2. Start Infrastructure

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Valkey** on port 6379
- **MinIO** on port 9000 (console: 9001)
- **Nginx** on port 80 (reverse proxy)

### 3. Setup Database

```bash
# Generate Prisma client
pnpm --filter @ths-thm/api exec prisma generate

# Run migrations
pnpm --filter @ths-thm/api exec prisma migrate dev

# Seed data
pnpm --filter @ths-thm/api exec prisma db seed
```

### 4. Start Development

```bash
# Terminal 1 - Backend API (port 4000)
pnpm dev:api

# Terminal 2 - Web Admin (port 3000)
pnpm dev:web

# Terminal 3 - Mobile App
pnpm dev:mobile
```

## 🔑 Default Login Credentials

After seeding:

| Role | Username | Password |
|------|----------|----------|
| **Superadmin** | `admin` | `admin123` |
| **Pelatih** | `pelatih1` | `pelatih123` |
| **Anggota** | `yohanes.don.bosco` | `anggota123` |
| **Anggota** | `maria.goreti` | `anggota123` |
| **Anggota** | `petrus.paulus` | `anggota123` |

## 📚 API Documentation

Once the API server is running, visit:

- **Swagger UI**: http://localhost:4000/api/docs
- **API Base URL**: http://localhost:4000/api/v1

### API Endpoints

| Module | Prefix | Description |
|--------|--------|-------------|
| Auth | `/auth` | Login, OTP, Refresh Token |
| Users | `/users` | User management |
| Roles | `/roles` | Role & permission management |
| Anggota | `/anggota` | Member data |
| Claim | `/claim` | Membership claim workflow |
| Organisasi | `/organisasi` | Organization structure |
| Kegiatan | `/kegiatan` | Activities & events |
| Latihan | `/latihan` | Training reports |
| Absensi | `/absensi` | Attendance tracking |
| Iuran | `/iuran` | Dues management |
| Pendadaran | `/pendadaran` | Initiation/examination |
| Dokumen | `/dokumen` | Document generation |
| Konten | `/konten` | Content management |
| Pustaka | `/pustaka` | Digital library |
| Surat | `/surat` | Mail management |
| Audit | `/audit` | Audit logs |
| Notifications | `/notifications` | Push notifications |

## 📱 Features

### Web Admin (apps/web-admin)
- **Dashboard** - Analytics with charts & stats
- **Anggota** - CRUD member management
- **Klaim Keanggotaan** - Approve/reject membership claims
- **Iuran** - Dues tracking & reporting
- **Latihan** - Training session reports
- **Kegiatan** - Activity management
- **Pendadaran** - Initiation scores & results
- **Dokumen** - Generate Kartu Anggota, Sertifikat, Piagam
- **Konten** - Content approval workflow
- **Pustaka** - Digital library management
- **Surat** - Incoming/outgoing mail
- **Users** - User & role management

### Mobile App (apps/mobile)
- **Login** - Password & OTP authentication
- **Dashboard** - Quick access to all features
- **Kartu Digital** - Digital member card
- **Sertifikat** - View/download certificates
- **Piagam** - Achievement awards
- **Iuran** - Dues status & history
- **Klaim Keanggotaan** - Submit membership claim
- **Berita & Artikel** - Published content
- **Pustaka** - Digital library
- **Struktur Organisasi** - Organization tree
- **Pelatih Dashboard** - Training report input

## 📄 Document Generation

The system generates:
- **Kartu Anggota** (PDF) - CR80-sized member card with QR verification
- **Sertifikat Pendadaran** (PDF) - A4 certificate with evaluation scores
- **Piagam Prestasi** (PDF) - Achievement award document

All documents:
- Rendered from JSX templates via Playwright (Chromium)
- Stored in MinIO/S3-compatible storage
- Include QR codes for public verification
- Accessible via signed URLs

## 🛡️ RBAC Permissions

| Role | Scope | Permissions |
|------|-------|-------------|
| **Superadmin** | `superadmin` | Full access |
| **Admin Distrik** | `admin_distrik` | Anggota, Iuran, Dokumen, Claim, Konten approval |
| **Pengurus Ranting** | `pengurus_ranting` | Anggota read, Latihan, Absensi |
| **Pelatih** | `pelatih` | Latihan reports, Absensi |
| **Anggota** | `anggota` | Self profile, documents, iuran |

## 🧪 Testing

```bash
# API tests
pnpm test:api

# All tests
pnpm test
```

## 🐳 Docker Commands

```bash
# Start services
docker compose -f infra/docker/docker-compose.yml up -d

# View logs
docker compose -f infra/docker/docker-compose.yml logs -f

# Stop services
docker compose -f infra/docker/docker-compose.yml down

# Reset everything (destroys data)
docker compose -f infra/docker/docker-compose.yml down -v
```

## 🌍 Environment Variables

See `.env.example` for all required variables:

```env
# Database
DATABASE_URL=postgresql://ths_thm:ths_thm_pass@localhost:5432/ths_thm_db

# Redis/Valkey
REDIS_URL=redis://localhost:6379

# MinIO/S3
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=ths-thm-docs

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m

# API
API_PORT=4000
CORS_ORIGIN=http://localhost:3000

# Firebase (for FCM)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
```

## 📊 Project Status

- ✅ Backend API (NestJS + Prisma)
- ✅ Authentication (JWT + OTP)
- ✅ RBAC with scope-based permissions
- ✅ All feature modules
- ✅ Document generation pipeline
- ✅ Web Admin Dashboard
- ✅ Mobile App
- ✅ Docker Compose setup
- ✅ Seed data
- ✅ API documentation (Swagger)

## 📝 License

Internal project - THS-THM Organization
