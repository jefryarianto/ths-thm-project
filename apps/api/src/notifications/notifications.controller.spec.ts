import { Test } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsService: jest.Mocked<NotificationsService>;

  beforeEach(async () => {
    notificationsService = {
      findByUser: jest.fn(),
      getUnreadCount: jest.fn(),
      markRead: jest.fn(),
      markAllRead: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    controller = module.get(NotificationsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── findByUser ───

  describe('findByUser', () => {
    it('should call service.findByUser with user id from request', async () => {
      const req = { user: { id: 1 } };
      const mockResult = { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
      notificationsService.findByUser.mockResolvedValue(mockResult);

      const result = await controller.findByUser(req);

      expect(notificationsService.findByUser).toHaveBeenCalledWith(1, undefined, undefined);
      expect(result).toEqual(mockResult);
    });

    it('should pass page and limit when provided', async () => {
      const req = { user: { id: 2 } };
      notificationsService.findByUser.mockResolvedValue({ data: [], meta: { total: 0, page: 2, limit: 10, totalPages: 0 } });

      await controller.findByUser(req, 2, 10);

      expect(notificationsService.findByUser).toHaveBeenCalledWith(2, 2, 10);
    });
  });

  // ─── getCount ───

  describe('getCount', () => {
    it('should return wrapped count object', async () => {
      const req = { user: { id: 1 } };
      notificationsService.getUnreadCount.mockResolvedValue(5);

      const result = await controller.getCount(req);

      expect(notificationsService.getUnreadCount).toHaveBeenCalledWith(1);
      expect(result).toEqual({ count: 5 });
    });

    it('should return zero count when no unread notifications', async () => {
      const req = { user: { id: 2 } };
      notificationsService.getUnreadCount.mockResolvedValue(0);

      const result = await controller.getCount(req);

      expect(result).toEqual({ count: 0 });
    });
  });

  // ─── markRead ───

  describe('markRead', () => {
    it('should call service.markRead with converted id', async () => {
      const req = { user: { id: 1 } };
      notificationsService.markRead.mockResolvedValue({ id: 5, isRead: true } as any);

      const result = await controller.markRead('5', req);

      expect(notificationsService.markRead).toHaveBeenCalledWith(5, 1);
      expect(result).toEqual({ id: 5, isRead: true });
    });
  });

  // ─── markAllRead ───

  describe('markAllRead', () => {
    it('should call service.markAllRead with user id', async () => {
      const req = { user: { id: 1 } };
      notificationsService.markAllRead.mockResolvedValue({ count: 3 });

      const result = await controller.markAllRead(req);

      expect(notificationsService.markAllRead).toHaveBeenCalledWith(1);
      expect(result).toEqual({ count: 3 });
    });
  });
});
