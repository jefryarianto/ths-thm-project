import { Test, TestingModule } from '@nestjs/testing';
import { ImportJobsController } from './import-jobs.controller.js';
import { ImportJobsService } from './import-jobs.service.js';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  getRowLogs: jest.fn(),
  processImport: jest.fn(),
};

describe('ImportJobsController', () => {
  let controller: ImportJobsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportJobsController],
      providers: [
        { provide: ImportJobsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<ImportJobsController>(ImportJobsController);
  });

  describe('create', () => {
    it('should create import job with req.user.id', async () => {
      const req = { user: { id: 5 } };
      const data = { importType: 'anggota', fileName: 'data.csv', filePath: '/uploads/data.csv' };
      mockService.create.mockResolvedValue({ id: 1 });

      const result = await controller.create(req as any, data);

      expect(mockService.create).toHaveBeenCalledWith({
        importType: 'anggota',
        fileName: 'data.csv',
        filePath: '/uploads/data.csv',
        importedBy: 5,
      });
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('process', () => {
    it('should process import with rows and importType', async () => {
      const rows = [{ nomorAnggota: '001' }];
      mockService.processImport.mockResolvedValue({ id: 1, status: 'completed' });

      const result = await controller.process('1', 'anggota', rows);

      expect(mockService.processImport).toHaveBeenCalledWith(1, rows, 'anggota');
      expect(result).toEqual({ id: 1, status: 'completed' });
    });
  });

  describe('findAll', () => {
    it('should return paginated import jobs', async () => {
      mockService.findAll.mockResolvedValue({ data: [], meta: { total: 0 } });

      const result = await controller.findAll(1, 20, 'anggota');

      expect(mockService.findAll).toHaveBeenCalledWith(1, 20, 'anggota');
      expect(result).toEqual({ data: [], meta: { total: 0 } });
    });
  });

  describe('findById', () => {
    it('should return import job by id', async () => {
      mockService.findById.mockResolvedValue({ id: 1 });

      const result = await controller.findById('1');

      expect(mockService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('getRowLogs', () => {
    it('should return row logs with filters', async () => {
      mockService.getRowLogs.mockResolvedValue({ data: [], meta: { total: 0 } });

      const result = await controller.getRowLogs('1', 'error', 1, 50);

      expect(mockService.getRowLogs).toHaveBeenCalledWith(1, 'error', 1, 50);
      expect(result).toEqual({ data: [], meta: { total: 0 } });
    });
  });
});
