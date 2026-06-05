import { Test } from '@nestjs/testing';
import { AbsensiService } from './absensi.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';

describe('AbsensiService', () => {
  let service: AbsensiService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module = await Test.createTestingModule({
      providers: [
        AbsensiService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AbsensiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── recordLatihan ───

  describe('recordLatihan', () => {
    it('should create absensi latihan record', async () => {
      const input = { anggotaId: 1, latihanId: 2, checkinMethod: 'manual', checkinTime: '2026-06-01T10:00:00Z', recordedBy: 1 };
      const expected = { id: 1, ...input };
      (prisma.absensiLatihan.create as jest.Mock).mockResolvedValue(expected);

      const result = await service.recordLatihan(input);

      expect(prisma.absensiLatihan.create).toHaveBeenCalledWith({
        data: {
          latihanId: 2,
          anggotaId: 1,
          calonAnggotaId: null,
          checkinMethod: 'manual',
          checkinTime: new Date('2026-06-01T10:00:00Z'),
          recordedBy: 1,
        },
      });
      expect(result).toEqual(expected);
    });
  });

  // ─── findByLatihan ───

  describe('findLatihanByLatihan', () => {
    it('should return absensi with anggota for given latihan', async () => {
      const absensi = [
        { id: 1, anggotaId: 1, checkinMethod: 'manual', anggota: { id: 1, namaLengkap: 'Anggota A' } },
        { id: 2, anggotaId: 2, checkinMethod: 'qr', anggota: { id: 2, namaLengkap: 'Anggota B' } },
      ];
      (prisma.absensiLatihan.findMany as jest.Mock).mockResolvedValue(absensi);

      const result = await service.findLatihanByLatihan(5);

      expect(prisma.absensiLatihan.findMany).toHaveBeenCalledWith({
        where: { latihanId: 5 },
        include: {
          anggota: { select: { id: true, namaLengkap: true, nomorAnggota: true } },
          calonAnggota: { select: { id: true, namaLengkap: true } },
          pencatat: { select: { id: true, name: true } },
        },
        orderBy: { checkinTime: 'desc' },
      });
      expect(result).toEqual(absensi);
    });

    it('should return empty array when no absensi found', async () => {
      (prisma.absensiLatihan.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findLatihanByLatihan(999);

      expect(result).toEqual([]);
    });
  });

  // ─── recordKegiatan ───

  describe('recordKegiatan', () => {
    it('should create absensi kegiatan record', async () => {
      const input = { anggotaId: 1, kegiatanId: 3, checkinMethod: 'qr', checkinTime: '2026-06-15T08:00:00Z', recordedBy: 2 };
      const expected = { id: 1, ...input, checkinTime: new Date(input.checkinTime) };
      (prisma.absensiKegiatan.create as jest.Mock).mockResolvedValue(expected);

      const result = await service.recordKegiatan(input);

      expect(prisma.absensiKegiatan.create).toHaveBeenCalledWith({
        data: {
          kegiatanId: 3,
          anggotaId: 1,
          calonAnggotaId: null,
          checkinMethod: 'qr',
          checkinTime: new Date('2026-06-15T08:00:00Z'),
          recordedBy: 2,
        },
        include: {
          kegiatan: { select: { id: true, nama: true } },
          anggota: { select: { id: true, namaLengkap: true } },
        },
      });
      expect(result).toEqual(expected);
    });

    it('should use default checkinMethod manual when not provided', async () => {
      const input = { calonAnggotaId: 5, kegiatanId: 3, checkinTime: '2026-06-15T08:00:00Z', recordedBy: 2 };
      (prisma.absensiKegiatan.create as jest.Mock).mockResolvedValue({ id: 2 });

      await service.recordKegiatan(input);

      expect(prisma.absensiKegiatan.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          checkinMethod: 'manual',
        }),
        include: expect.any(Object),
      });
    });
  });

  // ─── findKegiatanByKegiatan ───

  describe('findKegiatanByKegiatan', () => {
    it('should return absensi with anggota for given kegiatan', async () => {
      const absensi = [
        { id: 1, kegiatanId: 3, anggotaId: 1, anggota: { id: 1, namaLengkap: 'Anggota A', nomorAnggota: 'THS-001' } },
      ];
      (prisma.absensiKegiatan.findMany as jest.Mock).mockResolvedValue(absensi);

      const result = await service.findKegiatanByKegiatan(3);

      expect(prisma.absensiKegiatan.findMany).toHaveBeenCalledWith({
        where: { kegiatanId: 3 },
        include: {
          anggota: { select: { id: true, namaLengkap: true, nomorAnggota: true } },
          calonAnggota: { select: { id: true, namaLengkap: true } },
          pencatat: { select: { id: true, name: true } },
        },
        orderBy: { checkinTime: 'desc' },
      });
      expect(result).toEqual(absensi);
    });

    it('should filter calonAnggota and pencatat include', async () => {
      const absensi = [{
        id: 2, kegiatanId: 3, calonAnggotaId: 5,
        calonAnggota: { id: 5, namaLengkap: 'Calon A' },
        pencatat: { id: 2, name: 'Pencatat A' },
      }];
      (prisma.absensiKegiatan.findMany as jest.Mock).mockResolvedValue(absensi);

      const result = await service.findKegiatanByKegiatan(3);

      expect(result[0]?.calonAnggota?.namaLengkap).toBe('Calon A');
      expect(result[0]?.pencatat?.name).toBe('Pencatat A');
    });
  });

  // ─── recordLatihanBulk ───

  describe('recordLatihanBulk', () => {
    it('should create many absensi latihan records for hadir entries only', async () => {
      (prisma.absensiLatihan.createMany as jest.Mock).mockResolvedValue({ count: 2 });

      const entries = [
        { anggotaId: 1, hadir: true },
        { anggotaId: 2, hadir: false },
        { calonAnggotaId: 3, hadir: true },
        { anggotaId: 4, hadir: false },
      ];

      const result = await service.recordLatihanBulk(entries, 10, 1);

      expect(prisma.absensiLatihan.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ latihanId: 10, anggotaId: 1, checkinMethod: 'manual', recordedBy: 1 }),
          expect.objectContaining({ latihanId: 10, calonAnggotaId: 3, checkinMethod: 'manual', recordedBy: 1 }),
        ]),
      });
      // Should only have 2 entries (the hadir ones)
      const callData = (prisma.absensiLatihan.createMany as jest.Mock).mock.calls[0][0].data;
      expect(callData).toHaveLength(2);
      expect(result).toEqual({ count: 2 });
    });

    it('should return zero count when no entries are hadir', async () => {
      (prisma.absensiLatihan.createMany as jest.Mock).mockResolvedValue({ count: 0 });

      const entries = [
        { anggotaId: 1, hadir: false },
        { anggotaId: 2, hadir: false },
      ];

      const result = await service.recordLatihanBulk(entries, 10, 1);

      expect(prisma.absensiLatihan.createMany).toHaveBeenCalledWith({
        data: [],
      });
      expect(result).toEqual({ count: 0 });
    });
  });
});
