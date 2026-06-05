import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class LatihanService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    rantingId: number;
    kegiatanId?: number;
    pelatihId: number;
    hariTanggal: string;
    lokasi: string;
    jenisMateri: string;
    hasilLatihanGlobal?: string;
    rekomendasiLatihanBerikutnya?: string;
  }) {
    return this.prisma.latihan.create({
      data: {
        rantingId: data.rantingId,
        kegiatanId: data.kegiatanId || null,
        pelatihId: data.pelatihId,
        hariTanggal: new Date(data.hariTanggal),
        lokasi: data.lokasi,
        jenisMateri: data.jenisMateri,
        hasilLatihanGlobal: data.hasilLatihanGlobal || null,
        rekomendasiLatihanBerikutnya: data.rekomendasiLatihanBerikutnya || null,
      },
      include: {
        ranting: true,
        pelatih: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(page = 1, limit = 10, rantingId?: number) {
    const where: any = {};
    if (rantingId) where.rantingId = rantingId;

    const [data, total] = await Promise.all([
      this.prisma.latihan.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          ranting: true,
          pelatih: { select: { id: true, name: true } },
          _count: { select: { absensiLatihan: true, dokumentasiLatihan: true } },
        },
        orderBy: { hariTanggal: 'desc' },
      }),
      this.prisma.latihan.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: number) {
    return this.prisma.latihan.findUnique({
      where: { id },
      include: {
        ranting: true,
        pelatih: { select: { id: true, name: true } },
        absensiLatihan: {
          include: {
            anggota: { select: { id: true, namaLengkap: true } },
            calonAnggota: { select: { id: true, namaLengkap: true } },
          },
        },
        catatanLatihanPeserta: {
          include: {
            anggota: { select: { id: true, namaLengkap: true } },
            calonAnggota: { select: { id: true, namaLengkap: true } },
          },
        },
        dokumentasiLatihan: { orderBy: { urutan: 'asc' } },
      },
    });
  }
}
