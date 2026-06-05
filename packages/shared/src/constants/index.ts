export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN_DISTRIK: 'admin_distrik',
  PENGURUS_RANTING: 'pengurus_ranting',
  PELATIH: 'pelatih',
  ANGGOTA: 'anggota',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ANGGOTA_STATUS = {
  AKTIF: 'Aktif',
  NONAKTIF: 'Nonaktif',
  ALIH_STATUS: 'Alih Status',
  MENINGGAL: 'Meninggal',
  KELUAR: 'Keluar',
} as const;

export type AnggotaStatus = (typeof ANGGOTA_STATUS)[keyof typeof ANGGOTA_STATUS];

export const CLAIM_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
} as const;

export type ClaimStatus = (typeof CLAIM_STATUS)[keyof typeof CLAIM_STATUS];

export const CONTENT_STATUS = {
  DRAFT: 'Draft',
  PENDING: 'Menunggu Persetujuan',
  PUBLISHED: 'Dipublikasikan',
  REJECTED: 'Ditolak',
} as const;

export type ContentStatus = (typeof CONTENT_STATUS)[keyof typeof CONTENT_STATUS];

export const CONTENT_TYPE = {
  BERITA: 'Berita',
  ARTIKEL: 'Artikel',
  VIDEO: 'Video',
  ACARA: 'Acara',
} as const;

export type ContentType = (typeof CONTENT_TYPE)[keyof typeof CONTENT_TYPE];

export const JENIS_IURAN = {
  WAJIB: 'Wajib',
  SUKARELA: 'Sukarela',
  KHUSUS: 'Khusus',
} as const;

export type JenisIuran = (typeof JENIS_IURAN)[keyof typeof JENIS_IURAN];

export const TINGKAT_ORGANISASI = {
  DISTRIK: 'Distrik',
  WILAYAH: 'Wilayah',
  RANTING: 'Ranting',
} as const;

export type TingkatOrganisasi = (typeof TINGKAT_ORGANISASI)[keyof typeof TINGKAT_ORGANISASI];

export const PENDADARAN_STATUS = {
  LULUS: 'Lulus',
  TIDAK_LULUS: 'Tidak Lulus',
  MENUNGGU: 'Menunggu',
} as const;

export type PendadaranStatus = (typeof PENDADARAN_STATUS)[keyof typeof PENDADARAN_STATUS];

export const AUDIT_ACTION = {
  LOGIN: 'LOGIN',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  GENERATE_DOCUMENT: 'GENERATE_DOCUMENT',
  UPDATE_ANGGOTA: 'UPDATE_ANGGOTA',
  PAYMENT_RECORD: 'PAYMENT_RECORD',
  SK_ASSIGNMENT: 'SK_ASSIGNMENT',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const;

export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];

export const PREDIKAT_RANGE = {
  CUKUP: { min: 55, max: 65, label: 'Cukup' },
  BAIK: { min: 66, max: 75, label: 'Baik' },
  BAIK_SEKALI: { min: 76, max: 90, label: 'Baik Sekali' },
} as const;
