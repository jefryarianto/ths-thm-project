import { z } from 'zod';

// ─── Auth ───
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  password: z.string().optional(),
  otpCode: z.string().length(6, 'OTP must be 6 digits').optional(),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username min 3 characters'),
  email: z.string().email().optional().or(z.literal('')),
  nomorHp: z.string().min(10, 'Phone number min 10 digits'),
  password: z.string().min(6, 'Password min 6 characters'),
  nama: z.string().min(1, 'Name is required'),
});

export const otpVerifySchema = z.object({
  sessionId: z.string(),
  otpCode: z.string().length(6),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

// ─── Anggota ───
export const createAnggotaSchema = z.object({
  nomorAnggota: z.string().min(1),
  nama: z.string().min(1),
  tempatLahir: z.string().min(1),
  tanggalLahir: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  jenisKelamin: z.enum(['L', 'P']),
  alamat: z.string().min(1),
  nomorHp: z.string().min(10),
  email: z.string().email().optional().or(z.literal('')),
  rantingId: z.number().int().positive(),
  distrikId: z.number().int().positive(),
});

export const updateAnggotaSchema = createAnggotaSchema.partial();

// ─── Claim Membership ───
export const claimMembershipSchema = z.object({
  anggotaId: z.number().int().positive(),
  userId: z.number().int().positive(),
});

export const approveClaimSchema = z.object({
  catatanAdmin: z.string().optional(),
});

// ─── Organisasi ───
export const createOrganisasiSchema = z.object({
  tingkat: z.enum(['Distrik', 'Wilayah', 'Ranting']),
  nama: z.string().min(1),
  alamat: z.string().optional(),
  indukId: z.number().int().positive().optional(),
});

// ─── Kegiatan ───
export const createKegiatanSchema = z.object({
  nama: z.string().min(1),
  jenis: z.string().min(1),
  tanggalMulai: z.string().regex(/^\d{4}-\d{2}-\d{2}T/),
  tanggalSelesai: z.string().regex(/^\d{4}-\d{2}-\d{2}T/).optional(),
  lokasi: z.string().min(1),
  penyelenggaraId: z.number().int().positive(),
});

// ─── Latihan ───
export const createLatihanSchema = z.object({
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hari: z.string().min(1),
  lokasi: z.string().min(1),
  jumlahAnggotaHadir: z.number().int().min(0),
  jumlahCalonHadir: z.number().int().min(0),
  jenisMateri: z.string().min(1),
  rantingId: z.number().int().positive(),
});

// ─── Iuran ───
export const createIuranSchema = z.object({
  anggotaId: z.number().int().positive(),
  jenis: z.enum(['Wajib', 'Sukarela', 'Khusus']),
  jumlah: z.number().positive(),
  tanggalBayar: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bulan: z.number().int().min(1).max(12),
  tahun: z.number().int().min(2020),
  keterangan: z.string().optional(),
});

// ─── Pendadaran ───
export const createPendadaranSchema = z.object({
  anggotaId: z.number().int().positive(),
  kegiatanId: z.number().int().positive(),
});

export const inputNilaiSchema = z.object({
  nilai: z.array(
    z.object({
      itemId: z.number().int().positive(),
      nilai: z.number().int().min(0).max(100),
    }),
  ),
});

// ─── Konten ───
export const createKontenSchema = z.object({
  judul: z.string().min(1),
  jenis: z.enum(['Berita', 'Artikel', 'Video', 'Acara']),
  konten: z.string().min(1),
});

export const reviewKontenSchema = z.object({
  status: z.enum(['Dipublikasikan', 'Ditolak']),
  catatanReview: z.string().optional(),
});

// ─── Role ───
export const createRoleSchema = z.object({
  nama: z.string().min(1),
  scope: z.string().min(1),
  permissions: z.array(z.string()),
});

// ─── Pagination ───
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});
