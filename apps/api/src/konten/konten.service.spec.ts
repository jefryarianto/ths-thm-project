import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { KontenService } from './konten.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';

// ─── Test data ───

const mockPenulis = { id: 1, name: 'admin' };
const mockReviewer = { id: 2, name: 'reviewer' };

const mockKonten = {
  id: 1,
  uuid: 'konten-uuid-1',
  judul: 'Artikel Pemula',
  jenis: 'Artikel',
  konten: '<p>Isi artikel</p>',
  ringkasan: 'Ringkasan artikel',
  thumbnailUrl: null,
  status: 'Draft',
  penulisId: 1,
  reviewerId: null,
  catatanReview: null,
  organisasiId: null,
  publishedAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  penulis: mockPenulis,
  reviewer: null,
};

const mockKontenPublished = {
  ...mockKonten,
  id: 2,
  judul: 'Artikel Publik',
  status: 'Dipublikasikan',
  publishedAt: new Date('2025-02-01'),
  reviewerId: 2,
  reviewer: mockReviewer,
};

describe('KontenService', () => {
  let service: KontenService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KontenService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<KontenService>(KontenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  //  create()
  // ──────────────────────────────────────────────

  describe('create', () => {
    it('should create konten with penulis include', async () => {
      const dto = {
        judul: 'Artikel Baru',
        jenis: 'Berita',
        konten: '<p>Berita terbaru</p>',
        ringkasan: 'Ringkasan',
        penulisId: 1,
        organisasiId: 3,
      };

      (prisma.konten.create as jest.Mock).mockResolvedValue(mockKonten);

      const result = await service.create(dto);

      expect(prisma.konten.create).toHaveBeenCalledWith({
        data: dto,
        include: { penulis: { select: { id: true, name: true } } },
      });
      expect(result).toEqual(mockKonten);
    });

    it('should create konten without optional fields', async () => {
      const dto = {
        judul: 'Artikel Minimal',
        jenis: 'Video',
        konten: 'https://youtube.com/video',
        penulisId: 1,
      };

      (prisma.konten.create as jest.Mock).mockResolvedValue(mockKonten);

      await service.create(dto);

      expect(prisma.konten.create).toHaveBeenCalledWith({
        data: dto,
        include: { penulis: { select: { id: true, name: true } } },
      });
    });
  });

  // ──────────────────────────────────────────────
  //  findAll()
  // ──────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated konten without filters', async () => {
      const mockData = [mockKonten, mockKontenPublished];
      (prisma.konten.findMany as jest.Mock).mockResolvedValue(mockData);
      (prisma.konten.count as jest.Mock).mockResolvedValue(2);

      const result = await service.findAll();

      expect(prisma.konten.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          skip: 0,
          take: 10,
          include: {
            penulis: { select: { id: true, name: true } },
            reviewer: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(result).toEqual({
        data: mockData,
        meta: { total: 2, page: 1, limit: 10, totalPages: 1 },
      });
    });

    it('should filter by status', async () => {
      (prisma.konten.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.konten.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 10, 'Dipublikasikan');

      expect(prisma.konten.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'Dipublikasikan' } }),
      );
    });

    it('should filter by jenis', async () => {
      (prisma.konten.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.konten.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 10, undefined, 'Berita');

      expect(prisma.konten.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { jenis: 'Berita' } }),
      );
    });

    it('should combine status and jenis filters', async () => {
      (prisma.konten.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.konten.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 10, 'Dipublikasikan', 'Artikel');

      expect(prisma.konten.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'Dipublikasikan', jenis: 'Artikel' } }),
      );
    });

    it('should apply pagination', async () => {
      (prisma.konten.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.konten.count as jest.Mock).mockResolvedValue(30);

      const result = await service.findAll(2, 10);

      expect(prisma.konten.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
      expect(result.meta).toEqual({ total: 30, page: 2, limit: 10, totalPages: 3 });
    });
  });

  // ──────────────────────────────────────────────
  //  findPublished()
  // ──────────────────────────────────────────────

  describe('findPublished', () => {
    it('should return published konten sorted by publishedAt desc', async () => {
      (prisma.konten.findMany as jest.Mock).mockResolvedValue([mockKontenPublished]);

      const result = await service.findPublished();

      expect(prisma.konten.findMany).toHaveBeenCalledWith({
        where: { status: 'Dipublikasikan' },
        orderBy: { publishedAt: 'desc' },
        take: 50,
      });
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('Dipublikasikan');
    });

    it('should filter by jenis when provided', async () => {
      (prisma.konten.findMany as jest.Mock).mockResolvedValue([]);

      await service.findPublished('Berita');

      expect(prisma.konten.findMany).toHaveBeenCalledWith({
        where: { status: 'Dipublikasikan', jenis: 'Berita' },
        orderBy: { publishedAt: 'desc' },
        take: 50,
      });
    });

    it('should return empty array when no published content', async () => {
      (prisma.konten.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findPublished();

      expect(result).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────
  //  submitReview()
  // ──────────────────────────────────────────────

  describe('submitReview', () => {
    it('should publish konten with publishedAt timestamp', async () => {
      const updated = {
        ...mockKonten,
        status: 'Dipublikasikan',
        reviewerId: 2,
        catatanReview: 'Konten bagus',
        publishedAt: new Date(),
      };

      (prisma.konten.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.submitReview(1, 2, 'Dipublikasikan', 'Konten bagus');

      expect(prisma.konten.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          status: 'Dipublikasikan',
          reviewerId: 2,
          catatanReview: 'Konten bagus',
          publishedAt: expect.any(Date),
        },
      });
      expect(result.status).toBe('Dipublikasikan');
    });

    it('should reject konten without publishedAt', async () => {
      const updated = {
        ...mockKonten,
        status: 'Ditolak',
        reviewerId: 2,
        catatanReview: 'Tidak sesuai pedoman',
      };

      (prisma.konten.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.submitReview(1, 2, 'Ditolak', 'Tidak sesuai pedoman');

      expect(prisma.konten.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          status: 'Ditolak',
          reviewerId: 2,
          catatanReview: 'Tidak sesuai pedoman',
        },
      });
      expect(result.status).toBe('Ditolak');
    });

    it('should throw ForbiddenException for invalid status', async () => {
      await expect(
        service.submitReview(1, 2, 'Draft'),
      ).rejects.toThrow(ForbiddenException);

      expect(prisma.konten.update).not.toHaveBeenCalled();
    });

    it('should allow review without catatanReview', async () => {
      (prisma.konten.update as jest.Mock).mockResolvedValue({
        ...mockKonten,
        status: 'Dipublikasikan',
      });

      await service.submitReview(1, 2, 'Dipublikasikan');

      expect(prisma.konten.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          status: 'Dipublikasikan',
          reviewerId: 2,
          catatanReview: undefined,
          publishedAt: expect.any(Date),
        },
      });
    });
  });
});
