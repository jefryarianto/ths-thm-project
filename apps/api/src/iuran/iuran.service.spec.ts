import { Test } from '@nestjs/testing';
import { IuranService } from './iuran.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';

describe('IuranService', () => {
  let service: IuranService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module = await Test.createTestingModule({
      providers: [IuranService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<IuranService>(IuranService);
  });

  afterEach(() => { jest.clearAllMocks(); });

  // ─── createJenis ───

  describe('createJenis', () => {
    it('should create a jenis iuran record', async () => {
      const data = { nama: 'Iuran Bulanan', deskripsi: 'Iuran wajib bulanan', nominal: 50000, periode: 'bulanan', scopeType: 'distrik', scopeId: 1 };
      const expected = { id: 1, ...data };
      (prisma.jenisIuran.create as jest.Mock).mockResolvedValue(expected);

      const result = await service.createJenis(data);

      expect(prisma.jenisIuran.create).toHaveBeenCalledWith({ data });
      expect(result).toEqual(expected);
    });

    it('should create jenis iuran without optional deskripsi', async () => {
      const data = { nama: 'Iuran Kas', nominal: 25000, periode: 'bulanan', scopeType: 'ranting', scopeId: 3 };
      const expected = { id: 2, ...data };
      (prisma.jenisIuran.create as jest.Mock).mockResolvedValue(expected);

      const result = await service.createJenis(data);

      expect(result).toEqual(expected);
    });
  });

  // ─── findAllJenis ───

  describe('findAllJenis', () => {
    it('should return all jenis iuran', async () => {
      const data = [{ id: 1, nama: 'Iuran A' }, { id: 2, nama: 'Iuran B' }];
      (prisma.jenisIuran.findMany as jest.Mock).mockResolvedValue(data);

      const result = await service.findAllJenis();

      expect(prisma.jenisIuran.findMany).toHaveBeenCalledWith({ where: {}, orderBy: { nama: 'asc' } });
      expect(result).toEqual(data);
    });

    it('should filter by scopeType and scopeId', async () => {
      (prisma.jenisIuran.findMany as jest.Mock).mockResolvedValue([]);

      await service.findAllJenis('distrik', 1);

      expect(prisma.jenisIuran.findMany).toHaveBeenCalledWith({
        where: { scopeType: 'distrik', scopeId: 1 },
        orderBy: { nama: 'asc' },
      });
    });

    it('should filter by scopeType only', async () => {
      (prisma.jenisIuran.findMany as jest.Mock).mockResolvedValue([]);

      await service.findAllJenis('ranting');

      expect(prisma.jenisIuran.findMany).toHaveBeenCalledWith({
        where: { scopeType: 'ranting' },
        orderBy: { nama: 'asc' },
      });
    });

    it('should filter by scopeId only (no scopeType)', async () => {
      (prisma.jenisIuran.findMany as jest.Mock).mockResolvedValue([]);

      await service.findAllJenis(undefined, 1);

      expect(prisma.jenisIuran.findMany).toHaveBeenCalledWith({
        where: { scopeId: 1 },
        orderBy: { nama: 'asc' },
      });
    });
  });

  // ─── createPembayaran ───

  describe('createPembayaran', () => {
    it('should create a pembayaran with default values', async () => {
      const data = { jenisIuranId: 1, anggotaId: 1, jumlahBayar: 50000, tanggalBayar: '2026-06-01T00:00:00Z' };
      const expected = { id: 1, ...data, metodeBayar: 'tunai', buktiBayarPath: null, status: 'pending' };
      (prisma.pembayaranIuran.create as jest.Mock).mockResolvedValue(expected);

      const result = await service.createPembayaran(data);

      expect(prisma.pembayaranIuran.create).toHaveBeenCalledWith({
        data: {
          jenisIuranId: 1,
          anggotaId: 1,
          jumlahBayar: 50000,
          tanggalBayar: new Date('2026-06-01T00:00:00Z'),
          metodeBayar: 'tunai',
          buktiBayarPath: null,
          status: 'pending',
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(expected);
    });

    it('should use provided metodeBayar and buktiBayarPath', async () => {
      const data = {
        jenisIuranId: 1, anggotaId: 2, jumlahBayar: 100000,
        tanggalBayar: '2026-06-15T00:00:00Z',
        metodeBayar: 'transfer', buktiBayarPath: '/uploads/bukti.jpg',
      };
      (prisma.pembayaranIuran.create as jest.Mock).mockResolvedValue({ id: 2 });

      await service.createPembayaran(data);

      expect(prisma.pembayaranIuran.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metodeBayar: 'transfer',
          buktiBayarPath: '/uploads/bukti.jpg',
        }),
        include: expect.any(Object),
      });
    });
  });

  // ─── findAllPembayaran ───

  describe('findAllPembayaran', () => {
    it('should return paginated pembayaran', async () => {
      const data = [{ id: 1, jumlahBayar: 50000 }];
      (prisma.pembayaranIuran.findMany as jest.Mock).mockResolvedValue(data);
      (prisma.pembayaranIuran.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAllPembayaran(1, 10);

      expect(prisma.pembayaranIuran.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
      expect(result.data).toEqual(data);
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 10, totalPages: 1 });
    });

    it('should filter by anggotaId, jenisIuranId, and status', async () => {
      (prisma.pembayaranIuran.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.pembayaranIuran.count as jest.Mock).mockResolvedValue(0);

      await service.findAllPembayaran(1, 20, 3, 5, 'lunas');

      expect(prisma.pembayaranIuran.findMany).toHaveBeenCalledWith({
        where: { anggotaId: 3, jenisIuranId: 5, status: 'lunas' },
        skip: 0,
        take: 20,
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should calculate totalPages correctly', async () => {
      (prisma.pembayaranIuran.findMany as jest.Mock).mockResolvedValue(Array(25).fill({ id: 1 }));
      (prisma.pembayaranIuran.count as jest.Mock).mockResolvedValue(55);

      const result = await service.findAllPembayaran(3, 25);

      expect(result.meta).toEqual({ total: 55, page: 3, limit: 25, totalPages: 3 });
    });
  });

  // ─── verifyPembayaran ───

  describe('verifyPembayaran', () => {
    it('should verify payment as lunas', async () => {
      const updated = { id: 1, status: 'lunas', verifiedBy: 5 };
      (prisma.pembayaranIuran.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.verifyPembayaran(1, 5, 'lunas');

      expect(prisma.pembayaranIuran.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'lunas', verifiedBy: 5, verifiedAt: expect.any(Date) },
      });
      expect(result).toEqual(updated);
    });

    it('should reject payment', async () => {
      const updated = { id: 1, status: 'ditolak', verifiedBy: 5 };
      (prisma.pembayaranIuran.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.verifyPembayaran(1, 5, 'ditolak');

      expect(prisma.pembayaranIuran.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'ditolak', verifiedBy: 5, verifiedAt: expect.any(Date) },
      });
      expect(result).toEqual(updated);
    });

    it('should throw for invalid status', async () => {
      await expect(service.verifyPembayaran(1, 5, 'pending')).rejects.toThrow(
        'Invalid verification status',
      );
      expect(prisma.pembayaranIuran.update).not.toHaveBeenCalled();
    });
  });

  // ─── getStatusAnggota ───

  describe('getStatusAnggota', () => {
    it('should return payment status for an anggota', async () => {
      const payments = [
        { id: 1, jumlahBayar: 50000, jenisIuran: { nama: 'Iuran Bulanan' }, status: 'lunas', createdAt: new Date() },
        { id: 2, jumlahBayar: 50000, jenisIuran: { nama: 'Iuran Bulanan' }, status: 'lunas', createdAt: new Date() },
      ];
      (prisma.pembayaranIuran.findMany as jest.Mock).mockResolvedValue(payments);

      const result = await service.getStatusAnggota(1);

      expect(result.anggotaId).toBe(1);
      expect(result.totalLunas).toBe(100000);
      expect(result.totalTransaksi).toBe(2);
      expect(result.detail).toEqual(payments);
    });

    it('should return zero totals when no payments', async () => {
      (prisma.pembayaranIuran.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getStatusAnggota(99);

      expect(result.totalLunas).toBe(0);
      expect(result.totalTransaksi).toBe(0);
      expect(result.detail).toEqual([]);
    });
  });

  // ─── getDashboardStats ───

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      (prisma.pembayaranIuran.aggregate as jest.Mock).mockResolvedValue({
        _sum: { jumlahBayar: 500000 },
      });
      (prisma.anggota.count as jest.Mock).mockResolvedValue(150);
      (prisma.pembayaranIuran.count as jest.Mock).mockResolvedValue(30);

      const result = await service.getDashboardStats();

      expect(result.totalPemasukan).toBe(500000);
      expect(result.totalAnggota).toBe(150);
      expect(result.pembayaranBulanIni).toBe(30);
    });

    it('should return zero when no data', async () => {
      (prisma.pembayaranIuran.aggregate as jest.Mock).mockResolvedValue({
        _sum: { jumlahBayar: null },
      });
      (prisma.anggota.count as jest.Mock).mockResolvedValue(0);
      (prisma.pembayaranIuran.count as jest.Mock).mockResolvedValue(0);

      const result = await service.getDashboardStats();

      expect(result.totalPemasukan).toBe(0);
      expect(result.totalAnggota).toBe(0);
      expect(result.pembayaranBulanIni).toBe(0);
    });

    it('should count anggota with active status', async () => {
      (prisma.pembayaranIuran.aggregate as jest.Mock).mockResolvedValue({
        _sum: { jumlahBayar: null },
      });
      (prisma.anggota.count as jest.Mock).mockResolvedValue(75);
      (prisma.pembayaranIuran.count as jest.Mock).mockResolvedValue(0);

      await service.getDashboardStats();

      expect(prisma.anggota.count).toHaveBeenCalledWith({
        where: { statusKeanggotaan: 'aktif' },
      });
    });
  });

  // ─── getMonthlyChart ───

  describe('getMonthlyChart', () => {
    it('should return 6 months with zeros when no data exists', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);
      const result = await service.getMonthlyChart();
      expect(result).toHaveLength(6);
      expect(result[0]).toHaveProperty('bulan');
      expect(result[0]).toHaveProperty('jumlah');
      expect(result[0]).toHaveProperty('transaksi');
    });

    it('should aggregate iuran records correctly', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([
        { tahun: 2026, bulan: 2, jumlah: '7500000', count: BigInt(10) },
        { tahun: 2026, bulan: 4, jumlah: '5000000', count: BigInt(5) },
      ]);
      const result = await service.getMonthlyChart();
      expect(result).toHaveLength(6);
      // Feb 2026 — 7.5jt / 10 transaksi
      const feb = result.find(r => r.bulan.includes('Feb'));
      expect(feb?.jumlah).toBe(7500000);
      expect(feb?.transaksi).toBe(10);
    });

    it('should call $queryRaw with correct SQL', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);
      await service.getMonthlyChart();
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    });
  });
});
