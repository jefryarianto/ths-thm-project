# THS-THM API Documentation

**Base URL:** `/api/v1`  
**Auth:** JWT Bearer token via `Authorization: Bearer <token>`  
**Global Prefix:** All endpoints are under `/api/v1` (configured in `main.ts`)

---

## Authentication

### `POST /auth/login`
Login with email + password or OTP. Rate-limited: 30 req/min.

**Body:**
```json
{
  "identifier": "admin@ths-thm.org",
  "password": "admin123",
  "otpCode": "123456"  // optional, for OTP login
}
```
**Response:** `{ accessToken, refreshToken, user }`

### `POST /auth/send-otp`
Send OTP to user email.

**Body:** `{ "identifier": "admin@ths-thm.org" }`

### `POST /auth/register`
Register a new user account (auto-assigns anggota role).

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "nomorHp": "08123456789"
}
```

### `POST /auth/refresh`
Refresh access token using refresh token.

**Body:** `{ "refreshToken": "..." }`

### `POST /auth/logout` 🔒
Logout and invalidate refresh token.

### `POST /auth/register-fcm-token` 🔒
Register FCM device token for push notifications.

**Body:** `{ "fcmToken": "..." }`

### `POST /auth/unregister-fcm-token` 🔒
Unregister FCM device token.

---

## Users 🔒

### `POST /users` 🔒👑
Create a new user (superadmin/admin_distrik only).

**Body:**
```json
{
  "name": "New User",
  "email": "user@example.com",
  "nomorHp": "08123456789",
  "password": "password123",
  "roleId": 2,
  "scopeType": "distrik",
  "scopeId": 1
}
```

### `GET /users` 🔒👑
Get all users with pagination.

**Query:** `?page=1&limit=10&search=keyword`

### `GET /users/:id` 🔒
Get a user by ID.

### `PUT /users/:id` 🔒👑
Update a user (superadmin only).

### `DELETE /users/:id` 🔒👑
Delete a user (superadmin only).

---

## Roles 🔒

### `POST /roles` 🔒👑
Create a new role (superadmin only).

**Body:** `{ "nama": "Admin", "scope": "superadmin", "permissions": [...] }`

### `GET /roles` 🔒
Get all roles (no role restriction).

### `GET /roles/:id` 🔒
Get a role by ID.

### `PUT /roles/:id` 🔒👑
Update a role (superadmin only).

### `DELETE /roles/:id` 🔒👑
Delete a role (superadmin only).

---

## Anggota 🔒

### `POST /anggota` 🔒👑
Create a new anggota (admin only).

**Body:**
```json
{
  "nomorAnggota": "THS-001",
  "namaLengkap": "John Doe",
  "jenisKelamin": "L",
  "rantingId": 1,
  "tempatLahir": "Jakarta",
  "tanggalLahir": "1990-01-15",
  "alamat": "Jl. Merdeka No.1",
  "noHp": "08123456789",
  "email": "john@example.com"
}
```

### `GET /anggota` 🔒
Get all anggota with pagination and filters.

**Query:** `?page=1&limit=10&search=keyword&status=aktif&rantingId=1`

### `GET /anggota/me` 🔒
Get current logged-in user's anggota profile with full relations (ranting, wilayah, distrik, roles, documents).

### `GET /anggota/search-claim` 🔒
Search anggota for claim membership (public).

**Query:** `?q=name-or-number`

### `GET /anggota/:id` 🔒
Get anggota by ID with full relations.

### `GET /anggota/uuid/:uuid`
Get anggota by UUID (public verification).

### `PUT /anggota/:id` 🔒👑
Update anggota data.

### `DELETE /anggota/:id` 🔒👑
Delete anggota (superadmin only).

### `POST /anggota/:id/validate` 🔒👑
Validate anggota data completeness.

### `POST /anggota/:id/validasi` 🔒👑
Set validasi status for anggota.

**Body:** `{ "status": "approved" }`

### Calon Anggota

### `POST /anggota/calon` 🔒
Usulkan calon anggota baru.

### `GET /anggota/calon` 🔒👑
Get all calon anggota with pagination.

**Query:** `?page=1&limit=10&status=diusulkan&rantingId=1`

### `GET /anggota/calon/:id` 🔒
Get calon anggota by ID with relations.

### `PUT /anggota/calon/:id/status` 🔒👑
Update calon anggota status secara manual.

**Body:** `{ "status": "lulus" }`

> Status otomatis diset ke `lulus` atau `gagal` saat hasil pendadaran divalidasi (`PUT /pendadaran/validasi` dengan `status: "approved"`).

### `POST /anggota/calon/:id/konversi` 🔒👑
Konversi calon anggota yang sudah berstatus `lulus` menjadi anggota aktif. Roles: superadmin, admin_distrik.

**Body:**
```json
{
  "nomorAnggota": "THS-2026-010",
  "tingkat": "Tamtama"
}
```

**Proses yang terjadi secara otomatis dalam satu transaksi:**
1. Buat record `Anggota` baru dari data calon
2. Assign `AnggotaRole` dengan `roleCode: "anggota"`

> Hanya bisa dilakukan jika `status === "lulus"`. `nomorAnggota` wajib unik.

### Anggota Roles

### `POST /anggota/:id/role` 🔒👑
Assign role to anggota (pelatih, penguji, wasit_juri).

**Body:** `{ "roleCode": "pelatih", "expiresAt": "2026-12-31" }`

### `GET /anggota/:id/roles` 🔒
Get roles assigned to anggota.

### `DELETE /anggota/role/:roleId` 🔒👑
Remove role from anggota.

### Update Requests

### `POST /anggota/:id/update-request` 🔒
Submit update request for anggota data.

### `GET /anggota/update-requests` 🔒👑
Get all update requests with pagination.

### `PUT /anggota/update-requests/:id/review` 🔒👑
Review and approve/reject update request.

**Body:** `{ "status": "approved", "catatanAdmin": "Data valid" }`

---

## Pendaftaran Anggota

### `POST /anggota/pendaftaran`
Daftar sebagai anggota baru. **Tidak perlu login.** `noHp` wajib diisi.

**Body:**
```json
{
  "namaLengkap": "Budi Santoso",
  "jenisKelamin": "L",
  "noHp": "08123456789",
  "rantingId": 1,
  "tempatLahir": "Jakarta",
  "tanggalLahir": "2000-05-10",
  "email": "budi@example.com",
  "alamat": "Jl. Merdeka No. 5"
}
```
**Response:** Data pendaftaran dengan status `pending`. Admin menerima notifikasi otomatis.

### `GET /anggota/pendaftaran` 🔒👑
Get semua pendaftaran anggota (superadmin / admin_distrik).

**Query:** `?page=1&limit=10&status=pending&rantingId=1`

**Status values:** `pending` · `approved` · `rejected`

### `GET /anggota/pendaftaran/:id` 🔒👑
Get detail pendaftaran by ID.

### `PUT /anggota/pendaftaran/:id/review` 🔒👑
Setujui atau tolak pendaftaran. Jika `approved`, record `Anggota` dibuat otomatis.

**Body:**
```json
{
  "status": "approved",
  "nomorAnggota": "THS-2026-001",
  "catatanAdmin": "Data lengkap dan valid"
}
```
> `nomorAnggota` wajib diisi saat `status: "approved"`. Tidak bisa di-review ulang setelah diproses.

### `DELETE /anggota/pendaftaran/:id` 🔒👑
Hapus pendaftaran yang masih berstatus `pending`.

---

## Iuran 🔒

### `POST /iuran/jenis` 🔒👑
Create iuran type (master data).

**Body:** `{ "nama": "Iuran Bulanan", "deskripsi": "...", "nominal": 50000, "periode": "bulanan", "scopeType": "distrik", "scopeId": 1 }`

### `GET /iuran/jenis` 🔒
Get all iuran types.

**Query:** `?scopeType=distrik&scopeId=1`

### `POST /iuran` 🔒
Record a dues payment (creates pembayaran with pending status).

**Body:** `{ "jenisIuranId": 1, "anggotaId": 1, "jumlahBayar": 50000, "tanggalBayar": "2026-06-01", "metodeBayar": "tunai" }`

### `GET /iuran` 🔒
Get all pembayaran with pagination and filters.

**Query:** `?page=1&limit=10&anggotaId=1&jenisIuranId=1&status=lunas`

### `PUT /iuran/:id/verify` 🔒👑
Verify/reject a payment.

**Body:** `{ "status": "lunas" }`  (or "ditolak")

### `GET /iuran/status/:anggotaId` 🔒
Get payment status for a specific anggota.

### `GET /iuran/dashboard/stats` 🔒👑
Get iuran dashboard statistics.

### `GET /iuran/dashboard/monthly` 🔒👑
Get monthly iuran aggregation for dashboard chart (last 6 months).

---

## Surat 🔒

### `GET /surat` 🔒👑
Get all mail (combined masuk + keluar) with pagination.

**Query:** `?page=1&limit=10&scopeType=distrik&scopeId=1`

### `POST /surat/masuk` 🔒👑
Record incoming mail.

**Body:** `{ "nomorSurat": "SM-001", "pengirim": "Dinas X", "perihal": "Undangan", "tanggalSurat": "2026-06-01", "tanggalTerima": "2026-06-02", "filePath": "...", "scopeType": "distrik", "scopeId": 1 }`

### `POST /surat/keluar` 🔒👑
Record outgoing mail.

**Body:** `{ "nomorSurat": "SK-001", "penerima": "Dinas Y", "perihal": "Balasan", "tanggalSurat": "2026-06-01", "filePath": "...", "scopeType": "distrik", "scopeId": 1 }`

### `GET /surat/masuk` 🔒👑
Get incoming mail list.

### `GET /surat/keluar` 🔒👑
Get outgoing mail list.

### `PUT /surat/masuk/:id` 🔒👑
Update incoming mail.

### `DELETE /surat/masuk/:id` 🔒👑
Delete incoming mail.

### `PUT /surat/keluar/:id` 🔒👑
Update outgoing mail.

### `DELETE /surat/keluar/:id` 🔒👑
Delete outgoing mail.

---

## Kegiatan 🔒

### `POST /kegiatan` 🔒
Create a new activity.

**Body:** `{ "nama": "Latihan Rutin", "tipe": "latihan", "tanggalMulai": "2026-06-01", "lokasi": "GOR", "scopeType": "distrik", "scopeId": 1 }`

### `GET /kegiatan` 🔒
Get all activities with pagination and filters.

**Query:** `?page=1&limit=10&tipe=latihan&scopeType=distrik&scopeId=1&status=published`

### `GET /kegiatan/:id` 🔒
Get activity by ID with full relations.

### `PUT /kegiatan/:id` 🔒👑
Update activity. Roles: superadmin, admin_distrik, admin_kegiatan.

### `POST /kegiatan/:id/publish` 🔒👑
Publish activity. Roles: superadmin, admin_distrik, admin_kegiatan.

### `POST /kegiatan/:id/close` 🔒👑
Close activity. Roles: superadmin, admin_distrik, admin_kegiatan.

### `DELETE /kegiatan/:id` 🔒👑
Delete activity (superadmin only).

---

## Latihan 🔒

### `POST /latihan` 🔒
Submit training report (pelatih).

**Body:** `{ "rantingId": 1, "hariTanggal": "2026-06-01", "lokasi": "GOR", "jenisMateri": "Teknik Dasar", "hasilLatihanGlobal": "...", "rekomendasiLatihanBerikutnya": "..." }`

### `GET /latihan` 🔒
Get all training reports.

**Query:** `?page=1&limit=10&rantingId=1`

### `GET /latihan/:id` 🔒
Get training report by ID with absensi, catatan, and dokumentasi.

---

## Catatan Latihan Peserta 🔒

### `POST /latihan/:id/catatan` 🔒
Add catatan khusus for a peserta in a latihan. Roles: pelatih, admin_distrik, superadmin.

**Body:**
```json
{
  "anggotaId": 1,
  "calonAnggotaId": null,
  "catatanKhusus": "Perlu perbaikan teknik pukulan"
}
```
> Isi salah satu antara `anggotaId` atau `calonAnggotaId`.

### `GET /latihan/:id/catatan` 🔒
Get all catatan peserta for a latihan.

### `PUT /latihan/catatan/:catatanId` 🔒
Update catatan khusus peserta. Roles: pelatih, admin_distrik, superadmin.

**Body:** `{ "catatanKhusus": "Update catatan..." }`

### `DELETE /latihan/catatan/:catatanId` 🔒
Delete catatan khusus peserta. Roles: pelatih, admin_distrik, superadmin.

---

## Dokumentasi Latihan 🔒

### `POST /latihan/:id/dokumentasi` 🔒
Upload foto/video dokumentasi latihan. Roles: pelatih, admin_distrik, superadmin.

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | binary | ✅ | File foto (JPEG/PNG/WEBP) atau video (MP4/MOV), maks 50 MB |
| `fileType` | string | ✅ | `foto` atau `video` |
| `urutan` | number | — | Urutan tampilan, auto-increment jika tidak diisi |

### `GET /latihan/:id/dokumentasi` 🔒
Get all dokumentasi for a latihan. Response menyertakan `fileUrl` (signed URL, valid 1 jam).

### `PUT /latihan/:id/dokumentasi/reorder` 🔒
Reorder dokumentasi latihan. Roles: pelatih, admin_distrik, superadmin.

**Body:** `{ "orders": [{ "id": 1, "urutan": 2 }, { "id": 2, "urutan": 1 }] }`

### `DELETE /latihan/dokumentasi/:dokumentasiId` 🔒
Delete dokumentasi latihan dan hapus file dari storage. Roles: pelatih, admin_distrik, superadmin.

---

## Organisasi 🔒

### `POST /organisasi/nasional` 🔒👑
Create nasional level.

### `GET /organisasi/nasional`
Get all nasional.  
### `GET /organisasi/nasional/:id`
Get nasional by ID with distrik.

### `POST /organisasi/distrik` 🔒👑
Create distrik under nasional.

### `GET /organisasi/distrik`
Get all distrik, optionally by nasionalId.

### `GET /organisasi/wilayah`
Get all wilayah, optionally by distrikId.

### `POST /organisasi/ranting` 🔒
Create ranting under wilayah.

### `GET /organisasi/ranting`
Get all ranting, optionally by wilayahId.

### `POST /organisasi/unit-latihan` 🔒👑
Create unit latihan under distrik.

### `GET /organisasi/hierarchy`
Get full organization hierarchy tree (Nasional → Distrik → Wilayah → Ranting).

---

## Pendadaran 🔒

### `GET /pendadaran/aspek`
Get all aspek penilaian with items.

### `POST /pendadaran/aspek` 🔒👑
Create new aspek penilaian.

### `GET /pendadaran/aspek/:id`
Get aspek penilaian by ID with items.

### `PUT /pendadaran/aspek/:id` 🔒👑
Update aspek penilaian.

**Body:** `{ "namaAspek": "...", "bobot": 30, "isActive": true }`

### `DELETE /pendadaran/aspek/:id` 🔒👑
Delete aspek penilaian.

### `POST /pendadaran/item` 🔒👑
Create new item penilaian under aspek.

### `GET /pendadaran/item/:id`
Get item penilaian by ID.

### `PUT /pendadaran/item/:id` 🔒👑
Update item penilaian.

**Body:** `{ "namaItem": "...", "skorMaksimal": 100, "bobot": 10, "urutan": 1, "isActive": true }`

### `DELETE /pendadaran/item/:id` 🔒👑
Delete item penilaian.

### `POST /pendadaran/penguji` 🔒
Assign penguji to a kegiatan.

### `GET /pendadaran/penguji/:kegiatanId`
Get penguji by kegiatan.

### `DELETE /pendadaran/penguji/:id` 🔒
Remove penguji from kegiatan. Roles: superadmin, admin_distrik, admin_kegiatan.

### `POST /pendadaran/nilai` 🔒
Input a single score for a calon anggota (penguji).

### `POST /pendadaran/nilai/bulk` 🔒
Bulk input scores for a calon anggota.

### `POST /pendadaran/hitung` 🔒👑
Calculate final score and ranking for a calon.

### `PUT /pendadaran/validasi` 🔒👑
Validate/reject pendadaran results. Jika `status: "approved"`, status calon anggota otomatis diperbarui ke `lulus` atau `gagal` sesuai hasil.

**Body:** `{ "kegiatanId": 1, "calonAnggotaId": 1, "status": "approved" }`

### `GET /pendadaran`
Get all pendadaran results with filters.

### `GET /pendadaran/calon/:calonAnggotaId`
Get pendadaran results by calon anggota.

### `GET /pendadaran/detail/:kegiatanId/:calonAnggotaId`
Get detailed scores for a calon in a kegiatan.

---

## Dokumen 🔒

### `POST /dokumen/kartu-anggota/:anggotaId/generate` 🔒👑
Generate kartu anggota PDF for a member.

### `POST /dokumen/sertifikat/:calonAnggotaId/:kegiatanId/generate` 🔒
Generate sertifikat pendadaran PDF.

### `POST /dokumen/piagam/:anggotaId/generate` 🔒👑
Generate piagam prestasi PDF.

**Body:** `{ "prestasi": "Juara 1 Tingkat Nasional" }`

### `GET /dokumen/verify/:token`
Public verification of document via QR token.

### `GET /dokumen/download/:anggotaId/:type`
Download document by type code.

**Types:** `KARTU_ANGGOTA`, `SERTIFIKAT_PENDADARAN`, `PIAGAM_PRESTASI`

### `POST /dokumen/:id/revoke` 🔒👑
Revoke an issued document.

---

## Document Types 🔒

### `POST /dokumen/types` 🔒👑
Create a new document type (superadmin only).

**Body:** `{ "code": "KARTU_ANGGOTA", "name": "Kartu Anggota", "category": "kartu", "isAutoGenerated": true, "requiresApproval": false }`

**Category values:** `kartu` · `sertifikat` · `piagam` · `surat` · `dokumen_lain`

### `GET /dokumen/types` 🔒
Get all document types with template & issued document counts.

### `GET /dokumen/types/:id` 🔒
Get document type by ID with active templates, signers, and stamps.

### `PUT /dokumen/types/:id` 🔒👑
Update document type (superadmin only).

**Body:** `{ "name": "...", "isActive": true }`

### `DELETE /dokumen/types/:id` 🔒👑
Soft-delete document type — set `isActive = false` (superadmin only).

---

## Document Templates 🔒

### `POST /dokumen/templates` 🔒👑
Upload a new document template file. Roles: superadmin, admin_distrik.

**Content-Type:** `multipart/form-data`

| Field | Required | Description |
|-------|----------|-------------|
| `file` | ✅ | Template file, maks 20 MB |
| `documentTypeId` | ✅ | ID tipe dokumen |
| `name` | ✅ | Nama template |
| `layoutJson` | — | JSON string konfigurasi layout |
| `scopeType` | — | `nasional` / `distrik` / `wilayah` / `ranting` |
| `scopeId` | — | ID scope |

### `GET /dokumen/templates` 🔒
Get all document templates. Filter: `?documentTypeId=1`

### `GET /dokumen/templates/:id` 🔒
Get template by ID (includes signed file URL).

### `PUT /dokumen/templates/:id` 🔒👑
Update template metadata (name, layoutJson, isActive, scope).

### `DELETE /dokumen/templates/:id` 🔒👑
Delete template and remove file from storage (superadmin only).

---

## Document Signers 🔒

### `POST /dokumen/signers` 🔒👑
Upload signer with signature image. Roles: superadmin, admin_distrik.

**Content-Type:** `multipart/form-data`

| Field | Required | Description |
|-------|----------|-------------|
| `file` | ✅ | Signature image (PNG/JPEG/WEBP), maks 5 MB |
| `name` | ✅ | Nama penandatangan |
| `position` | ✅ | Jabatan |
| `documentTypeId` | — | Batasi ke tipe dokumen tertentu |
| `scopeType` / `scopeId` | — | Scope organisasi |

### `GET /dokumen/signers` 🔒
Get all active signers with signed URLs. Filter: `?documentTypeId=1`

### `PUT /dokumen/signers/:id` 🔒👑
Update signer name, position, or active status.

### `DELETE /dokumen/signers/:id` 🔒👑
Delete signer and remove signature file from storage (superadmin only).

---

## Document Stamps 🔒

### `POST /dokumen/stamps` 🔒👑
Upload organization stamp image. Roles: superadmin, admin_distrik.

**Content-Type:** `multipart/form-data`

| Field | Required | Description |
|-------|----------|-------------|
| `file` | ✅ | Stamp image (PNG/JPEG/WEBP), maks 5 MB |
| `name` | ✅ | Nama cap/stempel |
| `documentTypeId` | — | Batasi ke tipe dokumen tertentu |
| `scopeType` / `scopeId` | — | Scope organisasi |

### `GET /dokumen/stamps` 🔒
Get all active stamps with signed URLs. Filter: `?documentTypeId=1`

### `PUT /dokumen/stamps/:id` 🔒👑
Update stamp name or active status.

### `DELETE /dokumen/stamps/:id` 🔒👑
Delete stamp and remove image from storage (superadmin only).

---

## Claim 🔒

### `POST /claim`
Submit a membership claim (mobile user).

### `GET /claim` 🔒👑
Get all claims for admin review.

### `PUT /claim/:id/approve` 🔒👑
Approve a membership claim.

### `PUT /claim/:id/reject` 🔒👑
Reject a membership claim.

---

## Absensi 🔒

### `POST /absensi/kegiatan`
Record attendance for a kegiatan.

### `GET /absensi/kegiatan/:kegiatanId`
Get attendance by kegiatan.

### `POST /absensi/latihan`
Record attendance for a latihan.

### `POST /absensi/latihan/bulk`
Bulk record attendance for a training session.

### `GET /absensi/latihan/:latihanId`
Get attendance by training session.

---

## Konten

### `POST /konten` 🔒
Create content (requires auth). Status awal: `Draft`.

**Body:** `{ "judul": "...", "jenis": "Berita", "konten": "HTML content...", "ringkasan": "...", "scopeType": "distrik", "scopeId": 1 }`

**Jenis values:** `Berita` · `Artikel` · `Video` · `Acara`

### `GET /konten` 🔒👑
Get all content with pagination (superadmin/admin_distrik).

**Query:** `?page=1&limit=10&status=Draft&jenis=Berita`

### `GET /konten/published`
Get published content (public).

**Query:** `?jenis=Berita`

### `GET /konten/:id`
Get content by ID.

### `PUT /konten/:id` 🔒
Update content (penulis asli only, hanya saat status `Draft` atau `Menunggu Persetujuan`).

**Body:** `{ "judul": "...", "konten": "...", "ringkasan": "..." }`

### `PUT /konten/:id/submit` 🔒
Submit content for review — ubah status ke `Menunggu Persetujuan` (penulis only).

### `PUT /konten/:id/review` 🔒👑
Review and approve/reject content (superadmin/admin_distrik).

**Body:** `{ "status": "Dipublikasikan", "catatanReview": "..." }`

**Status values:** `Dipublikasikan` · `Ditolak`

### `DELETE /konten/:id` 🔒👑
Delete content (admin only).

---

## Pustaka

### `POST /pustaka` 🔒
Upload library item (requires auth).

**Body:** `{ "judul": "...", "deskripsi": "...", "jenis": "Buku", "fileUrl": "...", "thumbnailUrl": "...", "isPublic": true }`

**Jenis values:** `Buku` · `Modul` · `Materi` · `Dokumen`

### `GET /pustaka`
Get public library items.

**Query:** `?page=1&limit=10&jenis=Buku`

### `GET /pustaka/all` 🔒👑
Get all library items including private (admin only).

### `GET /pustaka/:id`
Get library item by ID.

### `PUT /pustaka/:id` 🔒👑
Update library item (admin only).

### `DELETE /pustaka/:id` 🔒👑
Delete library item (admin only).

---

## Notifications 🔒

### `GET /notifications`
Get user notifications.

**Query:** `?page=1&limit=20`

### `GET /notifications/count`
Get unread notification count.

**Response:** `{ count: 5 }`

### `PUT /notifications/:id/read`
Mark notification as read.

### `PUT /notifications/read-all`
Mark all notifications as read.

---

## Organisasi Dokumen 🔒

### `POST /organisasi-dokumen` 🔒👑
Upload dokumen organisasi.

**Body:** `{ "judul": "Statuta", "kategori": "statuta", "filePath": "...", "scopeType": "distrik", "scopeId": 1, "isPublic": false }`

### `GET /organisasi-dokumen` 🔒
Get all dokumen organisasi.

**Query:** `?page=1&limit=10&kategori=statuta&scopeType=distrik&scopeId=1`

### `GET /organisasi-dokumen/kategori/:kategori`
Get dokumen by kategori (public).

**Query:** `?isPublic=true`

### `GET /organisasi-dokumen/:id` 🔒
Get dokumen by ID.

### `PUT /organisasi-dokumen/:id` 🔒👑
Update dokumen.

### `DELETE /organisasi-dokumen/:id` 🔒👑
Delete dokumen (superadmin only).

---

## Import Jobs 🔒👑

### `POST /import-jobs`
Create a new import job.

**Body:** `{ "importType": "anggota", "fileName": "anggota.csv" }`

### `POST /import-jobs/:id/process`
Process import job with row data.

**Body:**
```json
{
  "importType": "anggota",
  "rows": [
    { "nomorAnggota": "THS-001", "namaLengkap": "John", "jenisKelamin": "L", "rantingId": 1 }
  ]
}
```

**Import Types:** `anggota`, `calon_anggota`, `aspek_penilaian`, `item_penilaian`

### `GET /import-jobs`
Get all import jobs.

**Query:** `?page=1&limit=10&importType=anggota`

### `GET /import-jobs/:id`
Get import job details with row logs.

### `GET /import-jobs/:id/rows`
Get row logs for an import job.

**Query:** `?status=error&page=1&limit=10`

---

## Audit 🔒👑

### `GET /audit`
Get audit logs (superadmin only).

**Query:** `?page=1&limit=10&action=LOGIN&userId=1`

---

## Role Access Matrix

| Endpoint | Superadmin | Admin Distrik | Admin Wilayah | Admin Ranting | Admin Kegiatan | Pelatih | Penguji | Anggota | Public |
|----------|:----------:|:-------------:|:-------------:|:-------------:|:--------------:|:-------:|:-------:|:-------:|:------:|
| Auth (login, register) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Anggota CRUD | ✅ | ✅ | — | — | — | — | — | — | — |
| Anggota (read) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Pendaftaran Anggota (submit) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pendaftaran Anggota (review/admin) | ✅ | ✅ | — | — | — | — | — | — | — |
| Konversi Calon → Anggota | ✅ | ✅ | — | — | — | — | — | — | — |
| Iuran (admin) | ✅ | ✅ | — | ✅ | — | — | — | — | — |
| Iuran (read) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Surat | ✅ | ✅ | — | — | — | — | — | — | — |
| Kegiatan (admin) | ✅ | ✅ | — | — | ✅ | — | — | — | — |
| Kegiatan (read) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Latihan (submit) | ✅ | ✅ | — | — | — | ✅ | — | — | — |
| Latihan (read) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Catatan Latihan (write) | ✅ | ✅ | — | — | — | ✅ | — | — | — |
| Catatan Latihan (read) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Dokumentasi Latihan (upload/delete) | ✅ | ✅ | — | — | — | ✅ | — | — | — |
| Dokumentasi Latihan (read) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Pendadaran | ✅ | ✅ | — | — | ✅ | — | ✅ | — | — |
| Dokumen (generate) | ✅ | ✅ | — | — | ✅ | — | — | — | — |
| Dokumen (verify) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dokumen Types/Templates/Signers/Stamps (write) | ✅ | ✅ | — | — | — | — | — | — | — |
| Dokumen Types/Templates/Signers/Stamps (read) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Claim (review) | ✅ | ✅ | — | — | — | — | — | — | — |
| Claim (submit) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Audit | ✅ | — | — | — | — | — | — | — | — |
| Users | ✅ | ✅ | — | — | — | — | — | — | — |
| Roles | ✅ | — | — | — | — | — | — | — | — |
| Organisasi (super) | ✅ | — | — | — | — | — | — | — | — |
| Organisasi (scope) | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — |
| Konten (create) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Konten (admin) | ✅ | ✅ | — | — | — | — | — | — | — |
| Pustaka (upload) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Pustaka (update/delete) | ✅ | ✅ | — | — | — | — | — | — | — |
| Pustaka (read public) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |

---

## Response Format

### Success
```json
{
  "data": [...],           // paginated data
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Error
```json
{
  "message": "Error description",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Common Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |
