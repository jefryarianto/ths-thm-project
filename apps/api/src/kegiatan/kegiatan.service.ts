import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class KegiatanService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    nama: string;
    tipe: string;
    tanggalMulai: string;
    tanggalSelesai?: string;
    lokasi: string;
    scopeType: string;
    scopeId: number;
    createdBy: number;
  }) {
    return this.prisma.kegiatan.create({
      data: {
        nama: data.nama,
        tipe: data.tipe,
        tanggalMulai: new Date(data.tanggalMulai),
        tanggalSelesai: data.tanggalSelesai ? new Date(data.tanggalSelesai) : null,
        lokasi: data.lokasi,
        scopeType: data.scopeType,
        scopeId: data.scopeId,
        createdBy: data.createdBy,
        status: 'draft',
      },
      include: {
        creator: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(
    page = 1,
    limit = 10,
    tipe?: string,
    scopeType?: string,
    scopeId?: number,
    status?: string,
  ) {
    const where: any = {};
    if (tipe) where.tipe = tipe;
    if (scopeType) where.scopeType = scopeType;
    if (scopeId) where.scopeId = scopeId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.kegiatan.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          creator: { select: { id: true, name: true } },
          _count: { select: { absensiKegiatan: true, latihan: true } },
        },
        orderBy: { tanggalMulai: 'desc' },
      }),
      this.prisma.kegiatan.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: number) {
    const kegiatan = await this.prisma.kegiatan.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true } },
        absensiKegiatan: {
          take: 50,
          include: { anggota: { select: { id: true, namaLengkap: true } }, calonAnggota: { select: { id: true, namaLengkap: true } } },
        },
        latihan: true,
        pengujiKegiatan: { include: { penguji: { select: { id: true, name: true } } } },
        hasilPendadaran: { include: { calonAnggota: { select: { id: true, namaLengkap: true } } } },
      },
    });
    if (!kegiatan) throw new NotFoundException('Kegiatan not found');
    return kegiatan;
  }

  async update(id: number, data: {
    nama?: string;
    tipe?: string;
    lokasi?: string;
    tanggalMulai?: string;
    tanggalSelesai?: string;
    status?: string;
  }) {
    const updateData: any = { ...data };
    if (data.tanggalMulai) updateData.tanggalMulai = new Date(data.tanggalMulai);
    if (data.tanggalSelesai) updateData.tanggalSelesai = new Date(data.tanggalSelesai);
    return this.prisma.kegiatan.update({ where: { id }, data: updateData });
  }

  async publish(id: number) {
    return this.prisma.kegiatan.update({
      where: { id },
      data: { status: 'published' },
    });
  }

  async close(id: number) {
    return this.prisma.kegiatan.update({
      where: { id },
      data: { status: 'closed' },
    });
  }

  async delete(id: number) {
    return this.prisma.kegiatan.delete({ where: { id } });
  }
}
