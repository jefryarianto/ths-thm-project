import { Test } from '@nestjs/testing';
import { KegiatanController } from './kegiatan.controller.js';
import { KegiatanService } from './kegiatan.service.js';

describe('KegiatanController', () => {
  let controller: KegiatanController;
  let kegiatanService: jest.Mocked<KegiatanService>;

  beforeEach(async () => {
    kegiatanService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      publish: jest.fn(),
      close: jest.fn(),
      delete: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      controllers: [KegiatanController],
      providers: [
        { provide: KegiatanService, useValue: kegiatanService },
      ],
    }).compile();

    controller = module.get(KegiatanController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call kegiatanService.create with data and creator', async () => {
      const req = { user: { id: 1 } };
      const data = { nama: 'Latihan Gabungan', tipe: 'latihan', tanggalMulai: '2026-06-15', lokasi: 'GOR', scopeType: 'ranting', scopeId: 1 };
      kegiatanService.create.mockResolvedValue({ id: 1, ...data } as any);

      const result = await controller.create(req, data);

      expect(kegiatanService.create).toHaveBeenCalledWith({ ...data, createdBy: 1 });
      expect(result).toEqual({ id: 1, ...data });
    });
  });

  describe('findAll', () => {
    it('should call kegiatanService.findAll with params', async () => {
      kegiatanService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      const result = await controller.findAll(1, 20, 'Pendadaran');

      expect(kegiatanService.findAll).toHaveBeenCalledWith(1, 20, 'Pendadaran', undefined, undefined, undefined);
      expect(result.meta.page).toBe(1);
    });

    it('should work without optional filters', async () => {
      kegiatanService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      await controller.findAll(undefined, undefined, undefined, undefined, undefined, undefined);

      expect(kegiatanService.findAll).toHaveBeenCalledWith(undefined, undefined, undefined, undefined, undefined, undefined);
    });
  });

  describe('findById', () => {
    it('should call kegiatanService.findById with converted id', async () => {
      kegiatanService.findById.mockResolvedValue({ id: 1, nama: 'Latihan' } as any);

      const result = await controller.findById('1');

      expect(kegiatanService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, nama: 'Latihan' });
    });
  });

  // ─── update ───
  describe('update', () => {
    it('should call kegiatanService.update with converted id and data', async () => {
      kegiatanService.update.mockResolvedValue({ id: 1, nama: 'Updated' } as any);

      const result = await controller.update('1', { nama: 'Updated', lokasi: 'Lapangan' });

      expect(kegiatanService.update).toHaveBeenCalledWith(1, { nama: 'Updated', lokasi: 'Lapangan' });
      expect(result.nama).toBe('Updated');
    });
  });

  // ─── publish ───
  describe('publish', () => {
    it('should call kegiatanService.publish with converted id', async () => {
      kegiatanService.publish.mockResolvedValue({ id: 1, status: 'published' } as any);

      const result = await controller.publish('1');

      expect(kegiatanService.publish).toHaveBeenCalledWith(1);
      expect(result.status).toBe('published');
    });
  });

  // ─── close ───
  describe('close', () => {
    it('should call kegiatanService.close with converted id', async () => {
      kegiatanService.close.mockResolvedValue({ id: 1, status: 'closed' } as any);

      const result = await controller.close('1');

      expect(kegiatanService.close).toHaveBeenCalledWith(1);
      expect(result.status).toBe('closed');
    });
  });

  // ─── delete ───
  describe('delete', () => {
    it('should call kegiatanService.delete with converted id', async () => {
      kegiatanService.delete.mockResolvedValue({ id: 1 } as any);

      const result = await controller.delete('1');

      expect(kegiatanService.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });
  });
});
