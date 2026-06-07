import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PustakaService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    judul: string; deskripsi?: string; jenis: string;
    fileUrl: string; thumbnailUrl?: string; isPublic?: boolean; uploadedBy: number;
  }) {
    return this.prisma.pustaka.create({ data });
  }

  async findAll(page = 1, limit = 20, jenis?: string, isPublic?: boolean) {
    const where: any = {};
    if (jenis) where.jenis = jenis;
    if (isPublic !== undefined) where.isPublic = isPublic;

    const [data, total] = await Promise.all([
      this.prisma.pustaka.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pustaka.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: number) {
    const item = await this.prisma.pustaka.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Pustaka #${id} tidak ditemukan`);
    return item;
  }

  async update(id: number, data: {
    judul?: string; deskripsi?: string; jenis?: string;
    fileUrl?: string; thumbnailUrl?: string; isPublic?: boolean;
  }) {
    const item = await this.prisma.pustaka.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Pustaka #${id} tidak ditemukan`);
    return this.prisma.pustaka.update({ where: { id }, data });
  }

  async delete(id: number) {
    const item = await this.prisma.pustaka.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Pustaka #${id} tidak ditemukan`);
    await this.prisma.pustaka.delete({ where: { id } });
    return { message: 'Item pustaka berhasil dihapus' };
  }
}
