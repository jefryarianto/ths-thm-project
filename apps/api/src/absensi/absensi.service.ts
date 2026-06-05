import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AbsensiService {
  constructor(private prisma: PrismaService) {}

  // ─── Absensi Kegiatan ───
  async recordKegiatan(data: {
    kegiatanId: number;
    anggotaId?: number;
    calonAnggotaId?: number;
    checkinMethod?: string;
    checkinTime: string;
    recordedBy: number;
  }) {
    return this.prisma.absensiKegiatan.create({
      data: {
        kegiatanId: data.kegiatanId,
        anggotaId: data.anggotaId || null,
        calonAnggotaId: data.calonAnggotaId || null,
        checkinMethod: data.checkinMethod || 'manual',
        checkinTime: new Date(data.checkinTime),
        recordedBy: data.recordedBy,
      },
      include: {
        kegiatan: { select: { id: true, nama: true } },
        anggota: { select: { id: true, namaLengkap: true } },
      },
    });
  }

  async findKegiatanByKegiatan(kegiatanId: number) {
    return this.prisma.absensiKegiatan.findMany({
      where: { kegiatanId },
      include: {
        anggota: { select: { id: true, namaLengkap: true, nomorAnggota: true } },
        calonAnggota: { select: { id: true, namaLengkap: true } },
        pencatat: { select: { id: true, name: true } },
      },
      orderBy: { checkinTime: 'desc' },
    });
  }

  // ─── Absensi Latihan ───
  async recordLatihan(data: {
    latihanId: number;
    anggotaId?: number;
    calonAnggotaId?: number;
    checkinMethod?: string;
    checkinTime: string;
    recordedBy: number;
  }) {
    return this.prisma.absensiLatihan.create({
      data: {
        latihanId: data.latihanId,
        anggotaId: data.anggotaId || null,
        calonAnggotaId: data.calonAnggotaId || null,
        checkinMethod: data.checkinMethod || 'manual',
        checkinTime: new Date(data.checkinTime),
        recordedBy: data.recordedBy,
      },
    });
  }

  async recordLatihanBulk(
    entries: Array<{ anggotaId?: number; calonAnggotaId?: number; hadir: boolean }>,
    latihanId: number,
    recordedBy: number,
  ) {
    const now = new Date();
    return this.prisma.absensiLatihan.createMany({
      data: entries
        .filter((e) => e.hadir)
        .map((e) => ({
          latihanId,
          anggotaId: e.anggotaId || null,
          calonAnggotaId: e.calonAnggotaId || null,
          checkinMethod: 'manual',
          checkinTime: now,
          recordedBy,
        })),
    });
  }

  async findLatihanByLatihan(latihanId: number) {
    return this.prisma.absensiLatihan.findMany({
      where: { latihanId },
      include: {
        anggota: { select: { id: true, namaLengkap: true, nomorAnggota: true } },
        calonAnggota: { select: { id: true, namaLengkap: true } },
        pencatat: { select: { id: true, name: true } },
      },
      orderBy: { checkinTime: 'desc' },
    });
  }
}
