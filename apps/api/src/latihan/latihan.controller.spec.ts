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
      addCatatan: jest.fn(),
      getCatatanByLatihan: jest.fn(),
      updateCatatan: jest.fn(),
      deleteCatatan: jest.fn(),
      addDokumentasi: jest.fn(),
      getDokumentasiByLatihan: jest.fn(),
      reorderDokumentasi: jest.fn(),
      deleteDokumentasi: jest.fn(),
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

  // ─── catatan ───

  describe('addCatatan', () => {
    it('should call service.addCatatan with latihanId, data, and userId', async () => {
      const req = { user: { id: 3 } };
      const data = { anggotaId: 2, catatanKhusus: 'Perlu perbaikan' };
      latihanService.addCatatan.mockResolvedValue({ id: 1, ...data } as any);

      const result = await controller.addCatatan('1', req, data);

      expect(latihanService.addCatatan).toHaveBeenCalledWith(1, data, 3);
      expect(result).toEqual({ id: 1, ...data });
    });
  });

  describe('getCatatan', () => {
    it('should call service.getCatatanByLatihan with latihanId', async () => {
      latihanService.getCatatanByLatihan.mockResolvedValue([{ id: 1 }] as any);

      const result = await controller.getCatatan('1');

      expect(latihanService.getCatatanByLatihan).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('updateCatatan', () => {
    it('should call service.updateCatatan with catatanId and data', async () => {
      latihanService.updateCatatan.mockResolvedValue({ id: 1, catatanKhusus: 'Updated' } as any);

      const result = await controller.updateCatatan('1', { catatanKhusus: 'Updated' });

      expect(latihanService.updateCatatan).toHaveBeenCalledWith(1, { catatanKhusus: 'Updated' });
      expect(result).toEqual({ id: 1, catatanKhusus: 'Updated' });
    });
  });

  describe('deleteCatatan', () => {
    it('should call service.deleteCatatan with catatanId', async () => {
      latihanService.deleteCatatan.mockResolvedValue({ message: 'Catatan berhasil dihapus' } as any);

      const result = await controller.deleteCatatan('1');

      expect(latihanService.deleteCatatan).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Catatan berhasil dihapus' });
    });
  });

  // ─── dokumentasi ───

  describe('getDokumentasi', () => {
    it('should call service.getDokumentasiByLatihan with latihanId', async () => {
      latihanService.getDokumentasiByLatihan.mockResolvedValue([{ id: 1, fileUrl: 'https://...' }] as any);

      const result = await controller.getDokumentasi('1');

      expect(latihanService.getDokumentasiByLatihan).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('reorderDokumentasi', () => {
    it('should call service.reorderDokumentasi with id and orders', async () => {
      const orders = [{ id: 1, urutan: 2 }, { id: 2, urutan: 1 }];
      latihanService.reorderDokumentasi.mockResolvedValue([] as any);

      await controller.reorderDokumentasi('1', { orders });

      expect(latihanService.reorderDokumentasi).toHaveBeenCalledWith(1, orders);
    });
  });

  describe('deleteDokumentasi', () => {
    it('should call service.deleteDokumentasi with dokumentasiId', async () => {
      latihanService.deleteDokumentasi.mockResolvedValue({ message: 'Dokumentasi berhasil dihapus' } as any);

      const result = await controller.deleteDokumentasi('5');

      expect(latihanService.deleteDokumentasi).toHaveBeenCalledWith(5);
      expect(result).toEqual({ message: 'Dokumentasi berhasil dihapus' });
    });
  });
});
