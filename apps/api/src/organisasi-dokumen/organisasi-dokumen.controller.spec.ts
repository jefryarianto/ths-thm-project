import { Test, TestingModule } from '@nestjs/testing';
import { OrganisasiDokumenController } from './organisasi-dokumen.controller.js';
import { OrganisasiDokumenService } from './organisasi-dokumen.service.js';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByKategori: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('OrganisasiDokumenController', () => {
  let controller: OrganisasiDokumenController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisasiDokumenController],
      providers: [{ provide: OrganisasiDokumenService, useValue: mockService }],
    }).compile();
    controller = module.get<OrganisasiDokumenController>(OrganisasiDokumenController);
  });

  describe('create', () => {
    it('should create dokumen with req.user.id', async () => {
      const req = { user: { id: 3 } };
      const data = { judul: 'Dokumen', kategori: 'statuta', filePath: '/tmp/doc.pdf' };
      mockService.create.mockResolvedValue({ id: 1 });

      const result = await controller.create(req as any, data);

      expect(mockService.create).toHaveBeenCalledWith({
        judul: 'Dokumen',
        kategori: 'statuta',
        filePath: '/tmp/doc.pdf',
        uploadedBy: 3,
      });
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('findAll', () => {
    it('should return paginated dokumen with filters', async () => {
      mockService.findAll.mockResolvedValue({ data: [], meta: { total: 0 } });

      const result = await controller.findAll(1, 20, 'statuta', 'nasional', 1 as any);

      expect(mockService.findAll).toHaveBeenCalledWith(1, 20, 'statuta', 'nasional', 1);
      expect(result).toEqual({ data: [], meta: { total: 0 } });
    });
  });

  describe('findByKategori', () => {
    it('should return dokumen by kategori (public)', async () => {
      mockService.findByKategori.mockResolvedValue([]);

      const result = await controller.findByKategori('statuta', 'true');

      expect(mockService.findByKategori).toHaveBeenCalledWith('statuta', true);
      expect(result).toEqual([]);
    });

    it('should handle isPublic=false', async () => {
      mockService.findByKategori.mockResolvedValue([]);

      await controller.findByKategori('kurikulum', 'false');

      expect(mockService.findByKategori).toHaveBeenCalledWith('kurikulum', false);
    });

    it('should handle undefined isPublic', async () => {
      mockService.findByKategori.mockResolvedValue([]);

      await controller.findByKategori('statuta', undefined);

      expect(mockService.findByKategori).toHaveBeenCalledWith('statuta', undefined);
    });
  });

  describe('findById', () => {
    it('should return dokumen by id', async () => {
      mockService.findById.mockResolvedValue({ id: 1 });

      const result = await controller.findById('1');

      expect(mockService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('update', () => {
    it('should update dokumen', async () => {
      mockService.update.mockResolvedValue({ id: 1, judul: 'Updated' });

      const result = await controller.update('1', { judul: 'Updated' });

      expect(mockService.update).toHaveBeenCalledWith(1, { judul: 'Updated' });
      expect(result).toEqual({ id: 1, judul: 'Updated' });
    });
  });

  describe('delete', () => {
    it('should delete dokumen by id', async () => {
      mockService.delete.mockResolvedValue({ id: 1 });

      const result = await controller.delete('1');

      expect(mockService.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });
  });
});
