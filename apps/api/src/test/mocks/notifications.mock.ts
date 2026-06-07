import { NotificationsService } from '../../notifications/notifications.service.js';

/**
 * Create a mock NotificationsService.
 */
export function createNotificationsMock(): jest.Mocked<NotificationsService> {
  return {
    send: jest.fn(),
    sendBulk: jest.fn(),
    sendOtpSilent: jest.fn(),
    getUnreadCount: jest.fn(),
    findByUser: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
  } as unknown as jest.Mocked<NotificationsService>;
}
