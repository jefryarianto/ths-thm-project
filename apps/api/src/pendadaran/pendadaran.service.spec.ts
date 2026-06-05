import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PendadaranService } from './pendadaran.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';

const mockAspekList = [
  { id: 1, kodeAspek: 'KEDISIPLINAN', namaAspek: 'Kedisiplinan', bobot: 3, isActive: true,
    itemPenilaian: [
      { id: 1, aspekId: 1, kodeItem: 'HADIR', namaItem: 'Kehadiran', skorMaksimal: 90, bobot: 1, urutan: 1, isActive: true },
      { id: 2, aspekId: 1, kodeItem: 'TEPAT', namaItem: 'Ketepatan Waktu', skorMaksimal: 90, bobot: 1, urutan: 2, isActive: true },
    ],
  },
  { id: 2, kodeAspek: 'PENGETAHUAN', namaAspek: 'Pengetahuan', bobot: 2, isActive: true,
    itemPenilaian: [
      { id: 3, aspekId: 2, kodeItem: 'TEORI', namaItem: 'Teori', skorMaksimal: 90, bobot: 1, urutan: 1, isActive: true },
    ],
  },
];

const mockHasil = {
  id: 1, kegiatanId: 5, calonAnggotaId: 10, totalSkor: 79, ranking: 1, statusKelulusan: 'lulus', statusValidasi: 'pending',
  calonAnggota: { id: 10, namaLengkap: 'Budi Santoso' },
  kegiatan: { id: 5, nama: 'Pendadaran Distrik' },
};



describe('PendadaranService', () => {
  let service: PendadaranService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [PendadaranService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<PendadaranService>(PendadaranService);
  });

  afterEach(() => { jest.clearAllMocks(); });

  describe('getAspek', () => {
    it('should return all aspek dengan item terurut', async () => {
      (prisma.aspekPenilaian.findMany as jest.Mock).mockResolvedValue(mockAspekList);
      const result = await service.getAspek();
      expect(prisma.aspekPenilaian.findMany).toHaveBeenCalledWith({
        include: { itemPenilaian: { orderBy: { urutan: 'asc' } } },
        orderBy: { id: 'asc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].itemPenilaian).toHaveLength(2);
    });
  });

  describe('hitungHasil', () => {
    it('should calculate weighted score and ranking', async () => {
      const nilaiList = [
        { id: 1, skor: 80, itemPenilaian: { aspekId: 1, aspek: { bobot: 3 } } },
        { id: 2, skor: 70, itemPenilaian: { aspekId: 1, aspek: { bobot: 3 } } },
        { id: 3, skor: 85, itemPenilaian: { aspekId: 2, aspek: { bobot: 2 } } },
      ];
      (prisma.nilaiPendadaran.findMany as jest.Mock).mockResolvedValue(nilaiList);
      (prisma.hasilPendadaran.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.hasilPendadaran.upsert as jest.Mock).mockResolvedValue(mockHasil);

      const result = await service.hitungHasil(5, 10);
      expect(result).toEqual(mockHasil);
    });

    it('should throw NotFoundException when no nilai found', async () => {
      (prisma.nilaiPendadaran.findMany as jest.Mock).mockResolvedValue([]);

      await expect(service.hitungHasil(5, 10)).rejects.toThrow(NotFoundException);
    });

    it('should determine gagal when totalSkor < 55', async () => {
      const nilaiList = [
        { id: 1, skor: 30, itemPenilaian: { aspekId: 1, aspek: { bobot: 3 } } },
      ];
      (prisma.nilaiPendadaran.findMany as jest.Mock).mockResolvedValue(nilaiList);
      (prisma.hasilPendadaran.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.hasilPendadaran.upsert as jest.Mock).mockResolvedValue({
        id: 2, kegiatanId: 5, calonAnggotaId: 10, totalSkor: 30, ranking: 1, statusKelulusan: 'gagal',
      });

      const result = await service.hitungHasil(5, 10);

      expect(result.statusKelulusan).toBe('gagal');
      expect(result.totalSkor).toBe(30);
    });

    it('should handle totalBobot=0 edge case', async () => {
      // All aspek bobot sum to 0, triggering the ternary false branch
      const nilaiList = [
        { id: 1, skor: 50, itemPenilaian: { aspekId: 1, aspek: { bobot: 0 } } },
      ];
      (prisma.nilaiPendadaran.findMany as jest.Mock).mockResolvedValue(nilaiList);
      (prisma.hasilPendadaran.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.hasilPendadaran.upsert as jest.Mock).mockResolvedValue({
        id: 3, kegiatanId: 5, calonAnggotaId: 10, totalSkor: 0, ranking: 1, statusKelulusan: 'gagal',
      });

      const result = await service.hitungHasil(5, 10);

      expect(result.totalSkor).toBe(0);
      expect(result.statusKelulusan).toBe('gagal');
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      (prisma.hasilPendadaran.findMany as jest.Mock).mockResolvedValue([mockHasil]);
      (prisma.hasilPendadaran.count as jest.Mock).mockResolvedValue(1);
      const result = await service.findAll();
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by kegiatanId', async () => {
      (prisma.hasilPendadaran.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.hasilPendadaran.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(5);

      expect(prisma.hasilPendadaran.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { kegiatanId: 5 } }),
      );
    });

    it('should filter by status validasi', async () => {
      (prisma.hasilPendadaran.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.hasilPendadaran.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(undefined, 'lulus');

      expect(prisma.hasilPendadaran.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { statusValidasi: 'lulus' } }),
      );
    });
  });

  // ─── createAspek ───

  describe('createAspek', () => {
    it('should create aspek penilaian', async () => {
      const data = { kodeAspek: 'KOMUNIKASI', namaAspek: 'Komunikasi', bobot: 2 };
      (prisma.aspekPenilaian.create as jest.Mock).mockResolvedValue({ id: 1, ...data });

      const result = await service.createAspek(data);

      expect(prisma.aspekPenilaian.create).toHaveBeenCalledWith({ data });
      expect(result).toEqual({ id: 1, kodeAspek: 'KOMUNIKASI', namaAspek: 'Komunikasi', bobot: 2 });
    });
  });

  // ─── createItem ───

  describe('createItem', () => {
    it('should create item penilaian', async () => {
      const data = { aspekId: 1, kodeItem: 'SIAP', namaItem: 'Kesiapan', skorMaksimal: 100, bobot: 1, urutan: 3 };
      (prisma.itemPenilaian.create as jest.Mock).mockResolvedValue({ id: 4, ...data });

      const result = await service.createItem(data);

      expect(prisma.itemPenilaian.create).toHaveBeenCalledWith({ data });
      expect(result.namaItem).toBe('Kesiapan');
    });
  });

  // ─── assignPenguji ───

  describe('assignPenguji', () => {
    it('should assign penguji to kegiatan', async () => {
      const data = { kegiatanId: 5, pengujiUserId: 3, peran: 'ketua' };
      (prisma.pengujiKegiatan.create as jest.Mock).mockResolvedValue({ id: 1, ...data });

      const result = await service.assignPenguji(data);

      expect(prisma.pengujiKegiatan.create).toHaveBeenCalledWith({ data });
      expect(result.peran).toBe('ketua');
    });
  });

  // ─── getPengujiByKegiatan ───

  describe('getPengujiByKegiatan', () => {
    it('should return penguji for kegiatan', async () => {
      const penguji = [{ id: 1, kegiatanId: 5, penguji: { id: 3, name: 'Penguji A' } }];
      (prisma.pengujiKegiatan.findMany as jest.Mock).mockResolvedValue(penguji);

      const result = await service.getPengujiByKegiatan(5);

      expect(prisma.pengujiKegiatan.findMany).toHaveBeenCalledWith({
        where: { kegiatanId: 5 },
        include: { penguji: { select: { id: true, name: true } } },
      });
      expect(result).toEqual(penguji);
    });
  });

  // ─── inputNilai ───

  describe('inputNilai', () => {
    it('should upsert nilai pendadaran', async () => {
      const data = { kegiatanId: 5, calonAnggotaId: 10, itemPenilaianId: 1, pengujiUserId: 3, skor: 85, komentar: 'Baik' };
      (prisma.nilaiPendadaran.upsert as jest.Mock).mockResolvedValue({ id: 1, ...data });

      const result = await service.inputNilai(data);

      expect(prisma.nilaiPendadaran.upsert).toHaveBeenCalledWith({
        where: {
          kegiatanId_calonAnggotaId_itemPenilaianId_pengujiUserId: {
            kegiatanId: 5, calonAnggotaId: 10, itemPenilaianId: 1, pengujiUserId: 3,
          },
        },
        update: { skor: 85, komentar: 'Baik' },
        create: {
          kegiatanId: 5, calonAnggotaId: 10, itemPenilaianId: 1, pengujiUserId: 3,
          skor: 85, komentar: 'Baik',
        },
      });
      expect(result).toEqual({ id: 1, ...data });
    });
  });

  // ─── inputNilaiBulk ───

  describe('inputNilaiBulk', () => {
    it('should input multiple nilai and return results', async () => {
      const entries = [
        { itemPenilaianId: 1, skor: 80 },
        { itemPenilaianId: 2, skor: 90 },
      ];
      (prisma.nilaiPendadaran.upsert as jest.Mock)
        .mockResolvedValueOnce({ id: 1, skor: 80 })
        .mockResolvedValueOnce({ id: 2, skor: 90 });

      const results = await service.inputNilaiBulk(5, 10, 3, entries);

      expect(results).toHaveLength(2);
      expect(prisma.nilaiPendadaran.upsert).toHaveBeenCalledTimes(2);
    });
  });

  // ─── validasiHasil ───

  describe('validasiHasil', () => {
    it('should validate hasil pendadaran', async () => {
      (prisma.hasilPendadaran.update as jest.Mock).mockResolvedValue({
        ...mockHasil,
        statusValidasi: 'lulus',
      });

      const result = await service.validasiHasil(5, 10, 2, 'lulus');

      expect(prisma.hasilPendadaran.update).toHaveBeenCalledWith({
        where: { kegiatanId_calonAnggotaId: { kegiatanId: 5, calonAnggotaId: 10 } },
        data: { statusValidasi: 'lulus', divalidasiOleh: 2, divalidasiAt: expect.any(Date) },
      });
      expect(result.statusValidasi).toBe('lulus');
    });
  });

  // ─── findByCalon ───

  describe('findByCalon', () => {
    it('should return hasil by calon anggota', async () => {
      (prisma.hasilPendadaran.findMany as jest.Mock).mockResolvedValue([mockHasil]);

      const result = await service.findByCalon(10);

      expect(prisma.hasilPendadaran.findMany).toHaveBeenCalledWith({
        where: { calonAnggotaId: 10 },
        include: {
          kegiatan: { select: { id: true, nama: true, tipe: true, lokasi: true } },
          validator: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual([mockHasil]);
    });
  });

  // ─── getNilaiDetail ───

  describe('getNilaiDetail', () => {
    it('should return nilai detail with aspek and penguji', async () => {
      const nilaiDetail = [{
        id: 1, skor: 85,
        itemPenilaian: { id: 1, namaItem: 'Kehadiran', aspek: { id: 1, namaAspek: 'Kedisiplinan' } },
        penguji: { id: 3, name: 'Penguji A' },
      }];
      (prisma.nilaiPendadaran.findMany as jest.Mock).mockResolvedValue(nilaiDetail);

      const result = await service.getNilaiDetail(5, 10);

      expect(prisma.nilaiPendadaran.findMany).toHaveBeenCalledWith({
        where: { kegiatanId: 5, calonAnggotaId: 10 },
        include: {
          itemPenilaian: { include: { aspek: true } },
          penguji: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual(nilaiDetail);
    });
  });
});
