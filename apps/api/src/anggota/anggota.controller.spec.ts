import { Test } from '@nestjs/testing';
import { AnggotaController } from './anggota.controller.js';
import { AnggotaService } from './anggota.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';
import { NotFoundException } from '@nestjs/common';

describe('AnggotaController', () => {
  let controller: AnggotaController;
  let anggotaService: jest.Mocked<AnggotaService>;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    anggotaService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUuid: jest.fn(),
      findForClaim: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      validateData: jest.fn(),
      setValidasi: jest.fn(),
      createPendaftaran: jest.fn(),
      findAllPendaftaran: jest.fn(),
      findPendaftaranById: jest.fn(),
      reviewPendaftaran: jest.fn(),
      deletePendaftaran: jest.fn(),
      konversiCalonKeAnggota: jest.fn(),
    } as any;

    prisma = createPrismaMock();

    const module = await Test.createTestingModule({
      controllers: [AnggotaController],
      providers: [
        { provide: AnggotaService, useValue: anggotaService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    controller = module.get(AnggotaController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── create ───

  describe('create', () => {
    it('should call anggotaService.create with data', async () => {
      const data = { namaLengkap: 'John', nomorAnggota: '001' } as any;
      anggotaService.create.mockResolvedValue({ id: 1, ...data } as any);

      const result = await controller.create(data);

      expect(anggotaService.create).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: 1, ...data });
    });
  });

  // ─── findAll ───

  describe('findAll', () => {
    it('should call anggotaService.findAll with default params', async () => {
      anggotaService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      const result = await controller.findAll(undefined, undefined, undefined, undefined, undefined);

      expect(anggotaService.findAll).toHaveBeenCalledWith(undefined, undefined, undefined, undefined, undefined);
      expect(result.meta).toEqual({ total: 0, page: 1, limit: 10, totalPages: 0 });
    });

    it('should convert rantingId to number', async () => {
      anggotaService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      await controller.findAll(1, 20, undefined, undefined, 5 as any);

      expect(anggotaService.findAll).toHaveBeenCalledWith(1, 20, undefined, undefined, 5);
    });
  });

  // ─── getMe ───

  describe('getMe', () => {
    it('should return anggota when user has anggota profile', async () => {
      const req = { user: { id: 1 } };
      const mockAnggota = {
        id: 1, uuid: 'u1', nomorAnggota: '001', namaLengkap: 'John',
        tempatLahir: 'Jakarta', tanggalLahir: new Date('1990-01-01'),
        jenisKelamin: 'L', alamat: 'Jl. Test', noHp: '0812',
        statusKeanggotaan: 'aktif', rantingId: 1,
        statusData: 'lengkap', statusValidasi: 'tervalidasi',
        createdAt: new Date(), updatedAt: new Date(),
        ranting: { id: 1, uuid: 'r1', kodeRanting: 'RA', nama: 'Ranting A', wilayahId: 1 },
        anggotaRole: [],
      };
      prisma.user.findUnique.mockResolvedValue({
        id: 1, uuid: 'u1', name: 'admin', nomorHp: '0812',
        passwordHash: 'hash', roleId: 1, isActive: true,
        createdAt: new Date(), updatedAt: new Date(),
        anggota: mockAnggota,
      } as any);

      const result = await controller.getMe(req);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          anggota: {
            include: {
              ranting: { include: { wilayah: { include: { distrik: true } } } },
              anggotaRole: true,
              issuedDocuments: { include: { documentType: true }, orderBy: { createdAt: 'desc' } },
            },
          },
        },
      });
      expect(result).toEqual(mockAnggota);
    });

    it('should throw NotFoundException when user has no anggota profile', async () => {
      const req = { user: { id: 2 } };
      prisma.user.findUnique.mockResolvedValue({
        id: 2, uuid: 'u2', name: 'user2', nomorHp: '0813',
        passwordHash: 'hash', roleId: 2, isActive: true,
        createdAt: new Date(), updatedAt: new Date(),
        anggota: null,
      } as any);

      await expect(controller.getMe(req)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user is not found', async () => {
      const req = { user: { id: 999 } };
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(controller.getMe(req)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── searchForClaim ───

  describe('searchForClaim', () => {
    it('should call anggotaService.findForClaim with query', async () => {
      const mockResult = [{
        id: 1, uuid: 'u1', nomorAnggota: '001', namaLengkap: 'John',
        tempatLahir: 'Jakarta', tanggalLahir: new Date('1990-01-01'),
        jenisKelamin: 'L', alamat: 'Jl. Test', noHp: '0812',
        statusKeanggotaan: 'aktif', rantingId: 1,
        statusData: 'lengkap', statusValidasi: 'tervalidasi',
        createdAt: new Date(), updatedAt: new Date(),
      }];
      anggotaService.findForClaim.mockResolvedValue(mockResult as any);

      const result = await controller.searchForClaim('John');

      expect(anggotaService.findForClaim).toHaveBeenCalledWith('John');
      expect(result).toEqual(mockResult);
    });
  });

  // ─── findById ───

  describe('findById', () => {
    it('should call anggotaService.findById with converted id', async () => {
      const mockResult = {
        id: 1, uuid: 'u1', nomorAnggota: '001', namaLengkap: 'John',
        tempatLahir: 'Jakarta', tanggalLahir: new Date('1990-01-01'),
        jenisKelamin: 'L', alamat: 'Jl. Test', noHp: '0812',
        statusKeanggotaan: 'aktif', rantingId: 1,
        statusData: 'lengkap', statusValidasi: 'tervalidasi',
        createdAt: new Date(), updatedAt: new Date(),
      };
      anggotaService.findById.mockResolvedValue(mockResult as any);

      const result = await controller.findById('1');

      expect(anggotaService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResult);
    });
  });

  // ─── findByUuid ───

  describe('findByUuid', () => {
    it('should call anggotaService.findByUuid with uuid param', async () => {
      const mockResult = {
        id: 1, uuid: 'abc-123', nomorAnggota: '001', namaLengkap: 'John',
        tempatLahir: 'Jakarta', tanggalLahir: new Date('1990-01-01'),
        jenisKelamin: 'L', alamat: 'Jl. Test', noHp: '0812',
        statusKeanggotaan: 'aktif', rantingId: 1,
        statusData: 'lengkap', statusValidasi: 'tervalidasi',
        createdAt: new Date(), updatedAt: new Date(),
      };
      anggotaService.findByUuid.mockResolvedValue(mockResult as any);

      const result = await controller.findByUuid('abc-123');

      expect(anggotaService.findByUuid).toHaveBeenCalledWith('abc-123');
      expect(result).toEqual(mockResult);
    });
  });

  // ─── update ───

  describe('update', () => {
    it('should call anggotaService.update with converted id', async () => {
      const data = { namaLengkap: 'John Updated' } as any;
      const mockResult = {
        id: 1, uuid: 'u1', nomorAnggota: '001', namaLengkap: 'John Updated',
        tempatLahir: 'Jakarta', tanggalLahir: new Date('1990-01-01'),
        jenisKelamin: 'L', alamat: 'Jl. Test', noHp: '0812',
        statusKeanggotaan: 'aktif', rantingId: 1,
        statusData: 'lengkap', statusValidasi: 'tervalidasi',
        createdAt: new Date(), updatedAt: new Date(),
      };
      anggotaService.update.mockResolvedValue(mockResult as any);

      const result = await controller.update('1', data);

      expect(anggotaService.update).toHaveBeenCalledWith(1, data);
      expect(result).toEqual(mockResult);
    });
  });

  // ─── delete ───

  describe('delete', () => {
    it('should call anggotaService.delete with converted id', async () => {
      const mockResult = {
        id: 1, uuid: 'u1', nomorAnggota: '001', namaLengkap: 'Deleted',
        tempatLahir: 'Jakarta', tanggalLahir: new Date('1990-01-01'),
        jenisKelamin: 'L', alamat: 'Jl. Test', noHp: '0812',
        statusKeanggotaan: 'aktif', rantingId: 1,
        statusData: 'lengkap', statusValidasi: 'tervalidasi',
        createdAt: new Date(), updatedAt: new Date(),
      };
      anggotaService.delete.mockResolvedValue(mockResult as any);

      const result = await controller.delete('1');

      expect(anggotaService.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResult);
    });
  });

  // ─── validateData ───

  describe('validateData', () => {
    it('should call anggotaService.validateData with converted id', async () => {
      const mockResult = {
        id: 1, statusData: 'complete', missingFields: [],
      };
      anggotaService.validateData.mockResolvedValue(mockResult as any);

      const result = await controller.validateData('1');

      expect(anggotaService.validateData).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResult);
    });
  });

  // ─── setValidasi ───

  describe('setValidasi', () => {
    it('should call anggotaService.setValidasi with converted id and status', async () => {
      anggotaService.setValidasi.mockResolvedValue({
        id: 1, statusValidasi: 'tervalidasi',
      } as any);

      const result = await controller.setValidasi('1', 'tervalidasi');

      expect(anggotaService.setValidasi).toHaveBeenCalledWith(1, 'tervalidasi');
      expect(result.statusValidasi).toBe('tervalidasi');
    });
  });

  // ─── createCalon ───

  describe('createCalon', () => {
    it('should create calon anggota via prisma', async () => {
      const req = { user: { id: 1 } };
      const data = {
        namaLengkap: 'New Calon',
        jenisKelamin: 'L',
        rantingId: 5,
        tempatLahir: 'Jakarta',
      };
      const mockResult = { id: 1, ...data, usulOlehUserId: 1 };
      (prisma.calonAnggota.create as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.createCalon(req, data as any);

      expect(prisma.calonAnggota.create).toHaveBeenCalledWith({
        data: {
          ...data,
          tanggalLahir: undefined,
          usulOlehUserId: 1,
        },
      });
      expect(result).toEqual(mockResult);
    });
  });

  // ─── findAllCalon ───

  describe('findAllCalon', () => {
    it('should return paginated calon anggota with filters', async () => {
      const mockData = [{ id: 1, namaLengkap: 'Calon A' }];
      (prisma.calonAnggota.findMany as jest.Mock).mockResolvedValue(mockData);
      (prisma.calonAnggota.count as jest.Mock).mockResolvedValue(1);

      const result = await controller.findAllCalon(1, 10, 'aktif', 5);

      expect(prisma.calonAnggota.findMany).toHaveBeenCalledWith({
        where: { status: 'aktif', rantingId: 5 },
        skip: 0,
        take: 10,
        include: {
          ranting: true,
          usulOleh: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result.meta).toEqual({
        total: 1, page: 1, limit: 10, totalPages: 1,
      });
      expect(result.data).toEqual(mockData);
    });

    it('should handle empty filters', async () => {
      (prisma.calonAnggota.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.calonAnggota.count as jest.Mock).mockResolvedValue(0);

      const result = await controller.findAllCalon(undefined, undefined, undefined, undefined);

      expect(prisma.calonAnggota.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        include: {
          ranting: true,
          usulOleh: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result.data).toEqual([]);
    });
  });

  // ─── findCalonById ───

  describe('findCalonById', () => {
    it('should return calon anggota with all includes', async () => {
      const mockCalon = { id: 1, namaLengkap: 'Calon A' };
      (prisma.calonAnggota.findUnique as jest.Mock).mockResolvedValue(mockCalon);

      const result = await controller.findCalonById('1');

      expect(prisma.calonAnggota.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          ranting: true,
          usulOleh: { select: { id: true, name: true } },
          nilaiPendadaran: { include: { kegiatan: true, itemPenilaian: true } },
          hasilPendadaran: true,
          issuedDocuments: { include: { documentType: true } },
        },
      });
      expect(result).toEqual(mockCalon);
    });

    it('should throw NotFoundException when calon not found', async () => {
      (prisma.calonAnggota.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(controller.findCalonById('999')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── updateCalonStatus ───

  describe('updateCalonStatus', () => {
    it('should update calon anggota status', async () => {
      const updated = { id: 1, status: 'diterima' };
      (prisma.calonAnggota.update as jest.Mock).mockResolvedValue(updated);

      const result = await controller.updateCalonStatus('1', 'diterima');

      expect(prisma.calonAnggota.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'diterima' },
      });
      expect(result).toEqual(updated);
    });
  });

  // ─── assignRole ───

  describe('assignRole', () => {
    it('should assign a role to anggota', async () => {
      const data = { roleCode: 'pelatih', expiresAt: '2026-12-31' };
      const mockRole = { id: 1, anggotaId: 1, roleCode: 'pelatih' };
      (prisma.anggotaRole.create as jest.Mock).mockResolvedValue(mockRole);

      const result = await controller.assignRole('1', data);

      expect(prisma.anggotaRole.create).toHaveBeenCalledWith({
        data: {
          anggotaId: 1,
          roleCode: 'pelatih',
          expiresAt: new Date('2026-12-31'),
        },
      });
      expect(result).toEqual(mockRole);
    });

    it('should set expiresAt to null when not provided', async () => {
      const data = { roleCode: 'penguji' };
      (prisma.anggotaRole.create as jest.Mock).mockResolvedValue({});

      await controller.assignRole('1', data);

      expect(prisma.anggotaRole.create).toHaveBeenCalledWith({
        data: {
          anggotaId: 1,
          roleCode: 'penguji',
          expiresAt: null,
        },
      });
    });
  });

  // ─── getRoles ───

  describe('getRoles', () => {
    it('should return roles for anggota', async () => {
      const mockRoles = [
        { id: 1, roleCode: 'pelatih' },
        { id: 2, roleCode: 'penguji' },
      ];
      (prisma.anggotaRole.findMany as jest.Mock).mockResolvedValue(mockRoles);

      const result = await controller.getRoles('1');

      expect(prisma.anggotaRole.findMany).toHaveBeenCalledWith({
        where: { anggotaId: 1 },
        orderBy: { issuedAt: 'desc' },
      });
      expect(result).toEqual(mockRoles);
    });
  });

  // ─── removeRole ───

  describe('removeRole', () => {
    it('should remove a role by roleId', async () => {
      const mockDeleted = { id: 1, roleCode: 'pelatih' };
      (prisma.anggotaRole.delete as jest.Mock).mockResolvedValue(mockDeleted);

      const result = await controller.removeRole('1');

      expect(prisma.anggotaRole.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockDeleted);
    });
  });

  // ─── konversiCalon ───

  describe('konversiCalon', () => {
    it('should call konversiCalonKeAnggota with parsed id and data', async () => {
      const req = { user: { id: 1 } };
      const data = { nomorAnggota: 'THS-2026-010', tingkat: 'Tamtama' };
      const mockResult = {
        anggota: { id: 10, nomorAnggota: 'THS-2026-010' },
        message: 'Calon anggota berhasil dikonversi menjadi anggota aktif dengan nomor THS-2026-010',
      };
      anggotaService.konversiCalonKeAnggota.mockResolvedValue(mockResult as any);

      const result = await controller.konversiCalon('5', req, data);

      expect(anggotaService.konversiCalonKeAnggota).toHaveBeenCalledWith(5, data, 1);
      expect(result).toEqual(mockResult);
    });
  });

  // ─── pendaftaran ───

  describe('createPendaftaran', () => {
    it('should call service.createPendaftaran with body data (no auth needed)', async () => {
      const data = {
        namaLengkap: 'Budi', jenisKelamin: 'L',
        noHp: '081234567890', rantingId: 1,
      };
      const mockResult = { id: 1, ...data, status: 'pending' };
      anggotaService.createPendaftaran.mockResolvedValue(mockResult as any);

      const result = await controller.createPendaftaran(data as any);

      expect(anggotaService.createPendaftaran).toHaveBeenCalledWith(data);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAllPendaftaran', () => {
    it('should call service.findAllPendaftaran with parsed query params', async () => {
      const mockResult = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      anggotaService.findAllPendaftaran.mockResolvedValue(mockResult as any);

      await controller.findAllPendaftaran('2', '20', 'pending', '3');

      expect(anggotaService.findAllPendaftaran).toHaveBeenCalledWith(2, 20, 'pending', 3);
    });

    it('should pass undefined when query params not provided', async () => {
      const mockResult = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      anggotaService.findAllPendaftaran.mockResolvedValue(mockResult as any);

      await controller.findAllPendaftaran(undefined, undefined, undefined, undefined);

      expect(anggotaService.findAllPendaftaran).toHaveBeenCalledWith(undefined, undefined, undefined, undefined);
    });
  });

  describe('reviewPendaftaran', () => {
    it('should call service.reviewPendaftaran with correct args', async () => {
      const req = { user: { id: 1 } };
      const data = { status: 'approved' as const, nomorAnggota: 'THS-001', catatanAdmin: 'OK' };
      const mockResult = { id: 1, status: 'approved' };
      anggotaService.reviewPendaftaran.mockResolvedValue(mockResult as any);

      const result = await controller.reviewPendaftaran('1', req, data);

      expect(anggotaService.reviewPendaftaran).toHaveBeenCalledWith(1, 1, data);
      expect(result).toEqual(mockResult);
    });
  });

  describe('deletePendaftaran', () => {
    it('should call service.deletePendaftaran with parsed id', async () => {
      anggotaService.deletePendaftaran.mockResolvedValue({ message: 'Pendaftaran berhasil dihapus' } as any);

      const result = await controller.deletePendaftaran('1');

      expect(anggotaService.deletePendaftaran).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Pendaftaran berhasil dihapus' });
    });
  });

  // ─── submitUpdateRequest ───

  describe('submitUpdateRequest', () => {
    it('should create update request via prisma', async () => {
      const req = { user: { id: 2 } };
      const data = {
        newData: { alamat: 'Jl. Baru No. 1' },
        oldData: { alamat: 'Jl. Lama' },
      };
      const mockRequest = {
        id: 1,
        anggotaId: 1,
        submittedBy: 2,
        newData: data.newData,
        oldData: data.oldData,
      };
      (prisma.anggotaUpdateRequest.create as jest.Mock).mockResolvedValue(mockRequest);

      const result = await controller.submitUpdateRequest('1', req, data);

      expect(prisma.anggotaUpdateRequest.create).toHaveBeenCalledWith({
        data: {
          anggotaId: 1,
          submittedBy: 2,
          oldData: data.oldData,
          newData: data.newData,
        },
      });
      expect(result).toEqual(mockRequest);
    });
  });

  // ─── getUpdateRequests ───

  describe('getUpdateRequests', () => {
    it('should return paginated update requests with filters', async () => {
      const mockData = [{ id: 1, anggotaId: 1, status: 'pending' }];
      (prisma.anggotaUpdateRequest.findMany as jest.Mock).mockResolvedValue(mockData);
      (prisma.anggotaUpdateRequest.count as jest.Mock).mockResolvedValue(1);

      const result = await controller.getUpdateRequests(1, 10, 'pending');

      expect(prisma.anggotaUpdateRequest.findMany).toHaveBeenCalledWith({
        where: { status: 'pending' },
        skip: 0,
        take: 10,
        include: {
          anggota: { select: { id: true, namaLengkap: true, nomorAnggota: true } },
          pengaju: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result.data).toEqual(mockData);
      expect(result.meta).toEqual({
        total: 1, page: 1, limit: 10, totalPages: 1,
      });
    });

    it('should handle empty filters', async () => {
      (prisma.anggotaUpdateRequest.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.anggotaUpdateRequest.count as jest.Mock).mockResolvedValue(0);

      const result = await controller.getUpdateRequests(undefined, undefined, undefined);

      expect(prisma.anggotaUpdateRequest.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        include: {
          anggota: { select: { id: true, namaLengkap: true, nomorAnggota: true } },
          pengaju: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  // ─── reviewUpdateRequest ───

  describe('reviewUpdateRequest', () => {
    it('should approve and apply newData on approval', async () => {
      const req = { user: { id: 2 } };
      const existingRequest = {
        id: 1,
        anggotaId: 1,
        status: 'pending',
        newData: { alamat: 'Jl. Baru No. 1', nomorHp: '081234567890' },
        oldData: null,
      };
      const reviewData = { status: 'approved', catatanAdmin: 'OK' };

      (prisma.anggotaUpdateRequest.findUnique as jest.Mock).mockResolvedValue(existingRequest);

      // Mock $transaction to call the callback with mock tx
      const mockTx = {
        anggota: {
          update: jest.fn().mockResolvedValue({}),
        },
        anggotaUpdateRequest: {
          update: jest.fn().mockResolvedValue({
            ...existingRequest,
            status: 'approved',
            reviewedBy: 2,
          }),
        },
      };
      (prisma.$transaction as jest.Mock).mockImplementation(
        (cb: (tx: any) => any) => cb(mockTx),
      );

      const result = await controller.reviewUpdateRequest('1', req, reviewData);

      // Should apply anggota update
      expect(mockTx.anggota.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          alamat: 'Jl. Baru No. 1',
          nomorHp: '081234567890',
          tanggalLahir: undefined,
        },
      });
      // Should update request status
      expect(result.status).toBe('approved');
    });

    it('should throw NotFoundException when request not found', async () => {
      (prisma.anggotaUpdateRequest.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        controller.reviewUpdateRequest('999', { user: { id: 1 } }, { status: 'approved' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
