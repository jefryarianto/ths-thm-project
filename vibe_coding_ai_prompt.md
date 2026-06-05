{
  "project_name": "THS-THM Management System",
  "files": ["vibe_coding_full_package.zip"],
  "description": "Implementasikan sistem manajemen anggota THS-THM sesuai SPEC dalam ZIP menggunakan stack yang ditentukan di bawah ini. Jangan mengganti stack tanpa alasan teknis yang kuat.",
  "architecture_type": "TypeScript monorepo",
  "recommended_stack": {
    "package_manager": "pnpm workspaces",
    "runtime": "Node.js 24 LTS",
    "backend": {
      "framework": "NestJS + TypeScript",
      "database": "PostgreSQL 18",
      "orm": "Prisma ORM",
      "cache_queue": "Valkey for caching and OTP storage",
      "auth": "JWT access token + refresh token + OTP verification",
      "otp_push": "Firebase Cloud Messaging using Firebase Admin SDK",
      "file_storage": "S3-compatible storage: MinIO for local/dev, AWS S3 or compatible provider for production",
      "pdf_png_generation": "Server-side Chromium renderer using Playwright or Puppeteer to render JSX templates into PDF/PNG",
      "qr_generation": "Generate QR code for kartu anggota, sertifikat, piagam, and SK validation URLs",
      "api_style": "REST API first; OpenAPI/Swagger documentation required",
      "testing": "Jest + Supertest"
    },
    "web_admin": {
      "framework": "Next.js 16 + React + TypeScript",
      "routing": "App Router",
      "ui": "Tailwind CSS + shadcn/ui",
      "server_state": "TanStack Query",
      "forms": "React Hook Form + Zod validation",
      "charts": "Recharts",
      "testing": "Playwright for E2E"
    },
    "mobile_app": {
      "framework": "Expo React Native + TypeScript",
      "build": "EAS Build with Expo Dev Client if native Firebase modules are required",
      "navigation": "React Navigation",
      "server_state": "TanStack Query",
      "notifications": "Firebase Cloud Messaging via React Native Firebase Messaging or Expo-compatible notification setup",
      "offline_support": "AsyncStorage/SecureStore for token and limited offline cache",
      "testing": "React Native Testing Library; Detox optional for E2E"
    },
    "devops": {
      "local_development": "Docker Compose",
      "services": ["api", "web-admin", "postgres", "valkey", "minio"],
      "reverse_proxy": "Nginx or Caddy",
      "ci_cd": "GitHub Actions",
      "deployment_target": "VPS/Docker first; later can migrate to Kubernetes if needed"
    }
  },
  "folder_structure_required": {
    "apps/api": "NestJS backend API",
    "apps/web-admin": "Next.js web admin",
    "apps/mobile": "Expo React Native mobile app",
    "packages/ui": "Shared UI components where possible",
    "packages/shared": "Shared TypeScript types, constants, validation schemas",
    "packages/templates": "JSX templates for kartu anggota, sertifikat pendadaran, and piagam prestasi",
    "packages/config": "Shared eslint, tsconfig, prettier config",
    "infra/docker": "Dockerfiles and docker-compose configuration",
    "docs": "SPEC, ERD, DFD, API docs, implementation notes",
    "seed": "CSV seed files and seed scripts"
  },
  "core_tasks": [
    "Create monorepo structure exactly as specified.",
    "Extract and place uploaded JSX templates into packages/templates.",
    "Generate database schema with integer auto-increment for internal IDs and UUID for public/exposed entities: kartu anggota, sertifikat, piagam, SK, and public validation tokens.",
    "Implement Prisma migrations and seed scripts from CSV templates.",
    "Implement NestJS modules for: auth, users, roles, anggota, klaim keanggotaan, organisasi, kegiatan, latihan, absensi, iuran, pendadaran, tim pendadaran, SK pendadaran, kartu anggota, sertifikat, piagam prestasi, konten organisasi, pustaka, surat masuk/keluar, notifications, audit logs, file storage.",
    "Implement RBAC and scope-based permissions: superadmin, admin distrik, pengurus ranting, pelatih, anggota.",
    "Implement content approval workflow based on scope before berita/artikel/video/acara are published.",
    "Implement login for anggota using nomor HP, nomor anggota, username/email, with OTP delivered through FCM; handle first-time claim via pending status requiring admin verification.",
    "Implement mobile claim membership workflow: search by nomor anggota/HP/email, verify identity data, submit claim, admin approve/reject, bind user account to anggota record.",
    "Implement manual admin generation for kartu anggota, sertifikat pendadaran, and piagam prestasi using JSX templates rendered to PDF/PNG and stored in object storage.",
    "Implement QR validation URLs for kartu, sertifikat, piagam, and SK.",
    "Implement download endpoints with access control for anggota/admin.",
    "Implement web admin screens for all modules including dashboard analytics, approval queues, document generation, and reports.",
    "Implement mobile app screens for anggota: profile, kartu digital, sertifikat, piagam, SK, status iuran, materi pustaka, berita, acara, artikel, video, struktur organisasi, klaim keanggotaan.",
    "Implement pelatih screens: input laporan latihan, tanggal/hari/lokasi, jumlah anggota hadir, jumlah calon anggota hadir, jenis materi latihan.",
    "Add audit logging for critical actions: login, approval, generate document, update anggota, payment record, SK assignment.",
    "Add tests for API, RBAC, OTP, claim membership, content approval, document generation, QR validation, and downloads.",
    "Create docker-compose for local development with api, web-admin, postgres, valkey, minio.",
    "Create README.md with setup, env variables, migration, seed, run, test, and deployment instructions."
  ],
  "output_required": [
    "Working monorepo with backend, web admin, and mobile app",
    "PostgreSQL Prisma schema and migrations",
    "Seed data scripts",
    "OpenAPI/Swagger API documentation",
    "Web admin fully functional",
    "Mobile app for anggota and pelatih flows",
    "Document generation pipeline for kartu anggota, sertifikat, and piagam prestasi",
    "Docker Compose local development setup",
    "README implementation guide"
  ],
  "important_constraints": [
    "Do not hardcode member data in templates; all template fields must come from API data.",
    "Do not expose sequential internal IDs in public URLs; use UUID/public_token.",
    "All published content must pass approval according to user scope.",
    "All private downloads must validate authenticated user and ownership/scope.",
    "FCM payload must not contain sensitive personal data; send minimal OTP/session payload only.",
    "Generated documents must be stored in object storage and referenced from database records."
  ],
  "notes": "Use vibe_coding_full_package.zip as the base for SPEC, templates, PlantUML diagrams, and CSV seed data. Follow the selected stack exactly: NestJS backend, Next.js web admin, Expo React Native mobile, PostgreSQL, Prisma, Valkey, MinIO/S3, FCM."
}

