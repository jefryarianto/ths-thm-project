import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class KontenService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    judul: string; jenis: string; konten: string; ringkasan?: string;
    penulisId: number; scopeType?: string; scopeId?: number;
  }) {
    return this.prisma.konten.create({
      data,
      include: { penulis: { select: { id: true, name: true } } },
    });
  }

  async findAll(page = 1, limit = 10, status?: string, jenis?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (jenis) where.jenis = jenis;

    const [data, total] = await Promise.all([
      this.prisma.konten.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: {
          penulis: { select: { id: true, name: true } },
          reviewer: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.konten.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findPublished(jenis?: string) {
    const where: any = { status: 'Dipublikasikan' };
    if (jenis) where.jenis = jenis;
    return this.prisma.konten.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: 50,
      include: { penulis: { select: { id: true, name: true } } },
    });
  }

  async findById(id: number) {
    const konten = await this.prisma.konten.findUnique({
      where: { id },
      include: {
        penulis: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true } },
      },
    });
    if (!konten) throw new NotFoundException(`Konten #${id} tidak ditemukan`);
    return konten;
  }

  async update(id: number, userId: number, data: {
    judul?: string; jenis?: string; konten?: string;
    ringkasan?: string; thumbnailUrl?: string;
  }) {
    const konten = await this.prisma.konten.findUnique({ where: { id } });
    if (!konten) throw new NotFoundException(`Konten #${id} tidak ditemukan`);
    if (konten.penulisId !== userId) {
      throw new ForbiddenException('Hanya penulis yang bisa mengedit konten ini');
    }
    if (!['Draft', 'Menunggu Persetujuan'].includes(konten.status)) {
      throw new ForbiddenException('Konten yang sudah dipublikasikan tidak dapat diedit');
    }
    return this.prisma.konten.update({ where: { id }, data });
  }

  async delete(id: number) {
    const konten = await this.prisma.konten.findUnique({ where: { id } });
    if (!konten) throw new NotFoundException(`Konten #${id} tidak ditemukan`);
    await this.prisma.konten.delete({ where: { id } });
    return { message: 'Konten berhasil dihapus' };
  }

  async submitForReview(id: number, userId: number) {
    const konten = await this.prisma.konten.findUnique({ where: { id } });
    if (!konten) throw new NotFoundException(`Konten #${id} tidak ditemukan`);
    if (konten.penulisId !== userId) {
      throw new ForbiddenException('Hanya penulis yang bisa mengajukan konten untuk review');
    }
    if (konten.status !== 'Draft') {
      throw new ForbiddenException(`Konten berstatus "${konten.status}" tidak bisa diajukan ulang`);
    }
    return this.prisma.konten.update({
      where: { id },
      data: { status: 'Menunggu Persetujuan' },
    });
  }

  async submitReview(id: number, reviewerId: number, status: string, catatanReview?: string) {
    if (!['Dipublikasikan', 'Ditolak'].includes(status)) {
      throw new ForbiddenException('Invalid review status. Gunakan "Dipublikasikan" atau "Ditolak"');
    }
    const data: any = { status, reviewerId, catatanReview };
    if (status === 'Dipublikasikan') data.publishedAt = new Date();
    return this.prisma.konten.update({ where: { id }, data });
  }
}
