import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AnggotaService } from './anggota.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';

// ─── Test data ───

const mockRanting = { id: 5, uuid: 'ranting-uuid', tingkat: 'Ranting', nama: 'Ranting Cisarua', indukId: 3 };
const mockWilayah = { id: 3, uuid: 'wilayah-uuid', tingkat: 'Wilayah', nama: 'Wilayah Bogor', indukId: 1 };

const mockAnggota = {
  id: 1,
  uuid: 'anggota-uuid-1',
  nomorAnggota: 'THS-001',
  namaLengkap: 'Budi Santoso',
  tempatLahir: 'Jakarta',
  tanggalLahir: new Date('2000-01-15'),
  jenisKelamin: 'L',
  alamat: 'Jl. Merdeka No. 1',
  noHp: '081234567890',
  email: 'budi@example.com',
  fotoUrl: null,
  statusKeanggotaan: 'aktif',
  rantingId: 5,
  distrikId: 1,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ranting: mockRanting,
};

const mockUser = {
  id: 1,
  uuid: 'user-uuid',
  username: 'admin',
  role: { id: 1, nama: 'Superadmin', scope: 'superadmin' },
};

const mockDeepAnggota = {
  ...mockAnggota,
  user: mockUser,
  anggotaRole: [],
  pembayaranIuran: [{ id: 1, jumlahBayar: 50000, status: 'lunas' }],
  issuedDocuments: [{ id: 1, nomorDokumen: 'DOC-001', documentType: { code: 'KARTU_ANGGOTA' } }],
};

describe('AnggotaService', () => {
  let service: AnggotaService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnggotaService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AnggotaService>(AnggotaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  //  create()
  // ──────────────────────────────────────────────

  describe('create', () => {
    const createDto = {
      nomorAnggota: 'THS-002',
      namaLengkap: 'Siti Rahmawati',
      tempatLahir: 'Bandung',
      tanggalLahir: '1999-06-20',
      jenisKelamin: 'P',
      alamat: 'Jl. Kencana No. 5',
      noHp: '081234567891',
      email: 'siti@example.com',
      rantingId: 5,
    };

    it('should create anggota with new schema', async () => {
      (prisma.ranting.findUnique as jest.Mock)
        .mockResolvedValue(mockRanting);
      (prisma.anggota.create as jest.Mock).mockResolvedValue(mockAnggota);

      const result = await service.create(createDto);

      expect(prisma.anggota.create).toHaveBeenCalledWith({
        data: {
          nomorAnggota: 'THS-002',
          namaLengkap: 'Siti Rahmawati',
          jenisKelamin: 'P',
          rantingId: 5,
          tempatLahir: 'Bandung',
          tanggalLahir: new Date('1999-06-20'),
          alamat: 'Jl. Kencana No. 5',
          noHp: '081234567891',
          email: 'siti@example.com',
          statusData: 'incomplete',
          statusValidasi: 'pending',
        },
        include: { ranting: { include: { wilayah: { include: { distrik: true } } } } },
      });
      expect(result).toEqual(mockAnggota);
    });

    it('should create anggota with only required fields (optionals → null)', async () => {
      const minDto = {
        nomorAnggota: 'THS-003',
        namaLengkap: 'Minimal Anggota',
        jenisKelamin: 'L',
        rantingId: 5,
      };
      (prisma.anggota.create as jest.Mock).mockResolvedValue({ ...mockAnggota, ...minDto, nomorAnggota: 'THS-003' });

      await service.create(minDto as any);

      expect(prisma.anggota.create).toHaveBeenCalledWith({
        data: {
          nomorAnggota: 'THS-003',
          namaLengkap: 'Minimal Anggota',
          jenisKelamin: 'L',
          rantingId: 5,
          tempatLahir: null,
          tanggalLahir: null,
          alamat: null,
          noHp: null,
          email: null,
          statusData: 'incomplete',
          statusValidasi: 'pending',
        },
        include: expect.any(Object),
      });
    });
  });

  // ──────────────────────────────────────────────
  //  findAll()
  // ──────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated anggota without filters', async () => {
      const mockData = [mockAnggota];
      (prisma.anggota.findMany as jest.Mock).mockResolvedValue(mockData);
      (prisma.anggota.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll();

      expect(prisma.anggota.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        include: { ranting: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        data: mockData,
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });
    });

    it('should search across namaLengkap, nomorAnggota, and noHp', async () => {
      (prisma.anggota.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.anggota.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 10, 'Budi');

      expect(prisma.anggota.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { namaLengkap: { contains: 'Budi' } },
              { nomorAnggota: { contains: 'Budi' } },
              { noHp: { contains: 'Budi' } },
            ],
          },
        }),
      );
    });

    it('should filter by statusKeanggotaan', async () => {
      (prisma.anggota.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.anggota.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 10, undefined, 'aktif');

      expect(prisma.anggota.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { statusKeanggotaan: 'aktif' },
        }),
      );
    });

    it('should filter by rantingId', async () => {
      (prisma.anggota.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.anggota.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 10, undefined, undefined, 5);

      expect(prisma.anggota.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { rantingId: 5 },
        }),
      );
    });

    it('should combine search, status, and rantingId filters', async () => {
      (prisma.anggota.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.anggota.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(1, 10, 'Budi', 'aktif', 5);

      expect(prisma.anggota.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { namaLengkap: { contains: 'Budi' } },
              { nomorAnggota: { contains: 'Budi' } },
              { noHp: { contains: 'Budi' } },
            ],
            statusKeanggotaan: 'aktif',
            rantingId: 5,
          },
        }),
      );
    });

    it('should apply pagination correctly', async () => {
      (prisma.anggota.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.anggota.count as jest.Mock).mockResolvedValue(45);

      const result = await service.findAll(3, 10);

      expect(result.meta).toEqual({
        total: 45, page: 3, limit: 10, totalPages: 5,
      });
    });
  });

  // ──────────────────────────────────────────────
  //  findById()
  // ──────────────────────────────────────────────

  describe('findById', () => {
    it('should return anggota with all nested includes', async () => {
      (prisma.anggota.findUnique as jest.Mock).mockResolvedValue(mockDeepAnggota);

      const result = await service.findById(1);

      expect(prisma.anggota.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          ranting: { include: { wilayah: { include: { distrik: true } } } },
          user: { include: { role: true } },
          anggotaRole: true,
          pembayaranIuran: { take: 10, orderBy: { createdAt: 'desc' } },
          issuedDocuments: { include: { documentType: true }, orderBy: { createdAt: 'desc' } },
        },
      });
      expect(result).toEqual(mockDeepAnggota);
    });

    it('should throw NotFoundException when anggota not found', async () => {
      (prisma.anggota.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────────
  //  findByUuid()
  // ──────────────────────────────────────────────

  describe('findByUuid', () => {
    it('should return anggota by uuid', async () => {
      (prisma.anggota.findUnique as jest.Mock).mockResolvedValue(mockAnggota);

      const result = await service.findByUuid('anggota-uuid-1');

      expect(prisma.anggota.findUnique).toHaveBeenCalledWith({
        where: { uuid: 'anggota-uuid-1' },
        include: { ranting: true, anggotaRole: true },
      });
      expect(result).toEqual(mockAnggota);
    });

    it('should throw NotFoundException when uuid not found', async () => {
      (prisma.anggota.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findByUuid('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────────
  //  update()
  // ──────────────────────────────────────────────

  describe('update', () => {
    it('should update anggota fields', async () => {
      const updateData = { namaLengkap: 'Budi Santoso Update', email: 'budi.new@example.com' };
      (prisma.anggota.update as jest.Mock).mockResolvedValue({
        ...mockAnggota,
        ...updateData,
      });

      const result = await service.update(1, updateData);

      expect(prisma.anggota.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
        include: { ranting: true },
      });
      expect(result.namaLengkap).toBe('Budi Santoso Update');
    });
  });

  // ──────────────────────────────────────────────
  //  delete()
  // ──────────────────────────────────────────────

  describe('delete', () => {
    it('should delete anggota by id', async () => {
      (prisma.anggota.delete as jest.Mock).mockResolvedValue(mockAnggota);

      const result = await service.delete(1);

      expect(prisma.anggota.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockAnggota);
    });
  });

  // ──────────────────────────────────────────────
  //  findForClaim()
  // ──────────────────────────────────────────────

  describe('findForClaim', () => {
    it('should search active anggota by nomorAnggota, noHp, or namaLengkap', async () => {
      const mockResults = [mockAnggota];
      (prisma.anggota.findMany as jest.Mock).mockResolvedValue(mockResults);

      const result = await service.findForClaim('THS-001');

      expect(prisma.anggota.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { nomorAnggota: { contains: 'THS-001' } },
            { noHp: { contains: 'THS-001' } },
            { namaLengkap: { contains: 'THS-001' } },
          ],
          statusKeanggotaan: 'aktif',
        },
        take: 10,
      });
      expect(result).toEqual(mockResults);
    });

    it('should return empty array when no matching active anggota', async () => {
      (prisma.anggota.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findForClaim('NONEXISTENT');

      expect(result).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────
  //  validateData()
  // ──────────────────────────────────────────────

  describe('validateData', () => {
    const completeAnggota = {
      ...mockAnggota,
      tempatLahir: 'Jakarta',
      tanggalLahir: new Date('2000-01-15'),
      alamat: 'Jl. Merdeka No. 1',
      noHp: '081234567890',
      fotoPath: '/photos/budi.jpg',
    };

    const incompleteAnggota = {
      ...mockAnggota,
      tempatLahir: null,
      tanggalLahir: null,
      alamat: null,
      noHp: null,
      fotoPath: null,
    };

    it('should mark data as complete when all required fields are present', async () => {
      (prisma.anggota.findUnique as jest.Mock).mockResolvedValue(completeAnggota);
      (prisma.anggota.update as jest.Mock).mockResolvedValue({
        ...completeAnggota,
        statusData: 'complete',
        missingFields: [],
      });

      const result = await service.validateData(1);

      expect(prisma.anggota.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          statusData: 'complete',
          missingFields: [],
        },
      });
      expect(result.statusData).toBe('complete');
    });

    it('should mark data as incomplete when fields are missing', async () => {
      (prisma.anggota.findUnique as jest.Mock).mockResolvedValue(incompleteAnggota);
      (prisma.anggota.update as jest.Mock).mockResolvedValue({
        ...incompleteAnggota,
        statusData: 'incomplete',
        missingFields: ['tempatLahir', 'tanggalLahir', 'alamat', 'noHp', 'fotoPath'],
      });

      const result = await service.validateData(1);

      expect(prisma.anggota.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          statusData: 'incomplete',
          missingFields: ['tempatLahir', 'tanggalLahir', 'alamat', 'noHp', 'fotoPath'],
        },
      });
      expect(result.statusData).toBe('incomplete');
    });

    it('should throw NotFoundException when anggota not found', async () => {
      (prisma.anggota.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.validateData(999)).rejects.toThrow(NotFoundException);
      expect(prisma.anggota.update).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────
  //  setValidasi()
  // ──────────────────────────────────────────────

  describe('setValidasi', () => {
    it('should update validasi status', async () => {
      const updated = { ...mockAnggota, statusValidasi: 'tervalidasi' };
      (prisma.anggota.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.setValidasi(1, 'tervalidasi');

      expect(prisma.anggota.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { statusValidasi: 'tervalidasi' },
      });
      expect(result.statusValidasi).toBe('tervalidasi');
    });

    it('should set rejected validasi status', async () => {
      const updated = { ...mockAnggota, statusValidasi: 'ditolak' };
      (prisma.anggota.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.setValidasi(1, 'ditolak');

      expect(prisma.anggota.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { statusValidasi: 'ditolak' },
      });
      expect(result.statusValidasi).toBe('ditolak');
    });
  });
});
