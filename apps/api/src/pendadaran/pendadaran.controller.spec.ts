import { Test } from '@nestjs/testing';
import { PendadaranController } from './pendadaran.controller.js';
import { PendadaranService } from './pendadaran.service.js';

describe('PendadaranController', () => {
  let controller: PendadaranController;
  let pendadaranService: jest.Mocked<PendadaranService>;

  beforeEach(async () => {
    pendadaranService = {
      getAspek: jest.fn(),
      createAspek: jest.fn(),
      createItem: jest.fn(),
      assignPenguji: jest.fn(),
      getPengujiByKegiatan: jest.fn(),
      inputNilai: jest.fn(),
      inputNilaiBulk: jest.fn(),
      hitungHasil: jest.fn(),
      validasiHasil: jest.fn(),
      findAll: jest.fn(),
      findByCalon: jest.fn(),
      getNilaiDetail: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      controllers: [PendadaranController],
      providers: [
        { provide: PendadaranService, useValue: pendadaranService },
      ],
    }).compile();

    controller = module.get(PendadaranController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAspek', () => {
    it('should call pendadaranService.getAspek', async () => {
      pendadaranService.getAspek.mockResolvedValue([{ id: 1, nama: 'Kedisiplinan', items: [] }] as any);

      const result = await controller.getAspek();

      expect(pendadaranService.getAspek).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('inputNilai', () => {
    it('should call pendadaranService.inputNilai with data from body and req user', async () => {
      const req = { user: { id: 2 } };
      const nilaiData = { kegiatanId: 1, calonAnggotaId: 1, itemPenilaianId: 1, skor: 80 };
      pendadaranService.inputNilai.mockResolvedValue({ id: 1, skor: 80 } as any);

      const result = await controller.inputNilai(req, nilaiData);

      expect(pendadaranService.inputNilai).toHaveBeenCalledWith({
        ...nilaiData,
        pengujiUserId: 2,
      });
      expect(result).toEqual({ id: 1, skor: 80 });
    });
  });

  // ─── createAspek ───
  describe('createAspek', () => {
    it('should call pendadaranService.createAspek with body data', async () => {
      const data = { kodeAspek: 'KOM', namaAspek: 'Komunikasi', bobot: 2 };
      pendadaranService.createAspek.mockResolvedValue({ id: 1, ...data } as any);

      const result = await controller.createAspek(data);

      expect(pendadaranService.createAspek).toHaveBeenCalledWith(data);
      expect(result.namaAspek).toBe('Komunikasi');
    });
  });

  // ─── createItem ───
  describe('createItem', () => {
    it('should call pendadaranService.createItem with body data', async () => {
      const data = { aspekId: 1, kodeItem: 'SIAP', namaItem: 'Kesiapan', skorMaksimal: 100, bobot: 1, urutan: 3 };
      pendadaranService.createItem.mockResolvedValue({ id: 1, ...data } as any);

      const result = await controller.createItem(data);

      expect(pendadaranService.createItem).toHaveBeenCalledWith(data);
      expect(result.namaItem).toBe('Kesiapan');
    });
  });

  // ─── assignPenguji ───
  describe('assignPenguji', () => {
    it('should call pendadaranService.assignPenguji with body data', async () => {
      const data = { kegiatanId: 5, pengujiUserId: 3, peran: 'ketua' };
      pendadaranService.assignPenguji.mockResolvedValue({ id: 1, ...data } as any);

      const result = await controller.assignPenguji(data);

      expect(pendadaranService.assignPenguji).toHaveBeenCalledWith(data);
      expect(result.peran).toBe('ketua');
    });
  });

  // ─── getPenguji ───
  describe('getPenguji', () => {
    it('should call pendadaranService.getPengujiByKegiatan with converted id', async () => {
      pendadaranService.getPengujiByKegiatan.mockResolvedValue([{ id: 1 }] as any);

      const result = await controller.getPenguji('5');

      expect(pendadaranService.getPengujiByKegiatan).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(1);
    });
  });

  // ─── inputNilaiBulk ───
  describe('inputNilaiBulk', () => {
    it('should call pendadaranService.inputNilaiBulk with all params', async () => {
      const req = { user: { id: 3 } };
      const entries = [{ itemPenilaianId: 1, skor: 80 }, { itemPenilaianId: 2, skor: 90 }];
      pendadaranService.inputNilaiBulk.mockResolvedValue([{ id: 1, skor: 80 }, { id: 2, skor: 90 }]);

      const result = await controller.inputNilaiBulk(req, 5, 10, entries);

      expect(pendadaranService.inputNilaiBulk).toHaveBeenCalledWith(5, 10, 3, entries);
      expect(result).toHaveLength(2);
    });
  });

  // ─── hitungHasil ───
  describe('hitungHasil', () => {
    it('should call pendadaranService.hitungHasil with body params', async () => {
      pendadaranService.hitungHasil.mockResolvedValue({ totalSkor: 79, statusKelulusan: 'lulus' } as any);

      const result = await controller.hitungHasil(5, 10);

      expect(pendadaranService.hitungHasil).toHaveBeenCalledWith(5, 10);
      expect(result.statusKelulusan).toBe('lulus');
    });
  });

  // ─── validasiHasil ───
  describe('validasiHasil', () => {
    it('should call pendadaranService.validasiHasil with all params', async () => {
      const req = { user: { id: 2 } };
      pendadaranService.validasiHasil.mockResolvedValue({ statusValidasi: 'lulus' } as any);

      const result = await controller.validasiHasil(req, 5, 10, 'lulus');

      expect(pendadaranService.validasiHasil).toHaveBeenCalledWith(5, 10, 2, 'lulus');
      expect(result.statusValidasi).toBe('lulus');
    });
  });

  // ─── getNilaiDetail ───
  describe('getNilaiDetail', () => {
    it('should call pendadaranService.getNilaiDetail with converted params', async () => {
      pendadaranService.getNilaiDetail.mockResolvedValue([{ id: 1, skor: 85 }] as any);

      const result = await controller.getNilaiDetail('5', '10');

      expect(pendadaranService.getNilaiDetail).toHaveBeenCalledWith(5, 10);
      expect(result).toHaveLength(1);
    });
  });

  describe('findAll', () => {
    it('should call pendadaranService.findAll with params', async () => {
      pendadaranService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      const result = await controller.findAll(undefined, 'lulus', 1, 10);

      expect(pendadaranService.findAll).toHaveBeenCalledWith(undefined, 'lulus', 1, 10);
      expect(result.meta).toEqual({ total: 0, page: 1, limit: 10, totalPages: 0 });
    });

    it('should work without optional filters', async () => {
      pendadaranService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      await controller.findAll(undefined, undefined, undefined, undefined);

      expect(pendadaranService.findAll).toHaveBeenCalledWith(undefined, undefined, undefined, undefined);
    });
  });

  describe('findByCalon', () => {
    it('should call pendadaranService.findByCalon with converted id', async () => {
      pendadaranService.findByCalon.mockResolvedValue([{ id: 1, calonAnggotaId: 5 }] as any);

      const result = await controller.findByCalon('5');

      expect(pendadaranService.findByCalon).toHaveBeenCalledWith(5);
      expect(result).toEqual([{ id: 1, calonAnggotaId: 5 }]);
    });
  });
});
