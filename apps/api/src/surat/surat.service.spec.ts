import { Test, TestingModule } from '@nestjs/testing';
import { SuratService } from './surat.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';

// ─── Test data ───

const mockSuratMasuk = {
  id: 1,
  uuid: 'masuk-uuid-1',
  nomorSurat: 'SM-001',
  pengirim: 'Dinas X',
  perihal: 'Undangan Rapat',
  tanggalSurat: new Date('2025-01-10'),
  tanggalTerima: new Date('2025-01-12'),
  filePath: null,
  createdAt: new Date('2025-01-12'),
};

const mockSuratMasuk2 = {
  id: 2,
  uuid: 'masuk-uuid-2',
  nomorSurat: 'SM-002',
  pengirim: 'Instansi Y',
  perihal: 'Pemberitahuan',
  tanggalSurat: new Date('2025-02-01'),
  tanggalTerima: new Date('2025-02-03'),
  filePath: 'surat.pdf',
  createdAt: new Date('2025-02-03'),
};

const mockSuratKeluar = {
  id: 1,
  uuid: 'keluar-uuid-1',
  nomorSurat: 'SK-001',
  penerima: 'Dinas Z',
  perihal: 'Permohonan Data',
  tanggalSurat: new Date('2025-01-15'),
  filePath: null,
  createdAt: new Date('2025-01-15'),
};

describe('SuratService', () => {
  let service: SuratService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuratService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SuratService>(SuratService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  //  createMasuk()
  // ──────────────────────────────────────────────

  describe('createMasuk', () => {
    it('should create surat masuk with date conversion', async () => {
      const dto = {
        nomorSurat: 'SM-003',
        pengirim: 'Pemerintah',
        perihal: 'Surat Edaran',
        tanggalSurat: '2025-03-01',
        tanggalTerima: '2025-03-05',
        filePath: 'edaran.pdf',
        diterimaOleh: 1,
      };

      const expected = {
        ...mockSuratMasuk2,
        nomorSurat: 'SM-003',
        pengirim: 'Pemerintah',
        perihal: 'Surat Edaran',
        filePath: 'edaran.pdf',
      };

      (prisma.suratMasuk.create as jest.Mock).mockResolvedValue(expected);

      const result = await service.createMasuk(dto);

      expect(prisma.suratMasuk.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          tanggalSurat: new Date('2025-03-01'),
          tanggalTerima: new Date('2025-03-05'),
        },
      });
      expect(result).toEqual(expected);
    });

    it('should create surat masuk without optional fields', async () => {
      const dto = {
        nomorSurat: 'SM-004',
        pengirim: 'Supplier',
        perihal: 'Penawaran',
        tanggalSurat: '2025-04-01',
        tanggalTerima: '2025-04-02',
        diterimaOleh: 1,
      };

      (prisma.suratMasuk.create as jest.Mock).mockResolvedValue({ ...mockSuratMasuk, ...dto });

      await service.createMasuk(dto);

      expect(prisma.suratMasuk.create).toHaveBeenCalledWith({
        data: {
          nomorSurat: 'SM-004',
          pengirim: 'Supplier',
          perihal: 'Penawaran',
          tanggalSurat: new Date('2025-04-01'),
          tanggalTerima: new Date('2025-04-02'),
          diterimaOleh: 1,
        },
      });
    });
  });

  // ──────────────────────────────────────────────
  //  createKeluar()
  // ──────────────────────────────────────────────

  describe('createKeluar', () => {
    it('should create surat keluar with date conversion', async () => {
      const dto = {
        nomorSurat: 'SK-002',
        penerima: 'Kementerian',
        perihal: 'Laporan',
        tanggalSurat: '2025-03-10',
        dibuatOleh: 1,
      };

      (prisma.suratKeluar.create as jest.Mock).mockResolvedValue({
        ...mockSuratKeluar,
        ...dto,
        tanggalSurat: new Date('2025-03-10'),
      });

      const result = await service.createKeluar(dto);

      expect(prisma.suratKeluar.create).toHaveBeenCalledWith({
        data: {
          nomorSurat: 'SK-002',
          penerima: 'Kementerian',
          perihal: 'Laporan',
          tanggalSurat: new Date('2025-03-10'),
          dibuatOleh: 1,
        },
      });
      expect(result.nomorSurat).toBe('SK-002');
    });
  });

  // ──────────────────────────────────────────────
  //  findAll() — combined surat masuk + keluar
  // ──────────────────────────────────────────────

  describe('findAll', () => {
    it('should combine and sort surat masuk and keluar by createdAt desc', async () => {
      (prisma.suratMasuk.findMany as jest.Mock).mockResolvedValue([mockSuratMasuk2, mockSuratMasuk]);
      (prisma.suratKeluar.findMany as jest.Mock).mockResolvedValue([mockSuratKeluar]);
      (prisma.suratMasuk.count as jest.Mock).mockResolvedValue(2);
      (prisma.suratKeluar.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll();

      // Verify queries use same pagination
      expect(prisma.suratMasuk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10, orderBy: { createdAt: 'desc' } }),
      );
      expect(prisma.suratKeluar.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10, orderBy: { createdAt: 'desc' } }),
      );

      // 3 total items, combined and sorted
      expect(result.data).toHaveLength(3);
      expect(result.meta).toEqual({ total: 3, page: 1, limit: 10, totalPages: 1 });

      // Data sorted by createdAt desc: SM-002 (Feb 3), SK-001 (Jan 15), SM-001 (Jan 12)
      // But sorted descending means newest first: SM-002 (Feb 3), SK-001 (Jan 15), SM-001 (Jan 12)
      // Check sorting — most recent first
      const dates = result.data.map((item: any) => item.createdAt.getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
      }
    });

    it('should handle empty result', async () => {
      (prisma.suratMasuk.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.suratKeluar.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.suratMasuk.count as jest.Mock).mockResolvedValue(0);
      (prisma.suratKeluar.count as jest.Mock).mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toHaveLength(0);
      expect(result.meta).toEqual({ total: 0, page: 1, limit: 10, totalPages: 0 });
    });

    it('should apply pagination to both queries', async () => {
      (prisma.suratMasuk.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.suratKeluar.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.suratMasuk.count as jest.Mock).mockResolvedValue(8);
      (prisma.suratKeluar.count as jest.Mock).mockResolvedValue(12);

      const result = await service.findAll(2, 10);

      expect(prisma.suratMasuk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10, orderBy: { createdAt: 'desc' } }),
      );
      expect(prisma.suratKeluar.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10, orderBy: { createdAt: 'desc' } }),
      );
      expect(result.meta).toEqual({ total: 20, page: 2, limit: 10, totalPages: 2 });
    });

    it('should add pengirim and penerima fields correctly for combined data', async () => {
      (prisma.suratMasuk.findMany as jest.Mock).mockResolvedValue([mockSuratMasuk]);
      (prisma.suratKeluar.findMany as jest.Mock).mockResolvedValue([mockSuratKeluar]);
      (prisma.suratMasuk.count as jest.Mock).mockResolvedValue(1);
      (prisma.suratKeluar.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll();

      const masukItem = result.data.find((item: any) => item.nomorSurat === 'SM-001');
      const keluarItem = result.data.find((item: any) => item.nomorSurat === 'SK-001');

      expect((masukItem as any).pengirim).toBe('Dinas X');
      expect((keluarItem as any).penerima).toBe('Dinas Z');
    });
  });

  // ──────────────────────────────────────────────
  //  findAllMasuk()
  // ──────────────────────────────────────────────

  describe('findAllMasuk', () => {
    it('should return paginated surat masuk', async () => {
      const mockData = [mockSuratMasuk, mockSuratMasuk2];
      (prisma.suratMasuk.findMany as jest.Mock).mockResolvedValue(mockData);
      (prisma.suratMasuk.count as jest.Mock).mockResolvedValue(2);

      const result = await service.findAllMasuk();

      expect(result).toEqual({
        data: mockData,
        meta: { total: 2, page: 1, limit: 10, totalPages: 1 },
      });
    });

    it('should apply pagination', async () => {
      (prisma.suratMasuk.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.suratMasuk.count as jest.Mock).mockResolvedValue(15);

      const result = await service.findAllMasuk(2, 5);

      expect(prisma.suratMasuk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5, orderBy: { createdAt: 'desc' } }),
      );
      expect(result.meta).toEqual({ total: 15, page: 2, limit: 5, totalPages: 3 });
    });
  });

  // ──────────────────────────────────────────────
  //  findAllKeluar()
  // ──────────────────────────────────────────────

  describe('findAllKeluar', () => {
    it('should return paginated surat keluar', async () => {
      const mockData = [mockSuratKeluar];
      (prisma.suratKeluar.findMany as jest.Mock).mockResolvedValue(mockData);
      (prisma.suratKeluar.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAllKeluar();

      expect(result).toEqual({
        data: mockData,
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });
    });

    it('should filter surat keluar by scopeType', async () => {
      (prisma.suratKeluar.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.suratKeluar.count as jest.Mock).mockResolvedValue(0);

      await service.findAllKeluar(1, 10, 'ranting');

      expect(prisma.suratKeluar.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { scopeType: 'ranting' } }),
      );
      expect(prisma.suratKeluar.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: { scopeType: 'ranting' } }),
      );
    });

    it('should filter surat keluar by scopeType and scopeId', async () => {
      (prisma.suratKeluar.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.suratKeluar.count as jest.Mock).mockResolvedValue(0);

      await service.findAllKeluar(1, 10, 'distrik', 3);

      expect(prisma.suratKeluar.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { scopeType: 'distrik', scopeId: 3 } }),
      );
    });
  });

  // ──────────────────────────────────────────────
  //  findAll() — dengan scopeType / scopeId
  // ──────────────────────────────────────────────

  describe('findAll with scope filters', () => {
    it('should filter by scopeType', async () => {
      (prisma.suratMasuk.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.suratKeluar.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.suratMasuk.count as jest.Mock).mockResolvedValue(0);
      (prisma.suratKeluar.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 10, 'ranting');

      expect(prisma.suratMasuk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { scopeType: 'ranting' } }),
      );
      expect(prisma.suratKeluar.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { scopeType: 'ranting' } }),
      );
    });

    it('should filter by scopeType and scopeId', async () => {
      (prisma.suratMasuk.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.suratKeluar.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.suratMasuk.count as jest.Mock).mockResolvedValue(0);
      (prisma.suratKeluar.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 10, 'distrik', 5);

      expect(prisma.suratMasuk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { scopeType: 'distrik', scopeId: 5 } }),
      );
      expect(prisma.suratKeluar.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { scopeType: 'distrik', scopeId: 5 } }),
      );
    });
  });

  // ──────────────────────────────────────────────
  //  updateMasuk()
  // ──────────────────────────────────────────────

  describe('updateMasuk', () => {
    it('should update surat masuk fields', async () => {
      const updated = { id: 1, nomorSurat: 'SM-001-UPDATED', pengirim: 'Updated' };
      (prisma.suratMasuk.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.updateMasuk(1, { nomorSurat: 'SM-001-UPDATED', pengirim: 'Updated' });

      expect(prisma.suratMasuk.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { nomorSurat: 'SM-001-UPDATED', pengirim: 'Updated' },
      });
      expect(result).toEqual(updated);
    });

    it('should convert tanggalSurat to Date when updating', async () => {
      (prisma.suratMasuk.update as jest.Mock).mockResolvedValue({ id: 1 });

      await service.updateMasuk(1, { perihal: 'Revisi', tanggalSurat: '2025-06-01' });

      expect(prisma.suratMasuk.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { perihal: 'Revisi', tanggalSurat: new Date('2025-06-01') },
      });
    });
  });

  // ──────────────────────────────────────────────
  //  deleteMasuk()
  // ──────────────────────────────────────────────

  describe('deleteMasuk', () => {
    it('should delete surat masuk by id', async () => {
      (prisma.suratMasuk.delete as jest.Mock).mockResolvedValue({ id: 1 });

      const result = await service.deleteMasuk(1);

      expect(prisma.suratMasuk.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ id: 1 });
    });
  });

  // ──────────────────────────────────────────────
  //  updateKeluar()
  // ──────────────────────────────────────────────

  describe('updateKeluar', () => {
    it('should update surat keluar fields', async () => {
      const updated = { id: 1, nomorSurat: 'SK-001-UPDATED', penerima: 'Updated' };
      (prisma.suratKeluar.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.updateKeluar(1, { nomorSurat: 'SK-001-UPDATED' });

      expect(prisma.suratKeluar.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { nomorSurat: 'SK-001-UPDATED' },
      });
      expect(result).toEqual(updated);
    });

    it('should convert tanggalSurat to Date when updating keluar', async () => {
      (prisma.suratKeluar.update as jest.Mock).mockResolvedValue({ id: 1 });

      await service.updateKeluar(1, { penerima: 'New Recipient', tanggalSurat: '2025-07-01' });

      expect(prisma.suratKeluar.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { penerima: 'New Recipient', tanggalSurat: new Date('2025-07-01') },
      });
    });

    it('should update surat keluar without tanggalSurat (no date conversion)', async () => {
      (prisma.suratKeluar.update as jest.Mock).mockResolvedValue({ id: 1 });

      await service.updateKeluar(1, { penerima: 'Only Name Change' });

      expect(prisma.suratKeluar.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { penerima: 'Only Name Change' },
      });
    });
  });

  // ──────────────────────────────────────────────
  //  findAllMasuk() — scope filters
  // ──────────────────────────────────────────────

  describe('findAllMasuk with scope filters', () => {
    it('should filter surat masuk by scopeType', async () => {
      (prisma.suratMasuk.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.suratMasuk.count as jest.Mock).mockResolvedValue(0);

      await service.findAllMasuk(1, 10, 'ranting');

      expect(prisma.suratMasuk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { scopeType: 'ranting' } }),
      );
      expect(prisma.suratMasuk.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: { scopeType: 'ranting' } }),
      );
    });

    it('should filter surat masuk by scopeType and scopeId', async () => {
      (prisma.suratMasuk.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.suratMasuk.count as jest.Mock).mockResolvedValue(0);

      await service.findAllMasuk(1, 10, 'distrik', 7);

      expect(prisma.suratMasuk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { scopeType: 'distrik', scopeId: 7 } }),
      );
    });
  });

  // ──────────────────────────────────────────────
  //  deleteKeluar()
  // ──────────────────────────────────────────────

  describe('deleteKeluar', () => {
    it('should delete surat keluar by id', async () => {
      (prisma.suratKeluar.delete as jest.Mock).mockResolvedValue({ id: 1 });

      const result = await service.deleteKeluar(1);

      expect(prisma.suratKeluar.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ id: 1 });
    });
  });
});
