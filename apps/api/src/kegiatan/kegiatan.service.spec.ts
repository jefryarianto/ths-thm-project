import { Test } from '@nestjs/testing';
import { KegiatanService } from './kegiatan.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';
import { NotFoundException } from '@nestjs/common';

describe('KegiatanService', () => {
  let service: KegiatanService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module = await Test.createTestingModule({
      providers: [
        KegiatanService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(KegiatanService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── create ───

  describe('create', () => {
    it('should create kegiatan with date conversion', async () => {
      const input = {
        nama: 'Latihan Gabungan',
        tipe: 'latihan',
        tanggalMulai: '2026-06-15',
        lokasi: 'GOR',
        scopeType: 'ranting',
        scopeId: 1,
        createdBy: 1,
      };
      const expected = { id: 1, ...input, tanggalMulai: new Date('2026-06-15') };
      (prisma.kegiatan.create as jest.Mock).mockResolvedValue(expected);

      const result = await service.create(input);

      expect(prisma.kegiatan.create).toHaveBeenCalledWith({
        data: {
          nama: 'Latihan Gabungan',
          tipe: 'latihan',
          tanggalMulai: new Date('2026-06-15'),
          tanggalSelesai: null,
          lokasi: 'GOR',
          scopeType: 'ranting',
          scopeId: 1,
          createdBy: 1,
          status: 'draft',
        },
        include: { creator: { select: { id: true, name: true } } },
      });
      expect(result).toEqual(expected);
    });

    it('should create kegiatan with tanggalSelesai (Date conversion branch)', async () => {
      const input = {
        nama: 'Latihan Gabungan 2',
        tipe: 'latihan',
        tanggalMulai: '2026-06-15',
        tanggalSelesai: '2026-06-16',
        lokasi: 'GOR',
        scopeType: 'ranting',
        scopeId: 1,
        createdBy: 1,
      };
      (prisma.kegiatan.create as jest.Mock).mockResolvedValue({ id: 2 });

      await service.create(input);

      expect(prisma.kegiatan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tanggalSelesai: new Date('2026-06-16'),
          }),
        }),
      );
    });
  });

  // ─── findAll ───

  describe('findAll', () => {
    it('should return paginated kegiatan without filter', async () => {
      const data = [{ id: 1, nama: 'Latihan', _count: { absensiKegiatan: 0, latihan: 0 } }];
      (prisma.kegiatan.findMany as jest.Mock).mockResolvedValue(data);
      (prisma.kegiatan.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll();

      expect(prisma.kegiatan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          skip: 0, take: 10,
          orderBy: { tanggalMulai: 'desc' },
        }),
      );
      expect(result).toEqual({ data, meta: { total: 1, page: 1, limit: 10, totalPages: 1 } });
    });

    it('should filter by tipe', async () => {
      (prisma.kegiatan.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.kegiatan.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 10, 'pendadaran');

      expect(prisma.kegiatan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tipe: 'pendadaran' } }),
      );
      expect(prisma.kegiatan.count).toHaveBeenCalledWith({ where: { tipe: 'pendadaran' } });
    });

    it('should apply pagination correctly', async () => {
      (prisma.kegiatan.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.kegiatan.count as jest.Mock).mockResolvedValue(25);

      const result = await service.findAll(3, 10);

      expect(prisma.kegiatan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
      expect(result.meta).toEqual({ total: 25, page: 3, limit: 10, totalPages: 3 });
    });

    it('should filter by scopeType', async () => {
      (prisma.kegiatan.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.kegiatan.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 10, undefined, 'distrik');

      expect(prisma.kegiatan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { scopeType: 'distrik' } }),
      );
    });

    it('should filter by scopeId', async () => {
      (prisma.kegiatan.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.kegiatan.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 10, undefined, undefined, 5);

      expect(prisma.kegiatan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { scopeId: 5 } }),
      );
    });

    it('should filter by status', async () => {
      (prisma.kegiatan.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.kegiatan.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 10, undefined, undefined, undefined, 'published');

      expect(prisma.kegiatan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'published' } }),
      );
    });
  });

  // ─── findById ───

  describe('findById', () => {
    it('should return kegiatan when found', async () => {
      const kegiatan = { id: 1, nama: 'Latihan' };
      (prisma.kegiatan.findUnique as jest.Mock).mockResolvedValue(kegiatan);

      const result = await service.findById(1);

      expect(prisma.kegiatan.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
        }),
      );
      expect(result).toEqual(kegiatan);
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.kegiatan.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ───

  describe('update', () => {
    it('should update kegiatan fields', async () => {
      const updated = { id: 1, nama: 'Updated Latihan', lokasi: 'Lapangan' };
      (prisma.kegiatan.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.update(1, { nama: 'Updated Latihan', lokasi: 'Lapangan' });

      expect(prisma.kegiatan.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { nama: 'Updated Latihan', lokasi: 'Lapangan' },
      });
      expect(result).toEqual(updated);
    });

    it('should convert date strings to Date objects', async () => {
      (prisma.kegiatan.update as jest.Mock).mockResolvedValue({ id: 1 });

      await service.update(1, {
        nama: 'Latihan',
        tanggalMulai: '2026-07-01',
        tanggalSelesai: '2026-07-02',
      });

      expect(prisma.kegiatan.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          nama: 'Latihan',
          tanggalMulai: new Date('2026-07-01'),
          tanggalSelesai: new Date('2026-07-02'),
        },
      });
    });

    it('should update only status field', async () => {
      (prisma.kegiatan.update as jest.Mock).mockResolvedValue({ id: 1, status: 'published' });

      const result = await service.update(1, { status: 'published' });

      expect(prisma.kegiatan.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'published' },
      });
      expect(result.status).toBe('published');
    });
  });

  // ─── publish ───

  describe('publish', () => {
    it('should set status to published', async () => {
      (prisma.kegiatan.update as jest.Mock).mockResolvedValue({ id: 1, status: 'published' });

      const result = await service.publish(1);

      expect(prisma.kegiatan.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'published' },
      });
      expect(result.status).toBe('published');
    });
  });

  // ─── close ───

  describe('close', () => {
    it('should set status to closed', async () => {
      (prisma.kegiatan.update as jest.Mock).mockResolvedValue({ id: 1, status: 'closed' });

      const result = await service.close(1);

      expect(prisma.kegiatan.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'closed' },
      });
      expect(result.status).toBe('closed');
    });
  });

  // ─── delete ───

  describe('delete', () => {
    it('should delete kegiatan by id', async () => {
      (prisma.kegiatan.delete as jest.Mock).mockResolvedValue({ id: 1 });

      const result = await service.delete(1);

      expect(prisma.kegiatan.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ id: 1 });
    });
  });
});
