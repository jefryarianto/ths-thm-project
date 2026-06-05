# Deploy ke Render.com — Panduan Lengkap

Render.com menyediakan hosting cloud yang mudah untuk full-stack aplikasi. Panduan ini mencakup部署 THS-THM (API NestJS + Web-Admin Next.js + PostgreSQL + Redis + S3 Storage).

---

## 📊 Arsitektur di Render

```
┌────────────────────────────────────────────────────────┐
│                      Render.com                         │
│                                                         │
│  🌐 Web-Admin (Next.js)    🖥️ API (NestJS/Docker)      │
│  https://ths-thm-admin.onrender.com  :4000              │
│       │                              ▲                  │
│       │  HTTPS /api/v1/*             │ internal network  │
│       └──────────────────────────────┘                  │
│                                                         │
│  🗄️ PostgreSQL 16     ⚡ Redis (Key Value)              │
│  ths-thm-db           ths-thm-redis                     │
│                                                         │
│  ☁️ S3 Storage (Cloudflare R2 / AWS S3 / Backblaze B2) │
│      (menggantikan MinIO lokal)                         │
└────────────────────────────────────────────────────────┘
```

**Perbedaan dari setup Docker lokal:**
| Komponen | Docker Lokal | Render.com |
|----------|-------------|------------|
| Nginx | ✅ Reverse proxy | ❌ Tidak perlu — Render handle SSL/routing |
| Certbot | ✅ SSL auto-renew | ❌ Tidak perlu — SSL managed by Render |
| MinIO | ✅ File storage | ❌ Ganti dengan S3 (R2/AWS/B2) |
| PostgreSQL | ✅ Container | ✅ Managed PostgreSQL |
| Valkey/Redis | ✅ Container | ✅ Managed Redis (Key Value) |

---

## 🚀 Step 1: Siapkan S3 Storage

Karena Render tidak punya managed MinIO, kamu perlu S3-compatible storage:

### Opsi A: Cloudflare R2 (Rekomendasi ✅)
- **Keuntungan:** Tidak ada biaya egress, 10 GB storage gratis
- **Setup:**
  1. Buka Cloudflare Dashboard → R2 → Create bucket
  2. Nama bucket: `ths-thm-docs`
  3. Buat API Token: R2 → Manage API Tokens → Create Token
  4. Dapatkan: `Access Key ID` dan `Secret Access Key`
  5. Endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

### Opsi B: AWS S3
- Buat bucket di region terdekat (ap-southeast-1)
- Buat IAM user dengan akses S3
- Endpoint: `s3.ap-southeast-1.amazonaws.com`

### Opsi C: Backblaze B2
- 10 GB storage gratis
- S3-compatible API

---

## 🚀 Step 2: Deploy dengan Blueprint (Infrastructure as Code)

Cara termudah — Render akan auto-provision semua service dari file `render.yaml`:

### 2a. Update `render.yaml`
Edit `render.yaml` di root repo, ganti:
- `YOUR_ORG` dengan GitHub org/username kamu
- `MINIO_ENDPOINT` dengan endpoint S3 provider kamu

### 2b. Push ke GitHub
```bash
git add render.yaml
git commit -m "feat: add Render Blueprint for deployment"
git push origin main
```

### 2c. Deploy Blueprint di Render

1. **Login** ke [Render Dashboard](https://dashboard.render.com)
2. **New + → Blueprint**
3. **Connect repository** → pilih `ths-thm-project`
4. Render akan membaca `render.yaml` dan otomatis membuat:
   - ✅ **PostgreSQL** database (`ths-thm-db`)
   - ✅ **Redis** Key Value (`ths-thm-redis`)
   - ✅ **API** Web Service (Docker) (`ths-thm-api`)
   - ✅ **Web-Admin** Web Service (Node) (`ths-thm-admin`)
5. Klik **Apply**

⏳ Tunggu 5-10 menit untuk provisioning.

---

## 🔧 Step 3: Konfigurasi Manual

Setelah Blueprint selesai, ada beberapa env vars yang perlu diisi manual:

### 3a. API Service → Environment

Buka service `ths-thm-api` → **Environment** → tambahkan:

| Key | Value | Catatan |
|-----|-------|---------|
| `MINIO_ACCESS_KEY` | *(dari S3 provider)* | Access Key ID |
| `MINIO_SECRET_KEY` | *(dari S3 provider)* | Secret Access Key |
| `JWT_SECRET` | *(Render auto-generate, bisa diganti)* | Minimal 32 karakter |
| `FIREBASE_PROJECT_ID` | *(dari Firebase Console)* | Jika pakai FCM |
| `FIREBASE_CLIENT_EMAIL` | *(service account email)* | Jika pakai FCM |
| `FIREBASE_PRIVATE_KEY` | *(private key)* | Jika pakai FCM |

### 3b. Firebase Cloud Messaging (jika pakai notifikasi)

Kalau pakai FCM push notifications, tambahkan:

| Key | Value |
|-----|-------|
| `FIREBASE_PROJECT_ID` | *(dari Firebase Console)* |
| `FIREBASE_CLIENT_EMAIL` | *(service account email)* |
| `FIREBASE_PRIVATE_KEY` | *(private key, replace \\n dengan real newline)* |

---

## 🔄 Step 4: Database Migration & Seed

Render menjalankan service dengan health check. API perlu database siap sebelum serve traffic.

### ✅ Sudah Otomatis via Blueprint

`render.yaml` sudah menyertakan `preDeployCommand`:
```yaml
preDeployCommand: cd apps/api && npx prisma generate && npx prisma migrate deploy
```

Ini otomatis jalan setiap deploy — **tidak perlu konfigurasi manual**. ✅

### Seed Database (Sekali Saja)

Jika seed diperlukan untuk data awal:
```bash
cd apps/api && npx tsx prisma/seed.ts
```
Jalankan via **Render Shell** setelah API pertama kali deploy:
1. Buka **ths-thm-api → Shell**
2. Jalankan: `cd apps/api && npx tsx prisma/seed.ts`

---

## ✅ Step 5: Verifikasi

Cek apakah semua service berjalan:

```bash
# API Health
curl https://ths-thm-api.onrender.com/api/v1/health
# → {"status":"ok","timestamp":"..."}

# Swagger Docs
curl https://ths-thm-api.onrender.com/api/docs
# → HTML Swagger UI

# Web-Admin
# Buka https://ths-thm-admin.onrender.com di browser
# Login: admin@ths-thm.org / admin123
```

---

## 🔄 Step 6: CI/CD dengan GitHub Actions

Render auto-deploy dari branch `main`. Tapi kamu bisa tambahkan GitHub Actions untuk testing sebelum deploy.

### Tambahkan deploy trigger ke CI/CD

Render auto-deploy dari branch `main`. Tapi kamu bisa tambahkan GitHub Actions untuk testing **sebelum** deploy.

> ⚠️ **Penting:** Karena Render Blueprint mengelola semua service secara kolektif, trigger deploy individual service akan di-override oleh sync Blueprint berikutnya. Gunakan **Blueprint Sync** endpoint sebagai gantinya:

```yaml
  deploy-render:
    name: Deploy to Render
    runs-on: ubuntu-latest
    needs: [api-test, web-admin-test, web-admin-e2e]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Trigger Render Blueprint Sync
        run: |
          curl -X POST "https://api.render.com/v1/blueprint/${{ secrets.RENDER_BLUEPRINT_ID }}/sync" \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
            -H "Content-Type: application/json"
```

**Setup:**
1. Buat API Key di Render Dashboard → **Account Settings → API Keys**
2. Dapatkan Blueprint ID dari URL Blueprint Render (`bp-xxxxx`)
3. Tambahkan ke GitHub Secrets:
   - `RENDER_API_KEY` — Render API key
   - `RENDER_BLUEPRINT_ID` — Blueprint ID (contoh: `bp-abc123`)

---

## 💰 Estimasi Biaya Render (per bulan)

| Service | Plan | Harga |
|---------|------|-------|
| API Web Service | Starter (0.1 CPU / 512 MB) | $7 |
| Web-Admin Web Service | Starter (0.1 CPU / 512 MB) | $7 |
| PostgreSQL | Starter (256 MB / 1 GB) | $7 |
| Redis Key Value | Starter (256 MB) | $7 |
| **Total** | | **$28/bulan** |

> 💡 Tip: Web-Admin bisa di-downgrade ke plan **Free** kalau traffic rendah.
> Free plan sleep setelah 15 menit idle dan wake up saat ada request (ada delay).

---

## ❗ Troubleshooting

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| `prisma: command not found` | Prisma CLI tidak di PATH | `npx prisma ...` atau install global di Docker |
| `Cannot find module '@ths-thm/shared'` | Workspace package belum build | Pastikan Dockerfile build shared package dulu |
| `ECONNREFUSED database` | DB URL salah atau belum ready | Cek env `DATABASE_URL` di Render Dashboard |
| `401 Unauthorized` pada login | JWT_SECRET tidak konsisten | Set `JWT_SECRET` manual (jangan auto-generate) |
| `Mixed Content` error di browser | HTTPS campur HTTP | Set `MINIO_USE_SSL=true` dan API URL pakai HTTPS |
| Build gagal — `tsc` error | TypeScript strict mode | Cek log build, fix error, push ulang |
| Chromium error saat generate PDF | Chrome tidak ditemukan | Set `CHROMIUM_PATH=/usr/bin/chromium-browser` |

---

## 📚 Referensi

- [Render Blueprint Spec](https://render.com/docs/blueprint-spec)
- [Render Node.js Deployment](https://render.com/docs/deploy-node-express-app)
- [Render Next.js Deployment](https://render.com/docs/deploy-nextjs-app)
- [Render Docker Deployment](https://render.com/docs/deploy-with-docker)
- [Render Managed PostgreSQL](https://render.com/docs/postgresql-creating-connecting)
- [Render Redis Key Value](https://render.com/docs/redis)
