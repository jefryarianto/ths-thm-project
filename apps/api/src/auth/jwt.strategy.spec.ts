import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => { jest.clearAllMocks(); });

  describe('validate', () => {
    const mockPayload = { sub: 1, uuid: 'user-uuid', role: 'admin_distrik', scope: 'distrik' };
    const mockUser = {
      id: 1,
      uuid: 'user-uuid',
      name: 'Admin',
      isActive: true,
      role: { id: 1, scope: 'admin_distrik', permissions: ['read', 'write'] },
    };

    it('should return user data when user is found and active', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await strategy.validate(mockPayload);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { role: true },
      });
      expect(result).toEqual({
        id: 1,
        uuid: 'user-uuid',
        role: 'admin_distrik',
        permissions: ['read', 'write'],
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(strategy.validate(mockPayload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, isActive: false });

      await expect(strategy.validate(mockPayload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
