import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    controller = module.get(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call usersService.create with data', async () => {
      const data = { name: 'newuser', nomorHp: '0812', password: 'secret', roleId: 2 };
      usersService.create.mockResolvedValue({ id: 1, username: 'newuser' } as any);

      const result = await controller.create(data);

      expect(usersService.create).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: 1, username: 'newuser' });
    });
  });

  describe('findAll', () => {
    it('should call usersService.findAll with params', async () => {
      usersService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      const result = await controller.findAll(1, 10, 'admin');

      expect(usersService.findAll).toHaveBeenCalledWith(1, 10, 'admin');
      expect(result.meta).toEqual({ total: 0, page: 1, limit: 10, totalPages: 0 });
    });

    it('should work without optional filters', async () => {
      usersService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      await controller.findAll(undefined, undefined, undefined);

      expect(usersService.findAll).toHaveBeenCalledWith(undefined, undefined, undefined);
    });
  });

  describe('findById', () => {
    it('should call usersService.findById with converted id', async () => {
      usersService.findById.mockResolvedValue({ id: 1, username: 'admin' } as any);

      const result = await controller.findById('1');

      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, username: 'admin' });
    });
  });

  describe('update', () => {
    it('should call usersService.update with converted id and data', async () => {
      const data = { email: 'new@email.com' };
      usersService.update.mockResolvedValue({ id: 1, email: 'new@email.com' } as any);

      const result = await controller.update('1', data);

      expect(usersService.update).toHaveBeenCalledWith(1, data);
      expect(result).toEqual({ id: 1, email: 'new@email.com' });
    });
  });

  describe('delete', () => {
    it('should call usersService.delete with converted id', async () => {
      usersService.delete.mockResolvedValue({ id: 1 } as any);

      const result = await controller.delete('1');

      expect(usersService.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });
  });
});
