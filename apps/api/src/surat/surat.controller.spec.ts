import { Test } from '@nestjs/testing';
import { SuratController } from './surat.controller.js';
import { SuratService } from './surat.service.js';

describe('SuratController', () => {
  let controller: SuratController;
  let suratService: jest.Mocked<SuratService>;

  beforeEach(async () => {
    suratService = {
      findAll: jest.fn(),
      createMasuk: jest.fn(),
      createKeluar: jest.fn(),
      findAllMasuk: jest.fn(),
      findAllKeluar: jest.fn(),
      updateMasuk: jest.fn(),
      deleteMasuk: jest.fn(),
      updateKeluar: jest.fn(),
      deleteKeluar: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      controllers: [SuratController],
      providers: [
        { provide: SuratService, useValue: suratService },
      ],
    }).compile();

    controller = module.get(SuratController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call suratService.findAll with pagination params', async () => {
      suratService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      const result = await controller.findAll();

      expect(suratService.findAll).toHaveBeenCalled();
      expect(result.meta.page).toBe(1);
    });
  });

  describe('createMasuk', () => {
    it('should call suratService.createMasuk with data and req', async () => {
      const req = { user: { id: 1 } };
      const data = { nomorSurat: '001', pengirim: 'Budi', perihal: 'Undangan', tanggalSurat: '2026-06-01', tanggalTerima: '2026-06-02', diterimaOleh: 1 };
      suratService.createMasuk.mockResolvedValue({ id: 1, ...data } as any);

      const result = await controller.createMasuk(data, req);

      expect(suratService.createMasuk).toHaveBeenCalledWith(expect.objectContaining({
        nomorSurat: '001', pengirim: 'Budi', diterimaOleh: 1,
      }));
      expect(result).toEqual({ id: 1, ...data });
    });
  });

  describe('createKeluar', () => {
    it('should call suratService.createKeluar with data and req', async () => {
      const req = { user: { id: 1 } };
      const data = { nomorSurat: '002', perihal: 'Permohonan', tanggalSurat: '2026-06-01', penerima: 'Dinas A', dibuatOleh: 1 };
      suratService.createKeluar.mockResolvedValue({ id: 1, ...data } as any);

      const result = await controller.createKeluar(data, req);

      expect(suratService.createKeluar).toHaveBeenCalledWith(expect.objectContaining({
        nomorSurat: '002', penerima: 'Dinas A', dibuatOleh: 1,
      }));
      expect(result).toEqual({ id: 1, ...data });
    });
  });

  describe('findAllMasuk', () => {
    it('should call suratService.findAllMasuk with pagination', async () => {
      suratService.findAllMasuk.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      await controller.findAllMasuk(1, 20, undefined, undefined);

      expect(suratService.findAllMasuk).toHaveBeenCalledWith(1, 20, undefined, undefined);
    });
  });

  describe('findAllKeluar', () => {
    it('should call suratService.findAllKeluar with pagination', async () => {
      suratService.findAllKeluar.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      await controller.findAllKeluar(1, 20, undefined, undefined);

      expect(suratService.findAllKeluar).toHaveBeenCalledWith(1, 20, undefined, undefined);
    });
  });

  // ─── updateMasuk ───
  describe('updateMasuk', () => {
    it('should call suratService.updateMasuk with converted id and data', async () => {
      suratService.updateMasuk.mockResolvedValue({ id: 1, perihal: 'Updated' } as any);

      const result = await controller.updateMasuk('1', { perihal: 'Updated' });

      expect(suratService.updateMasuk).toHaveBeenCalledWith(1, { perihal: 'Updated' });
      expect(result.perihal).toBe('Updated');
    });
  });

  // ─── deleteMasuk ───
  describe('deleteMasuk', () => {
    it('should call suratService.deleteMasuk with converted id', async () => {
      suratService.deleteMasuk.mockResolvedValue({ id: 1 } as any);

      const result = await controller.deleteMasuk('1');

      expect(suratService.deleteMasuk).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });
  });

  // ─── updateKeluar ───
  describe('updateKeluar', () => {
    it('should call suratService.updateKeluar with converted id and data', async () => {
      suratService.updateKeluar.mockResolvedValue({ id: 1, penerima: 'Updated' } as any);

      const result = await controller.updateKeluar('1', { penerima: 'Updated' });

      expect(suratService.updateKeluar).toHaveBeenCalledWith(1, { penerima: 'Updated' });
      expect(result.penerima).toBe('Updated');
    });
  });

  // ─── deleteKeluar ───
  describe('deleteKeluar', () => {
    it('should call suratService.deleteKeluar with converted id', async () => {
      suratService.deleteKeluar.mockResolvedValue({ id: 1 } as any);

      const result = await controller.deleteKeluar('1');

      expect(suratService.deleteKeluar).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });
  });
});
