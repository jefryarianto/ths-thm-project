import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

// ─── Firebase Admin mocks ───
const mockSend = jest.fn();
const mockSendEachForMulticast = jest.fn();
const mockGetMessaging = jest.fn(() => ({
  send: mockSend,
  sendEachForMulticast: mockSendEachForMulticast,
}));

const mockInitializeApp = jest.fn();
const mockGetApps = jest.fn();
const mockCert = jest.fn((sa: unknown) => sa as any);

jest.mock('firebase-admin/app', () => ({
  initializeApp: mockInitializeApp,
  getApps: mockGetApps,
  cert: mockCert,
}));

jest.mock('firebase-admin/messaging', () => ({
  getMessaging: mockGetMessaging,
}));

// Mock fs.readFileSync
jest.mock('node:fs', () => ({
  readFileSync: jest.fn(),
}));

import { FirebaseService } from './firebase.service.js';

describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear all env vars that could affect init
    delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    delete process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    delete process.env.FIREBASE_PROJECT_ID;
  });

  // ──────────────────────────────────────────────
  //  Initialization — onModuleInit / initializeApp
  // ──────────────────────────────────────────────

  describe('initialization', () => {
    it('should reuse existing Firebase app if already initialized', () => {
      mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }]);

      service = new FirebaseService();
      service.onModuleInit();

      expect(mockGetApps).toHaveBeenCalled();
      expect(mockInitializeApp).not.toHaveBeenCalled();
    });

    it('should initialize from FIREBASE_SERVICE_ACCOUNT_JSON env var', () => {
      mockGetApps.mockReturnValue([]);
      const privateKey = '-----BEGIN PRIVATE KEY-----\nFAKE\n-----END PRIVATE KEY-----';
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify({
        projectId: 'test-project',
        clientEmail: 'test@example.com',
        private_key: privateKey,
      });

      service = new FirebaseService();
      service.onModuleInit();

      expect(mockInitializeApp).toHaveBeenCalledWith({
        credential: expect.any(Object),
      });
      // Ensure \\n → real \n conversion happened
      const callArg = mockInitializeApp.mock.calls[0][0];
      const credentialArg = callArg.credential;
      // cert() receives the parsed service account
      expect(mockCert).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: 'test-project' }),
      );
    });

    it('should initialize from FIREBASE_SERVICE_ACCOUNT_PATH env var', () => {
      mockGetApps.mockReturnValue([]);
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH = '/path/to/service-account.json';
      const { readFileSync } = require('node:fs');
      readFileSync.mockReturnValue(JSON.stringify({
        projectId: 'file-project',
        clientEmail: 'file@example.com',
        private_key: 'file-private-key',
      }));

      service = new FirebaseService();
      service.onModuleInit();

      expect(readFileSync).toHaveBeenCalledWith('/path/to/service-account.json', 'utf-8');
      expect(mockInitializeApp).toHaveBeenCalled();
    });

    it('should fall through when FIREBASE_SERVICE_ACCOUNT_PATH file is invalid', () => {
      mockGetApps.mockReturnValue([]);
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH = '/path/to/invalid.json';
      const { readFileSync } = require('node:fs');
      readFileSync.mockReturnValue('not-valid-json');
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

      service = new FirebaseService();
      service.onModuleInit();

      expect(mockInitializeApp).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load service account from path'),
        expect.any(Error),
      );
      warnSpy.mockRestore();
    });

    it('should fall through when FIREBASE_SERVICE_ACCOUNT_PATH file read throws', () => {
      mockGetApps.mockReturnValue([]);
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH = '/path/to/missing.json';
      const { readFileSync } = require('node:fs');
      readFileSync.mockImplementation(() => { throw new Error('ENOENT: file not found'); });
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

      service = new FirebaseService();
      service.onModuleInit();

      expect(mockInitializeApp).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load service account from path'),
        expect.any(Error),
      );
      warnSpy.mockRestore();
    });

    it('should initialize from Application Default Credentials', () => {
      mockGetApps.mockReturnValue([]);
      process.env.FIREBASE_PROJECT_ID = 'adc-project';

      service = new FirebaseService();
      service.onModuleInit();

      expect(mockInitializeApp).toHaveBeenCalledWith({
        projectId: 'adc-project',
      });
    });

    it('should run in dry-run mode when no Firebase config is provided', () => {
      mockGetApps.mockReturnValue([]);
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

      service = new FirebaseService();
      service.onModuleInit();

      expect(mockInitializeApp).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Firebase Admin SDK not configured'),
      );
      warnSpy.mockRestore();
    });

    it('should log warn and fall through when service account JSON is invalid', () => {
      mockGetApps.mockReturnValue([]);
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON = 'not-valid-json';
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

      service = new FirebaseService();
      service.onModuleInit();

      expect(mockInitializeApp).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON'),
        expect.any(Error),
      );
      warnSpy.mockRestore();
    });

    it('should handle \\n literal in private_key from .env files', () => {
      mockGetApps.mockReturnValue([]);
      const privateKeyWithLiteralN = '-----BEGIN PRIVATE KEY-----\\nLINE1\\nLINE2\\n-----END PRIVATE KEY-----';
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify({
        projectId: 'test-project',
        private_key: privateKeyWithLiteralN,
      });

      service = new FirebaseService();
      service.onModuleInit();

      expect(mockCert).toHaveBeenCalledWith(
        expect.objectContaining({
          private_key: '-----BEGIN PRIVATE KEY-----\nLINE1\nLINE2\n-----END PRIVATE KEY-----',
        }),
      );
    });
  });

  // ──────────────────────────────────────────────
  //  sendPush()
  // ──────────────────────────────────────────────

  describe('sendPush', () => {
    it('should send push notification and return message ID', async () => {
      mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }]);
      mockSend.mockResolvedValue('fcm-message-id-123');

      service = new FirebaseService();
      service.onModuleInit();

      const result = await service.sendPush('device-token-abc', {
        title: 'Test Title',
        body: 'Test Body',
        data: { key: 'value' },
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'device-token-abc',
          notification: { title: 'Test Title', body: 'Test Body' },
          data: { key: 'value' },
          android: expect.objectContaining({ priority: 'high' }),
          apns: expect.anything(),
        }),
      );
      expect(result).toBe('fcm-message-id-123');
    });

    it('should return null (dry-run) when Firebase is not initialized', async () => {
      mockGetApps.mockReturnValue([]);
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

      service = new FirebaseService();
      service.onModuleInit();

      const result = await service.sendPush('device-token-abc', {
        title: 'Dry Run',
        body: 'Not really sent',
      });

      expect(result).toBeNull();
      expect(mockSend).not.toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DRY-RUN] Push to device-t'),
      );
      logSpy.mockRestore();
    });

    it('should return UNREGISTERED when FCM token is invalid', async () => {
      mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }]);
      const error = new Error('Not registered');
      (error as any).code = 'messaging/registration-token-not-registered';
      mockSend.mockRejectedValue(error);

      service = new FirebaseService();
      service.onModuleInit();

      const result = await service.sendPush('bad-token', {
        title: 'Title',
        body: 'Body',
      });

      expect(result).toBe('UNREGISTERED');
    });

    it('should return null for non-unregistered errors', async () => {
      mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }]);
      mockSend.mockRejectedValue(new Error('Quota exceeded'));

      service = new FirebaseService();
      service.onModuleInit();

      const result = await service.sendPush('token', {
        title: 'Title',
        body: 'Body',
      });

      expect(result).toBeNull();
    });
  });

  // ──────────────────────────────────────────────
  //  sendSilentPush()
  // ──────────────────────────────────────────────

  describe('sendSilentPush', () => {
    it('should send data-only message and return message ID', async () => {
      mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }]);
      mockSend.mockResolvedValue('silent-msg-id');

      service = new FirebaseService();
      service.onModuleInit();

      const result = await service.sendSilentPush('device-token-xyz', {
        type: 'otp',
        otp: '123456',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'device-token-xyz',
          data: { type: 'otp', otp: '123456' },
          android: { priority: 'high' },
        }),
      );
      // Should NOT have notification key
      expect(mockSend.mock.calls[0][0].notification).toBeUndefined();
      expect(result).toBe('silent-msg-id');
    });

    it('should return null (dry-run) when Firebase is not initialized', async () => {
      mockGetApps.mockReturnValue([]);
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

      service = new FirebaseService();
      service.onModuleInit();

      const result = await service.sendSilentPush('token', { key: 'value' });

      expect(result).toBeNull();
      expect(mockSend).not.toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DRY-RUN] Silent push to token'),
        expect.anything(),
      );
      logSpy.mockRestore();
    });

    it('should return UNREGISTERED on unregistered token error', async () => {
      mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }]);
      const error = new Error('Unregistered');
      (error as any).errorInfo = { code: 'messaging/registration-token-not-registered' };
      mockSend.mockRejectedValue(error);

      service = new FirebaseService();
      service.onModuleInit();

      const result = await service.sendSilentPush('bad-token', { otp: '000000' });

      expect(result).toBe('UNREGISTERED');
    });

    it('should return null for non-unregistered errors', async () => {
      mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }]);
      mockSend.mockRejectedValue(new Error('Rate limited'));

      service = new FirebaseService();
      service.onModuleInit();

      const result = await service.sendSilentPush('token', { otp: '000000' });

      expect(result).toBeNull();
    });
  });

  // ──────────────────────────────────────────────
  //  sendMulticast()
  // ──────────────────────────────────────────────

  describe('sendMulticast', () => {
    it('should send multicast and return per-token results', async () => {
      mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }]);
      mockSendEachForMulticast.mockResolvedValue({
        responses: [
          { success: true, messageId: 'msg-1' },
          { success: false, messageId: undefined },
          { success: true, messageId: 'msg-3' },
        ],
      });

      service = new FirebaseService();
      service.onModuleInit();

      const results = await service.sendMulticast(
        ['token-1', 'token-2', 'token-3'],
        { title: 'Broadcast', body: 'To all devices' },
      );

      expect(results).toEqual([
        { token: 'token-1', success: true, messageId: 'msg-1' },
        { token: 'token-2', success: false, messageId: undefined },
        { token: 'token-3', success: true, messageId: 'msg-3' },
      ]);
    });

    it('should return dry-run results when Firebase is not initialized', async () => {
      mockGetApps.mockReturnValue([]);
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

      service = new FirebaseService();
      service.onModuleInit();

      const results = await service.sendMulticast(
        ['tok-a', 'tok-b'],
        { title: 'Dry', body: 'Run' },
      );

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(false);
      expect(results[1].success).toBe(false);
      expect(logSpy).toHaveBeenCalledTimes(2);
      logSpy.mockRestore();
    });

    it('should handle empty tokens array', async () => {
      mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }]);

      service = new FirebaseService();
      service.onModuleInit();

      const results = await service.sendMulticast([], { title: 'T', body: 'B' });

      expect(results).toEqual([]);
      expect(mockSendEachForMulticast).not.toHaveBeenCalled();
    });

    it('should return failure results when multicast throws', async () => {
      mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }]);
      mockSendEachForMulticast.mockRejectedValue(new Error('FCM unavailable'));

      service = new FirebaseService();
      service.onModuleInit();

      const results = await service.sendMulticast(
        ['tok-x'],
        { title: 'Fail', body: 'Test' },
      );

      expect(results).toEqual([{ token: '', success: false }]);
    });
  });

  // ──────────────────────────────────────────────
  //  isUnregisteredError (private, tested indirectly)
  // ──────────────────────────────────────────────

  describe('error handling', () => {
    it('should match unregistered error by code string', async () => {
      mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }]);
      const error = new Error('Not registered');
      (error as any).code = 'messaging/registration-token-not-registered';
      mockSend.mockRejectedValue(error);

      service = new FirebaseService();
      service.onModuleInit();

      const result = await service.sendPush('token', { title: 'T', body: 'B' });
      expect(result).toBe('UNREGISTERED');
    });

    it('should match unregistered error by errorInfo.code', async () => {
      mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }]);
      const error = new Error('Unregistered');
      (error as any).errorInfo = { code: 'messaging/registration-token-not-registered' };
      mockSend.mockRejectedValue(error);

      service = new FirebaseService();
      service.onModuleInit();

      const result = await service.sendPush('token', { title: 'T', body: 'B' });
      expect(result).toBe('UNREGISTERED');
    });

    it('should not treat unrelated errors as unregistered', async () => {
      mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }]);
      mockSend.mockRejectedValue(new Error('Some other error'));

      service = new FirebaseService();
      service.onModuleInit();

      const result = await service.sendPush('token', { title: 'T', body: 'B' });
      expect(result).toBeNull();
    });

    it('should safely handle non-object error values', async () => {
      mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }]);
      mockSend.mockRejectedValue('string error');

      service = new FirebaseService();
      service.onModuleInit();

      const result = await service.sendPush('token', { title: 'T', body: 'B' });
      expect(result).toBeNull();
    });

    it('should safely handle null error values', async () => {
      mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }]);
      mockSend.mockRejectedValue(null);

      service = new FirebaseService();
      service.onModuleInit();

      const result = await service.sendPush('token', { title: 'T', body: 'B' });
      expect(result).toBeNull();
    });
  });
});
