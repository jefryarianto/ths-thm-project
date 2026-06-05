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
});
