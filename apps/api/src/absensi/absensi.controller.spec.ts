import { Test } from '@nestjs/testing';
import { AbsensiController } from './absensi.controller.js';
import { AbsensiService } from './absensi.service.js';

describe('AbsensiController', () => {
  let controller: AbsensiController;
  let absensiService: jest.Mocked<AbsensiService>;

  beforeEach(async () => {
    absensiService = {
      recordLatihan: jest.fn(),
      recordKegiatan: jest.fn(),
      recordLatihanBulk: jest.fn(),
      findLatihanByLatihan: jest.fn(),
      findKegiatanByKegiatan: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      controllers: [AbsensiController],
      providers: [
        { provide: AbsensiService, useValue: absensiService },
      ],
    }).compile();

    controller = module.get(AbsensiController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── recordLatihan ───
  describe('recordLatihan', () => {
    it('should call absensiService.recordLatihan with data', async () => {
      const req = { user: { id: 1 } };
      const data = { anggotaId: 1, latihanId: 2, checkinMethod: 'manual', checkinTime: '2026-06-01T10:00:00Z' };
      absensiService.recordLatihan.mockResolvedValue({ id: 1 } as any);

      const result = await controller.recordLatihan(req, data);

      expect(absensiService.recordLatihan).toHaveBeenCalledWith({ ...data, recordedBy: 1 });
      expect(result).toEqual({ id: 1 });
    });
  });

  // ─── recordKegiatan ───
  describe('recordKegiatan', () => {
    it('should call absensiService.recordKegiatan with data', async () => {
      const req = { user: { id: 2 } };
      const data = { kegiatanId: 3, calonAnggotaId: 5, checkinTime: '2026-06-15T08:00:00Z' };
      absensiService.recordKegiatan.mockResolvedValue({ id: 1 } as any);

      const result = await controller.recordKegiatan(req, data);

      expect(absensiService.recordKegiatan).toHaveBeenCalledWith({ ...data, recordedBy: 2 });
      expect(result).toEqual({ id: 1 });
    });
  });

  // ─── findByKegiatan ───
  describe('findByKegiatan', () => {
    it('should call absensiService.findKegiatanByKegiatan with parsed id', async () => {
      absensiService.findKegiatanByKegiatan.mockResolvedValue([{ id: 1, kegiatanId: 3 }] as any);

      const result = await controller.findByKegiatan('3');

      expect(absensiService.findKegiatanByKegiatan).toHaveBeenCalledWith(3);
      expect(result).toHaveLength(1);
    });
  });

  // ─── recordLatihanBulk ───
  describe('recordLatihanBulk', () => {
    it('should call absensiService.recordLatihanBulk with entries, latihanId, and userId', async () => {
      const req = { user: { id: 1 } };
      const entries = [{ anggotaId: 1, hadir: true }, { anggotaId: 2, hadir: false }];
      absensiService.recordLatihanBulk.mockResolvedValue({ count: 1 });

      const result = await controller.recordLatihanBulk(req, 5, entries);

      expect(absensiService.recordLatihanBulk).toHaveBeenCalledWith(entries, 5, 1);
      expect(result).toEqual({ count: 1 });
    });
  });

  // ─── findByLatihan ───
  describe('findByLatihan', () => {
    it('should call absensiService.findLatihanByLatihan with parsed id', async () => {
      absensiService.findLatihanByLatihan.mockResolvedValue([{ id: 1, latihanId: 5 }] as any);

      const result = await controller.findByLatihan('5');

      expect(absensiService.findLatihanByLatihan).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(1);
    });
  });
});
