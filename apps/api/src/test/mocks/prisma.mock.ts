import { PrismaService } from '../../prisma/prisma.service.js';

/**
 * Create a mock PrismaService with all methods as jest.fn().
 * Each call to createPrismaMock() returns a fresh mock instance
 * so tests are fully isolated.
 */
export function createPrismaMock() {
  const mk = () => ({
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  });

  return {
    user: mk(),
    notification: mk(),
    role: mk(),
    anggota: mk(),
    ranting: mk(),
    wilayah: mk(),
    distrik: mk(),
    nasional: mk(),
    unitLatihan: mk(),
    kegiatan: mk(),
    latihan: mk(),
    absensiKegiatan: mk(),
    absensiLatihan: mk(),
    jenisIuran: mk(),
    pembayaranIuran: mk(),
    suratMasuk: mk(),
    suratKeluar: mk(),
    konten: mk(),
    aspekPenilaian: mk(),
    itemPenilaian: mk(),
    nilaiPendadaran: mk(),
    hasilPendadaran: mk(),
    pengujiKegiatan: mk(),
    calonAnggota: mk(),
    anggotaRole: mk(),
    anggotaUpdateRequest: mk(),
    claimAnggota: mk(),
    auditLog: mk(),
    issuedDocument: mk(),
    documentType: mk(),
    documentTemplate: mk(),
    documentValidationLog: mk(),
    pustaka: mk(),
    importJob: mk(),
    importRowLog: mk(),
    organisasiDokumen: mk(),
    $queryRaw: jest.fn(),
    $transaction: jest.fn((cb: any) => cb({
      claimAnggota: mk(),
      user: mk(),
    })),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };
}
