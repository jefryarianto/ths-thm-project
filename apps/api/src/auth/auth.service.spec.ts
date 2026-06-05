import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';
import { createRedisMock } from '../test/mocks/redis.mock.js';
import { createNotificationsMock } from '../test/mocks/notifications.mock.js';

// ─── Mock bcrypt ───
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// ─── Test data ───
const mockUser = {
  id: 1,
  uuid: '550e8400-e29b-41d4-a716-446655440000',
  name: 'admin',
  email: 'admin@ths-thm.org',
  nomorHp: '081234567890',
  passwordHash: '$2b$10$hashedpassword',
  roleId: 1,
  anggotaId: null,
  isActive: true,
  lastLogin: null,
  refreshToken: null,
  fcmToken: 'fcm-token-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  role: {
    id: 1,
    nama: 'Superadmin',
    scope: 'superadmin',
  },
  anggota: null,
};

const mockUserWithAnggota = {
  ...mockUser,
  anggota: {
    id: 10,
    uuid: '660e8400-e29b-41d4-a716-446655440001',
    namaLengkap: 'Budi Santoso',
    nomorAnggota: 'THS-001',
  },
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let redis: ReturnType<typeof createRedisMock>;
  let jwtService: jest.Mocked<JwtService>;
  let notifications: ReturnType<typeof createNotificationsMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    redis = createRedisMock();
    notifications = createNotificationsMock();
    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: RedisService, useValue: redis },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  //  login()
  // ──────────────────────────────────────────────

  describe('login', () => {
    it('should return tokens on successful password login', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign
        .mockReturnValueOnce('access-token-123')
        .mockReturnValueOnce('refresh-token-456');
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.login('admin', 'admin123');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: 'admin' },
            { nomorHp: 'admin' },
            { uuid: 'admin' },
          ],
        },
        include: { role: true, anggota: true },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('admin123', mockUser.passwordHash);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { refreshToken: 'refresh-token-456', lastLogin: expect.any(Date) },
      });
      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        user: {
          id: mockUser.id,
          uuid: mockUser.uuid,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role.scope,
          anggota: null,
        },
      });
    });

    it('should include anggota data when user has anggota', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUserWithAnggota);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign
        .mockReturnValueOnce('access-token-123')
        .mockReturnValueOnce('refresh-token-456');
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUserWithAnggota);

      const result = await service.login('admin', 'admin123');

      expect(result.user!.anggota).toEqual({
        id: 10,
        uuid: '660e8400-e29b-41d4-a716-446655440001',
        namaLengkap: 'Budi Santoso',
        nomorAnggota: 'THS-001',
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.login('unknown', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive account', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(service.login('admin', 'admin123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('admin', 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should verify OTP when otpCode is provided', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (redis.get as jest.Mock).mockResolvedValue('123456');
      jwtService.sign
        .mockReturnValueOnce('access-token-otp')
        .mockReturnValueOnce('refresh-token-otp');
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.login('admin', undefined, '123456');

      expect(redis.get).toHaveBeenCalledWith('otp:1');
      expect(redis.del).toHaveBeenCalledWith('otp:1');
      expect(result.accessToken).toBe('access-token-otp');
    });

    it('should throw on invalid OTP', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (redis.get as jest.Mock).mockResolvedValue('654321'); // stored different OTP

      await expect(service.login('admin', undefined, '123456')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should skip password verification and use OTP when both are provided', async () => {
      const compareSpy = jest.spyOn(bcrypt, 'compare');
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (redis.get as jest.Mock).mockResolvedValue('999999');
      jwtService.sign
        .mockReturnValueOnce('access-both')
        .mockReturnValueOnce('refresh-both');
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.login('admin', 'ignored-password', '999999');

      // bcrypt.compare should NOT be called (skipped due to otpCode being present)
      expect(compareSpy).not.toHaveBeenCalled();
      expect(redis.get).toHaveBeenCalledWith('otp:1');
      expect(result.accessToken).toBe('access-both');
      compareSpy.mockRestore();
    });

    it('should send OTP when no password or otpCode provided', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      notifications.sendOtpSilent.mockResolvedValue(true);

      const result = await service.login('admin');

      expect(redis.set).toHaveBeenCalledWith(
        'otp:1',
        expect.any(String),
        'EX',
        300,
      );
      expect(notifications.sendOtpSilent).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String),
      );
      expect(result).toEqual({ message: 'OTP sent', userId: 1 });
    });

    it('should not throw if FCM delivery fails during OTP send', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      notifications.sendOtpSilent.mockRejectedValue(new Error('FCM unavailable'));

      const result = await service.login('admin');

      expect(result).toEqual({ message: 'OTP sent', userId: 1 });
    });
  });

  // ──────────────────────────────────────────────
  //  refreshToken()
  // ──────────────────────────────────────────────

  describe('refreshToken', () => {
    it('should return new tokens on valid refresh token', async () => {
      jwtService.verify.mockReturnValue({ sub: 1, uuid: mockUser.uuid, role: 'superadmin', scope: 'superadmin' });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        refreshToken: 'valid-refresh-token',
      });
      jwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, refreshToken: 'new-refresh-token' });

      const result = await service.refreshToken('valid-refresh-token');

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw on token with no matching user', async () => {
      jwtService.verify.mockReturnValue({ sub: 999, role: 'user', scope: 'user' });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.refreshToken('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when stored refreshToken does not match', async () => {
      jwtService.verify.mockReturnValue({ sub: 1, role: 'superadmin', scope: 'superadmin' });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        refreshToken: 'different-token-stored',
      });

      await expect(service.refreshToken('provided-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw on invalid JWT (expired/malformed)', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refreshToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ──────────────────────────────────────────────
  //  logout()
  // ──────────────────────────────────────────────

  describe('logout', () => {
    it('should clear refreshToken and return success message', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.logout(1);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { refreshToken: null },
      });
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  // ──────────────────────────────────────────────
  //  sendOtp()
  // ──────────────────────────────────────────────

  describe('sendOtp', () => {
    it('should generate OTP, store in Redis, and send via FCM', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      notifications.sendOtpSilent.mockResolvedValue(true);

      const result = await service.sendOtp('admin');

      expect(redis.set).toHaveBeenCalledWith(
        'otp:1',
        expect.any(String),
        'EX',
        300,
      );
      expect(notifications.sendOtpSilent).toHaveBeenCalledWith(1, expect.any(String));
      expect(result).toEqual({ message: 'OTP sent successfully' });
    });

    it('should throw when user is not found', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.sendOtp('unknown-user')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ──────────────────────────────────────────────
  //  verifyOtp()
  // ──────────────────────────────────────────────

  describe('verifyOtp', () => {
    it('should return true for matching OTP', async () => {
      (redis.get as jest.Mock).mockResolvedValue('555666');

      const result = await service.verifyOtp(1, '555666');

      expect(result).toBe(true);
      expect(redis.del).toHaveBeenCalledWith('otp:1');
    });

    it('should return false for non-matching OTP', async () => {
      (redis.get as jest.Mock).mockResolvedValue('111222');

      const result = await service.verifyOtp(1, '999999');

      expect(result).toBe(false);
      expect(redis.del).not.toHaveBeenCalled();
    });

    it('should return false when OTP has expired (null stored)', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);

      const result = await service.verifyOtp(1, '555666');

      expect(result).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  //  sendOtp() — additional paths
  // ──────────────────────────────────────────────

  describe('sendOtp (additional)', () => {
    it('should log no-FCM message when push not sent', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      notifications.sendOtpSilent.mockResolvedValue(false);
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

      const result = await service.sendOtp('admin');

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('no FCM token'),
      );
      expect(result).toEqual({ message: 'OTP sent successfully' });
      logSpy.mockRestore();
    });
  });

  // ──────────────────────────────────────────────
  //  register()
  // ──────────────────────────────────────────────

  describe('register', () => {
    const registerDto = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
      nomorHp: '081234567899',
    };

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$mockedhash');
    });

    it('should register a new user successfully', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.role.findFirst as jest.Mock).mockResolvedValue({ id: 5, scope: 'anggota' });
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 2,
        uuid: 'new-user-uuid',
        name: 'New User',
        email: 'new@example.com',
        nomorHp: '081234567899',
        passwordHash: '$2b$10$mockedhash',
        roleId: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: { id: 5, nama: 'Anggota', scope: 'anggota' },
      });

      const result = await service.register(registerDto);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: 'new@example.com' },
            { nomorHp: '081234567899' },
          ],
        },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'New User',
            email: 'new@example.com',
            passwordHash: '$2b$10$mockedhash',
            roleId: 5,
          }),
        }),
      );
      // passwordHash should NOT be in response
      expect((result as any).passwordHash).toBeUndefined();
      expect((result as any).name).toBe('New User');
    });

    it('should throw ConflictException when email already exists', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow('Email or phone already registered');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should use default roleId 5 when anggota role not found', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.role.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 3, name: 'No Role', email: 'norole@example.com',
        passwordHash: 'hash', roleId: 5,
        createdAt: new Date(), updatedAt: new Date(),
        role: { id: 5, nama: 'Anggota', scope: 'anggota' },
      });

      await service.register({ name: 'No Role', email: 'norole@example.com', password: 'pass123' });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ roleId: 5 }),
        }),
      );
    });

    it('should register without nomorHp', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.role.findFirst as jest.Mock).mockResolvedValue({ id: 5, scope: 'anggota' });
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 4, name: 'No HP', email: 'nohp@example.com', nomorHp: null,
        passwordHash: 'hash', roleId: 5,
        createdAt: new Date(), updatedAt: new Date(),
        role: { id: 5, nama: 'Anggota', scope: 'anggota' },
      });

      const result = await service.register({ name: 'No HP', email: 'nohp@example.com', password: 'pass123' });

      expect((result as any).nomorHp).toBeNull();
    });
  });

  // ──────────────────────────────────────────────
  //  registerFcmToken()
  // ──────────────────────────────────────────────

  describe('registerFcmToken', () => {
    it('should store FCM token for user', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, fcmToken: 'new-fcm-token' });

      const result = await service.registerFcmToken(1, 'new-fcm-token');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { fcmToken: 'new-fcm-token' },
      });
      expect(result).toEqual({ message: 'FCM token registered successfully' });
    });
  });

  // ──────────────────────────────────────────────
  //  unregisterFcmToken()
  // ──────────────────────────────────────────────

  describe('unregisterFcmToken', () => {
    it('should clear FCM token for user', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, fcmToken: null });

      const result = await service.unregisterFcmToken(1);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { fcmToken: null },
      });
      expect(result).toEqual({ message: 'FCM token unregistered successfully' });
    });
  });
});
