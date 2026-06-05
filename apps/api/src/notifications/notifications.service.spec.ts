import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { FirebaseService } from '../firebase/firebase.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';
import { createFirebaseMock } from '../test/mocks/firebase.mock.js';

// ─── Test data ───

const mockUser = {
  id: 1,
  username: 'admin',
  fcmToken: 'fcm-token-abc123',
};

const mockNotification = {
  id: 1,
  uuid: 'notif-uuid',
  userId: 1,
  title: 'Test Title',
  body: 'Test Body',
  data: { key: 'value' },
  isRead: false,
  createdAt: new Date('2025-01-01'),
};

const mockNotificationRead = {
  ...mockNotification,
  id: 2,
  isRead: true,
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let firebase: jest.Mocked<FirebaseService>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    firebase = createFirebaseMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: FirebaseService, useValue: firebase },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  //  send()
  // ──────────────────────────────────────────────

  describe('send', () => {
    it('should store notification and send push to user with FCM token', async () => {
      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      firebase.sendPush.mockResolvedValue('success-message-id');

      const result = await service.send(1, 'Test Title', 'Test Body', { key: 'value' });

      // Verify notification stored
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: { recipientUserId: 1, title: 'Test Title', body: 'Test Body', data: { key: 'value' } },
      });

      // Verify FCM push sent
      expect(firebase.sendPush).toHaveBeenCalledWith('fcm-token-abc123', {
        title: 'Test Title',
        body: 'Test Body',
        data: { key: 'value' },
      });
      expect(result).toEqual(mockNotification);
    });

    it('should store notification without data and skip push for user without FCM token', async () => {
      const noTokenUser = { ...mockUser, fcmToken: null };
      (prisma.notification.create as jest.Mock).mockResolvedValue({
        ...mockNotification,
        data: {},
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(noTokenUser);

      await service.send(1, 'Test Title', 'Test Body');

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: { recipientUserId: 1, title: 'Test Title', body: 'Test Body', data: {} },
      });
      expect(firebase.sendPush).not.toHaveBeenCalled();
    });

    it('should convert non-string data values to JSON for FCM', async () => {
      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      firebase.sendPush.mockResolvedValue('success');

      await service.send(1, 'Title', 'Body', { number: 42, nested: { a: 1 } });

      expect(firebase.sendPush).toHaveBeenCalledWith(
        'fcm-token-abc123',
        expect.objectContaining({
          data: { number: '42', nested: '{"a":1}' },
        }),
      );
    });

    it('should clear stale FCM token when push returns UNREGISTERED', async () => {
      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      firebase.sendPush.mockResolvedValue('UNREGISTERED');
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, fcmToken: null });

      await service.send(1, 'Title', 'Body');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { fcmToken: null },
      });
    });
  });

  // ──────────────────────────────────────────────
  //  sendBulk()
  // ──────────────────────────────────────────────

  describe('sendBulk', () => {
    it('should bulk insert notifications and push to all users', async () => {
      (prisma.notification.createMany as jest.Mock).mockResolvedValue({ count: 3 });
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser)        // user 1 has token
        .mockResolvedValueOnce({ id: 2, fcmToken: 'fcm-token-xyz' })  // user 2 has token
        .mockResolvedValueOnce({ id: 3, fcmToken: null });            // user 3 no token
      firebase.sendPush.mockResolvedValue('success');

      await service.sendBulk([1, 2, 3], 'Bulk Title', 'Bulk Body');

      // Verify bulk insert
      expect(prisma.notification.createMany).toHaveBeenCalledWith({
        data: [
          { recipientUserId: 1, title: 'Bulk Title', body: 'Bulk Body', data: {} },
          { recipientUserId: 2, title: 'Bulk Title', body: 'Bulk Body', data: {} },
          { recipientUserId: 3, title: 'Bulk Title', body: 'Bulk Body', data: {} },
        ],
      });

      // Verify push sent to users with tokens (not user 3)
      expect(firebase.sendPush).toHaveBeenCalledTimes(2);
      expect(firebase.sendPush).toHaveBeenCalledWith('fcm-token-abc123', expect.any(Object));
      expect(firebase.sendPush).toHaveBeenCalledWith('fcm-token-xyz', expect.any(Object));
    });

    it('should not throw when FCM push fails in bulk (logged as warning)', async () => {
      (prisma.notification.createMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      firebase.sendPush.mockRejectedValue(new Error('FCM unavailable'));

      await expect(
        service.sendBulk([1], 'Bulk Title', 'Bulk Body'),
      ).resolves.not.toThrow();
    });
  });

  // ──────────────────────────────────────────────
  //  sendOtpSilent()
  // ──────────────────────────────────────────────

  describe('sendOtpSilent', () => {
    it('should send silent push with OTP data', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      firebase.sendSilentPush.mockResolvedValue('fcm-message-id');

      const result = await service.sendOtpSilent(1, '123456');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { fcmToken: true, name: true },
      });
      expect(firebase.sendSilentPush).toHaveBeenCalledWith(
        'fcm-token-abc123',
        expect.objectContaining({
          type: 'otp',
          otp: '123456',
          timestamp: expect.any(String),
        }),
      );
      expect(result).toBe(true);
    });

    it('should return false when user has no FCM token', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        fcmToken: null,
      });

      const result = await service.sendOtpSilent(1, '123456');

      expect(firebase.sendSilentPush).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false when user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.sendOtpSilent(999, '123456');

      expect(firebase.sendSilentPush).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should clear stale FCM token when silent push returns UNREGISTERED', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      firebase.sendSilentPush.mockResolvedValue('UNREGISTERED');
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, fcmToken: null });

      const result = await service.sendOtpSilent(1, '123456');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { fcmToken: null },
      });
      expect(result).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  //  getUnreadCount()
  // ──────────────────────────────────────────────

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      (prisma.notification.count as jest.Mock).mockResolvedValue(5);

      const result = await service.getUnreadCount(1);

      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { recipientUserId: 1, isRead: false },
      });
      expect(result).toBe(5);
    });
  });

  // ──────────────────────────────────────────────
  //  findByUser()
  // ──────────────────────────────────────────────

  describe('findByUser', () => {
    it('should return paginated notifications for user', async () => {
      const mockData = [mockNotification, mockNotificationRead];
      (prisma.notification.findMany as jest.Mock).mockResolvedValue(mockData);
      (prisma.notification.count as jest.Mock).mockResolvedValue(2);

      const result = await service.findByUser(1);

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { recipientUserId: 1 },
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        data: mockData,
        meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
      });
    });

    it('should apply pagination', async () => {
      (prisma.notification.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.notification.count as jest.Mock).mockResolvedValue(50);

      const result = await service.findByUser(1, 3, 10);

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
      expect(result.meta).toEqual({
        total: 50, page: 3, limit: 10, totalPages: 5,
      });
    });
  });

  // ──────────────────────────────────────────────
  //  markRead()
  // ──────────────────────────────────────────────

  describe('markRead', () => {
    it('should mark a notification as read', async () => {
      (prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await service.markRead(1, 1);

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 1, recipientUserId: 1 },
        data: { isRead: true },
      });
      expect(result).toEqual({ count: 1 });
    });
  });

  // ──────────────────────────────────────────────
  //  markAllRead()
  // ──────────────────────────────────────────────

  describe('markAllRead', () => {
    it('should mark all user notifications as read', async () => {
      (prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

      const result = await service.markAllRead(1);

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { recipientUserId: 1, isRead: false },
        data: { isRead: true },
      });
      expect(result).toEqual({ count: 3 });
    });
  });
});
