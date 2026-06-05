import { Test } from '@nestjs/testing';
import { KontenController } from './konten.controller.js';
import { KontenService } from './konten.service.js';

describe('KontenController', () => {
  let controller: KontenController;
  let kontenService: jest.Mocked<KontenService>;

  beforeEach(async () => {
    kontenService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findPublished: jest.fn(),
      submitReview: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      controllers: [KontenController],
      providers: [
        { provide: KontenService, useValue: kontenService },
      ],
    }).compile();

    controller = module.get(KontenController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── create ───

  describe('create', () => {
    it('should inject user id from request into data', async () => {
      const req = { user: { id: 1 } };
      const data = { judul: 'Berita Baru', jenis: 'Berita', konten: 'Isi berita' };
      const expected = { ...data, penulisId: 1 };
      kontenService.create.mockResolvedValue({
        id: 1, uuid: 'k1', judul: 'Berita Baru', jenis: 'Berita',
        konten: 'Isi berita', status: 'Dipublikasikan', penulisId: 1,
        createdAt: new Date(), updatedAt: new Date(),
        penulis: { id: 1, uuid: 'u1', username: 'admin' },
      } as any);

      const result = await controller.create(req, data);

      expect(kontenService.create).toHaveBeenCalledWith(expected);
      expect(result).toMatchObject({ id: 1, judul: 'Berita Baru', penulisId: 1 });
    });

    it('should include ringkasan when provided', async () => {
      const req = { user: { id: 2 } };
      const data = { judul: 'Artikel', jenis: 'Artikel', konten: 'Konten', ringkasan: 'Ringkasan' };
      kontenService.create.mockResolvedValue({
        id: 2, uuid: 'k2', judul: 'Artikel', jenis: 'Artikel',
        konten: 'Konten', ringkasan: 'Ringkasan', status: 'Draft', penulisId: 2,
        createdAt: new Date(), updatedAt: new Date(),
        penulis: { id: 2, uuid: 'u2', username: 'penulis' },
      } as any);

      await controller.create(req, data);

      expect(kontenService.create).toHaveBeenCalledWith({
        judul: 'Artikel',
        jenis: 'Artikel',
        konten: 'Konten',
        ringkasan: 'Ringkasan',
        penulisId: 2,
      });
    });
  });

  // ─── findAll ───

  describe('findAll', () => {
    it('should call service.findAll with query params', async () => {
      kontenService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      const result = await controller.findAll(1, 10, 'Dipublikasikan', 'Berita');

      expect(kontenService.findAll).toHaveBeenCalledWith(1, 10, 'Dipublikasikan', 'Berita');
      expect(result.meta).toEqual({ total: 0, page: 1, limit: 10, totalPages: 0 });
    });

    it('should work without optional filters', async () => {
      kontenService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      await controller.findAll(undefined, undefined, undefined, undefined);

      expect(kontenService.findAll).toHaveBeenCalledWith(undefined, undefined, undefined, undefined);
    });
  });

  // ─── findPublished ───

  describe('findPublished', () => {
    it('should call service.findPublished without filter', async () => {
      kontenService.findPublished.mockResolvedValue([{
        id: 1, uuid: 'k1', judul: 'Berita', jenis: 'Berita',
        konten: 'Isi', status: 'Dipublikasikan', penulisId: 1,
        createdAt: new Date(), updatedAt: new Date(),
        penulis: { id: 1, uuid: 'u1', username: 'admin' },
      }] as any);

      const result = await controller.findPublished();

      expect(kontenService.findPublished).toHaveBeenCalledWith(undefined);
      expect(result).toHaveLength(1);
    });

    it('should call service.findPublished with jenis filter', async () => {
      kontenService.findPublished.mockResolvedValue([]);

      await controller.findPublished('Acara');

      expect(kontenService.findPublished).toHaveBeenCalledWith('Acara');
    });
  });

  // ─── review ───

  describe('review', () => {
    it('should call service.submitReview with all params', async () => {
      const req = { user: { id: 2 } };
      kontenService.submitReview.mockResolvedValue({
        id: 1, uuid: 'k1', judul: 'Berita', jenis: 'Berita',
        konten: 'Isi', status: 'Dipublikasikan', penulisId: 1, reviewerId: 2,
        catatanReview: 'Bagus', publishedAt: new Date(),
        createdAt: new Date(), updatedAt: new Date(),
        penulis: { id: 1, uuid: 'u1', username: 'admin' },
      } as any);

      const result = await controller.review('1', req, { status: 'Dipublikasikan', catatanReview: 'Bagus' });

      expect(kontenService.submitReview).toHaveBeenCalledWith(1, 2, 'Dipublikasikan', 'Bagus');
      expect(result).toMatchObject({ id: 1, status: 'Dipublikasikan', catatanReview: 'Bagus' });
    });

    it('should call service.submitReview without catatanReview', async () => {
      const req = { user: { id: 2 } };
      kontenService.submitReview.mockResolvedValue({
        id: 1, uuid: 'k1', judul: 'Berita', jenis: 'Berita',
        konten: 'Isi', status: 'Ditolak', penulisId: 1, reviewerId: 2,
        createdAt: new Date(), updatedAt: new Date(),
        penulis: { id: 1, uuid: 'u1', username: 'admin' },
      } as any);

      const result = await controller.review('1', req, { status: 'Ditolak' });

      expect(kontenService.submitReview).toHaveBeenCalledWith(1, 2, 'Ditolak', undefined);
      expect(result).toMatchObject({ id: 1, status: 'Ditolak' });
    });
  });
});
