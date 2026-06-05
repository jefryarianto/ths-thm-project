import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrganisasiDokumenService } from './organisasi-dokumen.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';

const mockDokumen = {
  id: 1,
  uuid: 'dok-uuid-1',
  judul: 'Statuta Organisasi',
  deskripsi: 'Dokumen statuta resmi',
  kategori: 'statuta',
  filePath: '/uploads/statuta.pdf',
  scopeType: 'nasional',
  scopeId: 1,
  aksesRoles: null,
  aksesTingkatan: null,
  isPublic: true,
  uploadedBy: 1,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

describe('OrganisasiDokumenService', () => {
  let service: OrganisasiDokumenService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisasiDokumenService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<OrganisasiDokumenService>(OrganisasiDokumenService);
  });

  afterEach(() => { jest.clearAllMocks(); });

  // ─── create ───

  describe('create', () => {
    it('should create dokumen with all fields', async () => {
      const data = {
        judul: 'Pedoman Kurikulum',
        deskripsi: 'Pedoman resmi',
        kategori: 'kurikulum',
        filePath: '/uploads/kurikulum.pdf',
        scopeType: 'distrik',
        scopeId: 2,
        aksesRoles: ['admin_distrik', 'pelatih'],
        aksesTingkatan: ['bintara'],
        isPublic: false,
        uploadedBy: 1,
      };
      (prisma.organisasiDokumen.create as jest.Mock).mockResolvedValue({ id: 2, ...data });

      const result = await service.create(data);

      expect(prisma.organisasiDokumen.create).toHaveBeenCalledWith({
        data: {
          judul: 'Pedoman Kurikulum',
          deskripsi: 'Pedoman resmi',
          kategori: 'kurikulum',
          filePath: '/uploads/kurikulum.pdf',
          scopeType: 'distrik',
          scopeId: 2,
          aksesRoles: ['admin_distrik', 'pelatih'],
          aksesTingkatan: ['bintara'],
          isPublic: false,
          uploadedBy: 1,
        },
      });
      expect(result.id).toBe(2);
    });

    it('should create dokumen with minimal fields (defaults)', async () => {
      const data = {
        judul: 'Dokumen Sederhana',
        kategori: 'lainnya',
        filePath: '/uploads/doc.pdf',
        uploadedBy: 1,
      };
      (prisma.organisasiDokumen.create as jest.Mock).mockResolvedValue({ id: 3, ...data });

      const result = await service.create(data);

      expect(prisma.organisasiDokumen.create).toHaveBeenCalledWith({
        data: {
          judul: 'Dokumen Sederhana',
          deskripsi: null,
          kategori: 'lainnya',
          filePath: '/uploads/doc.pdf',
          scopeType: null,
          scopeId: null,
          aksesRoles: null,
          aksesTingkatan: null,
          isPublic: false,
          uploadedBy: 1,
        },
      });
      expect(result.id).toBe(3);
    });
  });

  // ─── findAll ───

  describe('findAll', () => {
    it('should return paginated dokumen without filters', async () => {
      (prisma.organisasiDokumen.findMany as jest.Mock).mockResolvedValue([mockDokumen]);
      (prisma.organisasiDokumen.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll();

      expect(prisma.organisasiDokumen.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0, take: 20,
        include: { pengupload: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 20, totalPages: 1 });
    });

    it('should filter by kategori', async () => {
      (prisma.organisasiDokumen.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.organisasiDokumen.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 20, 'statuta');

      expect(prisma.organisasiDokumen.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { kategori: 'statuta' } }),
      );
    });

    it('should filter by scopeType and scopeId', async () => {
      (prisma.organisasiDokumen.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.organisasiDokumen.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 20, undefined, 'distrik', 3);

      expect(prisma.organisasiDokumen.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { scopeType: 'distrik', scopeId: 3 } }),
      );
    });
  });

  // ─── findById ───

  describe('findById', () => {
    it('should return dokumen with pengupload', async () => {
      (prisma.organisasiDokumen.findUnique as jest.Mock).mockResolvedValue(mockDokumen);

      const result = await service.findById(1);

      expect(prisma.organisasiDokumen.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { pengupload: { select: { id: true, name: true } } },
      });
      expect(result).toEqual(mockDokumen);
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.organisasiDokumen.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findByKategori ───

  describe('findByKategori', () => {
    it('should return dokumen by kategori', async () => {
      (prisma.organisasiDokumen.findMany as jest.Mock).mockResolvedValue([mockDokumen]);

      const result = await service.findByKategori('statuta');

      expect(prisma.organisasiDokumen.findMany).toHaveBeenCalledWith({
        where: { kategori: 'statuta' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockDokumen]);
    });

    it('should filter by isPublic when specified', async () => {
      (prisma.organisasiDokumen.findMany as jest.Mock).mockResolvedValue([]);

      await service.findByKategori('statuta', true);

      expect(prisma.organisasiDokumen.findMany).toHaveBeenCalledWith({
        where: { kategori: 'statuta', isPublic: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by isPublic=false', async () => {
      (prisma.organisasiDokumen.findMany as jest.Mock).mockResolvedValue([]);

      await service.findByKategori('statuta', false);

      expect(prisma.organisasiDokumen.findMany).toHaveBeenCalledWith({
        where: { kategori: 'statuta', isPublic: false },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  // ─── update ───

  describe('update', () => {
    it('should update dokumen fields', async () => {
      const updated = { id: 1, judul: 'Updated Title' };
      (prisma.organisasiDokumen.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.update(1, { judul: 'Updated Title' });

      expect(prisma.organisasiDokumen.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { judul: 'Updated Title' },
      });
      expect(result).toEqual(updated);
    });
  });

  // ─── delete ───

  describe('delete', () => {
    it('should delete dokumen by id', async () => {
      (prisma.organisasiDokumen.delete as jest.Mock).mockResolvedValue(mockDokumen);

      const result = await service.delete(1);

      expect(prisma.organisasiDokumen.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockDokumen);
    });
  });
});
