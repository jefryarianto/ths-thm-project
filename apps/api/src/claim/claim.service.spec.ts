import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ClaimService } from './claim.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';

// ─── Test data ───

const mockClaim = {
  id: 1,
  uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  userId: 1,
  anggotaId: 10,
  status: 'pending',
  catatanAdmin: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  anggota: {
    id: 10,
    uuid: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    nomorAnggota: 'THS-001',
    namaLengkap: 'Budi Santoso',
  },
  user: {
    id: 1,
    name: 'admin',
    email: 'admin@example.com',
  },
};

const mockUser = {
  id: 1,
  uuid: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  name: 'admin',
  anggotaId: null,
};

const mockUserWithAnggota = {
  ...mockUser,
  anggotaId: 10,
};

describe('ClaimService', () => {
  let service: ClaimService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaimService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ClaimService>(ClaimService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  //  create()
  // ──────────────────────────────────────────────

  describe('create', () => {
    it('should create a claim when no existing pending/approved claim exists', async () => {
      (prisma.claimAnggota.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.claimAnggota.create as jest.Mock).mockResolvedValue(mockClaim);

      const result = await service.create(1, { namaLengkap: 'Budi Santoso', nomorAnggotaInput: 'THS-001', anggotaId: 10 });

      expect(prisma.claimAnggota.findFirst).toHaveBeenCalledWith({
        where: { userId: 1, status: { in: ['pending', 'approved'] } },
      });
      expect(prisma.claimAnggota.create).toHaveBeenCalledWith({
        data: { namaLengkap: 'Budi Santoso', nomorAnggotaInput: 'THS-001', anggotaId: 10, userId: 1 },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      expect(result).toEqual(mockClaim);
    });

    it('should throw BadRequestException when user already has pending claim', async () => {
      (prisma.claimAnggota.findFirst as jest.Mock).mockResolvedValue(mockClaim);

      await expect(service.create(1, { namaLengkap: 'Budi Santoso', nomorAnggotaInput: 'THS-001', anggotaId: 20 })).rejects.toThrow(BadRequestException);
      expect(prisma.claimAnggota.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when user already has approved claim', async () => {
      (prisma.claimAnggota.findFirst as jest.Mock).mockResolvedValue({
        ...mockClaim,
        status: 'approved',
      });

      await expect(service.create(1, { namaLengkap: 'Budi Santoso', nomorAnggotaInput: 'THS-001', anggotaId: 20 })).rejects.toThrow(BadRequestException);
    });
  });

  // ──────────────────────────────────────────────
  //  findAll()
  // ──────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated claims without status filter', async () => {
      const mockData = [mockClaim];
      (prisma.claimAnggota.findMany as jest.Mock).mockResolvedValue(mockData);
      (prisma.claimAnggota.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll();

      expect(prisma.claimAnggota.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          skip: 0,
          take: 10,
          include: {
            anggota: { select: { id: true, namaLengkap: true, nomorAnggota: true } },
            user: { select: { id: true, name: true, email: true } },
            reviewer: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(result).toEqual({
        data: mockData,
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });
    });

    it('should filter by status when provided', async () => {
      (prisma.claimAnggota.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.claimAnggota.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 10, 'pending');

      expect(prisma.claimAnggota.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'pending' },
        }),
      );
    });

    it('should apply pagination correctly', async () => {
      (prisma.claimAnggota.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.claimAnggota.count as jest.Mock).mockResolvedValue(25);

      const result = await service.findAll(3, 10);

      expect(prisma.claimAnggota.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
      expect(result.meta).toEqual({
        total: 25,
        page: 3,
        limit: 10,
        totalPages: 3,
      });
    });
  });

  // ──────────────────────────────────────────────
  //  approve()
  // ──────────────────────────────────────────────

  describe('approve', () => {
    it('should approve claim and link user to anggota via transaction', async () => {
      (prisma.claimAnggota.findUnique as jest.Mock).mockResolvedValue(mockClaim);
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser)       // for user check
        .mockResolvedValueOnce(null);           // for existingLink check (no other user linked)

      (prisma.$transaction as jest.Mock).mockImplementation(
        (cb: (tx: any) => Promise<any>) => cb({
          claimAnggota: { update: jest.fn().mockResolvedValue({}) },
          user: { update: jest.fn().mockResolvedValue({}) },
        }),
      );

      const result = await service.approve(1, 2, 'Approved by admin');

      // Verify transaction was called
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Claim approved' });
    });

    it('should throw NotFoundException when claim does not exist', async () => {
      (prisma.claimAnggota.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.approve(999, 2)).rejects.toThrow(NotFoundException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when claim is not pending', async () => {
      (prisma.claimAnggota.findUnique as jest.Mock).mockResolvedValue({
        ...mockClaim,
        status: 'approved',
      });

      await expect(service.approve(1, 2)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when anggota already linked to another user', async () => {
      (prisma.claimAnggota.findUnique as jest.Mock).mockResolvedValue(mockClaim);
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 5, name: 'other' });

      await expect(service.approve(1, 2)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when anggota already linked to another user', async () => {
      (prisma.claimAnggota.findUnique as jest.Mock).mockResolvedValue(mockClaim);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 5 });

      await expect(service.approve(1, 2)).rejects.toThrow(BadRequestException);
    });

    it('should pass catatanAdmin to the transaction', async () => {
      (prisma.claimAnggota.findUnique as jest.Mock).mockResolvedValue(mockClaim);
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const txUpdateClaim = jest.fn().mockResolvedValue({});
      const txUpdateUser = jest.fn().mockResolvedValue({});

      (prisma.$transaction as jest.Mock).mockImplementation(
        (cb: (tx: any) => Promise<any>) => cb({
          claimAnggota: { update: txUpdateClaim },
          user: { update: txUpdateUser },
        }),
      );

      await service.approve(1, 2, 'Verified documents');

      expect(txUpdateClaim).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({ status: 'approved', catatanAdmin: 'Verified documents' }),
      });
      expect(txUpdateUser).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { anggotaId: 10 },
      });
    });

    it('should approve claim without anggotaId (no user link)', async () => {
      const claimWithoutAnggota = { ...mockClaim, anggotaId: null };
      (prisma.claimAnggota.findUnique as jest.Mock).mockResolvedValue(claimWithoutAnggota);
      (prisma.claimAnggota.update as jest.Mock).mockResolvedValue({
        ...claimWithoutAnggota,
        status: 'approved',
      });

      const result = await service.approve(1, 2, 'Approved');

      // Should update without transaction
      expect(prisma.claimAnggota.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({ status: 'approved', catatanAdmin: 'Approved' }),
      });
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'Claim approved' });
    });
  });

  // ──────────────────────────────────────────────
  //  reject()
  // ──────────────────────────────────────────────

  describe('reject', () => {
    it('should reject a pending claim', async () => {
      (prisma.claimAnggota.findUnique as jest.Mock).mockResolvedValue(mockClaim);
      (prisma.claimAnggota.update as jest.Mock).mockResolvedValue({
        ...mockClaim,
        status: 'rejected',
        catatanAdmin: 'Dokumen tidak lengkap',
      });

      const result = await service.reject(1, 'Dokumen tidak lengkap');

      expect(prisma.claimAnggota.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'rejected', catatanAdmin: 'Dokumen tidak lengkap' },
      });
      expect(result.status).toBe('rejected');
    });

    it('should throw NotFoundException when claim does not exist', async () => {
      (prisma.claimAnggota.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.reject(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when claim is not pending', async () => {
      (prisma.claimAnggota.findUnique as jest.Mock).mockResolvedValue({
        ...mockClaim,
        status: 'approved',
      });

      await expect(service.reject(1)).rejects.toThrow(BadRequestException);
    });

    it('should allow reject without catatanAdmin', async () => {
      (prisma.claimAnggota.findUnique as jest.Mock).mockResolvedValue(mockClaim);
      (prisma.claimAnggota.update as jest.Mock).mockResolvedValue({
        ...mockClaim,
        status: 'rejected',
      });

      const result = await service.reject(1);

      expect(prisma.claimAnggota.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'rejected', catatanAdmin: undefined },
      });
      expect(result.status).toBe('rejected');
    });
  });
});
