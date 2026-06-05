import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';

const mockRole = { id: 1, uuid: 'role-uuid', nama: 'Admin Distrik', scope: 'admin_distrik', permissions: [] };

describe('RolesService', () => {
  let service: RolesService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<RolesService>(RolesService);
  });

  afterEach(() => { jest.clearAllMocks(); });

  // ─── create ───

  describe('create', () => {
    it('should create a new role', async () => {
      const data = { nama: 'Admin Ranting', scope: 'admin_ranting', permissions: ['read', 'write'] };
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.role.create as jest.Mock).mockResolvedValue({ id: 2, ...data });

      const result = await service.create(data);

      expect(prisma.role.findUnique).toHaveBeenCalledWith({ where: { nama: 'Admin Ranting' } });
      expect(prisma.role.create).toHaveBeenCalledWith({ data });
      expect(result).toEqual({ id: 2, ...data });
    });

    it('should throw ConflictException when role already exists', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);

      await expect(service.create({ nama: 'Admin Distrik', scope: 'admin_distrik', permissions: [] }))
        .rejects.toThrow(ConflictException);
      expect(prisma.role.create).not.toHaveBeenCalled();
    });
  });

  // ─── findAll ───

  describe('findAll', () => {
    it('should return all roles sorted by nama', async () => {
      (prisma.role.findMany as jest.Mock).mockResolvedValue([mockRole]);

      const result = await service.findAll();

      expect(prisma.role.findMany).toHaveBeenCalledWith({ orderBy: { nama: 'asc' } });
      expect(result).toEqual([mockRole]);
    });
  });

  // ─── findById ───

  describe('findById', () => {
    it('should return role when found', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.findById(1);

      expect(prisma.role.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ───

  describe('update', () => {
    it('should update role fields', async () => {
      const updated = { ...mockRole, nama: 'Super Admin' };
      (prisma.role.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.update(1, { nama: 'Super Admin' });

      expect(prisma.role.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { nama: 'Super Admin' } });
      expect(result.nama).toBe('Super Admin');
    });
  });

  // ─── delete ───

  describe('delete', () => {
    it('should delete role by id', async () => {
      (prisma.role.delete as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.delete(1);

      expect(prisma.role.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockRole);
    });
  });
});
