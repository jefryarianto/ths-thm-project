import { Test } from '@nestjs/testing';
import { ClaimController } from './claim.controller.js';
import { ClaimService } from './claim.service.js';

describe('ClaimController', () => {
  let controller: ClaimController;
  let claimService: jest.Mocked<ClaimService>;

  beforeEach(async () => {
    claimService = {
      create: jest.fn(),
      findAll: jest.fn(),
      approve: jest.fn(),
      reject: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      controllers: [ClaimController],
      providers: [
        { provide: ClaimService, useValue: claimService },
      ],
    }).compile();

    controller = module.get(ClaimController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call claimService.create with user id and full data', async () => {
      const req = { user: { id: 1 } };
      const data = { namaLengkap: 'Budi Santoso', nomorAnggotaInput: 'THS-001', anggotaId: 5 };
      claimService.create.mockResolvedValue({ id: 1, status: 'pending' } as any);

      const result = await controller.create(req, data);

      expect(claimService.create).toHaveBeenCalledWith(1, data);
      expect(result).toEqual({ id: 1, status: 'pending' });
    });
  });

  describe('findAll', () => {
    it('should call claimService.findAll with params', async () => {
      claimService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      const result = await controller.findAll(1, 20, 'Pending');

      expect(claimService.findAll).toHaveBeenCalledWith(1, 20, 'Pending');
      expect(result.meta).toEqual({ total: 0, page: 1, limit: 10, totalPages: 0 });
    });

    it('should work without optional filters', async () => {
      claimService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      await controller.findAll(undefined, undefined, undefined);

      expect(claimService.findAll).toHaveBeenCalledWith(undefined, undefined, undefined);
    });
  });

  describe('approve', () => {
    it('should call claimService.approve with converted id, user, and optional catatan', async () => {
      const req = { user: { id: 2 } };
      claimService.approve.mockResolvedValue({ id: 1, status: 'approved' } as any);

      const result = await controller.approve('1', req, 'Disetujui');

      expect(claimService.approve).toHaveBeenCalledWith(1, 2, 'Disetujui');
      expect(result).toEqual({ id: 1, status: 'approved' });
    });

    it('should call claimService.approve without catatanAdmin', async () => {
      const req = { user: { id: 2 } };
      claimService.approve.mockResolvedValue({ id: 1, status: 'approved' } as any);

      await controller.approve('1', req, undefined);

      expect(claimService.approve).toHaveBeenCalledWith(1, 2, undefined);
    });
  });

  describe('reject', () => {
    it('should call claimService.reject with converted id and optional catatan', async () => {
      claimService.reject.mockResolvedValue({ id: 1, status: 'rejected' } as any);

      const result = await controller.reject('1', 'Data tidak valid');

      expect(claimService.reject).toHaveBeenCalledWith(1, 'Data tidak valid');
      expect(result).toEqual({ id: 1, status: 'rejected' });
    });

    it('should call claimService.reject without catatanAdmin', async () => {
      claimService.reject.mockResolvedValue({ id: 1, status: 'rejected' } as any);

      await controller.reject('1', undefined);

      expect(claimService.reject).toHaveBeenCalledWith(1, undefined);
    });
  });
});
