import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller.js';
import { RolesService } from './roles.service.js';

describe('RolesController', () => {
  let controller: RolesController;
  let rolesService: jest.Mocked<RolesService>;

  beforeEach(async () => {
    rolesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [{ provide: RolesService, useValue: rolesService }],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  afterEach(() => { jest.clearAllMocks(); });

  describe('create', () => {
    it('should call rolesService.create with data', async () => {
      const data = { nama: 'Admin', scope: 'superadmin', permissions: ['all'] };
      rolesService.create.mockResolvedValue({ id: 1, ...data } as any);

      const result = await controller.create(data);

      expect(rolesService.create).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: 1, ...data });
    });
  });

  describe('findAll', () => {
    it('should call rolesService.findAll', async () => {
      const mockRoles = [{ id: 1, nama: 'Admin' }];
      rolesService.findAll.mockResolvedValue(mockRoles as any);

      const result = await controller.findAll();

      expect(rolesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockRoles);
    });
  });

  describe('findById', () => {
    it('should call rolesService.findById with converted id', async () => {
      rolesService.findById.mockResolvedValue({ id: 1, nama: 'Admin' } as any);

      const result = await controller.findById('1');

      expect(rolesService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, nama: 'Admin' });
    });
  });

  describe('update', () => {
    it('should call rolesService.update with converted id and data', async () => {
      const data = { nama: 'Superadmin' };
      rolesService.update.mockResolvedValue({ id: 1, ...data } as any);

      const result = await controller.update('1', data);

      expect(rolesService.update).toHaveBeenCalledWith(1, data);
      expect(result).toEqual({ id: 1, nama: 'Superadmin' });
    });
  });

  describe('delete', () => {
    it('should call rolesService.delete with converted id', async () => {
      rolesService.delete.mockResolvedValue({ id: 1 } as any);

      const result = await controller.delete('1');

      expect(rolesService.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });
  });
});
