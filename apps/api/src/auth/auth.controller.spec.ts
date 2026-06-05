import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';
import { Logger } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    // Suppress Logger output
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

    authService = {
      login: jest.fn(),
      sendOtp: jest.fn(),
      refreshToken: jest.fn(),
      logout: jest.fn(),
      registerFcmToken: jest.fn(),
      unregisterFcmToken: jest.fn(),
      register: jest.fn(),
    } as any;

    prisma = createPrismaMock();

    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── login ───

  describe('login', () => {
    it('should call authService.login with identifier and password', async () => {
      const mockResult = { accessToken: 'token', user: { id: 1 } };
      authService.login.mockResolvedValue(mockResult as any);

      const result = await controller.login('admin', 'password123');

      expect(authService.login).toHaveBeenCalledWith('admin', 'password123', undefined);
      expect(result).toEqual(mockResult);
    });

    it('should call authService.login with OTP when provided', async () => {
      authService.login.mockResolvedValue({ accessToken: 'token' } as any);

      await controller.login('admin', undefined, '123456');

      expect(authService.login).toHaveBeenCalledWith('admin', undefined, '123456');
    });
  });

  // ─── sendOtp ───

  describe('sendOtp', () => {
    it('should call authService.sendOtp with identifier', async () => {
      authService.sendOtp.mockResolvedValue({ message: 'OTP sent' } as any);

      const result = await controller.sendOtp('admin');

      expect(authService.sendOtp).toHaveBeenCalledWith('admin');
      expect(result).toEqual({ message: 'OTP sent' });
    });
  });

  // ─── refresh ───

  describe('refresh', () => {
    it('should call authService.refreshToken', async () => {
      authService.refreshToken.mockResolvedValue({ accessToken: 'new-token' } as any);

      const result = await controller.refresh('some-refresh-token');

      expect(authService.refreshToken).toHaveBeenCalledWith('some-refresh-token');
      expect(result).toEqual({ accessToken: 'new-token' });
    });
  });

  // ─── logout ───

  describe('logout', () => {
    it('should call authService.logout with user id from request', async () => {
      authService.logout.mockResolvedValue({ message: 'Logged out' } as any);
      const req = { user: { id: 1 } };

      const result = await controller.logout(req);

      expect(authService.logout).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Logged out' });
    });
  });

  // ─── registerFcmToken ───

  describe('registerFcmToken', () => {
    it('should call authService.registerFcmToken when token is provided', async () => {
      const req = { user: { id: 1 } };
      authService.registerFcmToken.mockResolvedValue({ message: 'FCM token registered successfully' } as any);

      const result = await controller.registerFcmToken(req, 'fcm-token-123');

      expect(authService.registerFcmToken).toHaveBeenCalledWith(1, 'fcm-token-123');
      expect(result).toEqual({ message: 'FCM token registered successfully' });
    });

    it('should return error when fcmToken is empty', async () => {
      const req = { user: { id: 1 } };

      const result = await controller.registerFcmToken(req, '');

      expect(authService.registerFcmToken).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'FCM token is required' });
    });

    it('should return error when fcmToken is undefined', async () => {
      const req = { user: { id: 1 } };

      const result = await controller.registerFcmToken(req, undefined as any);

      expect(authService.registerFcmToken).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'FCM token is required' });
    });
  });

  // ─── unregisterFcmToken ───

  describe('unregisterFcmToken', () => {
    it('should call authService.unregisterFcmToken', async () => {
      const req = { user: { id: 1 } };
      authService.unregisterFcmToken.mockResolvedValue({ message: 'FCM token unregistered successfully' } as any);

      const result = await controller.unregisterFcmToken(req);

      expect(authService.unregisterFcmToken).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'FCM token unregistered successfully' });
    });
  });

  // ─── register ───

  describe('register', () => {
    it('should call authService.register with user data', async () => {
      const data = { name: 'New User', email: 'new@example.com', password: 'secure123' };
      authService.register.mockResolvedValue({ id: 1, name: 'New User' } as any);

      const result = await controller.register(data);

      expect(authService.register).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: 1, name: 'New User' });
    });
  });
});
