import { Test } from '@nestjs/testing';
import { AuditController } from './audit.controller.js';
import { AuditService } from './audit.service.js';

describe('AuditController', () => {
  let controller: AuditController;
  let auditService: jest.Mocked<AuditService>;

  beforeEach(async () => {
    auditService = {
      findAll: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    controller = module.get(AuditController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call auditService.findAll with all params', async () => {
      auditService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });

      const result = await controller.findAll(1, 20, 'LOGIN', 2);

      expect(auditService.findAll).toHaveBeenCalledWith(1, 20, 'LOGIN', 2);
      expect(result.meta.page).toBe(1);
    });

    it('should convert userId to number', async () => {
      auditService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });

      await controller.findAll(1, 10, undefined, '3' as any);

      expect(auditService.findAll).toHaveBeenCalledWith(1, 10, undefined, 3);
    });

    it('should pass undefined when userId not provided', async () => {
      auditService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });

      await controller.findAll(undefined, undefined, undefined, undefined);

      expect(auditService.findAll).toHaveBeenCalledWith(undefined, undefined, undefined, undefined);
    });
  });
});
