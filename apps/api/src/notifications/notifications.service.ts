import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { FirebaseService } from '../firebase/firebase.service.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private firebase: FirebaseService,
  ) {}

  /**
   * Send a notification to a specific user.
   * Stores the notification in the database AND sends a push notification via FCM
   * if the user has registered a device token.
   */
  async send(userId: number, title: string, body: string, data?: Record<string, unknown>) {
    // 1. Store notification in DB
    const notification = await this.prisma.notification.create({
      data: { recipientUserId: userId, title, body, data: (data || {}) as Prisma.JsonObject },
    });

    // 2. Send push via FCM if user has a device token
    await this.tryPushToUser(userId, title, body, data);

    return notification;
  }

  /**
   * Send notifications to multiple users at once.
   */
  async sendBulk(userIds: number[], title: string, body: string, data?: Record<string, unknown>) {
    // 1. Bulk insert notifications
    await this.prisma.notification.createMany({
      data: userIds.map((recipientUserId) => ({ recipientUserId, title, body, data: (data || {}) as Prisma.JsonObject })),
    });

    // 2. Send push to each user (sequentially to respect rate limits)
    for (const userId of userIds) {
      await this.tryPushToUser(userId, title, body, data).catch((err) =>
        this.logger.warn(`FCM push failed for user ${userId}: ${err.message}`),
      );
    }
  }

  /**
   * Send an OTP silently via FCM data-only message (no notification UI shown).
   * This is used by the AuthService; the OTP code is in the data payload.
   */
  async sendOtpSilent(userId: number, otp: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true, name: true },
    });

    if (!user?.fcmToken) {
      this.logger.warn(`User ${userId} (${user?.name}) has no FCM token — cannot send OTP push`);
      return false;
    }

    // FCM payload MUST NOT contain sensitive personal data per spec
    // OTP itself is a one-time code and minimal; no PII in payload
    const result = await this.firebase.sendSilentPush(user.fcmToken, {
      type: 'otp',
      otp,
      timestamp: Date.now().toString(),
    });

    if (result === 'UNREGISTERED') {
      // Token is stale — clear it so user re-registers
      await this.prisma.user.update({
        where: { id: userId },
        data: { fcmToken: null },
      });
      this.logger.log(`Cleared stale FCM token for user ${userId}`);
      return false;
    }

    return result !== null;
  }

  /**
   * Try to send a push notification to a user via their FCM token.
   * Handles stale token cleanup.
   */
  private async tryPushToUser(userId: number, title: string, body: string, data?: Record<string, unknown>) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user?.fcmToken) return;

    // Convert data values to strings for FCM
    const fcmData: Record<string, string> = {};
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        fcmData[key] = typeof value === 'string' ? value : JSON.stringify(value);
      }
    }

    const result = await this.firebase.sendPush(user.fcmToken, { title, body, data: fcmData });

    if (result === 'UNREGISTERED') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { fcmToken: null },
      });
      this.logger.log(`Cleared stale FCM token for user ${userId}`);
    }
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.prisma.notification.count({
      where: { recipientUserId: userId, isRead: false },
    });
  }

  async findByUser(userId: number, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { recipientUserId: userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { recipientUserId: userId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async markRead(id: number, userId: number) {
    return this.prisma.notification.updateMany({
      where: { id, recipientUserId: userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { recipientUserId: userId, isRead: false },
      data: { isRead: true },
    });
  }
}
