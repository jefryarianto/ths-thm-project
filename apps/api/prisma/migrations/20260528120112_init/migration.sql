-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "nomorHp" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fcmToken" TEXT,
    "roleId" INTEGER NOT NULL,
    "anggotaId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisasi" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tingkat" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT,
    "indukId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anggota" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "nomorAnggota" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tempatLahir" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "nomorHp" TEXT NOT NULL,
    "email" TEXT,
    "fotoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aktif',
    "rantingId" INTEGER NOT NULL,
    "wilayahId" INTEGER NOT NULL,
    "distrikId" INTEGER NOT NULL,
    "tanggalDadar" TIMESTAMP(3),
    "tempatDadar" TEXT,
    "level" TEXT,
    "berlakuSampai" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anggota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_membership" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "anggotaId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "catatanAdmin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claim_membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kegiatan" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3),
    "lokasi" TEXT NOT NULL,
    "penyelenggaraId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "latihan" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "hari" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "jumlahAnggotaHadir" INTEGER NOT NULL,
    "jumlahCalonHadir" INTEGER NOT NULL,
    "jenisMateri" TEXT NOT NULL,
    "pelatihId" INTEGER NOT NULL,
    "rantingId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "latihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absensi" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "anggotaId" INTEGER NOT NULL,
    "kegiatanId" INTEGER,
    "latihanId" INTEGER,
    "hadir" BOOLEAN NOT NULL DEFAULT false,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "absensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iuran" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "anggotaId" INTEGER NOT NULL,
    "jenis" TEXT NOT NULL,
    "jumlah" DECIMAL(12,2) NOT NULL,
    "tanggalBayar" TIMESTAMP(3) NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "iuran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendadaran_aspek" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "bobot" INTEGER NOT NULL DEFAULT 1,
    "urutan" INTEGER NOT NULL,
    "deskripsi" TEXT,

    CONSTRAINT "pendadaran_aspek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendadaran_item" (
    "id" SERIAL NOT NULL,
    "aspekId" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "minScore" INTEGER NOT NULL DEFAULT 55,
    "maxScore" INTEGER NOT NULL DEFAULT 90,
    "urutan" INTEGER NOT NULL,
    "deskripsi" TEXT,

    CONSTRAINT "pendadaran_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendadaran" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "anggotaId" INTEGER NOT NULL,
    "kegiatanId" INTEGER NOT NULL,
    "nilaiAkhir" DECIMAL(5,2),
    "predikat" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Menunggu',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pendadaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendadaran_nilai" (
    "id" SERIAL NOT NULL,
    "pendadaranId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "nilai" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pendadaran_nilai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendadaran_tim" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "pendadaranId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "peran" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pendadaran_tim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kartu_anggota" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "anggotaId" INTEGER NOT NULL,
    "nomorKartu" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "diterbitkanOleh" INTEGER NOT NULL,
    "berlakuSampai" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kartu_anggota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sertifikat" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "anggotaId" INTEGER NOT NULL,
    "pendadaranId" INTEGER NOT NULL,
    "nomorSertifikat" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "diterbitkanOleh" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sertifikat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "piagam" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "anggotaId" INTEGER NOT NULL,
    "prestasi" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "diterbitkanOleh" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "piagam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sk_pendadaran" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "nomorSk" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "anggotaId" INTEGER NOT NULL,
    "pendadaranId" INTEGER NOT NULL,
    "fileUrl" TEXT,
    "qrToken" TEXT NOT NULL,
    "diterbitkanOleh" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sk_pendadaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "konten" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "konten" TEXT NOT NULL,
    "ringkasan" TEXT,
    "thumbnailUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "penulisId" INTEGER NOT NULL,
    "reviewerId" INTEGER,
    "catatanReview" TEXT,
    "organisasiId" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "konten_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pustaka" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "jenis" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "uploadedBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pustaka_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat_masuk" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "nomorSurat" TEXT NOT NULL,
    "pengirim" TEXT NOT NULL,
    "perihal" TEXT NOT NULL,
    "tanggalSurat" TIMESTAMP(3) NOT NULL,
    "tanggalTerima" TIMESTAMP(3) NOT NULL,
    "fileUrl" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surat_masuk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat_keluar" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "nomorSurat" TEXT NOT NULL,
    "tujuan" TEXT NOT NULL,
    "perihal" TEXT NOT NULL,
    "tanggalSurat" TIMESTAMP(3) NOT NULL,
    "fileUrl" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surat_keluar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_key" ON "users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_anggotaId_key" ON "users"("anggotaId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_uuid_key" ON "roles"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nama_key" ON "roles"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "organisasi_uuid_key" ON "organisasi"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "anggota_uuid_key" ON "anggota"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "anggota_nomorAnggota_key" ON "anggota"("nomorAnggota");

-- CreateIndex
CREATE UNIQUE INDEX "claim_membership_uuid_key" ON "claim_membership"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "kegiatan_uuid_key" ON "kegiatan"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "latihan_uuid_key" ON "latihan"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "absensi_uuid_key" ON "absensi"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "iuran_uuid_key" ON "iuran"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "pendadaran_uuid_key" ON "pendadaran"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "pendadaran_nilai_pendadaranId_itemId_key" ON "pendadaran_nilai"("pendadaranId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "pendadaran_tim_uuid_key" ON "pendadaran_tim"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "kartu_anggota_uuid_key" ON "kartu_anggota"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "kartu_anggota_nomorKartu_key" ON "kartu_anggota"("nomorKartu");

-- CreateIndex
CREATE UNIQUE INDEX "kartu_anggota_qrToken_key" ON "kartu_anggota"("qrToken");

-- CreateIndex
CREATE UNIQUE INDEX "sertifikat_uuid_key" ON "sertifikat"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "sertifikat_nomorSertifikat_key" ON "sertifikat"("nomorSertifikat");

-- CreateIndex
CREATE UNIQUE INDEX "sertifikat_qrToken_key" ON "sertifikat"("qrToken");

-- CreateIndex
CREATE UNIQUE INDEX "piagam_uuid_key" ON "piagam"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "piagam_qrToken_key" ON "piagam"("qrToken");

-- CreateIndex
CREATE UNIQUE INDEX "sk_pendadaran_uuid_key" ON "sk_pendadaran"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "sk_pendadaran_nomorSk_key" ON "sk_pendadaran"("nomorSk");

-- CreateIndex
CREATE UNIQUE INDEX "sk_pendadaran_qrToken_key" ON "sk_pendadaran"("qrToken");

-- CreateIndex
CREATE UNIQUE INDEX "konten_uuid_key" ON "konten"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "pustaka_uuid_key" ON "pustaka"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "surat_masuk_uuid_key" ON "surat_masuk"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "surat_masuk_nomorSurat_key" ON "surat_masuk"("nomorSurat");

-- CreateIndex
CREATE UNIQUE INDEX "surat_keluar_uuid_key" ON "surat_keluar"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "surat_keluar_nomorSurat_key" ON "surat_keluar"("nomorSurat");

-- CreateIndex
CREATE UNIQUE INDEX "audit_logs_uuid_key" ON "audit_logs"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_uuid_key" ON "notifications"("uuid");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisasi" ADD CONSTRAINT "organisasi_indukId_fkey" FOREIGN KEY ("indukId") REFERENCES "organisasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anggota" ADD CONSTRAINT "anggota_rantingId_fkey" FOREIGN KEY ("rantingId") REFERENCES "organisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_membership" ADD CONSTRAINT "claim_membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_membership" ADD CONSTRAINT "claim_membership_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_penyelenggaraId_fkey" FOREIGN KEY ("penyelenggaraId") REFERENCES "organisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "latihan" ADD CONSTRAINT "latihan_pelatihId_fkey" FOREIGN KEY ("pelatihId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "latihan" ADD CONSTRAINT "latihan_rantingId_fkey" FOREIGN KEY ("rantingId") REFERENCES "organisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "kegiatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_latihanId_fkey" FOREIGN KEY ("latihanId") REFERENCES "latihan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iuran" ADD CONSTRAINT "iuran_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendadaran_item" ADD CONSTRAINT "pendadaran_item_aspekId_fkey" FOREIGN KEY ("aspekId") REFERENCES "pendadaran_aspek"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendadaran" ADD CONSTRAINT "pendadaran_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendadaran" ADD CONSTRAINT "pendadaran_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendadaran_nilai" ADD CONSTRAINT "pendadaran_nilai_pendadaranId_fkey" FOREIGN KEY ("pendadaranId") REFERENCES "pendadaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendadaran_nilai" ADD CONSTRAINT "pendadaran_nilai_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "pendadaran_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendadaran_tim" ADD CONSTRAINT "pendadaran_tim_pendadaranId_fkey" FOREIGN KEY ("pendadaranId") REFERENCES "pendadaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kartu_anggota" ADD CONSTRAINT "kartu_anggota_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_pendadaranId_fkey" FOREIGN KEY ("pendadaranId") REFERENCES "pendadaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piagam" ADD CONSTRAINT "piagam_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "konten" ADD CONSTRAINT "konten_penulisId_fkey" FOREIGN KEY ("penulisId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "konten" ADD CONSTRAINT "konten_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "konten" ADD CONSTRAINT "konten_organisasiId_fkey" FOREIGN KEY ("organisasiId") REFERENCES "organisasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
