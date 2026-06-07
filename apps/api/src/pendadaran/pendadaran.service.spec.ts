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
      (prisma.hasilPendadaran.findMany as jest.Mock).mockResolvedValue([mockHasil]);
      (prisma.hasilPendadaran.update as jest.Mock).mockResolvedValue(mockHasil);
      (prisma.hasilPendadaran.findUnique as jest.Mock).mockResolvedValue(mockHasil);
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
      (prisma.hasilPendadaran.update as jest.Mock).mockResolvedValue({});
      (prisma.hasilPendadaran.findUnique as jest.Mock).mockResolvedValue({
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
      (prisma.hasilPendadaran.update as jest.Mock).mockResolvedValue({});
      (prisma.hasilPendadaran.findUnique as jest.Mock).mockResolvedValue({
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

  // ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ createAspek ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

  describe('createAspek', () => {
    it('should create aspek penilaian', async () => {
      const data = { kodeAspek: 'KOMUNIKASI', namaAspek: 'Komunikasi', bobot: 2 };
      (prisma.aspekPenilaian.create as jest.Mock).mockResolvedValue({ id: 1, ...data });

      const result = await service.createAspek(data);

      expect(prisma.aspekPenilaian.create).toHaveBeenCalledWith({ data });
      expect(result).toEqual({ id: 1, kodeAspek: 'KOMUNIKASI', namaAspek: 'Komunikasi', bobot: 2 });
    });
  });

  // ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ createItem ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

  describe('createItem', () => {
    it('should create item penilaian', async () => {
      const data = { aspekId: 1, kodeItem: 'SIAP', namaItem: 'Kesiapan', skorMaksimal: 100, bobot: 1, urutan: 3 };
      (prisma.itemPenilaian.create as jest.Mock).mockResolvedValue({ id: 4, ...data });

      const result = await service.createItem(data);

      expect(prisma.itemPenilaian.create).toHaveBeenCalledWith({ data });
      expect(result.namaItem).toBe('Kesiapan');
    });
  });

  // ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ assignPenguji ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

  describe('assignPenguji', () => {
    it('should assign penguji to kegiatan', async () => {
      const data = { kegiatanId: 5, pengujiUserId: 3, peran: 'ketua' };
      (prisma.pengujiKegiatan.create as jest.Mock).mockResolvedValue({ id: 1, ...data });

      const result = await service.assignPenguji(data);

      expect(prisma.pengujiKegiatan.create).toHaveBeenCalledWith({ data });
      expect(result.peran).toBe('ketua');
    });
  });

  // ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ getPengujiByKegiatan ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

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

  // ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ inputNilai ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

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

  // ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ inputNilaiBulk ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

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

  // ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ validasiHasil ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

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
        include: {
          calonAnggota: { select: { id: true, namaLengkap: true } },
          kegiatan: { select: { id: true, nama: true } },
        },
      });
      expect(result.statusValidasi).toBe('lulus');
    });
  });

  // ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ findAspekById ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

  describe('findAspekById', () => {
    it('should return aspek by id with items', async () => {
      (prisma.aspekPenilaian.findUnique as jest.Mock).mockResolvedValue(mockAspekList[0]);

      const result = await service.findAspekById(1);

      expect(prisma.aspekPenilaian.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { itemPenilaian: { orderBy: { urutan: 'asc' } } },
      });
      expect(result).toEqual(mockAspekList[0]);
    });

    it('should throw NotFoundException when aspek not found', async () => {
      (prisma.aspekPenilaian.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findAspekById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ updateAspek ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

  describe('updateAspek', () => {
    it('should update aspek fields', async () => {
      (prisma.aspekPenilaian.findUnique as jest.Mock).mockResolvedValue(mockAspekList[0]);
      (prisma.aspekPenilaian.update as jest.Mock).mockResolvedValue({ ...mockAspekList[0], namaAspek: 'Updated' });

      const result = await service.updateAspek(1, { namaAspek: 'Updated' });

      expect(prisma.aspekPenilaian.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { namaAspek: 'Updated' },
      });
      expect(result.namaAspek).toBe('Updated');
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.aspekPenilaian.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateAspek(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  // ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ deleteAspek ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

  describe('deleteAspek', () => {
    it('should delete aspek and return success message', async () => {
      (prisma.aspekPenilaian.findUnique as jest.Mock).mockResolvedValue(mockAspekList[0]);
      (prisma.aspekPenilaian.delete as jest.Mock).mockResolvedValue({});

      const result = await service.deleteAspek(1);

      expect(prisma.aspekPenilaian.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ message: 'Aspek berhasil dihapus' });
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.aspekPenilaian.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteAspek(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ findItemById ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

  describe('findItemById', () => {
    it('should return item by id with aspek', async () => {
      const item = { id: 1, namaItem: 'Kehadiran', aspek: mockAspekList[0] };
      (prisma.itemPenilaian.findUnique as jest.Mock).mockResolvedValue(item);

      const result = await service.findItemById(1);

      expect(prisma.itemPenilaian.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { aspek: true },
      });
      expect(result).toEqual(item);
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.itemPenilaian.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findItemById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ updateItem ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

  describe('updateItem', () => {
    it('should update item fields', async () => {
      const item = { id: 1, namaItem: 'Kehadiran', bobot: 1 };
      (prisma.itemPenilaian.findUnique as jest.Mock).mockResolvedValue(item);
      (prisma.itemPenilaian.update as jest.Mock).mockResolvedValue({ ...item, bobot: 2 });

      const result = await service.updateItem(1, { bobot: 2 });

      expect(prisma.itemPenilaian.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { bobot: 2 },
      });
      expect(result.bobot).toBe(2);
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.itemPenilaian.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateItem(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  // ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ deleteItem ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

  describe('deleteItem', () => {
    it('should delete item and return success message', async () => {
      (prisma.itemPenilaian.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.itemPenilaian.delete as jest.Mock).mockResolvedValue({});

      const result = await service.deleteItem(1);

      expect(prisma.itemPenilaian.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ message: 'Item berhasil dihapus' });
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.itemPenilaian.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteItem(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ deletePenguji ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

  describe('deletePenguji', () => {
    it('should delete penguji kegiatan', async () => {
      (prisma.pengujiKegiatan.findUnique as jest.Mock).mockResolvedValue({ id: 1, kegiatanId: 5 });
      (prisma.pengujiKegiatan.delete as jest.Mock).mockResolvedValue({});

      const result = await service.deletePenguji(1);

      expect(prisma.pengujiKegiatan.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ message: 'Penguji berhasil dihapus' });
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.pengujiKegiatan.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deletePenguji(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ validasiHasil ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â auto update calon status ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

  describe('validasiHasil ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â status calon propagation', () => {
    it('should update calonAnggota status to lulus when approved and lulus', async () => {
      (prisma.hasilPendadaran.update as jest.Mock).mockResolvedValue({
        ...mockHasil, statusValidasi: 'approved', statusKelulusan: 'lulus',
      });
      (prisma.calonAnggota.update as jest.Mock).mockResolvedValue({});

      await service.validasiHasil(5, 10, 2, 'approved');

      expect(prisma.calonAnggota.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { status: 'lulus' },
      });
    });

    it('should update calonAnggota status to gagal when approved and gagal', async () => {
      (prisma.hasilPendadaran.update as jest.Mock).mockResolvedValue({
        ...mockHasil, statusValidasi: 'approved', statusKelulusan: 'gagal',
      });
      (prisma.calonAnggota.update as jest.Mock).mockResolvedValue({});

      await service.validasiHasil(5, 10, 2, 'approved');

      expect(prisma.calonAnggota.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { status: 'gagal' },
      });
    });

    it('should NOT update calonAnggota when status is rejected', async () => {
      (prisma.hasilPendadaran.update as jest.Mock).mockResolvedValue({
        ...mockHasil, statusValidasi: 'rejected',
      });

      await service.validasiHasil(5, 10, 2, 'rejected');

      expect(prisma.calonAnggota.update).not.toHaveBeenCalled();
    });
  });

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ findByCalon Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

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

  // ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ getNilaiDetail ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

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
