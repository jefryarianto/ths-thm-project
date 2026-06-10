node.exe : warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please 
migrate to a Prisma config file (e.g., `prisma.config.ts`).
At C:\Users\jefryarianto\AppData\Roaming\npm\pnpm.ps1:24 char:5
+     & "node$exe"  "$basedir/node_modules/pnpm/bin/pnpm.mjs" $args
+     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (warn The config...ma.config.ts`).:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
For more information, see: https://pris.ly/prisma-config

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "nasional" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nasional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distrik" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "nasionalId" INTEGER NOT NULL,
    "kodeDistrik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distrik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wilayah" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "distrikId" INTEGER NOT NULL,
    "kodeWilayah" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wilayah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranting" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "wilayahId" INTEGER NOT NULL,
    "kodeRanting" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "lokasiLatihan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ranting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_latihan" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "distrikId" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" TEXT NOT NULL DEFAULT 'reguler',
    "lokasi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_latihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "nomorHp" TEXT,
    "passwordHash" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "scopeType" TEXT,
    "scopeId" INTEGER,
    "anggotaId" INTEGER,
    "fcmToken" TEXT,
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
CREATE TABLE "anggota" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "rantingId" INTEGER NOT NULL,
    "nomorAnggota" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "alamat" TEXT,
    "noHp" TEXT,
    "email" TEXT,
    "fotoPath" TEXT,
    "statusKeanggotaan" TEXT NOT NULL DEFAULT 'aktif',
    "tingkat" TEXT,
    "statusData" TEXT NOT NULL DEFAULT 'incomplete',
    "statusValidasi" TEXT NOT NULL DEFAULT 'pending',
    "missingFields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anggota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calon_anggota" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "rantingId" INTEGER NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "alamat" TEXT,
    "noHp" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'diusulkan',
    "usulOlehUserId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calon_anggota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendaftaran_anggota" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "rantingId" INTEGER,
    "namaLengkap" TEXT NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "noHp" TEXT NOT NULL,
    "email" TEXT,
    "alamat" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "catatanAdmin" TEXT,
    "reviewedBy" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pendaftaran_anggota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_anggota" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "anggotaId" INTEGER,
    "namaLengkap" TEXT NOT NULL,
    "nomorAnggotaInput" TEXT NOT NULL,
    "nomorUnikKartu" TEXT,
    "nomorUnikSertifikat" TEXT,
    "buktiFilePath" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "catatanAdmin" TEXT,
    "reviewedBy" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claim_anggota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anggota_role" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "anggotaId" INTEGER NOT NULL,
    "roleCode" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anggota_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anggota_update_request" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "anggotaId" INTEGER NOT NULL,
    "submittedBy" INTEGER NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "catatanAdmin" TEXT,
    "reviewedBy" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anggota_update_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kegiatan" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeId" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" TEXT NOT NULL DEFAULT 'lainnya',
    "lokasi" TEXT NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3),
    "createdBy" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absensi_kegiatan" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "kegiatanId" INTEGER NOT NULL,
    "anggotaId" INTEGER,
    "calonAnggotaId" INTEGER,
    "checkinMethod" TEXT NOT NULL DEFAULT 'manual',
    "checkinTime" TIMESTAMP(3) NOT NULL,
    "recordedBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "absensi_kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "latihan" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "rantingId" INTEGER NOT NULL,
    "kegiatanId" INTEGER,
    "pelatihId" INTEGER NOT NULL,
    "hariTanggal" TIMESTAMP(3) NOT NULL,
    "lokasi" TEXT NOT NULL,
    "jenisMateri" TEXT NOT NULL,
    "hasilLatihanGlobal" TEXT,
    "rekomendasiLatihanBerikutnya" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "latihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absensi_latihan" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "latihanId" INTEGER NOT NULL,
    "anggotaId" INTEGER,
    "calonAnggotaId" INTEGER,
    "checkinMethod" TEXT NOT NULL DEFAULT 'manual',
    "checkinTime" TIMESTAMP(3) NOT NULL,
    "recordedBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "absensi_latihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catatan_latihan_peserta" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "latihanId" INTEGER NOT NULL,
    "anggotaId" INTEGER,
    "calonAnggotaId" INTEGER,
    "catatanKhusus" TEXT NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catatan_latihan_peserta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumentasi_latihan" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "latihanId" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "uploadedBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dokumentasi_latihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aspek_penilaian" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "kodeAspek" TEXT NOT NULL,
    "namaAspek" TEXT NOT NULL,
    "deskripsi" TEXT,
    "bobot" DECIMAL(5,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aspek_penilaian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_penilaian" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "aspekId" INTEGER NOT NULL,
    "kodeItem" TEXT NOT NULL,
    "namaItem" TEXT NOT NULL,
    "skorMaksimal" DECIMAL(5,2) NOT NULL,
    "bobot" DECIMAL(5,2) NOT NULL,
    "urutan" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_penilaian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penguji_kegiatan" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "kegiatanId" INTEGER NOT NULL,
    "pengujiUserId" INTEGER NOT NULL,
    "anggotaId" INTEGER,
    "peran" TEXT NOT NULL DEFAULT 'anggota',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "penguji_kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nilai_pendadaran" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "kegiatanId" INTEGER NOT NULL,
    "calonAnggotaId" INTEGER NOT NULL,
    "itemPenilaianId" INTEGER NOT NULL,
    "pengujiUserId" INTEGER NOT NULL,
    "skor" DECIMAL(5,2) NOT NULL,
    "komentar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nilai_pendadaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hasil_pendadaran" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "kegiatanId" INTEGER NOT NULL,
    "calonAnggotaId" INTEGER NOT NULL,
    "totalSkor" DECIMAL(7,2) NOT NULL,
    "ranking" INTEGER NOT NULL,
    "statusKelulusan" TEXT NOT NULL,
    "statusValidasi" TEXT NOT NULL DEFAULT 'pending',
    "divalidasiOleh" INTEGER,
    "divalidasiAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hasil_pendadaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jenis_iuran" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "nominal" DECIMAL(12,2) NOT NULL,
    "periode" TEXT NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jenis_iuran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pembayaran_iuran" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "jenisIuranId" INTEGER NOT NULL,
    "anggotaId" INTEGER NOT NULL,
    "jumlahBayar" DECIMAL(12,2) NOT NULL,
    "tanggalBayar" TIMESTAMP(3) NOT NULL,
    "metodeBayar" TEXT NOT NULL DEFAULT 'tunai',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "buktiBayarPath" TEXT,
    "verifiedBy" INTEGER,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pembayaran_iuran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_types" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isAutoGenerated" BOOLEAN NOT NULL DEFAULT false,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_templates" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "documentTypeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "templateFilePath" TEXT NOT NULL,
    "layoutJson" JSONB,
    "backgroundFilePath" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "scopeType" TEXT,
    "scopeId" INTEGER,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_signers" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "documentTypeId" INTEGER,
    "scopeType" TEXT,
    "scopeId" INTEGER,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "signatureFilePath" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_signers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_stamps" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "documentTypeId" INTEGER,
    "scopeType" TEXT,
    "scopeId" INTEGER,
    "name" TEXT NOT NULL,
    "stampFilePath" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_stamps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issued_documents" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "documentTypeId" INTEGER NOT NULL,
    "anggotaId" INTEGER,
    "calonAnggotaId" INTEGER,
    "kegiatanId" INTEGER,
    "nomorDokumen" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "issuedAt" TIMESTAMP(3),
    "issuedBy" INTEGER,
    "templateId" INTEGER NOT NULL,
    "signerId" INTEGER,
    "stampId" INTEGER,
    "filePath" TEXT,
    "qrToken" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issued_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_validation_logs" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "issuedDocumentId" INTEGER,
    "qrToken" TEXT NOT NULL,
    "validationResult" TEXT NOT NULL,
    "validatedBy" INTEGER NOT NULL,
    "validatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "document_validation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisasi_dokumen" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "kategori" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "scopeType" TEXT,
    "scopeId" INTEGER,
    "aksesRoles" JSONB,
    "aksesTingkatan" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "uploadedBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisasi_dokumen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat_masuk" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "nomorSurat" TEXT NOT NULL,
    "tanggalSurat" TIMESTAMP(3) NOT NULL,
    "tanggalTerima" TIMESTAMP(3) NOT NULL,
    "pengirim" TEXT NOT NULL,
    "perihal" TEXT NOT NULL,
    "filePath" TEXT,
    "scopeType" TEXT,
    "scopeId" INTEGER,
    "diterimaOleh" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surat_masuk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat_keluar" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "nomorSurat" TEXT NOT NULL,
    "tanggalSurat" TIMESTAMP(3) NOT NULL,
    "penerima" TEXT NOT NULL,
    "perihal" TEXT NOT NULL,
    "filePath" TEXT,
    "scopeType" TEXT,
    "scopeId" INTEGER,
    "dibuatOleh" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surat_keluar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_jobs" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "importType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "successRows" INTEGER NOT NULL DEFAULT 0,
    "warningRows" INTEGER NOT NULL DEFAULT 0,
    "errorRows" INTEGER NOT NULL DEFAULT 0,
    "importedBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_row_logs" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "importJobId" INTEGER NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "rawData" JSONB,
    "status" TEXT NOT NULL,
    "messages" JSONB,
    "createdRecordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_row_logs_pkey" PRIMARY KEY ("id")
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
    "scopeType" TEXT,
    "scopeId" INTEGER,
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
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "recipientUserId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sentViaFcm" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "actorUserId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nasional_uuid_key" ON "nasional"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "distrik_uuid_key" ON "distrik"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "distrik_kodeDistrik_key" ON "distrik"("kodeDistrik");

-- CreateIndex
CREATE UNIQUE INDEX "wilayah_uuid_key" ON "wilayah"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ranting_uuid_key" ON "ranting"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "unit_latihan_uuid_key" ON "unit_latihan"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_key" ON "users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_anggotaId_key" ON "users"("anggotaId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_uuid_key" ON "roles"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nama_key" ON "roles"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "anggota_uuid_key" ON "anggota"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "anggota_nomorAnggota_key" ON "anggota"("nomorAnggota");

-- CreateIndex
CREATE UNIQUE INDEX "calon_anggota_uuid_key" ON "calon_anggota"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "pendaftaran_anggota_uuid_key" ON "pendaftaran_anggota"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "claim_anggota_uuid_key" ON "claim_anggota"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "anggota_role_uuid_key" ON "anggota_role"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "anggota_update_request_uuid_key" ON "anggota_update_request"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "kegiatan_uuid_key" ON "kegiatan"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "absensi_kegiatan_uuid_key" ON "absensi_kegiatan"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "latihan_uuid_key" ON "latihan"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "absensi_latihan_uuid_key" ON "absensi_latihan"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "catatan_latihan_peserta_uuid_key" ON "catatan_latihan_peserta"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "dokumentasi_latihan_uuid_key" ON "dokumentasi_latihan"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "aspek_penilaian_uuid_key" ON "aspek_penilaian"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "aspek_penilaian_kodeAspek_key" ON "aspek_penilaian"("kodeAspek");

-- CreateIndex
CREATE UNIQUE INDEX "item_penilaian_uuid_key" ON "item_penilaian"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "item_penilaian_kodeItem_key" ON "item_penilaian"("kodeItem");

-- CreateIndex
CREATE UNIQUE INDEX "penguji_kegiatan_uuid_key" ON "penguji_kegiatan"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "nilai_pendadaran_uuid_key" ON "nilai_pendadaran"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "nilai_pendadaran_kegiatanId_calonAnggotaId_itemPenilaianId__key" ON "nilai_pendadaran"("kegiatanId", "calonAnggotaId", "itemPenilaianId", "pengujiUserId");

-- CreateIndex
CREATE UNIQUE INDEX "hasil_pendadaran_uuid_key" ON "hasil_pendadaran"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "hasil_pendadaran_kegiatanId_calonAnggotaId_key" ON "hasil_pendadaran"("kegiatanId", "calonAnggotaId");

-- CreateIndex
CREATE UNIQUE INDEX "jenis_iuran_uuid_key" ON "jenis_iuran"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "pembayaran_iuran_uuid_key" ON "pembayaran_iuran"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "document_types_uuid_key" ON "document_types"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "document_types_code_key" ON "document_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "document_templates_uuid_key" ON "document_templates"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "document_signers_uuid_key" ON "document_signers"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "document_stamps_uuid_key" ON "document_stamps"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "issued_documents_uuid_key" ON "issued_documents"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "issued_documents_nomorDokumen_key" ON "issued_documents"("nomorDokumen");

-- CreateIndex
CREATE UNIQUE INDEX "issued_documents_qrToken_key" ON "issued_documents"("qrToken");

-- CreateIndex
CREATE UNIQUE INDEX "document_validation_logs_uuid_key" ON "document_validation_logs"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "organisasi_dokumen_uuid_key" ON "organisasi_dokumen"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "surat_masuk_uuid_key" ON "surat_masuk"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "surat_keluar_uuid_key" ON "surat_keluar"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "import_jobs_uuid_key" ON "import_jobs"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "import_row_logs_uuid_key" ON "import_row_logs"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "konten_uuid_key" ON "konten"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "pustaka_uuid_key" ON "pustaka"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_uuid_key" ON "notifications"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "audit_logs_uuid_key" ON "audit_logs"("uuid");

-- AddForeignKey
ALTER TABLE "distrik" ADD CONSTRAINT "distrik_nasionalId_fkey" FOREIGN KEY ("nasionalId") REFERENCES "nasional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wilayah" ADD CONSTRAINT "wilayah_distrikId_fkey" FOREIGN KEY ("distrikId") REFERENCES "distrik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranting" ADD CONSTRAINT "ranting_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "wilayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_latihan" ADD CONSTRAINT "unit_latihan_distrikId_fkey" FOREIGN KEY ("distrikId") REFERENCES "distrik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anggota" ADD CONSTRAINT "anggota_rantingId_fkey" FOREIGN KEY ("rantingId") REFERENCES "ranting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calon_anggota" ADD CONSTRAINT "calon_anggota_rantingId_fkey" FOREIGN KEY ("rantingId") REFERENCES "ranting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calon_anggota" ADD CONSTRAINT "calon_anggota_usulOlehUserId_fkey" FOREIGN KEY ("usulOlehUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftaran_anggota" ADD CONSTRAINT "pendaftaran_anggota_rantingId_fkey" FOREIGN KEY ("rantingId") REFERENCES "ranting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftaran_anggota" ADD CONSTRAINT "pendaftaran_anggota_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_anggota" ADD CONSTRAINT "claim_anggota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_anggota" ADD CONSTRAINT "claim_anggota_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_anggota" ADD CONSTRAINT "claim_anggota_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anggota_role" ADD CONSTRAINT "anggota_role_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anggota_update_request" ADD CONSTRAINT "anggota_update_request_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anggota_update_request" ADD CONSTRAINT "anggota_update_request_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anggota_update_request" ADD CONSTRAINT "anggota_update_request_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_kegiatan" ADD CONSTRAINT "absensi_kegiatan_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_kegiatan" ADD CONSTRAINT "absensi_kegiatan_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_kegiatan" ADD CONSTRAINT "absensi_kegiatan_calonAnggotaId_fkey" FOREIGN KEY ("calonAnggotaId") REFERENCES "calon_anggota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_kegiatan" ADD CONSTRAINT "absensi_kegiatan_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "latihan" ADD CONSTRAINT "latihan_rantingId_fkey" FOREIGN KEY ("rantingId") REFERENCES "ranting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "latihan" ADD CONSTRAINT "latihan_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "kegiatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "latihan" ADD CONSTRAINT "latihan_pelatihId_fkey" FOREIGN KEY ("pelatihId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_latihan" ADD CONSTRAINT "absensi_latihan_latihanId_fkey" FOREIGN KEY ("latihanId") REFERENCES "latihan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_latihan" ADD CONSTRAINT "absensi_latihan_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_latihan" ADD CONSTRAINT "absensi_latihan_calonAnggotaId_fkey" FOREIGN KEY ("calonAnggotaId") REFERENCES "calon_anggota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_latihan" ADD CONSTRAINT "absensi_latihan_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catatan_latihan_peserta" ADD CONSTRAINT "catatan_latihan_peserta_latihanId_fkey" FOREIGN KEY ("latihanId") REFERENCES "latihan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catatan_latihan_peserta" ADD CONSTRAINT "catatan_latihan_peserta_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catatan_latihan_peserta" ADD CONSTRAINT "catatan_latihan_peserta_calonAnggotaId_fkey" FOREIGN KEY ("calonAnggotaId") REFERENCES "calon_anggota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catatan_latihan_peserta" ADD CONSTRAINT "catatan_latihan_peserta_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumentasi_latihan" ADD CONSTRAINT "dokumentasi_latihan_latihanId_fkey" FOREIGN KEY ("latihanId") REFERENCES "latihan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumentasi_latihan" ADD CONSTRAINT "dokumentasi_latihan_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_penilaian" ADD CONSTRAINT "item_penilaian_aspekId_fkey" FOREIGN KEY ("aspekId") REFERENCES "aspek_penilaian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penguji_kegiatan" ADD CONSTRAINT "penguji_kegiatan_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penguji_kegiatan" ADD CONSTRAINT "penguji_kegiatan_pengujiUserId_fkey" FOREIGN KEY ("pengujiUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai_pendadaran" ADD CONSTRAINT "nilai_pendadaran_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai_pendadaran" ADD CONSTRAINT "nilai_pendadaran_calonAnggotaId_fkey" FOREIGN KEY ("calonAnggotaId") REFERENCES "calon_anggota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai_pendadaran" ADD CONSTRAINT "nilai_pendadaran_itemPenilaianId_fkey" FOREIGN KEY ("itemPenilaianId") REFERENCES "item_penilaian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai_pendadaran" ADD CONSTRAINT "nilai_pendadaran_pengujiUserId_fkey" FOREIGN KEY ("pengujiUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasil_pendadaran" ADD CONSTRAINT "hasil_pendadaran_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasil_pendadaran" ADD CONSTRAINT "hasil_pendadaran_calonAnggotaId_fkey" FOREIGN KEY ("calonAnggotaId") REFERENCES "calon_anggota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasil_pendadaran" ADD CONSTRAINT "hasil_pendadaran_divalidasiOleh_fkey" FOREIGN KEY ("divalidasiOleh") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran_iuran" ADD CONSTRAINT "pembayaran_iuran_jenisIuranId_fkey" FOREIGN KEY ("jenisIuranId") REFERENCES "jenis_iuran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran_iuran" ADD CONSTRAINT "pembayaran_iuran_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran_iuran" ADD CONSTRAINT "pembayaran_iuran_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "document_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_signers" ADD CONSTRAINT "document_signers_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "document_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_stamps" ADD CONSTRAINT "document_stamps_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "document_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "document_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_calonAnggotaId_fkey" FOREIGN KEY ("calonAnggotaId") REFERENCES "calon_anggota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "kegiatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_issuedBy_fkey" FOREIGN KEY ("issuedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "document_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "document_signers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_documents" ADD CONSTRAINT "issued_documents_stampId_fkey" FOREIGN KEY ("stampId") REFERENCES "document_stamps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_validation_logs" ADD CONSTRAINT "document_validation_logs_issuedDocumentId_fkey" FOREIGN KEY ("issuedDocumentId") REFERENCES "issued_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisasi_dokumen" ADD CONSTRAINT "organisasi_dokumen_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surat_masuk" ADD CONSTRAINT "surat_masuk_diterimaOleh_fkey" FOREIGN KEY ("diterimaOleh") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surat_keluar" ADD CONSTRAINT "surat_keluar_dibuatOleh_fkey" FOREIGN KEY ("dibuatOleh") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_importedBy_fkey" FOREIGN KEY ("importedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_row_logs" ADD CONSTRAINT "import_row_logs_importJobId_fkey" FOREIGN KEY ("importJobId") REFERENCES "import_jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "konten" ADD CONSTRAINT "konten_penulisId_fkey" FOREIGN KEY ("penulisId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "konten" ADD CONSTRAINT "konten_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

