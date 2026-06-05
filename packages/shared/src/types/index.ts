// ─── User & Auth ───
export interface User {
  id: number;
  uuid: string;
  username: string;
  email: string | null;
  nomorHp: string;
  passwordHash: string;
  roleId: number;
  anggotaId: number | null;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  sub: number;
  uuid: string;
  role: string;
  scope: string;
}

export interface LoginRequest {
  identifier: string; // username, email, or nomor HP
  password?: string;
  otpCode?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ─── Anggota (Member) ───
export interface Anggota {
  id: number;
  uuid: string;
  nomorAnggota: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: Date;
  jenisKelamin: 'L' | 'P';
  alamat: string;
  nomorHp: string;
  email: string | null;
  fotoUrl: string | null;
  status: string;
  rantingId: number;
  wilayahId: number;
  distrikId: number;
  tanggalDadar: Date | null;
  tempatDadar: string | null;
  level: string | null;
  berlakuSampai: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Claim Membership ───
export interface ClaimMembership {
  id: number;
  uuid: string;
  userId: number;
  anggotaId: number;
  status: string;
  catatanAdmin: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Organisasi ───
export interface Organisasi {
  id: number;
  uuid: string;
  tingkat: string;
  nama: string;
  alamat: string | null;
  indukId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Kegiatan & Latihan ───
export interface Kegiatan {
  id: number;
  uuid: string;
  nama: string;
  jenis: string;
  tanggalMulai: Date;
  tanggalSelesai: Date | null;
  lokasi: string;
  penyelenggaraId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Latihan {
  id: number;
  uuid: string;
  tanggal: Date;
  hari: string;
  lokasi: string;
  jumlahAnggotaHadir: number;
  jumlahCalonHadir: number;
  jenisMateri: string;
  pelatihId: number;
  rantingId: number;
  createdAt: Date;
}

// ─── Absensi ───
export interface Absensi {
  id: number;
  uuid: string;
  anggotaId: number;
  kegiatanId: number | null;
  latihanId: number | null;
  hadir: boolean;
  keterangan: string | null;
  createdAt: Date;
}

// ─── Iuran (Dues) ───
export interface Iuran {
  id: number;
  uuid: string;
  anggotaId: number;
  jenis: string;
  jumlah: number;
  tanggalBayar: Date;
  bulan: number;
  tahun: number;
  keterangan: string | null;
  createdAt: Date;
}

// ─── Pendadaran ───
export interface PendadaranAspek {
  id: number;
  nama: string;
  bobot: number;
  urutan: number;
  deskripsi: string | null;
}

export interface PendadaranItem {
  id: number;
  aspekId: number;
  nama: string;
  minScore: number;
  maxScore: number;
  urutan: number;
  deskripsi: string | null;
}

export interface Pendadaran {
  id: number;
  uuid: string;
  anggotaId: number;
  kegiatanId: number;
  nilaiAkhir: number | null;
  predikat: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PendadaranNilai {
  id: number;
  pendadaranId: number;
  itemId: number;
  nilai: number;
  createdAt: Date;
}

// ─── Dokumen ───
export interface KartuAnggota {
  id: number;
  uuid: string;
  anggotaId: number;
  nomorKartu: string;
  fileUrl: string;
  qrToken: string;
  diterbitkanOleh: number;
  berlakuSampai: Date;
  createdAt: Date;
}

export interface Sertifikat {
  id: number;
  uuid: string;
  anggotaId: number;
  pendadaranId: number;
  nomorSertifikat: string;
  fileUrl: string;
  qrToken: string;
  diterbitkanOleh: number;
  createdAt: Date;
}

export interface Piagam {
  id: number;
  uuid: string;
  anggotaId: number;
  prestasi: string;
  fileUrl: string;
  qrToken: string;
  diterbitkanOleh: number;
  createdAt: Date;
}

// ─── Content ───
export interface Konten {
  id: number;
  uuid: string;
  judul: string;
  jenis: string;
  konten: string;
  status: string;
  penulisId: number;
  reviewerId: number | null;
  catatanReview: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Audit ───
export interface AuditLog {
  id: number;
  uuid: string;
  userId: number;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

// ─── Pagination ───
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
