import { Test } from '@nestjs/testing';
import { LatihanService } from './latihan.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';
import { createStorageMock } from '../test/mocks/storage.mock.js';

describe('LatihanService', () => {
  let service: LatihanService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module = await Test.createTestingModule({
      providers: [
        LatihanService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: createStorageMock() },
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
              pembuat: { select: { id: true, name: true } },
            },
          },
          dokumentasiLatihan: {
            orderBy: { urutan: 'asc' },
            include: { pengupload: { select: { id: true, name: true } } },
          },
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

  // ─── addCatatan ───

  describe('addCatatan', () => {
    it('should create catatan for anggota', async () => {
      const mockLatihan = { id: 1 };
      const mockCatatan = {
        id: 1, latihanId: 1, anggotaId: 2, catatanKhusus: 'Perlu perbaikan',
        anggota: { id: 2, namaLengkap: 'Budi' }, calonAnggota: null,
        pembuat: { id: 3, name: 'Pelatih' },
      };
      (prisma.latihan.findUnique as jest.Mock).mockResolvedValue(mockLatihan);
      (prisma.catatanLatihanPeserta.create as jest.Mock).mockResolvedValue(mockCatatan);

      const result = await service.addCatatan(1, { anggotaId: 2, catatanKhusus: 'Perlu perbaikan' }, 3);

      expect(prisma.catatanLatihanPeserta.create).toHaveBeenCalledWith({
        data: { latihanId: 1, anggotaId: 2, calonAnggotaId: null, catatanKhusus: 'Perlu perbaikan', createdBy: 3 },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockCatatan);
    });

    it('should throw BadRequestException when neither anggotaId nor calonAnggotaId provided', async () => {
      (prisma.latihan.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      const { BadRequestException } = await import('@nestjs/common');

      await expect(
        service.addCatatan(1, { catatanKhusus: 'test' } as any, 3),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when latihan not found', async () => {
      (prisma.latihan.findUnique as jest.Mock).mockResolvedValue(null);
      const { NotFoundException } = await import('@nestjs/common');

      await expect(
        service.addCatatan(999, { anggotaId: 1, catatanKhusus: 'test' }, 3),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getCatatanByLatihan ───

  describe('getCatatanByLatihan', () => {
    it('should return all catatan for a latihan', async () => {
      const mockCatatanList = [
        { id: 1, latihanId: 1, catatanKhusus: 'Catatan A' },
        { id: 2, latihanId: 1, catatanKhusus: 'Catatan B' },
      ];
      (prisma.latihan.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.catatanLatihanPeserta.findMany as jest.Mock).mockResolvedValue(mockCatatanList);

      const result = await service.getCatatanByLatihan(1);

      expect(prisma.catatanLatihanPeserta.findMany).toHaveBeenCalledWith({
        where: { latihanId: 1 },
        include: expect.any(Object),
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toHaveLength(2);
    });
  });

  // ─── deleteCatatan ───

  describe('deleteCatatan', () => {
    it('should delete catatan by id', async () => {
      (prisma.catatanLatihanPeserta.findUnique as jest.Mock).mockResolvedValue({ id: 1, latihanId: 1 });
      (prisma.catatanLatihanPeserta.delete as jest.Mock).mockResolvedValue({});

      const result = await service.deleteCatatan(1);

      expect(prisma.catatanLatihanPeserta.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ message: 'Catatan berhasil dihapus' });
    });

    it('should throw NotFoundException when catatan not found', async () => {
      (prisma.catatanLatihanPeserta.findUnique as jest.Mock).mockResolvedValue(null);
      const { NotFoundException } = await import('@nestjs/common');

      await expect(service.deleteCatatan(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getDokumentasiByLatihan ───

  describe('getDokumentasiByLatihan', () => {
    it('should return dokumentasi with signed URLs', async () => {
      const storage = (service as any).storage;
      storage.getFileUrl.mockResolvedValue('https://signed-url.example.com/file.jpg');

      const mockDocs = [
        { id: 1, latihanId: 1, filePath: 'docs/foto1.jpg', fileType: 'foto', urutan: 1, pengupload: { id: 1, name: 'Pelatih' } },
      ];
      (prisma.latihan.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.dokumentasiLatihan.findMany as jest.Mock).mockResolvedValue(mockDocs);

      const result = await service.getDokumentasiByLatihan(1);

      expect(storage.getFileUrl).toHaveBeenCalledWith('docs/foto1.jpg');
      expect(result[0].fileUrl).toBe('https://signed-url.example.com/file.jpg');
    });
  });

  // ─── deleteDokumentasi ───

  describe('deleteDokumentasi', () => {
    it('should delete file from storage and db', async () => {
      const storage = (service as any).storage;
      storage.deleteFile.mockResolvedValue(undefined);

      (prisma.dokumentasiLatihan.findUnique as jest.Mock).mockResolvedValue({
        id: 1, filePath: 'docs/foto1.jpg',
      });
      (prisma.dokumentasiLatihan.delete as jest.Mock).mockResolvedValue({});

      const result = await service.deleteDokumentasi(1);

      expect(storage.deleteFile).toHaveBeenCalledWith('docs/foto1.jpg');
      expect(prisma.dokumentasiLatihan.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ message: 'Dokumentasi berhasil dihapus' });
    });

    it('should throw NotFoundException when dokumentasi not found', async () => {
      (prisma.dokumentasiLatihan.findUnique as jest.Mock).mockResolvedValue(null);
      const { NotFoundException } = await import('@nestjs/common');

      await expect(service.deleteDokumentasi(999)).rejects.toThrow(NotFoundException);
    });
  });
});
