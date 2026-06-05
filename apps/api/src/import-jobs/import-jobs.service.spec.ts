import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ImportJobsService } from './import-jobs.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';

// ─── Test data ───

const mockImportJob = {
  id: 1,
  uuid: 'job-uuid-1',
  importType: 'anggota',
  fileName: 'anggota.csv',
  filePath: '/uploads/anggota.csv',
  status: 'completed',
  totalRows: 3,
  successRows: 3,
  warningRows: 0,
  errorRows: 0,
  importedBy: 1,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const mockRowLog = {
  id: 1,
  uuid: 'log-uuid-1',
  importJobId: 1,
  rowNumber: 1,
  rawData: {},
  status: 'success',
  messages: [],
  createdRecordId: '10',
  createdAt: new Date('2025-01-01'),
};

const mockAnggota = {
  id: 10,
  uuid: 'anggota-uuid',
  nomorAnggota: 'THS-001',
  namaLengkap: 'Budi Santoso',
  jenisKelamin: 'L',
  rantingId: 5,
};

describe('ImportJobsService', () => {
  let service: ImportJobsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportJobsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ImportJobsService>(ImportJobsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  //  create()
  // ──────────────────────────────────────────────

  describe('create', () => {
    it('should create an import job', async () => {
      const data = { importType: 'anggota', fileName: 'data.csv', importedBy: 1 };
      (prisma.importJob.create as jest.Mock).mockResolvedValue(mockImportJob);

      const result = await service.create(data);

      expect(prisma.importJob.create).toHaveBeenCalledWith({ data });
      expect(result).toEqual(mockImportJob);
    });

    it('should create import job with filePath', async () => {
      const data = { importType: 'calon_anggota', fileName: 'calon.csv', filePath: '/uploads/calon.csv', importedBy: 1 };
      (prisma.importJob.create as jest.Mock).mockResolvedValue({ ...mockImportJob, ...data });

      const result = await service.create(data);

      expect(prisma.importJob.create).toHaveBeenCalledWith({
        data: { importType: 'calon_anggota', fileName: 'calon.csv', filePath: '/uploads/calon.csv', importedBy: 1 },
      });
      expect(result.filePath).toBe('/uploads/calon.csv');
    });
  });

  // ──────────────────────────────────────────────
  //  findAll()
  // ──────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated import jobs', async () => {
      (prisma.importJob.findMany as jest.Mock).mockResolvedValue([mockImportJob]);
      (prisma.importJob.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll();

      expect(prisma.importJob.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        include: { pengimport: { select: { id: true, name: true } }, _count: { select: { rowLogs: true } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result.data).toEqual([mockImportJob]);
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 20, totalPages: 1 });
    });

    it('should filter by importType', async () => {
      (prisma.importJob.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.importJob.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 20, 'calon_anggota');

      expect(prisma.importJob.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { importType: 'calon_anggota' } }),
      );
      expect(prisma.importJob.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: { importType: 'calon_anggota' } }),
      );
    });

    it('should apply pagination correctly', async () => {
      (prisma.importJob.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.importJob.count as jest.Mock).mockResolvedValue(55);

      const result = await service.findAll(3, 10);

      expect(prisma.importJob.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
      expect(result.meta).toEqual({ total: 55, page: 3, limit: 10, totalPages: 6 });
    });
  });

  // ──────────────────────────────────────────────
  //  findById()
  // ──────────────────────────────────────────────

  describe('findById', () => {
    it('should return import job with row logs', async () => {
      const jobWithLogs = {
        ...mockImportJob,
        pengimport: { id: 1, name: 'admin' },
        rowLogs: [mockRowLog],
      };
      (prisma.importJob.findUnique as jest.Mock).mockResolvedValue(jobWithLogs);

      const result = await service.findById(1);

      expect(prisma.importJob.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          pengimport: { select: { id: true, name: true } },
          rowLogs: { orderBy: { rowNumber: 'asc' }, take: 100 },
        },
      });
      expect(result).toEqual(jobWithLogs);
    });

    it('should throw NotFoundException when job not found', async () => {
      (prisma.importJob.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────────
  //  getRowLogs()
  // ──────────────────────────────────────────────

  describe('getRowLogs', () => {
    it('should return paginated row logs', async () => {
      (prisma.importRowLog.findMany as jest.Mock).mockResolvedValue([mockRowLog]);
      (prisma.importRowLog.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getRowLogs(1);

      expect(prisma.importRowLog.findMany).toHaveBeenCalledWith({
        where: { importJobId: 1 },
        skip: 0,
        take: 50,
        orderBy: { rowNumber: 'asc' },
      });
      expect(result.data).toEqual([mockRowLog]);
    });

    it('should filter by status', async () => {
      (prisma.importRowLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.importRowLog.count as jest.Mock).mockResolvedValue(0);

      await service.getRowLogs(1, 'error');

      expect(prisma.importRowLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { importJobId: 1, status: 'error' } }),
      );
    });
  });

  // ──────────────────────────────────────────────
  //  processImport()
  // ──────────────────────────────────────────────

  describe('processImport', () => {
    beforeEach(() => {
      (prisma.importJob.update as jest.Mock).mockResolvedValue(mockImportJob);
    });

    it('should process anggota import rows', async () => {
      const rows = [
        { nomorAnggota: 'THS-001', namaLengkap: 'Budi', jenisKelamin: 'L', rantingId: 5 },
      ];
      (prisma.anggota.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.anggota.create as jest.Mock).mockResolvedValue(mockAnggota);
      (prisma.importRowLog.create as jest.Mock).mockResolvedValue(mockRowLog);

      const result = await service.processImport(1, rows, 'anggota');

      expect(prisma.importJob.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'processing', totalRows: 1 },
      });
      expect(prisma.anggota.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ nomorAnggota: 'THS-001' }),
        }),
      );
      expect(result).toEqual(mockImportJob);
    });

    it('should process calon_anggota import rows', async () => {
      const rows = [
        { namaLengkap: 'Calon Baru', jenisKelamin: 'P', rantingId: 5, usulOlehUserId: 1 },
      ];
      (prisma.calonAnggota.create as jest.Mock).mockResolvedValue({ id: 20, namaLengkap: 'Calon Baru' });
      (prisma.importRowLog.create as jest.Mock).mockResolvedValue(mockRowLog);
      (prisma.importJob.update as jest.Mock).mockResolvedValue(mockImportJob);

      const result = await service.processImport(1, rows, 'calon_anggota');

      expect(prisma.calonAnggota.create).toHaveBeenCalled();
      expect(result).toEqual(mockImportJob);
    });

    it('should handle unknown import type with warning', async () => {
      const rows = [{ some: 'data' }];
      (prisma.importRowLog.create as jest.Mock).mockResolvedValue(mockRowLog);
      (prisma.importJob.update as jest.Mock).mockResolvedValue({
        ...mockImportJob,
        warningRows: 1,
        status: 'completed_with_errors',
      });

      const result = await service.processImport(1, rows, 'unknown_type');

      expect(prisma.importRowLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'warning',
            messages: ['Unknown import type: unknown_type'],
          }),
        }),
      );
      expect(result.warningRows).toBe(1);
    });

    it('should handle row processing errors gracefully', async () => {
      const rows = [
        { nomorAnggota: 'THS-001' }, // Missing required fields will throw
      ];
      (prisma.importRowLog.create as jest.Mock).mockResolvedValue(mockRowLog);
      (prisma.importJob.update as jest.Mock).mockResolvedValue({
        ...mockImportJob,
        errorRows: 1,
        status: 'completed_with_errors',
      });

      const result = await service.processImport(1, rows, 'anggota');

      expect(prisma.importRowLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'error',
            messages: [expect.stringContaining('Missing required fields')],
          }),
        }),
      );
      expect(result.errorRows).toBe(1);
    });

    it('should handle non-Error thrown values with Unknown error fallback', async () => {
      // Make the anggota findUnique throw a non-Error value (no .message property)
      // This exercises the 'err.message || "Unknown error"' branch in the catch
      (prisma.anggota.findUnique as jest.Mock).mockImplementation(() => {
        // Throw a plain object without .message to trigger the 'Unknown error' fallback
        throw { code: 'DB_ERROR' };
      });
      (prisma.importJob.update as jest.Mock).mockResolvedValue(mockImportJob);
      (prisma.importRowLog.create as jest.Mock).mockResolvedValue(mockRowLog);

      const rows = [
        { nomorAnggota: 'THS-001', namaLengkap: 'Budi', jenisKelamin: 'L', rantingId: 5 },
      ];

      await service.processImport(1, rows, 'anggota');

      // Should log error with 'Unknown error' message
      expect(prisma.importRowLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'error',
            messages: ['Unknown error'],
          }),
        }),
      );
    });

    it('should complete with completed status when no errors', async () => {
      const rows = [
        { nomorAnggota: 'THS-001', namaLengkap: 'Budi', jenisKelamin: 'L', rantingId: 5 },
      ];
      (prisma.anggota.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.anggota.create as jest.Mock).mockResolvedValue(mockAnggota);
      (prisma.importRowLog.create as jest.Mock).mockResolvedValue(mockRowLog);
      (prisma.importJob.update as jest.Mock).mockResolvedValue({
        ...mockImportJob,
        successRows: 1,
        errorRows: 0,
        status: 'completed',
      });

      const result = await service.processImport(1, rows, 'anggota');

      expect(result.status).toBe('completed');
      expect(result.errorRows).toBe(0);
    });
  });

  // ──────────────────────────────────────────────
  //  processAnggotaRow() — tested via processImport
  //  Additional: existing anggota update path
  // ──────────────────────────────────────────────

  describe('processAnggotaRow (via processImport)', () => {
    it('should update existing anggota when nomorAnggota already exists', async () => {
      const rows = [
        { nomorAnggota: 'THS-001', namaLengkap: 'Budi Update', jenisKelamin: 'L', rantingId: 5, noHp: '081234567890' },
      ];
      // Existing anggota found
      (prisma.anggota.findUnique as jest.Mock).mockResolvedValue({ id: 10, nomorAnggota: 'THS-001' });
      (prisma.anggota.update as jest.Mock).mockResolvedValue({ id: 10, namaLengkap: 'Budi Update' });
      (prisma.importRowLog.create as jest.Mock).mockResolvedValue(mockRowLog);
      (prisma.importJob.update as jest.Mock).mockResolvedValue(mockImportJob);

      await service.processImport(1, rows, 'anggota');

      expect(prisma.anggota.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: expect.objectContaining({ namaLengkap: 'Budi Update', noHp: '081234567890' }),
      });
      expect(prisma.importRowLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ messages: ['Updated existing member'] }),
        }),
      );
    });

    it('should create new anggota when nomorAnggota does not exist', async () => {
      const rows = [
        { nomorAnggota: 'THS-NEW', namaLengkap: 'Anggota Baru', jenisKelamin: 'L', rantingId: 5 },
      ];
      (prisma.anggota.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.anggota.create as jest.Mock).mockResolvedValue({ id: 99, nomorAnggota: 'THS-NEW' });
      (prisma.importRowLog.create as jest.Mock).mockResolvedValue(mockRowLog);
      (prisma.importJob.update as jest.Mock).mockResolvedValue(mockImportJob);

      await service.processImport(1, rows, 'anggota');

      expect(prisma.anggota.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ nomorAnggota: 'THS-NEW', namaLengkap: 'Anggota Baru' }),
        }),
      );
    });
  });
});
