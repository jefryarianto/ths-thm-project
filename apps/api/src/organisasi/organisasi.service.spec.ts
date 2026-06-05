import { Test } from '@nestjs/testing';
import { OrganisasiService } from './organisasi.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';
import { NotFoundException } from '@nestjs/common';

const mockNasional = { id: 1, uuid: 'n-1', nama: 'Nasional THS', kode: 'THS' };
const mockDistrik = { id: 2, uuid: 'd-1', nama: 'Distrik A', kodeDistrik: 'DA', nasionalId: 1 };
const mockWilayah = { id: 3, uuid: 'w-1', nama: 'Wilayah A', kodeWilayah: 'WA', distrikId: 2 };
const mockRanting = { id: 4, uuid: 'r-1', nama: 'Ranting A', kodeRanting: 'RA', wilayahId: 3 };
const mockUnitLatihan = { id: 5, uuid: 'ul-1', nama: 'Unit Latihan A', distrikId: 2 };

describe('OrganisasiService', () => {
  let service: OrganisasiService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module = await Test.createTestingModule({
      providers: [OrganisasiService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(OrganisasiService);
  });

  afterEach(() => { jest.clearAllMocks(); });

  // ─── CREATE ───

  describe('createNasional', () => {
    it('should create nasional', async () => {
      const data = { nama: 'Nasional Test', kode: 'NT' };
      (prisma.nasional.create as jest.Mock).mockResolvedValue({ id: 1, ...data });

      const result = await service.createNasional(data);

      expect(prisma.nasional.create).toHaveBeenCalledWith({ data });
      expect(result).toEqual({ id: 1, nama: 'Nasional Test', kode: 'NT' });
    });
  });

  describe('createDistrik', () => {
    it('should create distrik with nasional include', async () => {
      const data = { nasionalId: 1, kodeDistrik: 'DB', nama: 'Distrik B' };
      const expected = { id: 3, ...data, nasional: mockNasional };
      (prisma.distrik.create as jest.Mock).mockResolvedValue(expected);

      const result = await service.createDistrik(data);

      expect(prisma.distrik.create).toHaveBeenCalledWith({
        data,
        include: { nasional: true },
      });
      expect(result).toEqual(expected);
    });
  });

  describe('createWilayah', () => {
    it('should create wilayah with distrik include', async () => {
      const data = { distrikId: 2, kodeWilayah: 'WB', nama: 'Wilayah B' };
      (prisma.wilayah.create as jest.Mock).mockResolvedValue({ id: 4, ...data, distrik: mockDistrik });

      await service.createWilayah(data);

      expect(prisma.wilayah.create).toHaveBeenCalledWith({
        data,
        include: { distrik: true },
      });
    });
  });

  describe('createRanting', () => {
    it('should create ranting with nested wilayah+distrik include', async () => {
      const data = { wilayahId: 3, kodeRanting: 'RB', nama: 'Ranting B' };
      const expected = {
        id: 5, ...data,
        wilayah: { ...mockWilayah, distrik: mockDistrik },
      };
      (prisma.ranting.create as jest.Mock).mockResolvedValue(expected);

      const result = await service.createRanting(data);

      expect(prisma.ranting.create).toHaveBeenCalledWith({
        data,
        include: { wilayah: { include: { distrik: true } } },
      });
      expect(result).toEqual(expected);
    });
  });

  describe('createUnitLatihan', () => {
    it('should create unit latihan with distrik include', async () => {
      const data = { distrikId: 2, nama: 'Unit Baru' };
      (prisma.unitLatihan.create as jest.Mock).mockResolvedValue({ id: 6, ...data, distrik: mockDistrik });

      await service.createUnitLatihan(data);

      expect(prisma.unitLatihan.create).toHaveBeenCalledWith({
        data,
        include: { distrik: true },
      });
    });
  });

  // ─── FIND ALL ───

  describe('findAllNasional', () => {
    it('should return all nasional with distrik count', async () => {
      (prisma.nasional.findMany as jest.Mock).mockResolvedValue([mockNasional]);
      const result = await service.findAllNasional();
      expect(prisma.nasional.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { _count: { select: { distrik: true } } },
          orderBy: { nama: 'asc' },
        }),
      );
      expect(result).toEqual([mockNasional]);
    });
  });

  describe('findAllDistrik', () => {
    it('should return distrik with includes', async () => {
      (prisma.distrik.findMany as jest.Mock).mockResolvedValue([mockDistrik]);
      const result = await service.findAllDistrik();
      expect(prisma.distrik.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ include: { nasional: true, _count: { select: { wilayah: true, unitLatihan: true } } }, orderBy: { nama: 'asc' } }),
      );
      expect(result).toEqual([mockDistrik]);
    });

    it('should filter by nasionalId', async () => {
      (prisma.distrik.findMany as jest.Mock).mockResolvedValue([]);
      await service.findAllDistrik(1);
      expect(prisma.distrik.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { nasionalId: 1 } }),
      );
    });
  });

  describe('findAllWilayah', () => {
    it('should return all wilayah with distrik and ranting count', async () => {
      (prisma.wilayah.findMany as jest.Mock).mockResolvedValue([mockWilayah]);
      const result = await service.findAllWilayah();
      expect(prisma.wilayah.findMany).toHaveBeenCalledWith({
        where: {},
        include: { distrik: true, _count: { select: { ranting: true } } },
        orderBy: { nama: 'asc' },
      });
      expect(result).toEqual([mockWilayah]);
    });

    it('should filter by distrikId', async () => {
      (prisma.wilayah.findMany as jest.Mock).mockResolvedValue([]);
      await service.findAllWilayah(2);
      expect(prisma.wilayah.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { distrikId: 2 } }),
      );
    });
  });

  describe('findAllRanting', () => {
    it('should return all ranting with nested wilayah+distrik and anggota count', async () => {
      (prisma.ranting.findMany as jest.Mock).mockResolvedValue([mockRanting]);
      const result = await service.findAllRanting();
      expect(prisma.ranting.findMany).toHaveBeenCalledWith({
        where: {},
        include: { wilayah: { include: { distrik: true } }, _count: { select: { anggota: true } } },
        orderBy: { nama: 'asc' },
      });
      expect(result).toEqual([mockRanting]);
    });

    it('should filter by wilayahId', async () => {
      (prisma.ranting.findMany as jest.Mock).mockResolvedValue([]);
      await service.findAllRanting(3);
      expect(prisma.ranting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { wilayahId: 3 } }),
      );
    });
  });

  describe('findAllUnitLatihan', () => {
    it('should return all unit latihan with distrik', async () => {
      (prisma.unitLatihan.findMany as jest.Mock).mockResolvedValue([mockUnitLatihan]);
      const result = await service.findAllUnitLatihan();
      expect(prisma.unitLatihan.findMany).toHaveBeenCalledWith({
        where: {},
        include: { distrik: true },
        orderBy: { nama: 'asc' },
      });
      expect(result).toEqual([mockUnitLatihan]);
    });

    it('should filter by distrikId', async () => {
      (prisma.unitLatihan.findMany as jest.Mock).mockResolvedValue([]);
      await service.findAllUnitLatihan(2);
      expect(prisma.unitLatihan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { distrikId: 2 } }),
      );
    });
  });

  // ─── FIND BY ID ───

  describe('findNasionalById', () => {
    it('should return nasional when found', async () => {
      (prisma.nasional.findUnique as jest.Mock).mockResolvedValue(mockNasional);
      const result = await service.findNasionalById(1);
      expect(prisma.nasional.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { distrik: { include: { _count: { select: { wilayah: true } } } } },
      });
      expect(result).toEqual(mockNasional);
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.nasional.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findNasionalById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findDistrikById', () => {
    it('should return distrik with wilayah and unit latihan', async () => {
      const distrik = { ...mockDistrik, wilayah: [], unitLatihan: [] };
      (prisma.distrik.findUnique as jest.Mock).mockResolvedValue(distrik);

      const result = await service.findDistrikById(2);

      expect(prisma.distrik.findUnique).toHaveBeenCalledWith({
        where: { id: 2 },
        include: { nasional: true, wilayah: { include: { ranting: true } }, unitLatihan: true },
      });
      expect(result).toEqual(distrik);
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.distrik.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findDistrikById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findWilayahById', () => {
    it('should return wilayah with ranting and anggota count', async () => {
      const wilayah = { ...mockWilayah, distrik: mockDistrik, ranting: [] };
      (prisma.wilayah.findUnique as jest.Mock).mockResolvedValue(wilayah);

      const result = await service.findWilayahById(3);

      expect(prisma.wilayah.findUnique).toHaveBeenCalledWith({
        where: { id: 3 },
        include: { distrik: true, ranting: { include: { _count: { select: { anggota: true } } } } },
      });
      expect(result).toEqual(wilayah);
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.wilayah.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findWilayahById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findRantingById', () => {
    it('should return ranting with wilayah+distrik and anggota', async () => {
      const ranting = { ...mockRanting, wilayah: { ...mockWilayah, distrik: mockDistrik }, anggota: [] };
      (prisma.ranting.findUnique as jest.Mock).mockResolvedValue(ranting);

      const result = await service.findRantingById(4);

      expect(prisma.ranting.findUnique).toHaveBeenCalledWith({
        where: { id: 4 },
        include: { wilayah: { include: { distrik: true } }, anggota: { take: 20 } },
      });
      expect(result).toEqual(ranting);
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.ranting.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findRantingById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── UPDATE ───

  describe('updateNasional', () => {
    it('should update nasional', async () => {
      (prisma.nasional.update as jest.Mock).mockResolvedValue({ id: 1, nama: 'Updated' });
      const result = await service.updateNasional(1, { nama: 'Updated' });
      expect(prisma.nasional.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { nama: 'Updated' } });
      expect(result.nama).toBe('Updated');
    });
  });

  describe('updateDistrik', () => {
    it('should update distrik', async () => {
      (prisma.distrik.update as jest.Mock).mockResolvedValue({ id: 2, nama: 'Updated Distrik' });
      const result = await service.updateDistrik(2, { nama: 'Updated Distrik' });
      expect(prisma.distrik.update).toHaveBeenCalledWith({ where: { id: 2 }, data: { nama: 'Updated Distrik' } });
      expect(result.nama).toBe('Updated Distrik');
    });
  });

  describe('updateWilayah', () => {
    it('should update wilayah', async () => {
      (prisma.wilayah.update as jest.Mock).mockResolvedValue({ id: 3, nama: 'Updated Wilayah' });
      const result = await service.updateWilayah(3, { nama: 'Updated Wilayah' });
      expect(prisma.wilayah.update).toHaveBeenCalledWith({ where: { id: 3 }, data: { nama: 'Updated Wilayah' } });
      expect(result.nama).toBe('Updated Wilayah');
    });
  });

  describe('updateRanting', () => {
    it('should update ranting', async () => {
      (prisma.ranting.update as jest.Mock).mockResolvedValue({ id: 4, lokasiLatihan: 'New Location' });
      const result = await service.updateRanting(4, { lokasiLatihan: 'New Location' });
      expect(prisma.ranting.update).toHaveBeenCalledWith({ where: { id: 4 }, data: { lokasiLatihan: 'New Location' } });
      expect(result.lokasiLatihan).toBe('New Location');
    });
  });

  // ─── DELETE ───

  describe('deleteRanting', () => {
    it('should delete ranting by id', async () => {
      (prisma.ranting.delete as jest.Mock).mockResolvedValue({ id: 4 });
      const result = await service.deleteRanting(4);
      expect(prisma.ranting.delete).toHaveBeenCalledWith({ where: { id: 4 } });
      expect(result).toEqual({ id: 4 });
    });
  });

  describe('deleteWilayah', () => {
    it('should delete wilayah by id', async () => {
      (prisma.wilayah.delete as jest.Mock).mockResolvedValue({ id: 3 });
      const result = await service.deleteWilayah(3);
      expect(prisma.wilayah.delete).toHaveBeenCalledWith({ where: { id: 3 } });
      expect(result).toEqual({ id: 3 });
    });
  });

  describe('deleteDistrik', () => {
    it('should delete distrik by id', async () => {
      (prisma.distrik.delete as jest.Mock).mockResolvedValue({ id: 2 });
      const result = await service.deleteDistrik(2);
      expect(prisma.distrik.delete).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(result).toEqual({ id: 2 });
    });
  });

  describe('deleteNasional', () => {
    it('should delete nasional by id', async () => {
      (prisma.nasional.delete as jest.Mock).mockResolvedValue({ id: 1 });
      const result = await service.deleteNasional(1);
      expect(prisma.nasional.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ id: 1 });
    });
  });

  // ─── HIERARCHY ───

  describe('getHierarchyTree', () => {
    it('should return full nested hierarchy', async () => {
      const tree = [{
        id: 1, nama: 'Nasional THS',
        distrik: [{
          id: 2, nama: 'Distrik A',
          wilayah: [{ id: 3, nama: 'Wilayah A', ranting: [{ id: 4, nama: 'Ranting A', _count: { anggota: 10 } }] }],
          unitLatihan: [{ id: 5, nama: 'Unit A' }],
        }],
      }];
      (prisma.nasional.findMany as jest.Mock).mockResolvedValue(tree);

      const result = await service.getHierarchyTree();

      expect(prisma.nasional.findMany).toHaveBeenCalledWith({
        include: {
          distrik: {
            include: {
              wilayah: {
                include: {
                  ranting: {
                    include: { _count: { select: { anggota: true } } },
                  },
                },
              },
              unitLatihan: true,
            },
          },
        },
      });
      expect(result).toEqual(tree);
      expect(result[0].distrik[0].wilayah[0].ranting[0]._count.anggota).toBe(10);
    });

    it('should return empty array when no data', async () => {
      (prisma.nasional.findMany as jest.Mock).mockResolvedValue([]);
      const result = await service.getHierarchyTree();
      expect(result).toEqual([]);
    });
  });
});
