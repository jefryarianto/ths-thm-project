import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UsersService } from './users.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';

// ─── Mock bcrypt ───
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

// ─── Test data ───

const mockRole = { id: 2, uuid: 'role-uuid', nama: 'Admin Distrik', scope: 'admin_distrik', permissions: [] };
const mockAnggota = { id: 10, uuid: 'anggota-uuid', nama: 'Budi Santoso', nomorAnggota: 'THS-001' };

const mockUser = {
  id: 1,
  uuid: 'user-uuid-1',
  name: 'admin',
  email: 'admin@example.com',
  nomorHp: '081234567890',
  passwordHash: '$2b$10$hashedpassword',
  roleId: 2,
  anggotaId: null,
  isActive: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  role: mockRole,
  anggota: null,
};

const mockUserWithAnggota = {
  ...mockUser,
  id: 2,
  uuid: 'user-uuid-2',
  name: 'budi',
  anggotaId: 10,
  anggota: mockAnggota,
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  //  create()
  // ──────────────────────────────────────────────

  describe('create', () => {
    const createDto = {
      name: 'newuser',
      email: 'new@example.com',
      nomorHp: '081234567891',
      password: 'securePass123',
      roleId: 2,
    };

    it('should hash password and create user', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$mockedhashed');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      // Verify duplicate check
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ email: 'new@example.com' }, { nomorHp: '081234567891' }] },
      });

      // Verify bcrypt hash
      expect(bcrypt.hash).toHaveBeenCalledWith('securePass123', 10);

      // Verify user creation without password field, with passwordHash
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'newuser',
          email: 'new@example.com',
          nomorHp: '081234567891',
          roleId: 2,
          passwordHash: '$2b$10$mockedhashed',
        },
        include: { role: true },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException when name already exists', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when nomorHp already exists', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should create user without email', async () => {
      const noEmailDto = {
        name: 'nophone',
        nomorHp: '081234567892',
        password: 'securePass456',
        roleId: 3,
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$anotherhash');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      await service.create(noEmailDto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'nophone',
          nomorHp: '081234567892',
          roleId: 3,
          passwordHash: '$2b$10$anotherhash',
        },
        include: { role: true },
      });
    });
  });

  // ──────────────────────────────────────────────
  //  findAll()
  // ──────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated users without search', async () => {
      const mockData = [mockUser, mockUserWithAnggota];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockData);
      (prisma.user.count as jest.Mock).mockResolvedValue(2);

      const result = await service.findAll();

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          skip: 0,
          take: 10,
          include: { role: true, anggota: true },
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('should search across username, nomorHp, and email', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 10, 'admin');

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: 'admin' } },
              { email: { contains: 'admin' } },
              { nomorHp: { contains: 'admin' } },
            ],
          },
        }),
      );
    });

    it('should apply pagination correctly', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(25);

      const result = await service.findAll(3, 10, 'test');

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
      expect(result.meta).toEqual({
        total: 25, page: 3, limit: 10, totalPages: 3,
      });
    });
  });

  // ──────────────────────────────────────────────
  //  findById()
  // ──────────────────────────────────────────────

  describe('findById', () => {
    it('should return user with role and anggota includes', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithAnggota);

      const result = await service.findById(2);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 2 },
        include: { role: true, anggota: true },
      });
      expect(result.anggota).toEqual(mockAnggota);
    });

    it('should throw NotFoundException when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────────
  //  update()
  // ──────────────────────────────────────────────

  describe('update', () => {
    it('should update user fields', async () => {
      const updateData = { email: 'updated@example.com', isActive: false };
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const result = await service.update(1, updateData);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
        include: { role: true },
      });
      expect(result.email).toBe('updated@example.com');
      expect(result.isActive).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  //  delete()
  // ──────────────────────────────────────────────

  describe('delete', () => {
    it('should delete user by id', async () => {
      (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.delete(1);

      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockUser);
    });
  });
});
