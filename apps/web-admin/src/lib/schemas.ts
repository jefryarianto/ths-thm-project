import { z } from "zod";

export const anggotaSchema = z.object({
  namaLengkap: z.string().min(1, "Nama wajib diisi").max(200, "Nama terlalu panjang"),
  nomorAnggota: z.string().max(50).default(""),
  tanggalLahir: z.string().default(""),
  jenisKelamin: z.string().default(""),
  alamat: z.string().max(500, "Alamat terlalu panjang").default(""),
  rantingId: z.string().default(""),
  statusKeanggotaan: z.string().default("aktif"),
  noHp: z.string().max(20).default(""),
  tempatLahir: z.string().max(100).default(""),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
});

export type AnggotaFormValues = z.infer<typeof anggotaSchema>;

export const iuranSchema = z.object({
  anggotaId: z.string().min(1, "ID Anggota wajib diisi"),
  jenis: z.string().min(1, "Jenis iuran wajib dipilih"),
  jumlah: z.string().min(1, "Jumlah iuran wajib diisi"),
  bulan: z.coerce.number().min(1).max(12),
  tahun: z.coerce.number().min(2020).max(2100),
  keterangan: z.string().default(""),
});

export const pembayaranIuranSchema = z.object({
  anggotaId: z.string().min(1, "ID Anggota wajib diisi"),
  jenisIuranId: z.string().min(1, "Jenis Iuran ID wajib diisi"),
  jumlahBayar: z.string().min(1, "Jumlah wajib diisi"),
  metodeBayar: z.string().default("tunai"),
  tanggalBayar: z.string().default(() => new Date().toISOString().split("T")[0]),
});

export type PembayaranIuranFormValues = z.infer<typeof pembayaranIuranSchema>;

export const loginSchema = z.object({
  identifier: z.string().min(1, "Username/email/nomor HP wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const kegiatanSchema = z.object({
  nama: z.string().min(1, "Nama kegiatan wajib diisi").max(200, "Nama terlalu panjang"),
  tipe: z.string().min(1, "Tipe kegiatan wajib dipilih"),
  tanggalMulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  lokasi: z.string().min(1, "Lokasi wajib diisi").max(300, "Lokasi terlalu panjang"),
  scopeType: z.string().default("distrik"),
  scopeId: z.string().default(""),
});

export type KegiatanFormValues = z.infer<typeof kegiatanSchema>;

export const suratSchema = z.object({
  jenis: z.string().default("masuk"),
  nomorSurat: z.string().min(1, "Nomor surat wajib diisi").max(100, "Nomor surat terlalu panjang"),
  pengirim: z.string().max(200).default(""),
  tujuan: z.string().max(200).default(""),
  perihal: z.string().min(1, "Perihal wajib diisi").max(500, "Perihal terlalu panjang"),
  tanggalSurat: z.string().min(1, "Tanggal surat wajib diisi"),
  keterangan: z.string().max(500).default(""),
});

export type SuratFormValues = z.infer<typeof suratSchema>;

export const latihanSchema = z.object({
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  hari: z.string().min(1, "Hari wajib dipilih"),
  lokasi: z.string().min(1, "Lokasi wajib diisi").max(300, "Lokasi terlalu panjang"),
  jenisMateri: z.string().min(1, "Jenis materi wajib diisi").max(200, "Materi terlalu panjang"),
  jumlahAnggotaHadir: z.coerce.number().min(0).default(0),
  jumlahCalonHadir: z.coerce.number().min(0).default(0),
  hasilLatihanGlobal: z.string().optional(),
  rekomendasiLatihanBerikutnya: z.string().optional(),
});

export type LatihanFormValues = z.infer<typeof latihanSchema>;

export const pendadaranSchema = z.object({
  kegiatanId: z.string().min(1, "ID Kegiatan wajib diisi"),
  calonAnggotaId: z.string().min(1, "ID Calon Anggota wajib diisi"),
  statusKelulusan: z.string().min(1, "Status wajib dipilih"),
  totalSkor: z.coerce.number().min(0).max(100).optional(),
  ranking: z.coerce.number().min(1).optional(),
});

export type PendadaranFormValues = z.infer<typeof pendadaranSchema>;

export const kontenSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi").max(300, "Judul terlalu panjang"),
  jenis: z.string().min(1, "Jenis konten wajib dipilih"),
  konten: z.string().min(1, "Konten wajib diisi"),
  ringkasan: z.string().max(500).default(""),
  status: z.string().default("Draft"),
});

export type KontenFormValues = z.infer<typeof kontenSchema>;

export const pustakaSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi").max(300, "Judul terlalu panjang"),
  jenis: z.string().min(1, "Jenis pustaka wajib dipilih"),
  deskripsi: z.string().max(1000, "Deskripsi terlalu panjang").default(""),
  fileUrl: z.string().max(500).default(""),
  isPublic: z.boolean().default(true),
});

export type PustakaFormValues = z.infer<typeof pustakaSchema>;

export const organisasiSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi").max(200, "Nama terlalu panjang"),
  kode: z.string().max(50).default(""),
  alamat: z.string().max(500).default(""),
  tingkat: z.string().default("ranting"),
});

export type OrganisasiFormValues = z.infer<typeof organisasiSchema>;

export type LoginFormValues = z.infer<typeof loginSchema>;
