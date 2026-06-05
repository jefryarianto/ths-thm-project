# Deploy THS-THM ke VPS dengan Dockploy

Panduan langkah demi langkah untuk mendeploy THS-THM Management System ke VPS menggunakan Dockploy.

---

## Prasyarat

- ✅ VPS dengan spesifikasi minimal 2 CPU / 4GB RAM / 40GB SSD
- ✅ Dockploy sudah terinstall di VPS
- ✅ Domain `ths-thm.cloud` sudah pointing ke IP VPS (A record)
- ✅ DNS sudah propagate:
  - `api.ths-thm.cloud` → IP VPS
  - `admin.ths-thm.cloud` → IP VPS
- ✅ Proyek THS-THM sudah ada di lokal (`f:\Coding\ths-thm-project`)

---

## Langkah 1: Push File Docker Compose ke GitHub

File deploy sudah siap di `infra/docker/docker-compose.dockploy.yml`. Pastikan semua perubahan sudah di-commit dan push ke GitHub:

```bash
git add infra/docker/docker-compose.dockploy.yml .env.production
git commit -m "feat: add Dockploy deployment config"
git push origin main
```

---

## Langkah 2: Login ke Dockploy Dashboard

1. Buka browser dan akses Dockploy dashboard (biasanya `http://<IP_VPS>:3000` atau domain yang dikonfigurasi)
2. Login dengan akun admin Dockploy

---

## Langkah 3: Buat Stack Baru di Dockploy

1. Klik **Stacks** → **New Stack**
2. Beri nama: `ths-thm`
3. Pada bagian **Upload Compose File**, upload file `infra/docker/docker-compose.dockploy.yml`
4. Dockploy akan membaca dan menampilkan daftar service

---

## Langkah 4: Isi Environment Variables

Di bagian **Environment** stack, isi variabel berikut:

| Variable | Value | Keterangan |
|----------|-------|------------|
| `POSTGRES_PASSWORD` | `ths_thm_secret` | Ganti dengan password yang lebih kuat |
| `JWT_SECRET` | *(generate random)* | **WAJIB DIGANTI**. Gunakan string 64 karakter random |
| `MINIO_ACCESS_KEY` | `minioadmin` | Ganti dengan access key baru |
| `MINIO_SECRET_KEY` | `minioadmin` | **WAJIB DIGANTI**. Ganti dengan secret key baru |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | *(isi dari file JSON)* | **WAJIB DIISI** |

### Cara generate JWT_SECRET:
- **PowerShell**: `[System.Convert]::ToBase64String((1..32|%{Get-Random -Max 256}))`
- **Linux/Mac**: `openssl rand -hex 32`
- **Online**: Gunakan https://randomkeygen.com

### Cara isi FIREBASE_SERVICE_ACCOUNT_JSON:
1. Buka file `docs/ayo-lapor-56443-firebase-adminsdk-fbsvc-eb6564edb9.json`
2. Copy seluruh isi file (raw JSON, termasuk `\n` dalam `private_key`)
3. Di Dockploy, paste sebagai satu baris (atau gunakan fitur multiline jika tersedia)
4. **PENTING**: Di environment variable, pastikan `\n` dalam `private_key` ditulis sebagai `\\n` (double escaped) agar terbaca dengan benar oleh Node.js

---

## Langkah 5: Konfigurasi Domain / Port Mapping

Dockploy menggunakan Traefik untuk routing. Konfigurasi port mapping:

### Service `api` (port 4000):
1. Di detail service `api`, klik **Add Port**
2. Port: `4000`
3. Protocol: `HTTP`
4. Domain: `api.ths-thm.cloud`
5. Enable HTTPS: ✅

### Service `web-admin` (port 3000):
1. Di detail service `web-admin`, klik **Add Port**
2. Port: `3000`
3. Protocol: `HTTP`
4. Domain: `admin.ths-thm.cloud`
5. Enable HTTPS: ✅

---

## Langkah 6: Deploy Stack

1. Klik **Deploy Stack**
2. Dockploy akan:
   - Clone repository dari GitHub
   - Build Docker images untuk service `api` dan `web-admin`
   - Pull images untuk `postgres`, `valkey`, `minio`
   - Start semua services
3. Proses build memakan waktu **5-10 menit** (tergantung koneksi VPS)
4. Pantau log di tab **Logs**

---

## Langkah 7: Jalankan Database Migration & Seed

Setelah semua service running, jalankan migration:

### Via Dockploy Terminal:
1. Buka stack `ths-thm`
2. Klik tab **Terminal**
3. Pilih service `api`
4. Jalankan perintah:

```bash
# Migration database
npx prisma migrate deploy

# Seed data awal (hanya sekali)
npx tsx prisma/seed.ts
```

### Via SSH ke VPS (alternatif):
```bash
ssh user@<IP_VPS>

# Cari container API
docker ps | grep ths-thm-api

# Jalankan migration di dalam container
docker exec -it ths-thm-api npx prisma migrate deploy

# Seed data
docker exec -it ths-thm-api npx tsx prisma/seed.ts
```

---

## Langkah 8: Verifikasi Deploy

### Cek API Health:
```bash
curl https://api.ths-thm.cloud/api/v1/health
```
**Response yang diharapkan:**
```json
{"status":"ok","timestamp":"2026-06-03T..."}
```

### Cek Web Admin:
Buka `https://admin.ths-thm.cloud` di browser
- Halaman login akan muncul
- Login dengan akun seed:
  - **Username**: `admin@ths-thm.org` atau `admin`
  - **Password**: `admin123`

### Cek Swagger Docs:
Buka `https://api.ths-thm.cloud/api/docs`

---

## Langkah 9: Troubleshooting

### Build gagal — "Cannot find module '@ths-thm/shared'"
**Penyebab:** Workspace package belum build.
**Solusi:** Pastikan Dockerfile build shared/templates package terlebih dahulu. Jika perlu, build manual di VPS:
```bash
docker exec -it ths-thm-api sh -c "cd /app && pnpm --filter @ths-thm/shared build && pnpm --filter @ths-thm/templates build"
```

### API crash — "ECONNREFUSED database"
**Penyebab:** PostgreSQL belum siap saat API start.
**Solusi:** Tunggu 30 detik, API akan restart otomatis. Atau restart manual container:
```bash
docker restart ths-thm-api
```

### 502 Bad Gateway dari Traefik
**Penyebab:** Service belum siap atau port tidak cocok.
**Solusi:** Pastikan port mapping di Dockploy benar (api:4000, web-admin:3000).

### Login gagal — "401 Unauthorized"
**Penyebab:** JWT_SECRET tidak konsisten atau seed belum dijalankan.
**Solusi:** 
1. Pastikan `JWT_SECRET` sudah diisi di environment
2. Jalankan seed:
```bash
docker exec -it ths-thm-api npx tsx prisma/seed.ts
```

### Firebase notifikasi tidak terkirim
**Penyebab:** `FIREBASE_SERVICE_ACCOUNT_JSON` tidak valid.
**Solusi:** Cek log API:
```bash
docker logs ths-thm-api | grep Firebase
```
Jika muncul `[DRY-RUN]`, berarti Firebase belum dikonfigurasi dengan benar.

---

## Ringkasan File yang Digunakan

| File | Lokasi | Fungsi |
|------|--------|--------|
| `docker-compose.dockploy.yml` | `infra/docker/` | Compose file untuk Dockploy |
| `.env.production` | Root proyek | Template environment variables (jangan di-commit) |
| Firebase JSON | `docs/ayo-lapor-56443-*.json` | Service account Firebase untuk FCM |

---

## ✅ Checklist Verifikasi Final

- [ ] `https://api.ths-thm.cloud/api/v1/health` → 200 OK
- [ ] `https://admin.ths-thm.cloud` → halaman login muncul
- [ ] `https://api.ths-thm.cloud/api/docs` → Swagger UI
- [ ] Login berhasil (admin/admin123)
- [ ] Database migration berjalan tanpa error
- [ ] Seed data berhasil
- [ ] Firebase tidak dalam dry-run mode