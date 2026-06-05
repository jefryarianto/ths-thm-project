import { Test } from '@nestjs/testing';
import { LatihanController } from './latihan.controller.js';
import { LatihanService } from './latihan.service.js';

describe('LatihanController', () => {
  let controller: LatihanController;
  let latihanService: jest.Mocked<LatihanService>;

  beforeEach(async () => {
    latihanService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      controllers: [LatihanController],
      providers: [
        { provide: LatihanService, useValue: latihanService },
      ],
    }).compile();

    controller = module.get(LatihanController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should inject req.user.id as pelatihId', async () => {
      const req = { user: { id: 2 } };
      const data = { hariTanggal: '2026-06-15', lokasi: 'GOR', jenisMateri: 'Teknik Dasar', rantingId: 1 };
      const expected = { ...data, pelatihId: 2 };
      latihanService.create.mockResolvedValue({ id: 1, ...expected } as any);

      const result = await controller.create(req, data);

      expect(latihanService.create).toHaveBeenCalledWith(expected);
      expect(result).toEqual({ id: 1, ...expected });
    });
  });

  describe('findAll', () => {
    it('should call latihanService.findAll with params', async () => {
      latihanService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      const result = await controller.findAll(1, 10, 3);

      expect(latihanService.findAll).toHaveBeenCalledWith(1, 10, 3);
      expect(result.meta.page).toBe(1);
    });

    it('should convert rantingId to number', async () => {
      latihanService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      await controller.findAll(1, 10, '3' as any);

      expect(latihanService.findAll).toHaveBeenCalledWith(1, 10, 3);
    });

    it('should pass undefined when rantingId not provided', async () => {
      latihanService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      await controller.findAll(undefined, undefined, undefined);

      expect(latihanService.findAll).toHaveBeenCalledWith(undefined, undefined, undefined);
    });
  });

  describe('findById', () => {
    it('should call latihanService.findById with parsed id', async () => {
      latihanService.findById.mockResolvedValue({ id: 5, jenisMateri: 'Teknik Dasar' } as any);

      const result = await controller.findById('5');

      expect(latihanService.findById).toHaveBeenCalledWith(5);
      expect(result).toEqual({ id: 5, jenisMateri: 'Teknik Dasar' });
    });
  });
});
