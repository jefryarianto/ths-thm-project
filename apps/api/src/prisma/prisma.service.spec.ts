import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service.js';

// ─── Mock PrismaClient ───

const mockConnect = jest.fn();
const mockDisconnect = jest.fn();

// Common model methods used by consumers
function mkModel() {
  return {
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
  };
}

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(function (this: any) {
    this.$connect = mockConnect;
    this.$disconnect = mockDisconnect;
    this.$queryRaw = jest.fn();
    this.$transaction = jest.fn();

    // Simulate PrismaClient model delegates
    this.user = mkModel();
    this.anggota = mkModel();
    this.role = mkModel();
    this.kegiatan = mkModel();
    this.latihan = mkModel();
    this.iuran = mkModel();
    this.notification = mkModel();
    this.auditLog = mkModel();
    this.calonAnggota = mkModel();
    this.ranting = mkModel();
    this.wilayah = mkModel();
    this.distrik = mkModel();
    this.nasional = mkModel();
    this.pembayaranIuran = mkModel();
    this.suratMasuk = mkModel();
    this.suratKeluar = mkModel();
    this.konten = mkModel();
    this.pustaka = mkModel();
    this.jenisIuran = mkModel();
    this.aspekPenilaian = mkModel();
    this.itemPenilaian = mkModel();
    this.nilaiPendadaran = mkModel();
    this.hasilPendadaran = mkModel();
    this.pengujiKegiatan = mkModel();
    this.claimAnggota = mkModel();
    this.issuedDocument = mkModel();
    this.documentType = mkModel();
    this.documentTemplate = mkModel();
    this.anggotaRole = mkModel();
    this.anggotaUpdateRequest = mkModel();
    this.absensiKegiatan = mkModel();
    this.absensiLatihan = mkModel();
    this.documentValidationLog = mkModel();
  }),
}));

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  // ──────────────────────────────────────────────
  //  PrismaModel delegates (from extends PrismaClient)
  // ──────────────────────────────────────────────

  describe('model delegates', () => {
    it('should have user model with standard CRUD methods', () => {
      expect(service.user).toBeDefined();
      expect(service.user.findUnique).toBeDefined();
      expect(service.user.findFirst).toBeDefined();
      expect(service.user.findMany).toBeDefined();
      expect(service.user.create).toBeDefined();
      expect(service.user.update).toBeDefined();
      expect(service.user.delete).toBeDefined();
    });

    it('should have anggota model delegates', () => {
      expect(service.anggota).toBeDefined();
      expect(service.anggota.findMany).toBeDefined();
    });

    it('should have $queryRaw and $transaction methods', () => {
      expect(service.$queryRaw).toBeDefined();
      expect(service.$transaction).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────
  //  onModuleInit()
  // ──────────────────────────────────────────────

  describe('onModuleInit', () => {
    it('should call $connect when module initializes', async () => {
      mockConnect.mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(mockConnect).toHaveBeenCalledTimes(1);
    });
  });

  // ──────────────────────────────────────────────
  //  onModuleDestroy()
  // ──────────────────────────────────────────────

  describe('onModuleDestroy', () => {
    it('should call $disconnect when module is destroyed', async () => {
      mockDisconnect.mockResolvedValue(undefined);

      await service.onModuleDestroy();

      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });
  });
});
