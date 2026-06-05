import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { AuditService } from './audit.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';

// ─── Test data ───

const mockAuditLog = {
  id: 1,
  uuid: 'audit-uuid-1',
  actorUserId: 1,
  actor: { id: 1, name: 'admin' },
  action: 'LOGIN',
  entityName: 'user',
  entityId: '1',
  oldValue: null,
  newValue: null,
  ipAddress: '192.168.1.1',
  createdAt: new Date('2025-01-01'),
};

describe('AuditService', () => {
  let service: AuditService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  //  log()
  // ──────────────────────────────────────────────

  describe('log', () => {
    it('should create audit log with all fields', async () => {
      const params = {
        userId: 1,
        action: 'LOGIN',
        entityName: 'user',
        entityId: '1',
        oldValue: { status: 'inactive' },
        newValue: { status: 'active' },
        ipAddress: '192.168.1.1',
      };

      (prisma.auditLog.create as jest.Mock).mockResolvedValue(mockAuditLog);

      const result = await service.log(params);

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          actorUserId: 1,
          action: 'LOGIN',
          entityName: 'user',
          entityId: '1',
          oldValue: { status: 'inactive' },
          newValue: { status: 'active' },
          ipAddress: '192.168.1.1',
        },
      });
      expect(result).toEqual(mockAuditLog);
    });

    it('should use Prisma.JsonNull when oldValue/newValue are undefined', async () => {
      const params = {
        userId: 1,
        action: 'DELETE',
        entityName: 'anggota',
        entityId: '10',
      };

      (prisma.auditLog.create as jest.Mock).mockResolvedValue({
        ...mockAuditLog,
        action: 'DELETE',
        entityName: 'anggota',
        entityId: '10',
        oldValue: '{}',
        newValue: '{}',
      } as any);

      await service.log(params);

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          actorUserId: 1,
          action: 'DELETE',
          entityName: 'anggota',
          entityId: '10',
          oldValue: Prisma.JsonNull,
          newValue: Prisma.JsonNull,
        },
      });
    });

    it('should include optional ipAddress when provided', async () => {
      const params = {
        userId: 1,
        action: 'UPDATE',
        entityName: 'user',
        entityId: '5',
        oldValue: { email: 'old@example.com' },
        newValue: { email: 'new@example.com' },
        ipAddress: '10.0.0.1',
      };

      (prisma.auditLog.create as jest.Mock).mockResolvedValue({
        ...mockAuditLog,
        ...params,
      });

      const result = await service.log(params);

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          actorUserId: 1,
          action: 'UPDATE',
          entityName: 'user',
          entityId: '5',
          oldValue: { email: 'old@example.com' },
          newValue: { email: 'new@example.com' },
          ipAddress: '10.0.0.1',
        },
      });
      expect(result.ipAddress).toBe('10.0.0.1');
    });
  });

  // ──────────────────────────────────────────────
  //  findAll()
  // ──────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated audit logs without filters', async () => {
      const mockData = [mockAuditLog];
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockData);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll();

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        include: { actor: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        data: mockData,
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });
    });

    it('should filter by action', async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 20, 'LOGIN');

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { action: 'LOGIN' },
        }),
      );
    });

    it('should filter by userId', async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 20, undefined, 5);

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { actorUserId: 5 },
        }),
      );
    });

    it('should combine action and actorUserId filters', async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 20, 'APPROVE', 3);

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { action: 'APPROVE', actorUserId: 3 },
        }),
      );
    });

    it('should apply pagination correctly', async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(55);

      const result = await service.findAll(3, 20);

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 40, take: 20 }),
      );
      expect(result.meta).toEqual({ total: 55, page: 3, limit: 20, totalPages: 3 });
    });

    it('should use default limit of 20', async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      await service.findAll();

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 }),
      );
    });
  });
});
