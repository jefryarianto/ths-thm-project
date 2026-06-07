import { Test } from '@nestjs/testing';
import { PustakaService } from './pustaka.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';

describe('PustakaService', () => {
  let service: PustakaService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module = await Test.createTestingModule({
      providers: [
        PustakaService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(PustakaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── create ───

  describe('create', () => {
    it('should create pustaka entry', async () => {
      const input = {
        judul: 'Buku THS',
        deskripsi: 'Panduan lengkap',
        jenis: 'Buku',
        fileUrl: 'https://storage/buku.pdf',
        isPublic: true,
        uploadedBy: 1,
      };
      (prisma.pustaka.create as jest.Mock).mockResolvedValue({ id: 1, ...input });

      const result = await service.create(input);

      expect(prisma.pustaka.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual({ id: 1, ...input });
    });

    it('should create pustaka without optional fields', async () => {
      const input = {
        judul: 'Modul Latihan',
        jenis: 'Modul',
        fileUrl: 'https://storage/modul.pdf',
        uploadedBy: 2,
      };
      (prisma.pustaka.create as jest.Mock).mockResolvedValue({ id: 2, ...input });

      await service.create(input);

      expect(prisma.pustaka.create).toHaveBeenCalledWith({ data: input });
    });
  });

  // ─── findAll ───

  describe('findAll', () => {
    it('should return paginated pustaka without filters', async () => {
      const data = [{ id: 1, judul: 'Buku A', jenis: 'Buku', isPublic: true }];
      (prisma.pustaka.findMany as jest.Mock).mockResolvedValue(data);
      (prisma.pustaka.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll();

      expect(prisma.pustaka.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0, take: 20,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({ data, meta: { total: 1, page: 1, limit: 20, totalPages: 1 } });
    });

    it('should filter by jenis', async () => {
      (prisma.pustaka.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.pustaka.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 20, 'Buku');

      expect(prisma.pustaka.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { jenis: 'Buku' } }),
      );
      expect(prisma.pustaka.count).toHaveBeenCalledWith({ where: { jenis: 'Buku' } });
    });

    it('should filter by isPublic', async () => {
      (prisma.pustaka.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.pustaka.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 20, undefined, true);

      expect(prisma.pustaka.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isPublic: true } }),
      );
    });

    it('should combine jenis and isPublic filters', async () => {
      (prisma.pustaka.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.pustaka.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 20, 'Dokumen', false);

      expect(prisma.pustaka.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { jenis: 'Dokumen', isPublic: false } }),
      );
    });

    it('should apply pagination with default limit 20', async () => {
      (prisma.pustaka.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.pustaka.count as jest.Mock).mockResolvedValue(45);

      const result = await service.findAll(3);

      expect(prisma.pustaka.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 40, take: 20 }),
      );
      expect(result.meta).toEqual({ total: 45, page: 3, limit: 20, totalPages: 3 });
    });
  });

  // ─── findById ───

  describe('findById', () => {
    it('should return pustaka by id', async () => {
      const item = { id: 1, judul: 'Buku A', jenis: 'Buku' };
      (prisma.pustaka.findUnique as jest.Mock).mockResolvedValue(item);

      const result = await service.findById(1);

      expect(prisma.pustaka.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(item);
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.pustaka.findUnique as jest.Mock).mockResolvedValue(null);
      const { NotFoundException } = await import('@nestjs/common');

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ───

  describe('update', () => {
    it('should update pustaka fields', async () => {
      const item = { id: 1, judul: 'Buku A' };
      (prisma.pustaka.findUnique as jest.Mock).mockResolvedValue(item);
      (prisma.pustaka.update as jest.Mock).mockResolvedValue({ ...item, judul: 'Buku Updated' });

      const result = await service.update(1, { judul: 'Buku Updated' });

      expect(prisma.pustaka.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { judul: 'Buku Updated' },
      });
      expect(result.judul).toBe('Buku Updated');
    });

    it('should throw NotFoundException when item not found', async () => {
      (prisma.pustaka.findUnique as jest.Mock).mockResolvedValue(null);
      const { NotFoundException } = await import('@nestjs/common');

      await expect(service.update(999, { judul: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  // ─── delete ───

  describe('delete', () => {
    it('should delete pustaka and return success message', async () => {
      (prisma.pustaka.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.pustaka.delete as jest.Mock).mockResolvedValue({});

      const result = await service.delete(1);

      expect(prisma.pustaka.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ message: 'Item pustaka berhasil dihapus' });
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.pustaka.findUnique as jest.Mock).mockResolvedValue(null);
      const { NotFoundException } = await import('@nestjs/common');

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
