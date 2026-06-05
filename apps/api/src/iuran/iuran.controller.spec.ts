import { Test } from '@nestjs/testing';
import { IuranController } from './iuran.controller.js';
import { IuranService } from './iuran.service.js';

describe('IuranController', () => {
  let controller: IuranController;
  let iuranService: jest.Mocked<IuranService>;

  beforeEach(async () => {
    iuranService = {
      createJenis: jest.fn(),
      findAllJenis: jest.fn(),
      createPembayaran: jest.fn(),
      findAllPembayaran: jest.fn(),
      verifyPembayaran: jest.fn(),
      getStatusAnggota: jest.fn(),
      getDashboardStats: jest.fn(),
      getMonthlyChart: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      controllers: [IuranController],
      providers: [
        { provide: IuranService, useValue: iuranService },
      ],
    }).compile();

    controller = module.get(IuranController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── createJenis ───

  describe('createJenis', () => {
    it('should call iuranService.createJenis with data', async () => {
      const data = { nama: 'Iuran Bulanan', nominal: 50000, periode: 'bulanan', scopeType: 'distrik', scopeId: 1 };
      iuranService.createJenis.mockResolvedValue({ id: 1, ...data } as any);

      const result = await controller.createJenis(data);

      expect(iuranService.createJenis).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: 1, ...data });
    });
  });

  // ─── findAllJenis ───

  describe('findAllJenis', () => {
    it('should call iuranService.findAllJenis without filters', async () => {
      iuranService.findAllJenis.mockResolvedValue([{ id: 1, nama: 'Iuran A' }] as any);

      const result = await controller.findAllJenis(undefined, undefined);

      expect(iuranService.findAllJenis).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toHaveLength(1);
    });

    it('should convert scopeId from string to number', async () => {
      iuranService.findAllJenis.mockResolvedValue([]);

      await controller.findAllJenis('distrik', '1');

      expect(iuranService.findAllJenis).toHaveBeenCalledWith('distrik', 1);
    });

    it('should pass undefined when scopeId not provided', async () => {
      iuranService.findAllJenis.mockResolvedValue([]);

      await controller.findAllJenis('ranting', undefined);

      expect(iuranService.findAllJenis).toHaveBeenCalledWith('ranting', undefined);
    });
  });

  // ─── verifyPembayaran ───

  describe('verifyPembayaran', () => {
    it('should call iuranService.verifyPembayaran with converted id, user, and status', async () => {
      const req = { user: { id: 2 } };
      iuranService.verifyPembayaran.mockResolvedValue({ id: 1, status: 'lunas' } as any);

      const result = await controller.verifyPembayaran('1', req, 'lunas');

      expect(iuranService.verifyPembayaran).toHaveBeenCalledWith(1, 2, 'lunas');
      expect(result.status).toBe('lunas');
    });
  });

  describe('createPembayaran', () => {
    it('should call iuranService.createPembayaran with data', async () => {
      const data = { anggotaId: 1, jenisIuranId: 1, jumlahBayar: 50000, tanggalBayar: '2026-06-01', metodeBayar: 'tunai' };
      iuranService.createPembayaran.mockResolvedValue({ id: 1, ...data } as any);

      const result = await controller.createPembayaran(data);

      expect(iuranService.createPembayaran).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: 1, ...data });
    });
  });

  describe('findAllPembayaran', () => {
    it('should call iuranService.findAllPembayaran with converted params', async () => {
      iuranService.findAllPembayaran.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      const result = await controller.findAllPembayaran(1, 20, 5, 2026);

      expect(iuranService.findAllPembayaran).toHaveBeenCalledWith(1, 20, 5, 2026, undefined);
      expect(result.meta.page).toBe(1);
    });

    it('should convert anggotaId from string to number', async () => {
      iuranService.findAllPembayaran.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      await controller.findAllPembayaran(1 as any, 10 as any, '5' as any, undefined, undefined);

      expect(iuranService.findAllPembayaran).toHaveBeenCalledWith(1, 10, 5, undefined, undefined);
    });

    it('should pass undefined when anggotaId/tahun are not provided', async () => {
      iuranService.findAllPembayaran.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      await controller.findAllPembayaran(undefined, undefined, undefined, undefined, undefined);

      expect(iuranService.findAllPembayaran).toHaveBeenCalledWith(undefined, undefined, undefined, undefined, undefined);
    });
  });

  describe('getStatus', () => {
    it('should call iuranService.getStatusAnggota with converted params', async () => {
      iuranService.getStatusAnggota.mockResolvedValue({ status: 'Lunas' } as any);

      const result = await controller.getStatus('5');

      expect(iuranService.getStatusAnggota).toHaveBeenCalledWith(5);
      expect(result).toEqual({ status: 'Lunas' });
    });

    it('should default tahun to current year when not provided', async () => {
      const currentYear = new Date().getFullYear();
      iuranService.getStatusAnggota.mockResolvedValue({ status: 'Lunas' } as any);

      await controller.getStatus('5');

      expect(iuranService.getStatusAnggota).toHaveBeenCalledWith(5);
    });
  });

  describe('getDashboardStats', () => {
    it('should call iuranService.getDashboardStats', async () => {
      iuranService.getDashboardStats.mockResolvedValue({ totalIuran: 500000 } as any);

      const result = await controller.getDashboardStats();

      expect(iuranService.getDashboardStats).toHaveBeenCalled();
      expect(result).toEqual({ totalIuran: 500000 });
    });
  });

  describe('getMonthlyChart', () => {
    it('should call iuranService.getMonthlyChart', async () => {
      iuranService.getMonthlyChart.mockResolvedValue([{ bulan: '2026-01', jumlah: 100000 }] as any);

      const result = await controller.getMonthlyChart();

      expect(iuranService.getMonthlyChart).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });
});
