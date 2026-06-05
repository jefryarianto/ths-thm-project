// ═══════════════════════════════════════════
// AUTH & USERS
// ═══════════════════════════════════════════

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: number;
  uuid?: string;
  name: string;
  /** @deprecated alias for name, used in users page */
  username?: string;
  email?: string;
  nomorHp?: string;
  isActive: boolean;
  roleId?: number;
  role?: Role;
  anggotaId?: number;
  anggota?: Anggota;
  scopeType?: string;
  scopeId?: number;
  createdAt: string;
}

export interface Role {
  id: number;
  nama: string;
  scope: string;
  permissions: string[];
}

// ═══════════════════════════════════════════
// ORGANISASI — Multi-level hierarchy
// ═══════════════════════════════════════════

export interface Nasional {
  id: number;
  uuid?: string;
  nama: string;
  kode: string;
  distrik?: Distrik[];
}

export interface Distrik {
  id: number;
  uuid?: string;
  nama: string;
  kodeDistrik: string;
  alamat?: string;
  nasionalId: number;
  nasional?: Nasional;
  wilayah?: Wilayah[];
  unitLatihan?: UnitLatihan[];
}

export interface Wilayah {
  id: number;
  uuid?: string;
  nama: string;
  kodeWilayah: string;
  distrikId: number;
  distrik?: Distrik;
  ranting?: Ranting[];
}

export interface Ranting {
  id: number;
  uuid?: string;
  nama: string;
  kodeRanting: string;
  wilayahId: number;
  wilayah?: Wilayah;
  lokasiLatihan?: string;
  _count?: { anggota: number; calonAnggota: number; latihan: number };
}

export interface UnitLatihan {
  id: number;
  uuid?: string;
  nama: string;
  tipe: string;
  lokasi?: string;
  distrikId: number;
  distrik?: Distrik;
}

// ═══════════════════════════════════════════
// ANGGOTA & CALON ANGGOTA
// ═══════════════════════════════════════════

export interface Anggota {
  id: number;
  uuid: string;
  nomorAnggota: string;
  namaLengkap: string;
  jenisKelamin: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  alamat?: string;
  noHp?: string;
  email?: string;
  fotoPath?: string;
  statusKeanggotaan: string;
  tingkat?: string;
  statusData: string;
  statusValidasi: string;
  rantingId: number;
  ranting?: Ranting;
  user?: User;
  anggotaRole?: AnggotaRole[];
  pembayaranIuran?: PembayaranIuran[];
  issuedDocuments?: IssuedDocument[];
  createdAt: string;
}

export interface CalonAnggota {
  id: number;
  uuid?: string;
  namaLengkap: string;
  jenisKelamin: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  noHp?: string;
  email?: string;
  status: string;
  rantingId: number;
  ranting?: Ranting;
  usulOlehUserId: number;
  usulOleh?: User;
  nilaiPendadaran?: NilaiPendadaran[];
  hasilPendadaran?: HasilPendadaran[];
  issuedDocuments?: IssuedDocument[];
  createdAt: string;
}

export interface AnggotaRole {
  id: number;
  roleCode: string;
  issuedAt: string;
  expiresAt?: string;
}

export interface AnggotaUpdateRequest {
  id: number;
  uuid?: string;
  anggotaId: number;
  anggota?: Anggota;
  submittedBy: number;
  pengaju?: User;
  oldData?: any;
  newData: any;
  status: string;
  catatanAdmin?: string;
  reviewedBy?: number;
  reviewer?: User;
  createdAt: string;
}

// ═══════════════════════════════════════════
// KEGIATAN & LATIHAN
// ═══════════════════════════════════════════

export interface Kegiatan {
  id: number;
  uuid?: string;
  scopeType: string;
  scopeId: number;
  nama: string;
  tipe: string;
  lokasi: string;
  tanggalMulai: string;
  tanggalSelesai?: string;
  createdBy: number;
  creator?: User;
  status: string;
  _count?: { absensiKegiatan: number; latihan: number };
}

export interface Latihan {
  id: number;
  uuid?: string;
  rantingId: number;
  ranting?: Ranting;
  kegiatanId?: number;
  pelatihId: number;
  pelatih?: User;
  hariTanggal: string;
  /** Convenience: extracted day-of-week from hariTanggal */
  hari?: string;
  /** Convenience: date portion of hariTanggal */
  tanggal?: string;
  lokasi: string;
  jenisMateri: string;
  hasilLatihanGlobal?: string;
  rekomendasiLatihanBerikutnya?: string;
  /** Convenience: count of attending anggota (from absensiLatihan) */
  jumlahAnggotaHadir?: number;
  /** Convenience: count of attending calon (from absensiLatihan) */
  jumlahCalonHadir?: number;
  _count?: { absensiLatihan: number; dokumentasiLatihan: number };
}

export interface AbsensiKegiatan {
  id: number;
  kegiatanId: number;
  anggotaId?: number;
  anggota?: Anggota;
  calonAnggotaId?: number;
  calonAnggota?: CalonAnggota;
  checkinMethod: string;
  checkinTime: string;
}

export interface AbsensiLatihan {
  id: number;
  latihanId: number;
  anggotaId?: number;
  anggota?: Anggota;
  calonAnggotaId?: number;
  calonAnggota?: CalonAnggota;
  checkinMethod: string;
  checkinTime: string;
}

export interface CatatanLatihanPeserta {
  id: number;
  latihanId: number;
  anggotaId?: number;
  calonAnggotaId?: number;
  catatanKhusus: string;
  createdAt: string;
}

export interface DokumentasiLatihan {
  id: number;
  latihanId: number;
  filePath: string;
  fileType: string;
  urutan: number;
}

// ═══════════════════════════════════════════
// PENDADARAN
// ═══════════════════════════════════════════

export interface AspekPenilaian {
  id: number;
  uuid?: string;
  kodeAspek: string;
  namaAspek: string;
  deskripsi?: string;
  bobot: number;
  isActive: boolean;
  itemPenilaian?: ItemPenilaian[];
}

export interface ItemPenilaian {
  id: number;
  uuid?: string;
  aspekId: number;
  kodeItem: string;
  namaItem: string;
  skorMaksimal: number;
  bobot: number;
  urutan: number;
  isActive: boolean;
}

export interface PengujiKegiatan {
  id: number;
  kegiatanId: number;
  pengujiUserId: number;
  penguji?: User;
  anggotaId?: number;
  peran: string;
}

export interface NilaiPendadaran {
  id: number;
  kegiatanId: number;
  calonAnggotaId: number;
  calonAnggota?: CalonAnggota;
  itemPenilaianId: number;
  itemPenilaian?: ItemPenilaian;
  pengujiUserId: number;
  penguji?: User;
  skor: number;
  komentar?: string;
}

export interface HasilPendadaran {
  id: number;
  kegiatanId: number;
  calonAnggotaId: number;
  calonAnggota?: CalonAnggota;
  totalSkor: number;
  ranking: number;
  statusKelulusan: string;
  statusValidasi: string;
}

// ═══════════════════════════════════════════
// IURAN
// ═══════════════════════════════════════════

export interface JenisIuran {
  id: number;
  uuid?: string;
  nama: string;
  deskripsi?: string;
  nominal: number;
  periode: string;
  scopeType: string;
  scopeId: number;
  isActive: boolean;
}

export interface PembayaranIuran {
  id: number;
  uuid?: string;
  jenisIuranId: number;
  jenisIuran?: JenisIuran;
  anggotaId: number;
  anggota?: Anggota;
  jumlahBayar: number;
  tanggalBayar: string;
  metodeBayar: string;
  status: string;
  buktiBayarPath?: string;
  verifiedBy?: number;
  verifikator?: User;
  verifiedAt?: string;
  createdAt: string;
}

export interface IuranDashboard {
  totalIuran: number;
  totalAnggota: number;
  iuranBulanIni: number;
}

// ═══════════════════════════════════════════
// DOKUMEN — Unified Document System
// ═══════════════════════════════════════════

export interface DocumentType {
  id: number;
  code: string;
  name: string;
  category: string;
  isAutoGenerated: boolean;
}

export interface DocumentTemplate {
  id: number;
  documentTypeId: number;
  documentType?: DocumentType;
  name: string;
  templateFilePath: string;
  isActive: boolean;
}

export interface IssuedDocument {
  id: number;
  uuid?: string;
  documentTypeId: number;
  documentType?: DocumentType;
  anggotaId?: number;
  calonAnggotaId?: number;
  kegiatanId?: number;
  nomorDokumen: string;
  title: string;
  status: string;
  issuedAt?: string;
  filePath?: string;
  qrToken: string;
  metadata?: any;
  createdAt: string;
}

// ═══════════════════════════════════════════
// SURAT
// ═══════════════════════════════════════════

export interface SuratMasuk {
  id: number;
  nomorSurat: string;
  tanggalSurat: string;
  tanggalTerima: string;
  pengirim: string;
  perihal: string;
  filePath?: string;
  scopeType?: string;
  scopeId?: number;
  diterimaOleh: number;
  penerima?: User;
  /** @deprecated alias for pengirim on keluar */
  tujuan?: string;
  /** @deprecated alias for perihal */
  keterangan?: string;
}

export interface SuratKeluar {
  id: number;
  nomorSurat: string;
  tanggalSurat: string;
  penerima: string;
  perihal: string;
  filePath?: string;
  scopeType?: string;
  scopeId?: number;
  dibuatOleh: number;
  pembuat?: User;
}

export type Surat = SuratMasuk;

// ═══════════════════════════════════════════
// KONTEN
// ═══════════════════════════════════════════

export interface Konten {
  id: number;
  judul: string;
  jenis: string;
  konten: string;
  ringkasan?: string;
  thumbnailUrl?: string;
  status: string;
  penulis?: User;
  reviewer?: User;
  scopeType?: string;
  scopeId?: number;
  publishedAt?: string;
  createdAt: string;
}

// ═══════════════════════════════════════════
// PUSTAKA
// ═══════════════════════════════════════════

export interface Pustaka {
  id: number;
  judul: string;
  deskripsi?: string;
  jenis: string;
  fileUrl: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  uploadedBy: number;
}

// ═══════════════════════════════════════════
// AUDIT
// ═══════════════════════════════════════════

export interface Audit {
  id: number;
  action: string;
  entityName: string;
  entityId?: string;
  actor?: User;
  ipAddress?: string;
  createdAt: string;
}

// ═══════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════

export interface Notification {
  id: number;
  title: string;
  body: string;
  /** @deprecated alias for title, used in notifications page */
  judul?: string;
  /** @deprecated alias for body, used in notifications page */
  pesan?: string;
  type?: string;
  data?: any;
  linkTo?: string;
  isRead: boolean;
  sentViaFcm?: boolean;
  createdAt: string;
}

export interface NotifCount {
  count: number;
}

// ═══════════════════════════════════════════
// IMPORT JOBS
// ═══════════════════════════════════════════

export interface ImportJob {
  id: number;
  uuid?: string;
  importType: string;
  fileName: string;
  status: string;
  totalRows: number;
  successRows: number;
  warningRows: number;
  errorRows: number;
  importedBy: number;
  pengimport?: User;
  rowLogs?: ImportRowLog[];
  _count?: { rowLogs: number };
  createdAt: string;
}

export interface ImportRowLog {
  id: number;
  rowNumber: number;
  rawData?: any;
  status: string;
  messages?: string[];
  createdRecordId?: string;
}

// ═══════════════════════════════════════════
// ORGANISASI DOKUMEN
// ═══════════════════════════════════════════

export interface OrganisasiDokumen {
  id: number;
  judul: string;
  deskripsi?: string;
  kategori: string;
  filePath: string;
  scopeType?: string;
  scopeId?: number;
  aksesRoles?: string[];
  aksesTingkatan?: string[];
  isPublic: boolean;
  uploadedBy: number;
  pengupload?: User;
  createdAt: string;
}

// ═══════════════════════════════════════════
// GENERIC
// ═══════════════════════════════════════════

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ═══════════════════════════════════════════
// COMPATIBILITY ALIASES (for old imports that still reference these)
// ═══════════════════════════════════════════

/** @deprecated Use PembayaranIuran directly */
export type Iuran = PembayaranIuran;

/** @deprecated Use hierarchy types (Nasional|Distrik|Wilayah|Ranting) */
export type Organisasi = Nasional;

/** @deprecated Use HasilPendadaran directly */
export type Pendadaran = HasilPendadaran;

export interface IuranStatusResponse {
  detail: Array<PembayaranIuran & {
    /** @deprecated backward-compat alias */
    bulan?: number;
    /** @deprecated backward-compat alias */
    jenis?: string;
    /** @deprecated backward-compat alias — use jumlahBayar */
    jumlah?: number;
    /** @deprecated backward-compat alias */
    keterangan?: string;
  }>;
  totalBayar: number;
  targetPerBulan: number;
  status: string;
}

export interface HealthResponse {
  status: string;
  uptime: number;
  services: {
    redis: { status: string };
    database: { status: string };
  };
  system: {
    uptime: number;
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    nodeVersion: string;
    platform: string;
  };
}
