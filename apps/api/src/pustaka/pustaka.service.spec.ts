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
});
