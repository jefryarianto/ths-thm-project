import { Test } from '@nestjs/testing';
import { LatihanService } from './latihan.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';

describe('LatihanService', () => {
  let service: LatihanService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module = await Test.createTestingModule({
      providers: [
        LatihanService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(LatihanService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── create ───

  describe('create', () => {
    it('should create latihan with date conversion', async () => {
      const input = {
        hariTanggal: '2026-06-15',
        lokasi: 'GOR',
        jenisMateri: 'Teknik Dasar',
        pelatihId: 1,
        rantingId: 2,
      };
      const expected = { id: 1, ...input, ranting: { id: 2, nama: 'Ranting A' } };
      (prisma.latihan.create as jest.Mock).mockResolvedValue(expected);

      const result = await service.create(input);

      expect(prisma.latihan.create).toHaveBeenCalledWith({
        data: {
          rantingId: 2,
          kegiatanId: null,
          pelatihId: 1,
          hariTanggal: new Date('2026-06-15'),
          lokasi: 'GOR',
          jenisMateri: 'Teknik Dasar',
          hasilLatihanGlobal: null,
          rekomendasiLatihanBerikutnya: null,
        },
        include: {
          ranting: true,
          pelatih: { select: { id: true, name: true } },
        },
      });
      expect(result).toEqual(expected);
    });
  });

  // ─── findAll ───

  describe('findAll', () => {
    it('should return paginated latihan without filter', async () => {
      const data = [{ id: 1, hariTanggal: new Date(), ranting: {}, pelatih: { id: 1, name: 'pelatih1' } }];
      (prisma.latihan.findMany as jest.Mock).mockResolvedValue(data);
      (prisma.latihan.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll();

      expect(prisma.latihan.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0, take: 10,
        include: {
          ranting: true,
          pelatih: { select: { id: true, name: true } },
          _count: { select: { absensiLatihan: true, dokumentasiLatihan: true } },
        },
        orderBy: { hariTanggal: 'desc' },
      });
      expect(result).toEqual({ data, meta: { total: 1, page: 1, limit: 10, totalPages: 1 } });
    });

    it('should filter by rantingId', async () => {
      (prisma.latihan.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.latihan.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 10, 3);

      expect(prisma.latihan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { rantingId: 3 } }),
      );
      expect(prisma.latihan.count).toHaveBeenCalledWith({ where: { rantingId: 3 } });
    });

    it('should calculate totalPages correctly', async () => {
      (prisma.latihan.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.latihan.count as jest.Mock).mockResolvedValue(7);

      const result = await service.findAll(1, 5);

      expect(result.meta).toEqual({ total: 7, page: 1, limit: 5, totalPages: 2 });
    });
  });

  // ─── findById ───

  describe('findById', () => {
    it('should return latihan with full relations', async () => {
      const latihan = {
        id: 1,
        hariTanggal: new Date(),
        ranting: { id: 2, nama: 'Ranting A' },
        pelatih: { id: 1, name: 'Pelatih A' },
        absensiLatihan: [{ id: 1, anggota: { id: 1, namaLengkap: 'Anggota A' } }],
        catatanLatihanPeserta: [],
        dokumentasiLatihan: [],
      };
      (prisma.latihan.findUnique as jest.Mock).mockResolvedValue(latihan);

      const result = await service.findById(1);

      expect(prisma.latihan.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          ranting: true,
          pelatih: { select: { id: true, name: true } },
          absensiLatihan: {
            include: {
              anggota: { select: { id: true, namaLengkap: true } },
              calonAnggota: { select: { id: true, namaLengkap: true } },
            },
          },
          catatanLatihanPeserta: {
            include: {
              anggota: { select: { id: true, namaLengkap: true } },
              calonAnggota: { select: { id: true, namaLengkap: true } },
            },
          },
          dokumentasiLatihan: { orderBy: { urutan: 'asc' } },
        },
      });
      expect(result).toEqual(latihan);
    });

    it('should return null when not found', async () => {
      (prisma.latihan.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });

    it('should include anggota and calonAnggota in absensi', async () => {
      const latihan = {
        id: 1,
        absensiLatihan: [
          { id: 1, anggota: { id: 1, namaLengkap: 'Anggota A' }, calonAnggota: null },
          { id: 2, anggota: null, calonAnggota: { id: 5, namaLengkap: 'Calon A' } },
        ],
        catatanLatihanPeserta: [],
        dokumentasiLatihan: [],
      };
      (prisma.latihan.findUnique as jest.Mock).mockResolvedValue(latihan);

      const result = await service.findById(1);

      expect(result?.absensiLatihan).toHaveLength(2);
      expect(result?.absensiLatihan[0].anggota?.namaLengkap).toBe('Anggota A');
      expect(result?.absensiLatihan[1].calonAnggota?.namaLengkap).toBe('Calon A');
    });
  });
});
