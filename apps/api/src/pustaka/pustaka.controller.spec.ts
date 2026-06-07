import { Test } from '@nestjs/testing';
import { PustakaController } from './pustaka.controller.js';
import { PustakaService } from './pustaka.service.js';

describe('PustakaController', () => {
  let controller: PustakaController;
  let pustakaService: jest.Mocked<PustakaService>;

  beforeEach(async () => {
    pustakaService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      controllers: [PustakaController],
      providers: [
        { provide: PustakaService, useValue: pustakaService },
      ],
    }).compile();

    controller = module.get(PustakaController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should inject req.user.id as uploadedBy', async () => {
      const req = { user: { id: 2 } };
      const data = { judul: 'Buku THS', deskripsi: 'Panduan', jenis: 'Buku', fileUrl: 'https://storage/buku.pdf' };
      pustakaService.create.mockResolvedValue({ id: 1, ...data, uploadedBy: 2 } as any);

      const result = await controller.create(req, data);

      expect(pustakaService.create).toHaveBeenCalledWith({ ...data, uploadedBy: 2 });
      expect(result).toEqual({ id: 1, ...data, uploadedBy: 2 });
    });
  });

  describe('findAll', () => {
    it('should call pustakaService.findAll with public filter true', async () => {
      pustakaService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });

      const result = await controller.findAll(1, 20, 'Buku');

      // Controller always passes isPublic: true for public endpoint
      expect(pustakaService.findAll).toHaveBeenCalledWith(1, 20, 'Buku', true);
      expect(result.meta.page).toBe(1);
    });

    it('should work without optional filters', async () => {
      pustakaService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });

      await controller.findAll(undefined, undefined, undefined);

      expect(pustakaService.findAll).toHaveBeenCalledWith(undefined, undefined, undefined, true);
    });
  });

  describe('findAllAdmin', () => {
    it('should call pustakaService.findAll without isPublic filter', async () => {
      pustakaService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });

      await controller.findAllAdmin(1, 10, 'Buku');

      expect(pustakaService.findAll).toHaveBeenCalledWith(1, 10, 'Buku');
    });
  });

  describe('findById', () => {
    it('should call pustakaService.findById with parsed id', async () => {
      pustakaService.findById.mockResolvedValue({ id: 3, judul: 'Buku C' } as any);

      const result = await controller.findById('3');

      expect(pustakaService.findById).toHaveBeenCalledWith(3);
      expect(result).toEqual({ id: 3, judul: 'Buku C' });
    });
  });

  describe('update', () => {
    it('should call pustakaService.update with id and data', async () => {
      const data = { judul: 'Buku Updated', isPublic: false };
      pustakaService.update.mockResolvedValue({ id: 1, ...data } as any);

      const result = await controller.update('1', data);

      expect(pustakaService.update).toHaveBeenCalledWith(1, data);
      expect(result).toEqual({ id: 1, ...data });
    });
  });

  describe('delete', () => {
    it('should call pustakaService.delete with parsed id', async () => {
      pustakaService.delete.mockResolvedValue({ message: 'Item pustaka berhasil dihapus' } as any);

      const result = await controller.delete('1');

      expect(pustakaService.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Item pustaka berhasil dihapus' });
    });
  });
});
